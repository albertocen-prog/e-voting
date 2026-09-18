import type { NextApiResponse } from 'next'
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

async function handler(
  req: NextApiRequestWithAuth,
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
    const ballot = await prisma.ballot.findUnique({
      where: { id: id as string },
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

// Pass your required role here (e.g., 'ADMIN' or 'USER'):
export default requireRole(handler, 'USER')
