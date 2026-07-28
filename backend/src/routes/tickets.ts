import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all tickets
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        equipment: { select: { name: true, type: true } },
        alarm: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Update ticket status
router.put('/:id/status', requireAuth, async (req: any, res: Response) => {
  const authReq = req as AuthRequest;
  const { status } = req.body; // e.g. "inProgress", "resolved"
  
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

export default router;
