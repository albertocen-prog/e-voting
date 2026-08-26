import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/dashboard
 * Admin dashboard with system overview
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get election statistics
    const [totalElections, openElections, closedElections] = await Promise.all([
      prisma.election.count(),
      prisma.election.count({ where: { status: 'OPEN' } }),
      prisma.election.count({ where: { status: 'CLOSED' } }),
    ]);

    // Get user statistics
    const [totalVoters, approvedVoters, pendingVoters] = await Promise.all([
      prisma.voterRegistration.count(),
      prisma.user.count({ where: { role: 'VOTER', status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'VOTER', status: 'PENDING' } }),
    ]);

    // Get staff users
    const staffCount = await prisma.user.count({
      where: {
        role: { in: ['ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN'] },
      },
    });

    // Get recent activity
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        action: { in: ['vote_cast', 'election_opened', 'election_closed'] },
      },
      include: {
        actor: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.status(200).json({
      elections: {
        total: totalElections,
        open: openElections,
        closed: closedElections,
      },
      voters: {
        total: totalVoters,
        approved: approvedVoters,
        pending: pendingVoters,
      },
      staff: staffCount,
      recentActivity: recentLogs.map((log) => ({
        action: log.action,
        actor: log.actor.name,
        timestamp: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ADMIN')(handler);
