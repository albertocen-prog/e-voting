import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';
import { parsePaginationParams } from '@/lib/db/pagination';

/**
 * GET /api/voters
 * List all voter registrations with pagination (ADMIN or ELECTION_OFFICIAL only)
 */
const handleGet = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { skip: skipStr, take: takeStr, status } = req.query;
    const { skip, take } = parsePaginationParams(skipStr as string, takeStr as string);

    const where: any = {};
    if (status) {
      where.user = { status };
    }

    const voters = await prisma.voterRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.voterRegistration.count({ where });

    return res.status(200).json({
      voters: voters.map((v) => ({
        id: v.id,
        voterId: v.voterId,
        name: v.user.name,
        status: v.user.status,
        verificationInfo: v.verificationInfo,
        createdAt: v.createdAt,
        approvedAt: v.approvedAt,
      })),
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    });
  } catch (error) {
    console.error('Get voters error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default requireRole('ELECTION_OFFICIAL', 'ADMIN')(handler);
