import type { NextApiRequest, NextApiResponse } from 'next'
import { requireApprovedVoter } from '@/lib/auth/middleware'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { electionId, ballotId, optionId } = req.body
  // req.user injected by requireApprovedVoter -- Type might need cast depending on your types
  const user = (req as any).user

  if (!electionId || !ballotId || !optionId) return res.status(400).json({ error: 'Missing fields' })

  try {
    // TODO: perform transactional creation and enforce unique vote constraint
    // Example: check voterRegistration by user.userId then create Vote with prisma
    return res.status(501).json({ error: 'Not implemented: add transactional vote creation' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default requireApprovedVoter(handler)
