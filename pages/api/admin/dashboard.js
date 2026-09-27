import { requireRole } from '@/lib/auth/middleware';
import CreateUserForm from '@/components/admin/CreateUserForm';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/dashboard
 * Admin dashboard with system overview metrics
 */
const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run election, voter, staff, and audit queries concurrently
    const [
      totalElections,
      openElections,
      closedElections,
      totalVoters,
      approvedVoters,
      pendingVoters,
      staffCount,
      recentLogs,
    ] = await Promise.all([
      // Election stats
      prisma.election.count(),
      prisma.election.count({ where: { status: 'OPEN' } }),
      prisma.election.count({ where: { status: 'CLOSED' } }),
      // Voter stats
      prisma.voterRegistration.count(),
      prisma.user.count({ where: { role: 'VOTER', status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'VOTER', status: 'PENDING' } }),
      // Staff counts (Admin, Official, Observer)
      prisma.user.count({
        where: {
          role: { in: ['ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN'] },
        },
      }),
      // Recent system activity audit log
      prisma.auditLog.findMany({
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
      }),
    ]);

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
        id: log.id,
        action: log.action,
        actor: log.actor?.name ?? 'System',
        role: log.actor?.role ?? 'SYSTEM',
        timestamp: log.createdAt,
      })),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ADMIN')(handler);
