"use client"

import { useEffect, useState } from 'react'

type Health = {
  database: { configured: boolean; ok: boolean; error?: string }
  blob: { configured: boolean }
}

export default function HealthBanner() {
  const [health, setHealth] = useState<Health | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/health', { cache: 'no-store' })
      .then(r => r.json())
      .then((h) => { if (mounted) setHealth(h) })
      .catch(() => { /* ignore */ })
    return () => { mounted = false }
  }, [])

  if (!health) return null

  const readOnly = !health.database.configured || !health.database.ok
  const blobMissing = !health.blob.configured

  if (!readOnly && !blobMissing) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="container mx-auto px-4 py-2 text-sm">
        {readOnly && (
          <span>
            Read-only mode: database not configured or unreachable
            {health.database.error ? ` — ${health.database.error}` : ''}
          </span>
        )}
        {readOnly && blobMissing && <span className="mx-2">•</span>}
        {blobMissing && (
          <span>Image uploads disabled: Blob token not configured</span>
        )}
      </div>
    </div>
  )
}

