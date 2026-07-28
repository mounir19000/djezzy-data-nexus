import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';
import { calculateSiteHealth } from '../services/siteHealth';

const router = Router();

const siteInclude = {
  rooms: {
    include: {
      equipments: {
        include: {
          alarms: {
            where: { active: true },
            orderBy: { createdAt: 'desc' as const }
          },
          tickets: {
            where: { status: { notIn: ['resolved', 'closed'] } },
            orderBy: { createdAt: 'desc' as const }
          },
          maintenanceTasks: {
            where: { status: { not: 'completed' } },
            orderBy: { scheduledDate: 'asc' as const }
          }
        },
        orderBy: { name: 'asc' as const }
      }
    },
    orderBy: { name: 'asc' as const }
  }
};

router.get('/', requireAuth, async (req, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      include: siteInclude,
      orderBy: { name: 'asc' }
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

router.get('/:id', requireAuth, async (req, res: Response) => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: String(req.params.id) },
      include: siteInclude
    });

    if (!site) return res.status(404).json({ error: 'Site not found' });

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

router.get('/:id/dashboard', requireAuth, async (req, res: Response) => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: String(req.params.id) },
      include: siteInclude
    });

    if (!site) return res.status(404).json({ error: 'Site not found' });

    const equipmentIds = site.rooms.flatMap((room: any) => room.equipments.map((equipment: any) => equipment.id));
    const latestTelemetry = equipmentIds.length > 0 ? await prisma.telemetry.findMany({
      where: { equipmentId: { in: equipmentIds } },
      orderBy: { timestamp: 'desc' },
      take: equipmentIds.length * 12
    }) : [];
    const latestMetricMap = latestTelemetry.reduce((acc: Record<string, Record<string, number>>, item: any) => {
      acc[item.equipmentId] ||= {};
      if (acc[item.equipmentId][item.metricType] === undefined) {
        acc[item.equipmentId][item.metricType] = item.value;
      }
      return acc;
    }, {});

    const equipmentWhere = { equipment: { room: { siteId: site.id } } };
    const [alarms, tickets, maintenance] = await Promise.all([
      prisma.alarm.findMany({
        where: {
          active: true,
          ...equipmentWhere
        },
        include: {
          equipment: {
            include: { room: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 8
      }),
      prisma.ticket.findMany({
        where: equipmentWhere,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          equipment: {
            include: { room: true }
          },
          alarm: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 8
      }),
      prisma.maintenanceTask.findMany({
        where: equipmentWhere,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          equipment: {
            include: { room: true }
          }
        },
        orderBy: { scheduledDate: 'asc' },
        take: 8
      })
    ]);

    const health = calculateSiteHealth(site, latestMetricMap);
    const now = Date.now();

    res.json({
      site: {
        id: site.id,
        name: site.name,
        location: site.location,
        latitude: site.latitude,
        longitude: site.longitude
      },
      health,
      summary: {
        activeAlarms: alarms.length,
        openTickets: tickets.filter((ticket: any) => !['resolved', 'closed'].includes(ticket.status)).length,
        pendingMaintenance: maintenance.filter((task: any) => task.status !== 'completed').length,
        dueSoonMaintenance: maintenance.filter((task: any) => {
          const scheduled = new Date(task.scheduledDate).getTime();
          return task.status !== 'completed' && scheduled <= now + 7 * 24 * 60 * 60 * 1000;
        }).length
      },
      alarms,
      tickets,
      maintenance
    });
  } catch (error) {
    console.error('Site dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch site dashboard' });
  }
});

export default router;
