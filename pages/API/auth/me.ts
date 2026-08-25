import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler);
