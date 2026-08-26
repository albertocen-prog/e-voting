import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { electionId } = req.query
  if (!electionId || Array.isArray(electionId)) return res.status(400).json({ error: 'Invalid electionId' })

  try {
    // Aggregate votes per option for the election
    const results = await prisma.$queryRaw`
      SELECT "optionId", COUNT(*) as count
      FROM "Vote"
      WHERE "electionId" = ${electionId}
      GROUP BY "optionId"
    `
    return res.status(200).json({ results })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
