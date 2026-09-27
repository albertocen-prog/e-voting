import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth/jwt';

/**
 * POST /api/auth/voter-login
 * Voter ID-based login endpoint
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voterId } = req.body;

    if (!voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

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
      return res.status(403).json({ error: 'Your voter registration is pending approval' });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({ error: 'Your voter registration was rejected' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    const token = signToken({
      userId: user.id,
      voterId: voterRegistration.voterId,
      role: user.role,
      status: user.status,
    });

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

    const response = {
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
