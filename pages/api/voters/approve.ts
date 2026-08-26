import type { NextApiRequest, NextApiResponse } from 'next'
import { requireRole } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { voterRegistrationId, approve } = req.body
  if (!voterRegistrationId) return res.status(400).json({ error: 'Missing voterRegistrationId' })

  try {
    if (approve) {
      const updated = await prisma.voterRegistration.update({
        where: { id: voterRegistrationId },
        data: { approvedAt: new Date(), approvedBy: (req as any).user?.userId || null },
      })
      return res.status(200).json(updated)
    } else {
      // example: mark rejected via approver/approvedAt handling
      const updated = await prisma.voterRegistration.update({
        where: { id: voterRegistrationId },
        data: { approvedAt: null },
      })
      return res.status(200).json(updated)
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler)
