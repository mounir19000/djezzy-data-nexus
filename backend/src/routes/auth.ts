import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

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
      return res.status(401).json({ error: { message: 'Email ou mot de passe invalide' } });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Email ou mot de passe invalide' } });
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
    res.status(500).json({ error: { message: 'Erreur serveur interne pendant la connexion' } });
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
      return res.status(404).json({ error: { message: 'Utilisateur introuvable' } });
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
    res.status(500).json({ error: { message: 'Erreur serveur interne' } });
  }
});

export default router;
