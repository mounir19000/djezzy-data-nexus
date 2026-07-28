import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { generateDiagnosis } from '../services/expertSystem';
import {
  buildTicketAccessWhere,
  createIncidentKnowledgeArticle,
  mapTicketWithDiagnosis,
  terminalStatuses,
  ticketInclude,
  userCanAccessSite,
  validateEngineerAssignee,
  validateTicketStatusChange
} from '../services/ticketWorkflow';

const router = Router();

const reportFields = [
  'isFailure',
  'failureDomain',
  'rootCause',
  'actionTaken',
  'serviceImpact',
  'currentState'
];

const findAccessibleTicket = async (ticketId: string, user: AuthRequest['user']) => {
  return prisma.ticket.findFirst({
    where: {
      AND: [
        { id: ticketId },
        buildTicketAccessWhere(user)
      ]
    },
    include: ticketInclude
  });
};

const siteIdForTicket = (ticket: any) => ticket.equipment?.room?.site?.id || ticket.equipment?.room?.siteId;

// Get tickets. Super Admin sees all; other users are limited to assigned sites.
router.get('/', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const siteId = req.query.siteId ? String(req.query.siteId) : undefined;

  try {
    const tickets = await prisma.ticket.findMany({
      where: buildTicketAccessWhere(authReq.user, siteId),
      include: ticketInclude,
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets.map(mapTicketWithDiagnosis));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create a manual ticket or manually escalate an alarm. Alarm-created tickets are automatic in the simulator.
router.post('/', requireAuth, requireRole(['Site Operator', 'Engineer']), async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const { alarmId, equipmentId, title, priority, assignedTo, dueDate } = req.body;

  try {
    const alarm = alarmId ? await prisma.alarm.findUnique({
      where: { id: String(alarmId) },
      include: {
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        }
      }
    }) : null;

    const equipment = alarm?.equipment || (equipmentId ? await prisma.equipment.findUnique({
      where: { id: String(equipmentId) },
      include: {
        room: { include: { site: true } }
      }
    }) : null);

    if (!equipment) {
      return res.status(400).json({ error: 'equipmentId or alarmId is required' });
    }

    const siteId = equipment.room.site.id;
    const canAccess = await userCanAccessSite(authReq.user, siteId);
    if (!canAccess) {
      return res.status(403).json({ error: 'Forbidden: ticket is outside your assigned site scope' });
    }

    if (alarmId) {
      const existingTicket = await prisma.ticket.findFirst({
        where: {
          alarmId: String(alarmId),
          status: { notIn: terminalStatuses }
        },
        include: ticketInclude
      });

      if (existingTicket) {
        return res.status(409).json({
          error: 'An open ticket already exists for this alarm',
          ticket: mapTicketWithDiagnosis(existingTicket)
        });
      }
    }

    const resolvedAssignee = assignedTo || (authReq.user?.roleName === 'Engineer' ? authReq.user.id : undefined);
    if (resolvedAssignee) {
      const assigneeValidation = await validateEngineerAssignee(String(resolvedAssignee), siteId);
      if (!assigneeValidation.valid) {
        return res.status(400).json({ error: assigneeValidation.message });
      }
    }

    const ticketPriority = priority || (alarm ? generateDiagnosis(alarm).priority : 'medium');
    const ticket = await prisma.ticket.create({
      data: {
        alarmId: alarm?.id,
        equipmentId: equipment.id,
        title: title?.trim() || `Respond to ${alarm?.description || 'operational event'}`,
        status: resolvedAssignee ? 'assigned' : 'pending',
        priority: ticketPriority,
        source: alarm ? 'alarm_manual' : 'manual',
        assignedTo: resolvedAssignee || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
      },
      include: ticketInclude
    });

    if (resolvedAssignee) {
      await prisma.notification.create({
        data: {
          userId: resolvedAssignee,
          siteId,
          message: `Ticket ${ticket.id.substring(0, 8)} assigned: ${ticket.title}`
        }
      });
    }

    await prisma.notification.create({
      data: {
        userId: authReq.user!.id,
        siteId,
        message: `Ticket ${ticket.id.substring(0, 8)} launched for ${equipment.name}.`
      }
    });

    res.status(201).json(mapTicketWithDiagnosis(ticket));
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket status and optional assignment in one regulated workflow move.
router.put('/:id/status', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const { status, assignedTo } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const ticket = await findAccessibleTicket(req.params.id, authReq.user);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const siteId = siteIdForTicket(ticket);
    const nextAssigneeId = Object.prototype.hasOwnProperty.call(req.body, 'assignedTo')
      ? (assignedTo || null)
      : ticket.assignedTo;

    const finalAssigneeId = status === 'pending' ? null : nextAssigneeId;

    if (authReq.user?.roleName === 'Engineer') {
      if (finalAssigneeId && finalAssigneeId !== authReq.user.id) {
        return res.status(403).json({ error: 'Engineers can only assign tickets to themselves' });
      }
    }

    if (finalAssigneeId) {
      const assigneeValidation = await validateEngineerAssignee(String(finalAssigneeId), siteId);
      if (!assigneeValidation.valid) {
        return res.status(400).json({ error: assigneeValidation.message });
      }
    }

    const transitionError = validateTicketStatusChange(ticket, String(status), finalAssigneeId, authReq.user);
    if (transitionError) {
      return res.status(400).json({ error: transitionError });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status: String(status),
        assignedTo: finalAssigneeId
      },
      include: ticketInclude
    });

    if (finalAssigneeId && finalAssigneeId !== ticket.assignedTo) {
      await prisma.notification.create({
        data: {
          userId: finalAssigneeId,
          siteId: siteIdForTicket(updatedTicket),
          message: `Ticket ${updatedTicket.id.substring(0, 8)} assigned: ${updatedTicket.title}`
        }
      });
      const io = req.app.get('io');
      if (io) io.emit('notification_update');
    }

    if (terminalStatuses.includes(String(status)) && updatedTicket.alarmId) {
      await prisma.alarm.update({
        where: { id: updatedTicket.alarmId },
        data: { active: false }
      });
    }

    if (status === 'closed') {
      await createIncidentKnowledgeArticle(updatedTicket.id);
      
      const superAdmins = await prisma.user.findMany({
        where: { role: { name: 'Super Admin' } }
      });
      
      for (const admin of superAdmins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            siteId: siteIdForTicket(updatedTicket),
            message: `Ticket ${updatedTicket.id.substring(0, 8)} (${updatedTicket.title}) has been closed.`
          }
        });
      }
      
      const io = req.app.get('io');
      if (io) {
        io.emit('notification_update');
      }
    }

    res.json(mapTicketWithDiagnosis(updatedTicket));
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Delete a ticket. Site Operators can delete tickets in their assigned sites; Super Admins can delete any ticket.
router.delete('/:id', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const ticket = await findAccessibleTicket(req.params.id, authReq.user);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    await prisma.ticket.delete({
      where: { id: ticket.id }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('ticket_update', { type: 'deleted', ticketId: ticket.id, alarmId: ticket.alarmId });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

// Submit or update the engineer response report for a ticket.
router.post('/:id/report', requireAuth, requireRole(['Engineer']), async (req: any, res: Response) => {
  const authReq = req as AuthRequest;

  try {
    const ticket = await findAccessibleTicket(req.params.id, authReq.user);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (authReq.user?.roleName === 'Engineer' && ticket.assignedTo !== authReq.user.id) {
      return res.status(403).json({ error: 'Only the assigned engineer can submit this ticket report' });
    }

    const missingField = reportFields.find((field) => {
      if (field === 'isFailure') return typeof req.body[field] !== 'boolean';
      return !String(req.body[field] || '').trim();
    });

    if (missingField) {
      return res.status(400).json({ error: `Missing report field: ${missingField}` });
    }

    await prisma.ticketReport.upsert({
      where: { ticketId: ticket.id },
      update: {
        isFailure: Boolean(req.body.isFailure),
        failureDomain: String(req.body.failureDomain),
        rootCause: String(req.body.rootCause),
        actionTaken: String(req.body.actionTaken),
        serviceImpact: String(req.body.serviceImpact),
        currentState: String(req.body.currentState),
        notes: req.body.notes ? String(req.body.notes).trim() : null,
        submittedById: authReq.user!.id
      },
      create: {
        ticketId: ticket.id,
        submittedById: authReq.user!.id,
        isFailure: Boolean(req.body.isFailure),
        failureDomain: String(req.body.failureDomain),
        rootCause: String(req.body.rootCause),
        actionTaken: String(req.body.actionTaken),
        serviceImpact: String(req.body.serviceImpact),
        currentState: String(req.body.currentState),
        notes: req.body.notes ? String(req.body.notes).trim() : null
      }
    });

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: ticketInclude
    });

    res.json(mapTicketWithDiagnosis(updatedTicket));
  } catch (error) {
    console.error('Submit ticket report error:', error);
    res.status(500).json({ error: 'Failed to submit ticket report' });
  }
});

export default router;
