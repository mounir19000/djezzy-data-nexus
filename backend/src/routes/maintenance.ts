import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

const maintenanceTaskInclude = {
  assignee: { select: { id: true, firstName: true, lastName: true } },
  equipment: {
    include: {
      room: { include: { site: true } }
    }
  },
  report: {
    include: {
      submitter: { select: { id: true, firstName: true, lastName: true } }
    }
  }
};

const maintenanceScheduleInclude = {
  assignee: { select: { id: true, firstName: true, lastName: true } },
  equipment: {
    include: {
      room: { include: { site: true } }
    }
  }
};

const buildMaintenanceAccessWhere = (user: AuthRequest['user'], siteId?: string) => {
  const siteWhere = siteId ? { equipment: { room: { siteId } } } : {};

  if (user?.roleName === 'Super Admin') return siteWhere;

  return {
    AND: [
      siteWhere,
      {
        equipment: {
          room: {
            site: {
              userAssignments: {
                some: { userId: user?.id }
              }
            }
          }
        }
      }
    ]
  };
};

const containsSearch = (query: string) => ({ contains: query, mode: 'insensitive' as const });

const buildMaintenanceHistorySearchWhere = (query: string): any => {
  if (!query) return {};

  const search = containsSearch(query);

  return {
    OR: [
      { title: search },
      { status: search },
      { equipment: { name: search } },
      { equipment: { type: search } },
      { equipment: { room: { name: search } } },
      { equipment: { room: { site: { name: search } } } },
      { assignee: { firstName: search } },
      { assignee: { lastName: search } },
      { report: { actionTaken: search } },
      { report: { currentState: search } },
      { report: { notes: search } },
      { report: { submitter: { firstName: search } } },
      { report: { submitter: { lastName: search } } }
    ]
  };
};

// Get all maintenance tasks
router.get('/', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const tasks = await prisma.maintenanceTask.findMany({
      where: buildMaintenanceAccessWhere(authReq.user),
      include: maintenanceTaskInclude,
      orderBy: { scheduledDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Échec du chargement des tâches de maintenance' });
  }
});

router.post('/', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
  const { title, equipmentId, status, assignedTo, scheduledDate } = req.body;

  if (!title || !equipmentId || !scheduledDate) {
    return res.status(400).json({ error: 'title, equipmentId et scheduledDate sont requis' });
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
          message: `Maintenance planifiee : ${task.title}`
        }
      });
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create maintenance task error:', error);
    res.status(500).json({ error: 'Échec de la création de la tâche de maintenance' });
  }
});

// Get completed maintenance history
router.get('/history', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const query = req.query.q ? String(req.query.q).trim() : '';
  const siteId = req.query.siteId ? String(req.query.siteId) : undefined;

  try {
    const tasks = await prisma.maintenanceTask.findMany({
      where: {
        AND: [
          { status: 'completed' },
          buildMaintenanceAccessWhere(authReq.user, siteId),
          buildMaintenanceHistorySearchWhere(query)
        ]
      },
      include: maintenanceTaskInclude,
      orderBy: { scheduledDate: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Fetch maintenance history error:', error);
    res.status(500).json({ error: 'Échec du chargement de l’historique maintenance' });
  }
});

// Get all maintenance schedules
router.get('/schedules', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: buildMaintenanceAccessWhere(authReq.user),
      include: maintenanceScheduleInclude,
      orderBy: { nextRunDate: 'asc' }
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Échec du chargement des planifications de maintenance' });
  }
});

// Delete a recurring maintenance schedule
router.delete('/schedules/:id', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const schedule = await prisma.maintenanceSchedule.findFirst({
      where: {
        AND: [
          { id: String(req.params.id) },
          buildMaintenanceAccessWhere(authReq.user)
        ]
      }
    });

    if (!schedule) return res.status(404).json({ error: 'Planification de maintenance introuvable' });

    await prisma.maintenanceSchedule.delete({
      where: { id: schedule.id }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('maintenance_update', { type: 'schedule_deleted', scheduleId: schedule.id });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete maintenance schedule error:', error);
    res.status(500).json({ error: 'Échec de la suppression de la planification de maintenance' });
  }
});

// Create a new maintenance schedule
router.post('/schedules', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
  const { title, equipmentId, recurrence, assignedTo, startDate } = req.body;

  if (!title || !equipmentId || !recurrence || !startDate) {
    return res.status(400).json({ error: 'title, equipmentId, recurrence et startDate sont requis' });
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
      include: maintenanceScheduleInclude
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create maintenance schedule error:', error);
    res.status(500).json({ error: 'Échec de la création de la planification de maintenance' });
  }
});

// Delete a maintenance task. Site Operators can delete tasks in their assigned sites; Super Admins can delete any task.
router.delete('/tasks/:id', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const task = await prisma.maintenanceTask.findFirst({
      where: {
        AND: [
          { id: String(req.params.id) },
          buildMaintenanceAccessWhere(authReq.user)
        ]
      }
    });

    if (!task) return res.status(404).json({ error: 'Tâche de maintenance introuvable' });

    await prisma.maintenanceTask.delete({
      where: { id: task.id }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('maintenance_update', { type: 'task_deleted', taskId: task.id });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete maintenance task error:', error);
    res.status(500).json({ error: 'Échec de la suppression de la tâche de maintenance' });
  }
});

// Complete a task with a report
router.post('/tasks/:id/report', requireAuth, requireRole(['Engineer', 'Super Admin', 'Site Operator']), async (req: any, res: Response) => {
  const { actionTaken, currentState, notes } = req.body;
  const taskId = String(req.params.id);

  if (!actionTaken || !currentState) {
    return res.status(400).json({ error: 'actionTaken et currentState sont requis' });
  }

  try {
    const task = await prisma.maintenanceTask.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Tâche de maintenance introuvable' });

    // Create the report
    await prisma.maintenanceReport.create({
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
      include: maintenanceTaskInclude
    });

    res.status(201).json(updatedTask);
  } catch (error) {
    console.error('Create maintenance report error:', error);
    res.status(500).json({ error: 'Échec de la soumission du rapport de maintenance' });
  }
});

export default router;
