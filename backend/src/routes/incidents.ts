import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { attachExpertDiagnosesToAlarms } from '../services/expertSystem';

const router = Router();

// Get all active alarms
router.get('/', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const siteId = req.query.siteId ? String(req.query.siteId) : undefined;
  const siteScope = {
    ...(siteId ? { siteId } : {}),
    ...(authReq.user?.roleName === 'Super Admin' ? {} : {
      site: {
        userAssignments: {
          some: { userId: authReq.user?.id }
        }
      }
    })
  };
  const alarmInclude = {
    equipment: {
      include: {
        room: { include: { site: true } }
      }
    },
    tickets: {
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        report: true
      }
    }
  };

  try {
    const alarms = await prisma.alarm.findMany({
      where: {
        active: true,
        equipment: {
          room: siteScope
        }
      },
      include: alarmInclude,
      orderBy: { createdAt: 'desc' }
    });

    const contextSince = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const contextAlarms = await prisma.alarm.findMany({
      where: {
        equipment: {
          room: siteScope
        },
        OR: [
          { active: true },
          { createdAt: { gte: contextSince } },
          { clearedAt: { gte: contextSince } }
        ]
      },
      include: {
        equipment: {
          include: {
            room: { include: { site: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(attachExpertDiagnosesToAlarms(alarms as any[], contextAlarms as any[]));
  } catch (error) {
    console.error('Fetch incidents error:', error);
    res.status(500).json({ error: 'Échec du chargement des alarmes' });
  }
});

// Acknowledge (resolve) an alarm
router.post('/:id/acknowledge', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const alarm = await prisma.alarm.update({
      where: { id: req.params.id },
      data: { active: false }
    });
    
    // Create a notification for the ack
    await prisma.notification.create({
      data: {
        userId: authReq.user!.id,
        message: `Alarme sur l’équipement ${alarm.equipmentId} acquittée.`,
      }
    });

    res.json(alarm);
  } catch (error) {
    res.status(500).json({ error: 'Échec de l’acquittement de l’alarme' });
  }
});

export default router;
