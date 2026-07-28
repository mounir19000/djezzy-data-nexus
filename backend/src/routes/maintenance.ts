import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all maintenance tasks
router.get('/', requireAuth, async (req, res: Response) => {
  try {
    const tasks = await prisma.maintenanceTask.findMany({
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: { select: { name: true, type: true } }
      },
      orderBy: { scheduledDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance tasks' });
  }
});

export default router;
