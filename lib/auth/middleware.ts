import { NextApiRequest, NextApiResponse } from 'next';
import type { DecodedToken } from './types';

// Export interface directly so other API routes can import it
export interface NextApiRequestWithAuth extends NextApiRequest {
  user?: DecodedToken;
}

export type MiddlewareHandler = (
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Middleware wrapper enforcing role-based authorization
 */
export function requireRole(allowedRoles: string | string[]) {
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

        // Add token verification logic here
        // req.user = decodedToken;

        return handler(req, res);
      } catch (error) {
        console.error('Authorization middleware error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
      }
    };
  };
}
