import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { generateDiagnosis } from '../services/expertSystem';

const router = Router();

const terminalStatuses = ['resolved', 'closed'];
const allowedStatuses = ['pending', 'assigned', 'inProgress', 'resolved', 'closed'];

const createIncidentKnowledgeArticle = async (ticketId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      assignee: { select: { firstName: true, lastName: true } },
      alarm: true,
      equipment: {
        include: {
          room: { include: { site: true } }
        }
      }
    }
  });

  if (!ticket) return;

  const existing = await prisma.knowledgeBase.findFirst({
    where: { tags: { has: `ticket:${ticket.id}` } }
  });

  if (existing) return;

  const diagnosis = ticket.alarm ? generateDiagnosis({
    severity: ticket.alarm.severity,
    description: ticket.alarm.description,
    equipment: ticket.equipment
  }) : null;

  const content = [
    '# Incident Summary',
    `Ticket: ${ticket.id}`,
    `Site: ${ticket.equipment.room.site.name}`,
    `Room: ${ticket.equipment.room.name}`,
    `Equipment: ${ticket.equipment.name} (${ticket.equipment.type})`,
    `Priority: ${ticket.priority}`,
    `Assigned engineer: ${ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'}`,
    '',
    '## Symptoms',
    ticket.alarm?.description || ticket.title,
    '',
    '## Diagnosis',
    diagnosis?.problem || 'Manual intervention completed.',
    '',
    '## Root Cause',
    diagnosis?.probableCauses.join('; ') || 'To be completed from engineer notes.',
    '',
    '## Corrective Actions',
    diagnosis?.recommendedActions.map((action) => `- ${action}`).join('\n') || '- Followed standard operating procedure.',
    '',
    '## Recovery Conditions',
    diagnosis?.recoveryConditions.map((condition) => `- ${condition}`).join('\n') || '- Equipment restored to healthy state.',
    '',
    '## Lessons Learned',
    'This article was generated automatically when the ticket was closed and should be enriched with engineer notes after review.'
  ].join('\n');

  await prisma.knowledgeBase.create({
    data: {
      title: `Incident Report - ${ticket.title}`,
      category: 'Incident Reports',
      tags: [
        'incident-report',
        `ticket:${ticket.id}`,
        ticket.equipment.type,
        ticket.equipment.room.name
      ],
      content
    }
  });
};

// Get all tickets
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        },
        alarm: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets.map((ticket: any) => ({
      ...ticket,
      diagnosis: ticket.alarm ? generateDiagnosis({
        severity: ticket.alarm.severity,
        description: ticket.alarm.description,
        equipment: ticket.equipment
      }) : null
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create an actionable ticket from an alarm or manual operator review
router.post('/', requireAuth, requireRole(['Site Operator']), async (req: any, res: Response) => {
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

    const resolvedEquipmentId = alarm?.equipmentId || equipmentId;
    if (!resolvedEquipmentId) {
      return res.status(400).json({ error: 'equipmentId or alarmId is required' });
    }

    if (alarmId) {
      const existingTicket = await prisma.ticket.findFirst({
        where: {
          alarmId: String(alarmId),
          status: { notIn: terminalStatuses }
        },
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          equipment: {
            include: {
              room: { include: { site: true } }
            }
          },
          alarm: true
        }
      });

      if (existingTicket) {
        return res.status(409).json({
          error: 'An open ticket already exists for this alarm',
          ticket: existingTicket
        });
      }
    }

    const ticketPriority = priority || (alarm ? generateDiagnosis(alarm).priority : 'medium');
    const ticket = await prisma.ticket.create({
      data: {
        alarmId: alarm?.id,
        equipmentId: resolvedEquipmentId,
        title: title?.trim() || `Respond to ${alarm?.description || 'operational event'}`,
        status: assignedTo ? 'assigned' : 'pending',
        priority: ticketPriority,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        },
        alarm: true
      }
    });

    if (assignedTo) {
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          message: `Ticket ${ticket.id.substring(0, 8)} assigned: ${ticket.title}`
        }
      });
    }

    await prisma.notification.create({
      data: {
        userId: authReq.user!.id,
        message: `Ticket ${ticket.id.substring(0, 8)} created from ${alarm ? 'expert diagnosis' : 'operator review'}.`
      }
    });

    res.status(201).json({
      ...ticket,
      diagnosis: ticket.alarm ? generateDiagnosis({
        severity: ticket.alarm.severity,
        description: ticket.alarm.description,
        equipment: ticket.equipment
      }) : null
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket status
router.put('/:id/status', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const { status } = req.body; // e.g. "inProgress", "resolved"
  
  if (!status) return res.status(400).json({ error: 'Status is required' });
  if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  if (authReq.user?.roleName === 'Site Operator' && terminalStatuses.includes(status)) {
    return res.status(403).json({ error: 'Site Operators cannot resolve or close tickets' });
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        alarm: true,
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        },
        assignee: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (terminalStatuses.includes(status) && ticket.alarmId) {
      await prisma.alarm.update({
        where: { id: ticket.alarmId },
        data: { active: false }
      });
    }

    if (status === 'closed') {
      await createIncidentKnowledgeArticle(ticket.id);
    }
    
    res.json({
      ...ticket,
      diagnosis: ticket.alarm ? generateDiagnosis({
        severity: ticket.alarm.severity,
        description: ticket.alarm.description,
        equipment: ticket.equipment
      }) : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

export default router;
