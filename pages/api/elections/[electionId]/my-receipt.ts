import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/elections/[electionId]/my-receipt
 * Get personal voting receipt for authenticated voter
 * Shows what the voter voted for and when (no other voter information)
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

    // Get voter registration for this user
    const voterRegistration = await prisma.voterRegistration.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!voterRegistration) {
      return res.status(404).json({
        error: 'Voter registration not found',
      });
    }

    // Get the vote for this voter in this election
    const vote = await prisma.vote.findUnique({
      where: {
        electionId_voterRegistrationId: {
          electionId,
          voterRegistrationId: voterRegistration.id,
        },
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
