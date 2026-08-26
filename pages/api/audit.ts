import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/audit?election_id=&actor_id=&action=&skip=&take=
 * Get audit logs with filtering
 * Accessible to ELECTION_OFFICIAL, OBSERVER, and ADMIN
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { election_id, actor_id, action, skip: skipStr, take: takeStr } = req.query;

    const skip = skipStr ? Math.max(0, parseInt(skipStr as string, 10)) : 0;
    const take = takeStr ? Math.max(1, Math.min(100, parseInt(takeStr as string, 10))) : 50;

    const where: any = {};
    if (election_id) where.targetId = election_id;
    if (actor_id) where.actorId = actor_id;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.auditLog.count({ where });

    return res.status(200).json({
      logs: logs.map((log) => ({
        id: log.id,
        actor: log.actor,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details ? JSON.parse(log.details) : null,
        createdAt: log.createdAt,
      })),
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireRole('ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN')(handler);
