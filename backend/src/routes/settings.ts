import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Get expert rules
router.get('/rules', requireAuth, requireRole(['Super Admin']), async (req, res: Response) => {
  try {
    const { siteId } = req.query;
    const whereClause = siteId ? { siteId: String(siteId) } : {};
    
    const rules = await prisma.expertRule.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Échec du chargement des règles' });
  }
});

// Update a rule threshold
router.put('/rules/:id', requireAuth, requireRole(['Super Admin']), async (req: any, res: Response) => {
  try {
    const { threshold } = req.body;
    if (threshold === undefined) {
      return res.status(400).json({ error: 'Le seuil est requis' });
    }
    
    const rule = await prisma.expertRule.update({
      where: { id: req.params.id },
      data: { threshold: Number(threshold) }
    });
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la mise à jour de la règle' });
  }
});

export default router;
