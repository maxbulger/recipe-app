import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type LogBody = {
  date?: string
  location?: string
  notes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { id } = await params
    const body: LogBody = await request.json()

    // Normalize date: default to today (yyyy-mm-dd)
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const date = body.date && body.date.trim() ? body.date : `${yyyy}-${mm}-${dd}`

    // Get current logs
    const current = await prisma.recipe.findUnique({
      where: { id },
      select: { cookLogs: true }
    })

    if (!current) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    const logs = Array.isArray(current.cookLogs) ? (current.cookLogs as unknown[]) : []
    const newLog = { date, location: body.location || '', notes: body.notes || '' }
    const updatedLogs = [...logs, newLog]

    const updated = await prisma.recipe.update({
      where: { id },
      data: { cookLogs: updatedLogs as Prisma.InputJsonValue }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error adding cook log:', error)
    return NextResponse.json({ error: 'Failed to add log' }, { status: 500 })
  }
}
