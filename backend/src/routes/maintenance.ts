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
        },
        report: true
      },
      orderBy: { scheduledDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance tasks' });
  }
});

router.post('/', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
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

// Get all maintenance schedules
router.get('/schedules', requireAuth, async (req, res: Response) => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        }
      },
      orderBy: { nextRunDate: 'asc' }
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance schedules' });
  }
});

// Create a new maintenance schedule
router.post('/schedules', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
  const { title, equipmentId, recurrence, assignedTo, startDate } = req.body;

  if (!title || !equipmentId || !recurrence || !startDate) {
    return res.status(400).json({ error: 'title, equipmentId, recurrence, and startDate are required' });
  }

  try {
    const start = new Date(startDate);
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title: String(title),
        equipmentId: String(equipmentId),
        recurrence: String(recurrence),
        assignedTo: assignedTo || undefined,
        startDate: start,
        nextRunDate: start // the first run is exactly the start date
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

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create maintenance schedule error:', error);
    res.status(500).json({ error: 'Failed to create maintenance schedule' });
  }
});

// Complete a task with a report
router.post('/tasks/:id/report', requireAuth, requireRole(['Engineer', 'Super Admin', 'Site Operator']), async (req: any, res: Response) => {
  const { actionTaken, currentState, notes } = req.body;
  const taskId = String(req.params.id);

  if (!actionTaken || !currentState) {
    return res.status(400).json({ error: 'actionTaken and currentState are required' });
  }

  try {
    const task = await prisma.maintenanceTask.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Maintenance task not found' });

    // Create the report
    const report = await prisma.maintenanceReport.create({
      data: {
        taskId,
        submittedById: req.user.id,
        actionTaken: String(actionTaken),
        currentState: String(currentState),
        notes: notes ? String(notes) : undefined
      }
    });

    // Update task status to completed
    const updatedTask = await prisma.maintenanceTask.update({
      where: { id: taskId },
      data: { status: 'completed' },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: { include: { room: { include: { site: true } } } },
        report: true
      }
    });

    res.status(201).json(updatedTask);
  } catch (error) {
    console.error('Create maintenance report error:', error);
    res.status(500).json({ error: 'Failed to submit maintenance report' });
  }
});

export default router;
