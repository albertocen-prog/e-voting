import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid or missing id' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // If your Prisma schema uses an Int ID, convert it:
    // const targetId = parseInt(id, 10)
    // if (isNaN(targetId)) return res.status(400).json({ error: 'ID must be a number' })
    
    // If your Prisma schema uses String/UUID/CUID IDs:
    const targetId = id

    const ballot = await prisma.ballot.findUnique({
      where: { id: targetId },
      include: { options: true },
    })

    if (!ballot) {
      return res.status(404).json({ error: 'Not found' })
    }

    return res.status(200).json(ballot)
  } catch (error) {
    console.error('Error fetching ballot:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
