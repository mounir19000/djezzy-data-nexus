import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all KB articles
router.get('/', requireAuth, async (req, res: Response) => {
  try {
    const articles = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KB articles' });
  }
});

export default router;
