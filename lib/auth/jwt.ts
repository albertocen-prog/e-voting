// 1. Move to top of file
import jwt from 'jsonwebtoken';
// ... rest of your code ...

// 2. Fixed jwt.sign function call:
const token = jwt.sign(
  { 
    // payload properties
    status: session.status,
  },
  process.env.JWT_SECRET as string,
  {
    expiresIn: 60 * 60 * 24, // 24 hours in seconds
  }
);
import { AuthSession, DecodedToken } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for an authenticated user
 */
export const generateToken = (session: AuthSession): string => {
  return jwt.sign(
    {
      userId: session.userId,
      voterId: session.voterId,
      email: session.email,
      role: session.role,
      status: session.status,
    },
   }
/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};
