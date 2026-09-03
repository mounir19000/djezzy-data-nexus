import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roleId: string;
    roleName: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Non autorisé : aucun token fourni' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Non autorisé : token invalide' } });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Non autorisé' } });
    }

    if (req.user.roleName === 'Super Admin') {
      return next(); // Super Admin can access everything
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({ error: { message: 'Accès refusé : permissions insuffisantes' } });
    }

    next();
  };
};
