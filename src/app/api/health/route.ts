import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  const dbVars = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL)
  const blobToken = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE ||
    (process.env as Record<string, string | undefined>)['blob_read_write_token']
  )

  let dbOk = false
  let dbError: string | undefined
  if (dbVars) {
    try {
      await prisma.$queryRaw`SELECT 1`
      dbOk = true
    } catch (e: any) {
      dbError = e?.message || 'Database connection failed'
    }
  }

  return NextResponse.json({
    database: { configured: dbVars, ok: dbOk, error: dbError },
    blob: { configured: blobToken }
  })
}

