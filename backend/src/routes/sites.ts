import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

export default router;
