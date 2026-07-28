import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/metrics', requireAuth, async (req, res: Response) => {
  try {
    const totalSites = await prisma.site.count();
    const sites = await prisma.site.findMany();
    const healthySites = sites.filter((s: any) => s.overallHealth >= 90).length;
    const criticalSites = sites.filter((s: any) => s.overallHealth < 80).length;

    const openTickets = await prisma.ticket.count({
      where: { status: { notIn: ['resolved', 'closed'] } }
    });

    const pendingMaintenance = await prisma.maintenanceTask.count({
      where: { status: { notIn: ['completed'] } }
    });

    // Mock AI diagnoses count and Closed Tickets today (just for dashboard visual)
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
      criticalSites,
      openTickets,
      pendingMaintenance,
      closedTicketsToday,
      aiDiagnosesRun: 8401, // Mock value
      feed: [
        ...recentAlarms.map((a: any) => ({
          id: a.id,
          type: 'alarm',
          title: `Site ${a.equipment?.room?.site?.name || 'Unknown'} - ${a.severity.toUpperCase()}`,
          description: a.description,
          severity: a.severity,
          time: a.createdAt
        })),
        ...recentTickets.map((t: any) => ({
          id: t.id,
          type: 'ticket',
          title: `Ticket ${t.id.substring(0,8)} Updated`,
          description: `Ticket status is now ${t.status}.`,
          severity: t.status === 'resolved' || t.status === 'closed' ? 'healthy' : 'secondary',
          time: t.updatedAt
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;
