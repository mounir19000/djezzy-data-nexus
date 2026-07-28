import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get all maintenance tasks
router.get('/', requireAuth, async (req, res: Response) => {
  try {
    const tasks = await prisma.maintenanceTask.findMany({
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance tasks' });
  }
});

router.post('/', requireAuth, requireRole(['Engineer']), async (req: any, res: Response) => {
  const { title, equipmentId, status, assignedTo, scheduledDate } = req.body;

  if (!title || !equipmentId || !scheduledDate) {
    return res.status(400).json({ error: 'title, equipmentId, and scheduledDate are required' });
  }

  try {
    const task = await prisma.maintenanceTask.create({
      data: {
        title: String(title),
        equipmentId: String(equipmentId),
        status: status || 'pending',
        assignedTo: assignedTo || undefined,
        scheduledDate: new Date(scheduledDate)
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        }
      }
    });

    if (assignedTo) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          message: `Maintenance scheduled: ${task.title}`
        }
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create maintenance task error:', error);
    res.status(500).json({ error: 'Failed to create maintenance task' });
  }
});

export default router;
