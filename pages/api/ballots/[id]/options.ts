import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * POST /api/ballots/[id]/options
 * Add an option to a ballot (ELECTION_OFFICIAL or ADMIN only)
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { label, metadata } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Ballot ID is required' });
    }

    if (!label) {
      return res.status(400).json({ error: 'Option label is required' });
    }

    const ballot = await prisma.ballot.findUnique({
      where: { id },
      include: { election: true },
    });

    if (!ballot) {
      return res.status(404).json({ error: 'Ballot not found' });
    }

    // Only allow adding options if election is in DRAFT status
    if (ballot.election.status !== 'DRAFT') {
      return res.status(400).json({
        error: `Cannot add options to ballots in a ${ballot.election.status} election`,
      });
    }

    const option = await prisma.option.create({
      data: {
        ballotId: id,
        label,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'option_created',
      targetType: 'option',
      targetId: option.id,
      details: {
        ballotId: id,
        label: option.label,
      },
    });

    return res.status(201).json(option);
  } catch (error) {
    console.error('Create option error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
