import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

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

export default router;
