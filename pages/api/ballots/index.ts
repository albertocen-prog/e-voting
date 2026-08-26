import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { electionId } = req.query
    const where: any = {}
    if (electionId) where.electionId = String(electionId)
    const ballots = await prisma.ballot.findMany({ where })
    return res.status(200).json(ballots)
  } else if (req.method === 'POST') {
    // create ballot (official role)
    const { electionId, title, type } = req.body
    if (!electionId || !title) return res.status(400).json({ error: 'Missing fields' })
    const ballot = await prisma.ballot.create({ data: { electionId, title, type: type || 'SINGLE_CHOICE' } })
    return res.status(201).json(ballot)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler)
