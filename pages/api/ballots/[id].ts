import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Invalid id' })
  if (req.method === 'GET') {
    const ballot = await prisma.ballot.findUnique({ where: { id }, include: { options: true } })
    if (!ballot) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(ballot)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
