import type { NextApiRequest, NextApiResponse } from 'next'
import { Prisma } from '@prisma/client'
import { requireRole } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { electionId } = req.query

    // Guard against array inputs from duplicate query strings
    if (Array.isArray(electionId)) {
      return res.status(400).json({ error: 'Invalid electionId parameter' })
    }

    // Strongly typed Prisma filter
    const where: Prisma.BallotWhereInput = {}
    if (electionId) {
      where.electionId = electionId
    }

    try {
      const ballots = await prisma.ballot.findMany({ where })
      return res.status(200).json(ballots)
    } catch (error) {
      console.error('Fetch ballots error:', error)
      return res.status(500).json({ error: 'Failed to fetch ballots' })
    }
  }

  if (req.method === 'POST') {
    const { electionId, title, type } = req.body

    if (!electionId || !title) {
      return res.status(400).json({ error: 'Missing required fields: electionId, title' })
    }

    try {
      const ballot = await prisma.ballot.create({
        data: {
          electionId,
          title,
          type: type || 'SINGLE_CHOICE',
        },
      })
      return res.status(201).json(ballot)
    } catch (error) {
      console.error('Create ballot error:', error)
      return res.status(500).json({ error: 'Failed to create ballot' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Applies role guard to the entire route handler
export default requireRole(['ELECTION_OFFICIAL', 'ADMIN'])(handler)
