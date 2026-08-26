import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * POST /api/elections/[id]/close
 * Close an election
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'OPEN') {
      return res.status(400).json({
        error: `Election is in ${election.status} status. Can only close OPEN elections.`,
      });
    }

    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'election_closed',
      targetType: 'election',
      targetId: id,
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Close election error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
