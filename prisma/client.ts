import { PrismaClient } from '@prisma/client';

// 1. Declare global type to preserve the Prisma instance across hot-reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 2. Export single instance (re-use existing in dev, create new if none exists)
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 3. Save instance to globalThis in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
