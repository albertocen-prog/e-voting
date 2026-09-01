// Database client initialization
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  })
} else {
  // Avoid instantiating too many PrismaClient instances during development
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    })
  }
  prisma = globalWithPrisma.prisma
}

export default prisma
