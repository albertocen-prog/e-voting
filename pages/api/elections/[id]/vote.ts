import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

export interface NextApiRequestWithAuth extends NextApiRequest {
  user?: any;
}

interface VoteRequest {
  electionId: string;
  ballotId: string;
  optionId: string;
}

/**
 * POST /api/elections/[id]/vote
 * Cast an anonymous vote and record ballot participation (APPROVED voter only)
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { electionId, ballotId, optionId } = req.body as VoteRequest;

    if (!electionId || !ballotId || !optionId) {
      return res.status(400).json({
        error: 'electionId, ballotId, and optionId are required',
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User identity missing' });
    }

    // 1. Verify user exists and is APPROVED
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user || user.status !== 'APPROVED') {
      return res.status(403).json({
        error: 'Forbidden: Your voter account must be approved to cast a vote.',
      });
    }

    // 2. Fetch voter registration for this user
    const voterRegistration = await prisma.voterRegistration.findUnique({
      where: { userId },
    });

    if (!voterRegistration) {
      return res.status(404).json({
        error: 'Voter registration not found',
      });
    }

    // 3. Verify election exists and is OPEN
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'OPEN') {
      return res.status(400).json({
        error: `Election is ${election.status}. Voting is not currently allowed.`,
      });
    }

    // 4. Verify ballot exists and belongs to election
    const ballot = await prisma.ballot.findUnique({
      where: { id: ballotId },
    });

    if (!ballot || ballot.electionId !== electionId) {
      return res.status(404).json({ error: 'Ballot not found' });
    }

    // 5. Verify option exists and belongs to ballot
    const option = await prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option || option.ballotId !== ballotId) {
      return res.status(404).json({ error: 'Option not found' });
    }

    // 6. Check if voter has already participated in this ballot
    const existingParticipation = await prisma.ballotParticipation.findUnique({
      where: {
        ballotId_voterRegistrationId: {
          ballotId,
          voterRegistrationId: voterRegistration.id,
        },
      },
    });

    if (existingParticipation) {
      return res.status(409).json({
        error: 'You have already voted on this ballot',
      });
    }

    // 7. Atomic transaction: Record participation & save anonymous vote
    const [participation, vote] = await prisma.$transaction([
      prisma.ballotParticipation.create({
        data: {
          ballotId,
          voterRegistrationId: voterRegistration.id,
        },
      }),
      prisma.vote.create({
        data: {
          electionId,
          ballotId,
          optionId,
        },
      }),
    ]);

    // 8. Log audit record
    await createAuditLog({
      actorId: userId,
      actorRole: 'VOTER',
      action: 'vote_cast',
      targetType: 'vote',
      targetId: vote.id,
      details: {
        electionId,
        ballotId,
        optionId,
      },
    });

    return res.status(201).json({
      message: 'Vote recorded successfully',
      receiptId: participation.id,
      electionId,
    });
  } catch (error: any) {
    console.error('Vote casting error:', error);

    // Handle unique constraint violation on BallotParticipation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'You have already voted on this ballot',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler);
