import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/official/dashboard
 * Election official dashboard with active elections and pending approvals
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get active elections
    const activeElections = await prisma.election.findMany({
      where: {
        status: { in: ['OPEN', 'DRAFT'] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        startAt: true,
        endAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get pending voter approvals
    const pendingVoters = await prisma.voterRegistration.findMany({
      where: {
        user: { status: 'PENDING' },
      },
      include: {
        user: {
          select: {
            name: true,
            createdAt: true,
          },
        },
      },
      take: 20,
    });

    return res.status(200).json({
      activeElections,
      pendingApprovals: pendingVoters.map((v) => ({
        voterId: v.voterId,
        registeredAt: v.user.createdAt,
        verificationInfo: v.verificationInfo,
      })),
      stats: {
        activeElectionCount: activeElections.length,
        pendingApprovalsCount: pendingVoters.length,
      },
    });
  } catch (error) {
    console.error('Official dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default authMiddleware(handler);
