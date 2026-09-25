import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import jwt from 'jsonwebtoken';

/**
 * Basic authentication middleware wrapper
 */
export function authMiddleware(handler) {
  return async (req, res) => {
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
      );

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

/**
 * Middleware wrapper enforcing role-based authorization
 */
export function requireRole(allowedRoles) {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (handler) => {
    return async (req, res) => {
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
        );

        req.user = decoded;

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

/**
 * Middleware wrapper ensuring the user has a VOTER role and is approved
 */
export function requireApprovedVoter(handler) {
  return async (req, res) => {
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
      );

      req.user = decoded;

      const isVoter = decoded.role === 'VOTER' || decoded.role === 'voter';
      const isApproved = decoded.isApproved ?? true;

      if (!isVoter || !isApproved) {
        return res.status(403).json({
          error: 'Forbidden: You must be an approved voter to perform this action.',
        });
      }

      return handler(req, res);
    } catch (error) {
      console.error('Approval check error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
