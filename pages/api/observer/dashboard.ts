import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/observer/dashboard
 * Observer read-only dashboard with election overview and audit logs
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get election statistics (open and closed only)
    const elections = await prisma.election.findMany({
      where: {
        status: { in: ['OPEN', 'CLOSED'] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        startAt: true,
        endAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['vote_cast', 'election_opened', 'election_closed'] },
      },
      include: {
        actor: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Count votes per election
    const voteStats = await Promise.all(
      elections.map(async (election) => {
        const voteCount = await prisma.vote.count({
          where: { electionId: election.id },
        });
        return {
          electionId: election.id,
          voteCount,
        };
      })
    );

    return res.status(200).json({
      elections: elections.map((election) => ({
        ...election,
        votes: voteStats.find((s) => s.electionId === election.id)?.voteCount || 0,
      })),
      auditLogs: auditLogs.map((log) => ({
        action: log.action,
        actor: log.actor.name,
        timestamp: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('Observer dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('OBSERVER')(handler);
