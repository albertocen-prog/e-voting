import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface NextApiRequestWithAuth extends NextApiRequest {
  user?: any;
}

export type MiddlewareHandler = (
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Middleware wrapper enforcing role-based authorization
 */
export function requireRole(allowedRoles: string | string[]) {
  // 1. Declare and normalize allowedRoles into an array
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (handler: MiddlewareHandler) => {
    return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
      try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.substring(7)
          : req.cookies?.token;

        if (!token) {
          return res.status(401).json({ error: 'Authentication token missing' });
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback-secret-key'
        ) as any;

        req.user = decoded;

        // 2. READ & USE 'rolesArray' HERE to perform the role check
        if (rolesArray.length > 0 && !rolesArray.includes(decoded.role)) {
          return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        }

        return handler(req, res);
      } catch (error) {
        console.error('Authorization middleware error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    };
  };
}
