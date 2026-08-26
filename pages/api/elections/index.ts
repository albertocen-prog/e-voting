import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';
import { parsePaginationParams } from '@/lib/db/pagination';

/**
 * GET /api/elections
 * List all elections with pagination
 * Returns elections accessible to the authenticated user based on their role
 */
const handleGet = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { skip: skipStr, take: takeStr, status } = req.query;
    const { skip, take } = parsePaginationParams(skipStr as string, takeStr as string);

    // Filter by status if provided
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Observers and voters can only see OPEN elections
    if (req.user?.role === 'OBSERVER' || req.user?.role === 'VOTER') {
      where.status = 'OPEN';
    }

    const elections = await prisma.election.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        startAt: true,
        endAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.election.count({ where });

    return res.status(200).json({
      elections,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    });
  } catch (error) {
    console.error('Get elections error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/elections
 * Create a new election (ELECTION_OFFICIAL or ADMIN only)
 */
const handlePost = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { title, description, startAt, endAt } = req.body;

    // Validate input
    if (!title || !startAt || !endAt) {
      return res.status(400).json({
        error: 'title, startAt, and endAt are required',
      });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (start >= end) {
      return res.status(400).json({
        error: 'startAt must be before endAt',
      });
    }

    // Create election in DRAFT status
    const election = await prisma.election.create({
      data: {
        title,
        description,
        startAt: start,
        endAt: end,
        status: 'DRAFT',
        createdBy: req.user!.userId,
      },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'election_created',
      targetType: 'election',
      targetId: election.id,
      details: {
        title: election.title,
        startAt: election.startAt,
        endAt: election.endAt,
      },
    });

    return res.status(201).json(election);
  } catch (error) {
    console.error('Create election error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default requireRole('VOTER', 'ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN')(handler);
