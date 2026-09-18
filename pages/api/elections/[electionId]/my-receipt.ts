import type { NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/elections/[electionId]/my-receipt
 * Get personal voting receipt for authenticated voter
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { electionId } = req.query;

    if (!electionId || typeof electionId !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User ID missing from token' });
    }

    // 1. Get the voter registration record for this user
    const voterRegistration = await prisma.voterRegistration.findUnique({
      where: { userId },
    });

    if (!voterRegistration) {
      return res.status(404).json({ error: 'Voter registration not found' });
    }

    // 2. Fetch the vote using electionId and matching voter registration reference
    const vote = await prisma.vote.findFirst({
      where: {
        electionId: electionId,
        voterRegistrationId: voterRegistration.id,
      },
      include: {
        ballot: {
          select: {
            id: true,
            title: true,
          },
        },
        option: {
          select: {
            id: true,
            label: true,
          },
        },
      },
    });

    if (!vote) {
      return res.status(404).json({
        error: 'No vote found for this election',
      });
    }

    return res.status(200).json({
      voteId: vote.id,
      electionId,
      ballot: vote.ballot,
      selectedOption: vote.option,
      votedAt: vote.createdAt,
      message: 'Your vote has been recorded',
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler);
