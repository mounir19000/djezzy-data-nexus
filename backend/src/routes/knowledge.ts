import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

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

router.post('/', requireAuth, requireRole(['Engineer']), async (req: any, res: Response) => {
  const { title, category, tags, content } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'title, category, and content are required' });
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag: string) => String(tag).trim()).filter(Boolean)
    : String(tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  try {
    const article = await prisma.knowledgeBase.create({
      data: {
        title: String(title),
        category: String(category),
        tags: normalizedTags,
        content: String(content)
      }
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Create knowledge article error:', error);
    res.status(500).json({ error: 'Failed to create KB article' });
  }
});

export default router;
