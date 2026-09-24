import type { NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/elections/[electionId]/my-receipt
 * Get personal voting participation receipt for authenticated voter
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

    // 1. Fetch voter registration for the current authenticated user
    const voterRegistration = await prisma.voterRegistration.findUnique({
      where: { userId },
    });

    if (!voterRegistration) {
      return res.status(404).json({ error: 'Voter registration not found' });
    }

    // 2. Query participation via BallotParticipation using the user's voterRegistrationId
    const participation = await prisma.ballotParticipation.findFirst({
      where: {
        voterRegistrationId: voterRegistration.id,
        ballot: {
          electionId: electionId,
        },
      },
      include: {
        ballot: {
          select: {
            electionId: true,
            title: true,
          },
        },
      },
    });

    if (!participation) {
      return res.status(404).json({
        error: 'No vote participation record found for this election',
      });
    }

    return res.status(200).json({
      receiptId: participation.id,
      electionId,
      ballot: participation.ballot,
      votedAt: participation.votedAt,
      message: 'Your vote participation has been recorded',
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler);
