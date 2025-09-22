import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const token =
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_READ_WRITE ||
      (process.env as Record<string, string | undefined>)['blob_read_write_token']
    if (!token) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 503 }
      )
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Basic guardrails
    const maxBytes = 10 * 1024 * 1024 // 10MB
    if (file.size && file.size > maxBytes) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const key = `recipes/${timestamp}-${safeName}`

    const { url } = await put(key, file, {
      access: 'public',
      token,
      // Optionally you can set contentType; Blob infers from File
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
