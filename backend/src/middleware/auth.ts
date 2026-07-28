import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'djezzy_super_secret_jwt_key_2026';

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
    return res.status(401).json({ error: { message: 'Unauthorized: No token provided' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Unauthorized: Invalid token' } });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    if (req.user.roleName === 'Super Admin') {
      return next(); // Super Admin can access everything
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({ error: { message: 'Forbidden: Insufficient role permissions' } });
    }

    next();
  };
};
