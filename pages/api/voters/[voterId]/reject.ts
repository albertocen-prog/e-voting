import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * POST /api/voters/[voterId]/reject
 * Reject a voter registration (ADMIN only)
 */
const handlePost = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { voterId } = req.query;
    const { reason } = req.body;

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

    if (registration.user.status === 'REJECTED') {
      return res.status(400).json({
        error: 'Voter is already rejected',
      });
    }

    // Update user status to REJECTED
    await prisma.user.update({
      where: { id: registration.userId },
      data: { status: 'REJECTED' },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'voter_rejected',
      targetType: 'voter_registration',
      targetId: registration.id,
      details: {
        voterId: voterId,
        reason: reason || 'No reason provided',
      },
    });

    return res.status(200).json({
      message: 'Voter rejected successfully',
      voterId,
      status: 'REJECTED',
    });
  } catch (error) {
    console.error('Reject voter error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default requireRole('ADMIN')(handler);
