import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole, authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * GET /api/elections/[id]
 * Get election details by ID
 */
const handleGet = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        ballots: {
          select: {
            id: true,
            title: true,
            type: true,
            options: {
              select: {
                id: true,
                label: true,
                metadata: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Observers and voters can only see OPEN elections
    if ((req.user?.role === 'OBSERVER' || req.user?.role === 'VOTER') && election.status !== 'OPEN') {
      return res.status(403).json({ error: 'Election not accessible' });
    }

    return res.status(200).json(election);
  } catch (error) {
    console.error('Get election error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/elections/[id]
 * Update election (ELECTION_OFFICIAL or ADMIN only)
 * Cannot modify if election is OPEN
 */
const handlePatch = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const { title, description, startAt, endAt } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Cannot edit if election is open (unless admin)
    if (election.status === 'OPEN' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Cannot edit an open election',
      });
    }

    // Validate dates if provided
    if (startAt && endAt) {
      const start = new Date(startAt);
      const end = new Date(endAt);
      if (start >= end) {
        return res.status(400).json({
          error: 'startAt must be before endAt',
        });
      }
    }

    const updated = await prisma.election.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startAt && { startAt: new Date(startAt) }),
        ...(endAt && { endAt: new Date(endAt) }),
      },
    });

    // Log action
    await createAuditLog({
      actorId: req.user!.userId,
      actorRole: req.user!.role as any,
      action: 'election_updated',
      targetType: 'election',
      targetId: id,
      details: {
        title: updated.title,
        startAt: updated.startAt,
        endAt: updated.endAt,
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update election error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

export default authMiddleware(handler);
