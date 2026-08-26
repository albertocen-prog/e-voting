import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * GET /api/elections/[electionId]/voters
 * Get list of voters for an election (ELECTION_OFFICIAL or ADMIN only)
 * Shows voters who have voted and their vote timestamps
 */
const handleGet = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { electionId } = req.query;

    if (!electionId || typeof electionId !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Get all voter registrations and check if they voted
    const voters = await prisma.voterRegistration.findMany({
      include: {
        user: {
          select: {
            name: true,
            status: true,
          },
        },
        votes: {
          where: { electionId },
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Map to include vote status
    const voterList = voters.map((voter) => ({
      voterId: voter.voterId,
      name: voter.user.name,
      status: voter.user.status,
      hasVoted: voter.votes.length > 0,
      votedAt: voter.votes[0]?.createdAt || null,
    }));

    return res.status(200).json({
      electionId,
      voters: voterList,
      total: voterList.length,
      votedCount: voterList.filter((v) => v.hasVoted).length,
    });
  } catch (error) {
    console.error('Get voters error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
