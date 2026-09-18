// pages/api/votes/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { electionId, ballotId, optionId } = req.body
  const user = req.user

  if (!electionId || !ballotId || !optionId)
    return res.status(400).json({ error: 'Missing fields: electionId, ballotId, optionId required' })

  try {
    const createdVote = await prisma.$transaction(async (tx) => {
      // 1) Lock the voter registration row for this user
      const rows: Array<{ id: string; userId: string; approvedAt: Date | null }> = await tx.$queryRaw`
        SELECT id, "voterId", "approvedAt", "userId"
        FROM "VoterRegistration"
        WHERE "userId" = ${user.userId}
        FOR UPDATE
      `
      const voterReg = rows && rows[0]
      if (!voterReg || !voterReg.approvedAt) {
        throw { status: 403, message: 'Voter registration not approved or not found' }
      }

      // 2) Verify election exists and is OPEN
      const election = await tx.election.findUnique({ where: { id: electionId } })
      if (!election) throw { status: 404, message: 'Election not found' }
      if (election.status !== 'OPEN') throw { status: 403, message: 'Election is not open' }

      // 3) Verify ballot belongs to election
      const ballot = await tx.ballot.findUnique({ where: { id: ballotId } })
      if (!ballot) throw { status: 404, message: 'Ballot not found' }
      if (ballot.electionId !== electionId) throw { status: 400, message: 'Ballot does not belong to specified election' }

      // 4) Verify option belongs to ballot
      const option = await tx.option.findUnique({ where: { id: optionId } })
      if (!option) throw { status: 404, message: 'Option not found' }
      if (option.ballotId !== ballotId) throw { status: 400, message: 'Option does not belong to ballot' }

      // 5) Check existing vote via voterParticipation relation
      const existing = await tx.vote.findFirst({
        where: {
          electionId,
          voterParticipation: {
            voterRegistrationId: voterReg.id,
          },
        },
      })
      if (existing) {
        throw { status: 409, message: 'A vote from this voter for this election already exists' }
      }

      // 6) Create vote via voterParticipation relation
      const vote = await tx.vote.create({
        data: {
          electionId,
          ballotId,
          optionId,
          voterParticipation: {
            connect: {
              // Connect via unique composite or unique field on VoterParticipation
              voterRegistrationId_electionId: {
                voterRegistrationId: voterReg.id,
                electionId: electionId,
              },
            },
          },
        },
      })

      // 7) Create audit log inside the same tx
      await tx.auditLog.create({
        data: {
          actorId: voterReg.userId,
          actorRole: 'VOTER' as any,
          action: 'vote_cast',
          targetType: 'election',
          targetId: electionId,
          details: JSON.stringify({ ballotId, optionId, voteId: vote.id }),
        },
      })

      return vote
    }, { maxWait: 5000, timeout: 10000 })

    return res.status(201).json({ voteId: createdVote.id })
  } catch (err: any) {
    if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
      return res.status(err.status).json({ error: err.message })
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'A vote from this voter for this election already exists' })
    }

    console.error('Cast vote error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireRole('VOTER')(handler as any)
