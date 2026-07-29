import { Server } from 'socket.io';
import { prisma } from '../config/prisma';
import { generateDiagnosis } from './expertSystem';
import { AuthRequest } from '../middleware/auth';

export const terminalStatuses = ['resolved', 'closed'];
export const allowedStatuses = ['pending', 'assigned', 'inProgress', 'resolved', 'closed'];

const ticketStatusLabels: Record<string, string> = {
  pending: 'En attente',
  assigned: 'Assigné',
  inProgress: 'En cours',
  resolved: 'Résolu',
  closed: 'Clôturé'
};

const priorityLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Haute'
};

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
    return { valid: false, message: 'Assigné introuvable' };
  }

  if (assignee.role.name !== 'Engineer') {
    return { valid: false, message: 'Les tickets ne peuvent être assignés qu’aux ingénieurs' };
  }

  const hasSiteAccess = assignee.siteAssignments.some((assignment) => assignment.siteId === siteId);
  if (!hasSiteAccess) {
    return { valid: false, message: 'L’ingénieur n’est pas assigné à ce site' };
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
    return 'Statut invalide';
  }

  if (user?.roleName === 'Site Operator' && terminalStatuses.includes(nextStatus)) {
    return 'Les opérateurs de site ne peuvent pas résoudre ou clôturer les tickets';
  }

  const transitions: Record<string, string[]> = {
    pending: ['pending', 'assigned'],
    assigned: ['assigned', 'pending', 'inProgress'],
    inProgress: ['inProgress', 'assigned', 'resolved'],
    resolved: ['resolved', 'inProgress', 'closed'],
    closed: ['closed']
  };

  if (!transitions[ticket.status]?.includes(nextStatus)) {
    return `Le ticket ne peut pas passer de ${ticketStatusLabels[ticket.status] || ticket.status} à ${ticketStatusLabels[nextStatus] || nextStatus}`;
  }

  if (nextStatus !== 'pending' && !nextAssigneeId) {
    return 'Assignez le ticket à un ingénieur avant de le faire avancer';
  }

  if (terminalStatuses.includes(nextStatus) && !ticket.report) {
    return 'Le rapport de réponse ingénieur est requis avant résolution ou clôture';
  }

  if (ticket.assignedTo && ticket.status !== nextStatus) {
    if (nextStatus === 'pending') {
      if (user?.roleName !== 'Super Admin') {
        return 'Seul un Super administrateur peut renvoyer un ticket assigné vers En attente';
      }
    } else {
      if (user?.id !== ticket.assignedTo) {
        return 'Seul l’ingénieur assigné peut déplacer ce ticket';
      }
    }
  }

  if (user?.roleName === 'Engineer' && nextAssigneeId && nextAssigneeId !== user.id) {
    return 'Les ingénieurs ne peuvent faire avancer que les tickets qui leur sont assignés';
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
      title: `Intervenir sur ${equipment.name} : ${alarm.description}`,
      status: 'pending',
      priority: diagnosis.priority || (alarm.severity === 'critical' ? 'high' : 'medium'),
      source: 'alarm_auto'
    },
    include: ticketInclude
  });

  if (siteId) {
    await notifyTicketRecipients(
      siteId,
      `Ticket automatique ${ticket.id.substring(0, 8)} créé pour ${equipment.name} : ${alarm.description}`,
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
    '# Synthèse de l’incident',
    `Ticket : ${ticket.id}`,
    `Site : ${ticket.equipment.room.site.name}`,
    `Salle : ${ticket.equipment.room.name}`,
    `Équipement : ${ticket.equipment.name} (${ticket.equipment.type})`,
    `Priorité : ${priorityLabels[ticket.priority] || ticket.priority}`,
    `Ingénieur assigné : ${ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Non assigné'}`,
    `Verdict ingénieur : ${ticket.report ? (ticket.report.isFailure ? 'Panne confirmée' : 'Fausse alarme / pas de panne') : 'Aucun rapport'}`,
    '',
    '## Symptômes',
    ticket.alarm?.description || ticket.title,
    '',
    '## Diagnostic',
    diagnosis?.problem || 'Intervention manuelle terminée.',
    '',
    '## Rapport ingénieur',
    ticket.report
      ? [
        `Domaine de panne : ${ticket.report.failureDomain}`,
        `Cause racine : ${ticket.report.rootCause}`,
        `Action effectuée : ${ticket.report.actionTaken}`,
        `Impact service : ${ticket.report.serviceImpact}`,
        `État actuel : ${ticket.report.currentState}`,
        ticket.report.notes ? `Notes : ${ticket.report.notes}` : ''
      ].filter(Boolean).join('\n')
      : 'Aucun rapport ingénieur soumis.',
    '',
    '## Cause racine',
    ticket.report?.rootCause || diagnosis?.probableCauses.join('; ') || 'À compléter depuis les notes ingénieur.',
    '',
    '## Actions correctives',
    ticket.report?.actionTaken || diagnosis?.recommendedActions.map((action) => `- ${action}`).join('\n') || '- Procédure opérationnelle standard suivie.',
    '',
    '## Conditions de retour à la normale',
    diagnosis?.recoveryConditions.map((condition) => `- ${condition}`).join('\n') || '- Équipement rétabli en état sain.',
    '',
    '## Enseignements',
    'Cet article a été généré automatiquement à la clôture du ticket et doit être enrichi si une analyse post-incident complémentaire est requise.'
  ].join('\n');

  await prisma.knowledgeBase.create({
    data: {
      title: `Rapport incident - ${ticket.title}`,
      category: 'Rapports incidents',
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
