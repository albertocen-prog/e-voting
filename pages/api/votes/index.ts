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

interface VoterRegRow {
  id: string
  voter_id: string
  approved_at: Date | null
  user_id: string
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
      error: 'Missing fields: electionId, ballotId, optionId required' 
    })
  }

  try {
    const createdVoteId = await prisma.$transaction(
      async (tx) => {
        // 1) Lock voter registration row to prevent concurrent race conditions
        const rows = await tx.$queryRaw<VoterRegRow[]>`
          SELECT id, voter_id, approved_at, user_id
          FROM voter_registrations
          WHERE user_id = ${user.userId}
          FOR UPDATE
        `
        const voterReg = rows?.[0]
        if (!voterReg || !voterReg.approved_at) {
          throw { status: 403, message: 'Voter registration not approved or not found' }
        }

        // 2) Verify election exists and is OPEN
        const elections = await tx.$queryRaw<Array<{ id: string; status: string }>>`
          SELECT id, status FROM elections WHERE id = ${electionId} LIMIT 1
        `
        const election = elections?.[0]
        if (!election) throw { status: 404, message: 'Election not found' }
        if (election.status !== 'OPEN') throw { status: 403, message: 'Election is not open' }

        // 3) Verify ballot belongs to election
        const ballots = await tx.$queryRaw<Array<{ id: string; election_id: string }>>`
          SELECT id, election_id FROM ballots WHERE id = ${ballotId} LIMIT 1
        `
        const ballot = ballots?.[0]
        if (!ballot) throw { status: 404, message: 'Ballot not found' }
        if (ballot.election_id !== electionId) {
          throw { status: 400, message: 'Ballot does not belong to specified election' }
        }

        // 4) Verify option belongs to ballot
        const options = await tx.$queryRaw<Array<{ id: string; ballot_id: string }>>`
          SELECT id, ballot_id FROM options WHERE id = ${optionId} LIMIT 1
        `
        const option = options?.[0]
        if (!option) throw { status: 404, message: 'Option not found' }
        if (option.ballot_id !== ballotId) {
          throw { status: 400, message: 'Option does not belong to ballot' }
        }

        // 5) Check existing vote
        const existingVotes = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM votes
          WHERE election_id = ${electionId} AND voter_id = ${voterReg.voter_id}
          LIMIT 1
        `
        if (existingVotes && existingVotes.length > 0) {
          throw { status: 409, message: 'A vote from this voter for this election already exists' }
        }

        // 6) Insert vote using random UUID / CUID generator pattern
        const voteId = `cuid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        await tx.$executeRaw`
          INSERT INTO votes (id, election_id, ballot_id, option_id, voter_id, user_id, created_at)
          VALUES (${voteId}, ${electionId}, ${ballotId}, ${optionId}, ${voterReg.voter_id}, ${user.userId}, NOW())
        `

        // 7) Insert audit log
        const auditId = `cuid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        const detailsJson = JSON.stringify({ ballotId, optionId, voteId })

        await tx.$executeRaw`
          INSERT INTO audit_logs (id, actor_id, actor_role, action, target_type, target_id, election_id, details, created_at)
          VALUES (${auditId}, ${user.userId}, 'VOTER'::"UserRole", 'vote_cast', 'election', ${electionId}, ${electionId}, ${detailsJson}::jsonb, NOW())
        `

        return voteId
      },
      { maxWait: 5000, timeout: 10000 }
    )

    return res.status(201).json({ voteId: createdVoteId })
  } catch (err: any) {
    // Custom thrown error object handling
    if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
      return res.status(err.status).json({ error: err.message })
    }

    // PostgreSQL Unique Constraint Violation error code
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'A vote from this voter for this election already exists' })
    }

    console.error('Cast vote error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireApprovedVoter(handler as any)
