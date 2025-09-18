import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
])
const EXT_FROM_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = Number(process.env.NEXT_MAX_UPLOAD_BYTES || DEFAULT_MAX_SIZE)
    if (Number.isNaN(maxSize) || maxSize <= 0) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${(maxSize / (1024 * 1024)).toFixed(1)}MB)` }, { status: 413 })
    }

    if (!file.type || !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const safeExt = EXT_FROM_MIME[file.type] || 'bin'
    const filename = `${Date.now()}-${randomUUID()}.${safeExt}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
