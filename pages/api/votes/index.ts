import type { NextApiRequest, NextApiResponse } from 'next' 
import { requireApprovedVoter } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

export interface AuthUser {
  userId: string
  role: string
  [key: string]: any
}

export interface AuthenticatedRequest extends NextApiRequest {
  user: AuthUser
}

/**
 * POST /api/votes
 * Body: { electionId, ballotId, optionId }
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { electionId, ballotId, optionId } = req.body
  const { user } = req

  if (!electionId || !ballotId || !optionId) {
    return res.status(400).json({
      error: 'Missing fields: electionId, ballotId, and optionId are required',
    })
  }

  try {
    const createdVoteId = await prisma.$transaction(
      async (tx) => {
        // 1) Lock voter registration row to prevent race conditions
        const rows = await tx.$queryRaw<Array<{ id: string; approved_at: Date | null }>>`
          SELECT id, approved_at
          FROM voter_registrations
          WHERE user_id = ${user.userId}
          FOR UPDATE
        `
        const voterReg = rows?.[0]
        if (!voterReg || !voterReg.approved_at) {
          throw { status: 403, message: 'Voter registration not approved or not found' }
        }

        // 2) Verify election exists and is OPEN
        const election = await tx.election.findFirst({
          where: { id: electionId },
          select: { id: true, status: true },
        })
        if (!election) throw { status: 404, message: 'Election not found' }
        if (election.status !== 'OPEN') throw { status: 403, message: 'Election is not open' }

        // 3) Verify ballot belongs to election
        const ballot = await tx.ballot.findFirst({
          where: { id: ballotId },
          select: { id: true, electionId: true },
        })
        if (!ballot) throw { status: 404, message: 'Ballot not found' }
        if (ballot.electionId!== electionId) {
          throw { status: 400, message: 'Ballot does not belong to specified election' }
        }

        // 4) Verify option belongs to ballot
        const option = await tx.option.findFirst({
          where: { id: optionId },
          select: { id: true, ballotId: true },
        })
        if (!option) throw { status: 404, message: 'Option not found' }
        if (option.ballotId !== ballotId) {
          throw { status: 400, message: 'Option does not belong to ballot' }
        }

        // 5) Record participation (enforces unique [ballotId, voterRegistrationId])
        await tx.ballotParticipation.create({
          data: {
            ballotId,
            voterRegistrationId: voterReg.id,
          },
        })

        // 6) Create anonymous vote entry
        const vote = await tx.vote.create({
          data: {
            electionId,
            ballotId,
            optionId,
          },
        })

        // 7) Create audit log entry
        await tx.auditLog.create({
          data: {
            actorId: user.userId,
            actorRole: 'VOTER' as any,
            action: 'vote_cast',
            targetType: 'election',
            targetId: electionId,
            electionId,
            details:JSON.stringify ({ballotId, optionId, voteId: vote.id }),
          },
        })

        return vote.id
      },
      { maxWait: 5000, timeout: 10000 }
    )

    return res.status(201).json({ voteId: createdVoteId })
  } catch (err: any) {
    if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
      return res.status(err.status).json({ error: err.message })
    }

    // Prisma Unique Constraint Violation (P2002) for BallotParticipation
    if (err?.code === 'P2002' || err?.code === '23505') {
      return res.status(409).json({ error: 'You have already voted on this ballot' })
    }

    console.error('Cast vote error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireApprovedVoter(handler as any)
