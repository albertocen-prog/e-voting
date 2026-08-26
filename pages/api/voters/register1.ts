import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, voterId, verificationInfo } = req.body
  if (!name || !email || !voterId) return res.status(400).json({ error: 'Missing fields' })

  try {
    // Create user + voter registration (basic)
    const user = await prisma.user.create({
      data: { name, email, role: 'VOTER' as any },
    })
    const reg = await prisma.voterRegistration.create({
      data: { userId: user.id, voterId, verificationInfo },
    })
    return res.status(201).json({ user, registration: reg })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
