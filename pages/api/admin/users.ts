import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/users
 * Manage all users (ADMIN only)
 */
const handleGet = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { skip: skipStr, take: takeStr, role, status } = req.query;

    const skip = skipStr ? Math.max(0, parseInt(skipStr as string, 10)) : 0;
    const take = takeStr ? Math.max(1, Math.min(100, parseInt(takeStr as string, 10))) : 20;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.user.count({ where });

    return res.status(200).json({
      users,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/admin/users/[id]
 * Update user role or status (ADMIN only)
 */
const handlePatch = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const { role, status } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default requireRole('ADMIN')(handler);
