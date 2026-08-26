import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/observer/audit-logs
 * Detailed audit log viewer for observers
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { election_id, skip: skipStr, take: takeStr, startDate, endDate } = req.query;

    const skip = skipStr ? Math.max(0, parseInt(skipStr as string, 10)) : 0;
    const take = takeStr ? Math.max(1, Math.min(100, parseInt(takeStr as string, 10))) : 100;

    const where: any = {};
    if (election_id) where.targetId = election_id;
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
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
        action: log.action,
        actor: log.actor,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details ? JSON.parse(log.details) : null,
        timestamp: log.createdAt,
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

export default requireRole('OBSERVER')(handler);
