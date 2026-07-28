import { Router, Response } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: { select: { name: true } },
        siteAssignments: { select: { siteId: true } }
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });

    res.json(users.map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      siteIds: user.siteAssignments.map((assignment: any) => assignment.siteId)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
