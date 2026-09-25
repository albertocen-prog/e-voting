import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/auth/middleware';

export interface NextApiRequestWithAuth extends NextApiRequest {
  user?: any;
}

/**
 * POST /api/auth/logout
 * Clears the authentication token cookie / session
 */
const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear auth cookie
    res.setHeader(
      'Set-Cookie',
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict'
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Use requireRole with all standard roles or leave array empty if open to any authenticated user
export default requireRole(['VOTER', 'ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN'])(handler as any);
