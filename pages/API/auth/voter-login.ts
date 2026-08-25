import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth/jwt';
import { VoterLoginRequest, AuthResponse } from '@/lib/auth/types';

/**
 * POST /api/auth/voter-login
 * Voter ID-based login endpoint
 *
 * Security Note: In production, add:
 * - Rate limiting (e.g., 5 attempts per minute)
 * - Admin approval requirement for voter IDs
 * - Optional one-time code verification
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voterId } = req.body as VoterLoginRequest;

    if (!voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    // Find voter registration
    const voterRegistration = await prisma.voterRegistration.findUnique({
      where: { voterId },
      include: { user: true },
    });

    if (!voterRegistration) {
      return res
        .status(404)
        .json({ error: 'Voter ID not found. Please register first.' });
    }

    const user = voterRegistration.user;

    if (user.status === 'PENDING') {
      return res.status(403).json({
        error: 'Your voter registration is pending approval',
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({
        error: 'Your voter registration was rejected',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'Your account has been suspended',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      voterId: voterRegistration.voterId,
      role: user.role as any,
      status: user.status as any,
    });

    // Log successful login
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'voter_login',
        targetType: 'user',
        targetId: user.id,
        details: JSON.stringify({ voterId: voterRegistration.voterId }),
      },
    });

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Voter login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
