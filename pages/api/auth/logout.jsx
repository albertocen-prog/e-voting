import { requireRole } from '@/lib/auth/middleware';

/**
 * POST /api/auth/logout
 * Clears the authentication token cookie / session
 */
const handler = async (req, res) => {
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

export default requireRole(['VOTER', 'ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN'])(handler);
