import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * POST /api/voters/register
 * Register a new voter (public endpoint)
 * Creates voter registration with PENDING approval status
 */
const handlePost = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { voterId, verificationInfo } = req.body;

    if (!voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    // Check if voter ID already exists
    const existing = await prisma.voterRegistration.findUnique({
      where: { voterId },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Voter ID already registered',
      });
    }

    // Create user account with PENDING status
    const user = await prisma.user.create({
      data: {
        email: `voter-${voterId}@e-elct.local`,
        name: voterId,
        role: 'VOTER',
        status: 'PENDING',
      },
    });

    // Create voter registration
    const registration = await prisma.voterRegistration.create({
      data: {
        userId: user.id,
        voterId,
        verificationInfo,
      },
      select: {
        id: true,
        voterId: true,
        createdAt: true,
      },
    });

    // Log action
    const { createAuditLog } = await import('@/lib/db/audit');
    await createAuditLog({
      actorId: user.id,
      actorRole: 'VOTER',
      action: 'voter_registration_created',
      targetType: 'voter_registration',
      targetId: registration.id,
      details: {
        voterId: voterId,
      },
    });

    return res.status(201).json({
      message: 'Registration submitted successfully',
      registration,
      status: 'pending_approval',
    });
  } catch (error) {
    console.error('Voter registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default handler;
