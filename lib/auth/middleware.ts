import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { DecodedToken } from './types';

// Extend NextApiRequest to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export interface NextApiRequestWithAuth extends NextApiRequest {
  user?: DecodedToken;
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authMiddleware = (handler: any) => {
  return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole =
  (...roles: string[]) =>
  (handler: any) => {
    return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
      try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }

        if (!roles.includes(decoded.role)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        req.user = decoded;
        return handler(req, res);
      } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  };

/**
 * Voter-specific middleware (checks approval status)
 */
export const requireApprovedVoter = (handler: any) => {
  return async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      if (decoded.role !== 'VOTER') {
        return res.status(403).json({ error: 'Voter access only' });
      }

      if (decoded.status !== 'APPROVED') {
        return res
          .status(403)
          .json({ error: 'Your voter registration has not been approved' });
      }

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
