import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'djezzy_super_secret_jwt_key_2026';

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        siteAssignments: { select: { siteId: true } }
      }
    });

    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // In a real app, compare bcrypt hash. For this MVP, all seeded users share admin123.
    if (user.passwordHash === 'hashed_password_mock') {
      if (password !== 'admin123') {
        return res.status(401).json({ error: { message: 'Invalid email or password' } });
      }
    } else if (password !== user.passwordHash) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    const token = jwt.sign(
      { id: user.id, roleId: user.roleId, roleName: user.role.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
          siteIds: user.siteAssignments.map((assignment: any) => assignment.siteId)
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Internal server error during login' } });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        siteAssignments: { select: { siteId: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        siteIds: user.siteAssignments.map((assignment: any) => assignment.siteId)
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

export default router;
