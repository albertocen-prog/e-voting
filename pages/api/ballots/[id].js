import { authMiddleware } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

async function handler(req, res) {
  // 1. Guard against unallowed HTTP methods first
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // 2. Validate query parameter
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing id' });
  }

  try {
    const ballot = await prisma.ballot.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!ballot) {
      return res.status(404).json({ error: 'Ballot not found' });
    }

    return res.status(200).json(ballot);
  } catch (error) {
    console.error('Fetch ballot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);
