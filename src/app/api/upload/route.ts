import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'

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

    const safeExt = EXT_FROM_MIME[file.type] || 'bin'
    const filename = `${Date.now()}-${randomUUID()}.${safeExt}`

    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_RW_TOKEN
    if (token) {
      // Store in Vercel Blob (public)
      const blob = await put(`uploads/${filename}`, file, {
        access: 'public',
        token,
        contentType: file.type,
      })
      return NextResponse.json({ url: blob.url })
    }

    // Fallback to local disk (dev)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
