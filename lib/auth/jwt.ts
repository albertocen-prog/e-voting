/**import jwt from 'jsonwebtoken';
import { DecodedToken } from './types'; // Ensure correct import path for DecodedToken

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, JWT_SECRET) as DecodedToken;
};
**/
import jwt from 'jsonwebtoken';
import { DecodedToken } from './types'; // Adjust relative path as needed

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, JWT_SECRET) as unknown as DecodedToken;
};

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

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1] || null;
};
