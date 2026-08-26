import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * POST /api/elections/[id]/ballots
 * Create a ballot within an election (ELECTION_OFFICIAL or ADMIN only)
 * Can only create ballots if election is in DRAFT status
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { title, type = 'SINGLE_CHOICE' } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Ballot title is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Only allow ballot creation if election is DRAFT
    if (election.status !== 'DRAFT') {
      return res.status(400).json({
        error: `Cannot add ballots to a ${election.status} election`,
      });
    }

    const ballot = await prisma.ballot.create({
      data: {
        electionId: id,
        title,
        type: type as any,
      },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'ballot_created',
      targetType: 'ballot',
      targetId: ballot.id,
      details: {
        electionId: id,
        title: ballot.title,
      },
    });

    return res.status(201).json(ballot);
  } catch (error) {
    console.error('Create ballot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
