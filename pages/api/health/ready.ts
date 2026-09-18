import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

/**
 * POST /api/health/ready
 * Readiness probe - checks database connectivity
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to connect to database
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
}
