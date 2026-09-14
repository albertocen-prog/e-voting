import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthSession, DecodedToken } from './types'; // update import path if needed

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate a JWT token for an authenticated session
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
    JWT_SECRET,
    {
      expiresIn: 60 * 60 * 24, // 24 hours in seconds
    }
  );
};
