// If defined as 'enum Role' in schema.prisma:
import { Role } from '@prisma/client';

// Or if defined as 'enum UserRole' in schema.prisma:
import { UserRole } from '@prisma/client';


const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const signToken = (session: DecodedToken): string => {
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
      expiresIn: 60 * 60 * 24, // 24 hours
    }
  );
};

export const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, JWT_SECRET) as DecodedToken;
};
