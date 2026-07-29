import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { calculateSiteHealth } from '../services/siteHealth';

const router = Router();

const severityLabels: Record<string, string> = {
  critical: 'CRITIQUE',
  warning: 'AVERTISSEMENT',
  healthy: 'SAIN'
};

const ticketStatusLabels: Record<string, string> = {
  pending: 'En attente',
  assigned: 'Assigné',
  inProgress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clôturé'
};

router.get('/metrics', requireAuth, async (req, res: Response) => {
  try {
    const totalSites = await prisma.site.count();
    const rawSites = await prisma.site.findMany({
      include: {
        rooms: {
          include: {
            equipments: {
              include: {
                alarms: { where: { active: true } }
              }
            }
          }
        }
      }
    });

    const equipmentIds = rawSites.flatMap(s => s.rooms.flatMap(r => r.equipments.map(e => e.id)));
    const latestTelemetry = equipmentIds.length > 0 ? await prisma.telemetry.findMany({
      where: { equipmentId: { in: equipmentIds } },
      orderBy: { timestamp: 'desc' },
      take: equipmentIds.length * 15
    }) : [];

    const latestMetricMap = latestTelemetry.reduce((acc: Record<string, Record<string, number>>, item: any) => {
      acc[item.equipmentId] ||= {};
      if (acc[item.equipmentId][item.metricType] === undefined) {
        acc[item.equipmentId][item.metricType] = item.value;
      }
      return acc;
    }, {});

    const sites = rawSites.map(site => ({
      ...site,
      overallHealth: calculateSiteHealth(site, latestMetricMap).score
    }));

    const healthySites = sites.filter((s: any) => s.overallHealth >= 90).length;
    const warningSites = sites.filter((s: any) => s.overallHealth >= 70 && s.overallHealth < 90).length;
    const criticalSites = sites.filter((s: any) => s.overallHealth < 70).length;

    const activeIncidents = await prisma.alarm.count({
      where: { active: true }
    });

    const openTickets = await prisma.ticket.count({
      where: { status: { notIn: ['resolved', 'closed'] } }
    });

    const pendingMaintenance = await prisma.maintenanceTask.count({
      where: { status: { notIn: ['completed'] } }
    });

    const closedTicketsToday = await prisma.ticket.count({
      where: { 
        status: 'closed',
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    // Feed items (Recent Alarms + Recent Tickets)
    const recentAlarms = await prisma.alarm.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: { equipment: { include: { room: { include: { site: true } } } } }
    });

    const recentTickets = await prisma.ticket.findMany({
      take: 2,
      orderBy: { updatedAt: 'desc' },
      include: { equipment: true }
    });

    res.json({
      overallHealthScore: (sites.reduce((acc: number, s: any) => acc + s.overallHealth, 0) / (totalSites || 1)).toFixed(1),
      totalSites,
      healthySites,
      warningSites,
      criticalSites,
      activeIncidents,
      openTickets,
      pendingMaintenance,
      closedTicketsToday,
      sites,
      feed: [
        ...recentAlarms.map((a: any) => ({
          id: a.id,
          type: 'alarm',
          title: `Site ${a.equipment?.room?.site?.name || 'Inconnu'} - ${severityLabels[a.severity] || a.severity.toUpperCase()}`,
          description: a.description,
          severity: a.severity,
          time: a.createdAt
        })),
        ...recentTickets.map((t: any) => ({
          id: t.id,
          type: 'ticket',
          title: `Ticket ${t.id.substring(0,8)} mis à jour`,
          description: `Le statut du ticket est maintenant ${ticketStatusLabels[t.status] || t.status}.`,
          severity: t.status === 'resolved' || t.status === 'closed' ? 'healthy' : 'secondary',
          time: t.updatedAt
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    });

  } catch (error) {
    res.status(500).json({ error: 'Échec du chargement des indicateurs du tableau de bord' });
  }
});

export default router;
