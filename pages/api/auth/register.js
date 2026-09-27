import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

// Secret keys for self-serve admin/official signup during initial setup
// (In production, move these to environment variables like process.env.ADMIN_SIGNUP_KEY)
const ROLE_KEYS = {
  ADMIN: process.env.ADMIN_SIGNUP_KEY || 'admin-secret-key-123',
  ELECTION_OFFICIAL: process.env.OFFICIAL_SIGNUP_KEY || 'official-secret-key-123',
  OBSERVER: process.env.OBSERVER_SIGNUP_KEY || 'observer-secret-key-123',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, password, role = 'VOTER', secretKey } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Allowed staff roles
  const validRoles = ['ADMIN', 'ELECTION_OFFICIAL', 'OBSERVER', 'VOTER'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  // Require secret key for elevated roles
  if (['ADMIN', 'ELECTION_OFFICIAL', 'OBSERVER'].includes(role)) {
    if (!secretKey || secretKey !== ROLE_KEYS[role]) {
      return res.status(403).json({ error: 'Invalid secret key for this role' });
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await hashPassword(password);

    // Admins and Officials can be auto-approved or set to APPROVED, Observers set to APPROVED
    const userStatus = role === 'VOTER' ? 'PENDING' : 'APPROVED';

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role,
        status: userStatus,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
