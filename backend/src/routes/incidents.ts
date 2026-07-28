import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateDiagnosis } from '../services/expertSystem';

const router = Router();

// Get all active alarms
router.get('/', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const siteId = req.query.siteId ? String(req.query.siteId) : undefined;

  try {
    const alarms = await prisma.alarm.findMany({
      where: {
        active: true,
        equipment: {
          room: {
            ...(siteId ? { siteId } : {}),
            ...(authReq.user?.roleName === 'Super Admin' ? {} : {
              site: {
                userAssignments: {
                  some: { userId: authReq.user?.id }
                }
              }
            })
          }
        }
      },
      include: {
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
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alarms.map((alarm: any) => ({
      ...alarm,
      diagnosis: generateDiagnosis(alarm)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alarms' });
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
        message: `Alarm on equipment ${alarm.equipmentId} acknowledged.`,
      }
    });

    res.json(alarm);
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alarm' });
  }
});

export default router;
