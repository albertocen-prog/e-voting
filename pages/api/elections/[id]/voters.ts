import type { NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/elections/[electionId]/voters
 * Get list of voters for an election
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

    const voters = await prisma.voterRegistration.findMany({
      include: {
        user: {
          select: {
            name: true,
            status: true,
          },
        },
        participations: {
          where: {
            ballot: {
              id: electionId,
            },
          },
          select: {
            id: true,
            votedAt: true,
          },
        },
      },
    });

    const voterList = voters.map((voter) => ({
      voterId: voter.voterId,
      name: voter.user.name,
      status: voter.user.status,
      hasVoted: voter.participations.length > 0,
      votedAt: voter.participations[0]?.votedAt || null,
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return handleGet(req, res);
};

export default requireRole(['ELECTION_OFFICIAL', 'ADMIN'])(handler);
