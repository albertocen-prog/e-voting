import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * POST /api/elections/[id]/open
 * Open an election for voting (ELECTION_OFFICIAL or ADMIN only)
 * Transitions election from DRAFT to OPEN
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'DRAFT') {
      return res.status(400).json({
        error: `Election is in ${election.status} status. Can only open DRAFT elections.`,
      });
    }

    // Verify election has at least one ballot with options
    const ballotCount = await prisma.ballot.count({
      where: { electionId: id },
    });

    if (ballotCount === 0) {
      return res.status(400).json({
        error: 'Election must have at least one ballot before opening',
      });
    }

    // Update election status
    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'OPEN' },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'election_opened',
      targetType: 'election',
      targetId: id,
      details: {
        reason: req.body?.reason || 'No reason provided',
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Open election error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
