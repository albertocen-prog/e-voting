import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './jwt';
import { DecodedToken } from './types';

export interface NextApiRequestWithAuth extends NextApiRequest {
  user?: DecodedToken;
}

const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * Authentication Middleware
 */
export const authMiddleware = (handler: withAuth) => {
  return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
      }

      const decoded = verifyToken(token) as unknown as DecodedToken;
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles: string[]) => {
  return (handler: any) => {
    return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
      try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
          return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const decoded = verifyToken(token) as unknown as DecodedToken;

        if (!roles.includes(decoded.role)) {
          return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        req.user = decoded;
        return handler(req, res);
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      }
    };
  };
};
