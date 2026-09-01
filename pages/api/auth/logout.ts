import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';

/**
 * POST /api/auth/logout
 * Logout endpoint (primarily client-side token removal)
 * Server-side: audit log the logout event
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Log logout event
    const { prisma } = await import('@/lib/db');
    await prisma.auditLog.create({
      data: {
        actorId: req.user.userId,
        actorRole: req.user.role,
        action: 'logout',
        targetType: 'user',
        targetId: req.user.userId,
      },
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler);
