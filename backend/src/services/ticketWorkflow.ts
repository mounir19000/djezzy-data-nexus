import { Server } from 'socket.io';
import { prisma } from '../config/prisma';
import { generateDiagnosis } from './expertSystem';
import { AuthRequest } from '../middleware/auth';

export const terminalStatuses = ['resolved', 'closed'];
export const allowedStatuses = ['pending', 'assigned', 'inProgress', 'resolved', 'closed'];

export const ticketInclude = {
  assignee: { select: { id: true, firstName: true, lastName: true } },
  report: {
    include: {
      submitter: { select: { id: true, firstName: true, lastName: true } }
    }
  },
  equipment: {
    include: {
      room: { include: { site: true } }
    }
  },
  alarm: true
};

export const mapTicketWithDiagnosis = (ticket: any) => ({
  ...ticket,
  diagnosis: ticket.alarm ? generateDiagnosis({
    severity: ticket.alarm.severity,
    description: ticket.alarm.description,
    equipment: ticket.equipment
  }) : null
});

export const buildTicketAccessWhere = (user: AuthRequest['user'], siteId?: string) => {
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

export const userCanAccessSite = async (user: AuthRequest['user'], siteId: string) => {
  if (user?.roleName === 'Super Admin') return true;

  const assignment = await prisma.siteAssignment.findFirst({
    where: {
      userId: user?.id,
      siteId
    },
    select: { id: true }
  });

  return !!assignment;
};

export const validateEngineerAssignee = async (assigneeId: string, siteId: string) => {
  const assignee = await prisma.user.findUnique({
    where: { id: assigneeId },
    include: {
      role: true,
      siteAssignments: true
    }
  });

  if (!assignee) {
    return { valid: false, message: 'Assignee not found' };
  }

  if (assignee.role.name !== 'Engineer') {
    return { valid: false, message: 'Tickets can only be assigned to engineers' };
  }

  const hasSiteAccess = assignee.siteAssignments.some((assignment) => assignment.siteId === siteId);
  if (!hasSiteAccess) {
    return { valid: false, message: 'Engineer is not assigned to this site' };
  }

  return { valid: true, message: null };
};

export const validateTicketStatusChange = (
  ticket: any,
  nextStatus: string,
  nextAssigneeId: string | null | undefined,
  user: AuthRequest['user']
) => {
  if (!allowedStatuses.includes(nextStatus)) {
    return 'Invalid status';
  }

  if (user?.roleName === 'Site Operator' && terminalStatuses.includes(nextStatus)) {
    return 'Site Operators cannot resolve or close tickets';
  }

  const transitions: Record<string, string[]> = {
    pending: ['pending', 'assigned'],
    assigned: ['assigned', 'pending', 'inProgress'],
    inProgress: ['inProgress', 'assigned', 'resolved'],
    resolved: ['resolved', 'inProgress', 'closed'],
    closed: ['closed']
  };

  if (!transitions[ticket.status]?.includes(nextStatus)) {
    return `Ticket cannot move from ${ticket.status} to ${nextStatus}`;
  }

  if (nextStatus !== 'pending' && !nextAssigneeId) {
    return 'Assign the ticket to an engineer before moving it forward';
  }

  if (terminalStatuses.includes(nextStatus) && !ticket.report) {
    return 'Engineer response report is required before resolving or closing';
  }

  if (ticket.assignedTo && ticket.status !== nextStatus) {
    if (nextStatus === 'pending') {
      if (user?.roleName !== 'Super Admin') {
        return 'Only a Super Admin can send an assigned ticket back to pending';
      }
    } else {
      if (user?.id !== ticket.assignedTo) {
        return 'Only the assigned engineer can move this ticket';
      }
    }
  }

  if (user?.roleName === 'Engineer' && nextAssigneeId && nextAssigneeId !== user.id) {
    return 'Engineers can only progress tickets assigned to themselves';
  }

  return null;
};

const notifyTicketRecipients = async (
  siteId: string,
  message: string,
  io?: Server
) => {
  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { siteAssignments: { some: { siteId } } },
        { role: { name: 'Super Admin' } }
      ]
    },
    select: { id: true }
  });
  const recipientIds = [...new Set(recipients.map((recipient) => recipient.id))];

  for (const recipientId of recipientIds) {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        siteId,
        message
      }
    });
  }

  io?.emit('notification_update');
};

export const createAutomaticTicketForAlarm = async (
  alarm: { id: string; severity: string; description: string; equipmentId: string },
  equipment: any,
  io?: Server
) => {
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      alarmId: alarm.id,
      status: { notIn: terminalStatuses }
    },
    include: ticketInclude
  });

  if (existingTicket) return existingTicket;

  const diagnosis = generateDiagnosis({
    severity: alarm.severity,
    description: alarm.description,
    equipment
  });
  const siteId = equipment.room?.siteId;

  const ticket = await prisma.ticket.create({
    data: {
      alarmId: alarm.id,
      equipmentId: alarm.equipmentId,
      title: `Respond to ${equipment.name}: ${alarm.description}`,
      status: 'pending',
      priority: diagnosis.priority || (alarm.severity === 'critical' ? 'high' : 'medium'),
      source: 'alarm_auto'
    },
    include: ticketInclude
  });

  if (siteId) {
    await notifyTicketRecipients(
      siteId,
      `Auto-ticket ${ticket.id.substring(0, 8)} created for ${equipment.name}: ${alarm.description}`,
      io
    );
  }

  io?.emit('ticket_update', { type: 'created', ticketId: ticket.id, alarmId: alarm.id });

  return ticket;
};

export const createIncidentKnowledgeArticle = async (ticketId: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: ticketInclude
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
    `Engineer verdict: ${ticket.report ? (ticket.report.isFailure ? 'Confirmed failure' : 'False alarm / no failure') : 'No report'}`,
    '',
    '## Symptoms',
    ticket.alarm?.description || ticket.title,
    '',
    '## Diagnosis',
    diagnosis?.problem || 'Manual intervention completed.',
    '',
    '## Engineer Report',
    ticket.report
      ? [
        `Failure domain: ${ticket.report.failureDomain}`,
        `Root cause: ${ticket.report.rootCause}`,
        `Action taken: ${ticket.report.actionTaken}`,
        `Service impact: ${ticket.report.serviceImpact}`,
        `Current state: ${ticket.report.currentState}`,
        ticket.report.notes ? `Notes: ${ticket.report.notes}` : ''
      ].filter(Boolean).join('\n')
      : 'No engineer report submitted.',
    '',
    '## Root Cause',
    ticket.report?.rootCause || diagnosis?.probableCauses.join('; ') || 'To be completed from engineer notes.',
    '',
    '## Corrective Actions',
    ticket.report?.actionTaken || diagnosis?.recommendedActions.map((action) => `- ${action}`).join('\n') || '- Followed standard operating procedure.',
    '',
    '## Recovery Conditions',
    diagnosis?.recoveryConditions.map((condition) => `- ${condition}`).join('\n') || '- Equipment restored to healthy state.',
    '',
    '## Lessons Learned',
    'This article was generated automatically when the ticket was closed and should be enriched if additional post-incident analysis is required.'
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
