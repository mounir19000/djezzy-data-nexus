import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get all expert rules
router.get('/rules', requireAuth, requireRole(['Super Admin']), async (req, res: Response) => {
  try {
    const rules = await prisma.expertRule.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

// Update a rule threshold
router.put('/rules/:id', requireAuth, requireRole(['Super Admin']), async (req: any, res: Response) => {
  try {
    const { threshold } = req.body;
    if (threshold === undefined) {
      return res.status(400).json({ error: 'Threshold is required' });
    }
    
    const rule = await prisma.expertRule.update({
      where: { id: req.params.id },
      data: { threshold: Number(threshold) }
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

export default router;
