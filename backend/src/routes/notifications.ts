import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: any, res: any) => {
  const authReq = req as AuthRequest;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: authReq.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark single notification as read
router.put('/:id/read', requireAuth, async (req: any, res: any) => {
  const authReq = req as AuthRequest;
  try {
    const notification = await prisma.notification.updateMany({
      where: { 
        id: req.params.id,
        userId: authReq.user!.id 
      },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', requireAuth, async (req: any, res: any) => {
  const authReq = req as AuthRequest;
  try {
    await prisma.notification.updateMany({
      where: { 
        userId: authReq.user!.id,
        read: false
      },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
