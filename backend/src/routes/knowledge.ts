import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { buildExpertKnowledgeArticles } from '../services/expertSystem';

const router = Router();

// Get all KB articles
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const [manualArticles, tickets] = await Promise.all([
      prisma.knowledgeBase.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ticket.findMany({
        include: {
          report: true,
          alarm: true,
          equipment: {
            include: {
              room: { include: { site: true } }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 200
      })
    ]);

    const expertArticles = buildExpertKnowledgeArticles(tickets);
    const normalizedManualArticles = manualArticles.map((article: any) => ({
      ...article,
      failureType: article.category,
      severity: article.tags?.find((tag: string) => ['Info', 'Faible', 'Moyenne', 'Élevée', 'Elevee', 'Critique', 'Critical', 'Warning'].includes(tag)) || 'General',
      problem: article.content,
      symptoms: [],
      causes: [],
      resolution: [],
      relatedEquipment: article.tags || [],
      engineerNotes: [],
      similarCases: [],
      relatedTickets: [],
      rooms: [],
      alarmTypes: []
    }));

    const query = String(req.query.search || '').trim().toLowerCase();
    const equipment = String(req.query.equipment || '').trim().toLowerCase();
    const room = String(req.query.room || '').trim().toLowerCase();
    const failureType = String(req.query.failureType || '').trim().toLowerCase();
    const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : null;
    const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)) : null;

    const articles = [...expertArticles, ...normalizedManualArticles]
      .filter((article: any) => {
        const haystack = [
          article.title,
          article.category,
          article.content,
          article.problem,
          ...(article.tags || []),
          ...(article.symptoms || []),
          ...(article.causes || []),
          ...(article.resolution || []),
          ...(article.relatedEquipment || []),
          ...(article.rooms || [])
        ].join(' ').toLowerCase();

        if (query && !haystack.includes(query)) return false;
        if (equipment && !(article.relatedEquipment || []).join(' ').toLowerCase().includes(equipment)) return false;
        if (room && !(article.rooms || []).join(' ').toLowerCase().includes(room)) return false;
        if (failureType && String(article.failureType || article.category).toLowerCase() !== failureType) return false;

        const createdAt = new Date(article.createdAt).getTime();
        if (dateFrom && !Number.isNaN(dateFrom.getTime()) && createdAt < dateFrom.getTime()) return false;
        if (dateTo && !Number.isNaN(dateTo.getTime()) && createdAt > dateTo.getTime()) return false;
        return true;
      })
      .sort((left: any, right: any) => {
        if (left.ruleId && !right.ruleId) return -1;
        if (!left.ruleId && right.ruleId) return 1;
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      });

    res.json(articles);
  } catch (error) {
    console.error('Fetch KB articles error:', error);
    res.status(500).json({ error: 'Échec du chargement des articles de connaissance' });
  }
});

router.get('/filters', requireAuth, async (req, res: Response) => {
  try {
    const manualArticles = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const articles = [...buildExpertKnowledgeArticles(), ...manualArticles.map((article: any) => ({
      ...article,
      failureType: article.category,
      relatedEquipment: article.tags || [],
      rooms: []
    }))];

    res.json({
      equipment: [...new Set(articles.flatMap((article: any) => article.relatedEquipment || []))].sort(),
      room: [...new Set(articles.flatMap((article: any) => article.rooms || []))].sort(),
      failureType: [...new Set(articles.map((article: any) => article.failureType || article.category).filter(Boolean))].sort()
    });
  } catch (error) {
    res.status(500).json({ error: 'Échec du chargement des filtres de connaissance' });
  }
});

router.post('/', requireAuth, requireRole(['Engineer']), async (req: any, res: Response) => {
  const { title, category, tags, content } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ error: 'title, category et content sont requis' });
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
    res.status(500).json({ error: 'Échec de la création de l’article de connaissance' });
  }
});

export default router;
