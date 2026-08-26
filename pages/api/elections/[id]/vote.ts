import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireApprovedVoter } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

interface VoteRequest {
  electionId: string;
  ballotId: string;
  optionId: string;
}

/**
 * POST /api/elections/[id]/vote
 * Cast a vote (APPROVED voter only)
 *
 * Security:
 * - Voter must be authenticated and approved
 * - Database unique constraint: (electionId, voterRegistrationId) prevents duplicate votes
 * - Application layer also checks to prevent race conditions
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

    // Get voter registration for this user
    const voterRegistration = await prisma.voterRegistration.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!voterRegistration) {
      return res.status(404).json({
        error: 'Voter registration not found',
      });
    }

    // Verify election exists and is OPEN
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

    // Verify ballot exists and belongs to election
    const ballot = await prisma.ballot.findUnique({
      where: { id: ballotId },
    });

    if (!ballot || ballot.electionId !== electionId) {
      return res.status(404).json({ error: 'Ballot not found' });
    }

    // Verify option exists and belongs to ballot
    const option = await prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option || option.ballotId !== ballotId) {
      return res.status(404).json({ error: 'Option not found' });
    }

    // Check if voter already voted in this election
    const existingVote = await prisma.vote.findUnique({
      where: {
        electionId_voterRegistrationId: {
          electionId,
          voterRegistrationId: voterRegistration.id,
        },
      },
    });

    if (existingVote) {
      return res.status(409).json({
        error: 'You have already voted in this election',
      });
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        electionId,
        ballotId,
        optionId,
        voterRegistrationId: voterRegistration.id,
      },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: 'VOTER',
      action: 'vote_cast',
      targetType: 'vote',
      targetId: vote.id,
      details: {
        electionId,
        ballotId,
        optionId,
        voterRegistrationId: voterRegistration.id,
      },
    });

    return res.status(201).json({
      message: 'Vote recorded successfully',
      voteId: vote.id,
      electionId,
    });
  } catch (error: any) {
    console.error('Vote casting error:', error);

    // Handle unique constraint violation (duplicate vote)
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'You have already voted in this election',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireApprovedVoter(handler);
