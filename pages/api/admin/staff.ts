import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

/**
 * POST /api/admin/staff
 * Create a new staff member (official, observer, admin)
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        error: 'email, password, name, and role are required',
      });
    }

    if (!['ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be ELECTION_OFFICIAL, OBSERVER, or ADMIN',
      });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        status: 'APPROVED', // Staff accounts auto-approved
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ADMIN')(handler);
