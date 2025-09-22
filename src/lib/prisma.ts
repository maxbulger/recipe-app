import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Support Vercel Postgres defaults by falling back to POSTGRES_PRISMA_URL/POSTGRES_URL
const resolvedDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

const prismaOptions: Prisma.PrismaClientOptions = {
  log: ['query'],
}

if (resolvedDbUrl) {
  prismaOptions.datasources = { db: { url: resolvedDbUrl } }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
