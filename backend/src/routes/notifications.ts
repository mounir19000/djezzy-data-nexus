import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: any, res: any) => {
  const authReq = req as AuthRequest;
  try {
    const limit = Number(req.query.limit);
    const take = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : undefined;
    const notifications = await prisma.notification.findMany({
      where: { userId: authReq.user!.id },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {})
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
    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
router.put('/read-all', requireAuth, async (req: any, res: any) => {
  const authReq = req as AuthRequest;
  try {
    const result = await prisma.notification.updateMany({
      where: { 
        userId: authReq.user!.id,
        read: false
      },
      data: { read: true }
    });
    res.json({ success: true, updated: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
