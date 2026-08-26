// pages/api/votes/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireApprovedVoter } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'
import { createAuditLog } from '@/lib/db/audit'
import { Prisma } from '@prisma/client'

/**
 * POST /api/votes
 * Body: { electionId, ballotId, optionId }
 * Requires a verified, approved voter (requireApprovedVoter).
 *
 * Behavior:
 *  - validate election/ballot/option relationships and election status (OPEN)
 *  - rely on DB unique constraint @@unique([electionId, voterRegistrationId]) to prevent double-voting
 *  - return 409 if unique constraint violation occurs
 *  - write an audit log on success
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { electionId, ballotId, optionId } = req.body
  const user = (req as any).user

  if (!electionId || !ballotId || !optionId)
    return res.status(400).json({ error: 'Missing fields: electionId, ballotId, optionId required' })

  try {
    // 1) Ensure voter registration exists & is approved
    const voterReg = await prisma.voterRegistration.findUnique({
      where: { userId: user.userId },
    })
    if (!voterReg || !voterReg.approvedAt) {
      return res.status(403).json({ error: 'Voter registration not approved or not found' })
    }

    // 2) Verify election exists and is OPEN
    const election = await prisma.election.findUnique({ where: { id: electionId } })
    if (!election) return res.status(404).json({ error: 'Election not found' })
    if (election.status !== 'OPEN') return res.status(403).json({ error: 'Election is not open' })

    // 3) Verify ballot belongs to election
    const ballot = await prisma.ballot.findUnique({ where: { id: ballotId } })
    if (!ballot) return res.status(404).json({ error: 'Ballot not found' })
    if (ballot.electionId !== electionId)
      return res.status(400).json({ error: 'Ballot does not belong to specified election' })

    // 4) Verify option belongs to ballot
    const option = await prisma.option.findUnique({ where: { id: optionId } })
    if (!option) return res.status(404).json({ error: 'Option not found' })
    if (option.ballotId !== ballotId) return res.status(400).json({ error: 'Option does not belong to ballot' })

    // 5) Create vote (let DB unique constraint enforce one-vote-per-voter-per-election)
    try {
      const vote = await prisma.vote.create({
        data: {
          electionId,
          ballotId,
          optionId,
          voterRegistrationId: voterReg.id,
        },
      })

      // 6) Audit log (non-blocking)
      await createAuditLog({
        actorId: voterReg.userId,
        actorRole: 'VOTER' as any,
        action: 'vote_cast',
        targetType: 'election',
        targetId: electionId,
        details: { ballotId, optionId, voteId: vote.id },
      })

      return res.status(201).json({ voteId: vote.id })
    } catch (err: any) {
      // Prisma unique constraint error code for duplicate key is P2002
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return res.status(409).json({ error: 'A vote from this voter for this election already exists' })
      }
      throw err
    }
  } catch (err) {
    console.error('Cast vote error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireApprovedVoter(handler)
