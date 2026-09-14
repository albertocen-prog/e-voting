import jwt from 'jsonwebtoken';

// Ensure JWT_SECRET is loaded properly
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateToken = (session: any): string => {
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

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
