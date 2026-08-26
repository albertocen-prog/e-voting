import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth/jwt';
import { comparePassword } from '@/lib/auth/password';
import { EmailLoginRequest, AuthResponse } from '@/lib/auth/types';

/**
 * POST /api/auth/login
 * Email + password login for officials, observers, and admins
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body as EmailLoginRequest;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'This account is not configured for email login',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: 'Your account has been suspended',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      status: user.status as any,
    });

    // Log successful login
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'email_login',
        targetType: 'user',
        targetId: user.id,
        details: JSON.stringify({ email: user.email }),
      },
    });

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Email login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
