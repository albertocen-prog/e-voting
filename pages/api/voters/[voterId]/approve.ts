import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * POST /api/voters/[voterId]/approve
 * Approve a voter registration (ADMIN or ELECTION_OFFICIAL only)
 */
const handlePost = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { voterId } = req.query;

    if (!voterId || typeof voterId !== 'string') {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    const registration = await prisma.voterRegistration.findUnique({
      where: { voterId },
      include: { user: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Voter registration not found' });
    }

    if (registration.user.status === 'APPROVED') {
      return res.status(400).json({
        error: 'Voter is already approved',
      });
    }

    // Update user status to APPROVED
    const updated = await prisma.user.update({
      where: { id: registration.userId },
      data: { status: 'APPROVED' },
    });

    // Update registration with approval details
    await prisma.voterRegistration.update({
      where: { voterId },
      data: {
        approvedBy: req.user!.userId,
        approvedAt: new Date(),
      },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'voter_approved',
      targetType: 'voter_registration',
      targetId: registration.id,
      details: {
        voterId: voterId,
      },
    });

    return res.status(200).json({
      message: 'Voter approved successfully',
      voterId,
      status: 'APPROVED',
    });
  } catch (error) {
    console.error('Approve voter error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
