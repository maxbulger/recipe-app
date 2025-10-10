'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import AlertDialog from '@/components/ui/AlertDialog'
import { useRouter } from 'next/navigation'
import { Recipe } from '@/types/recipe'

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export default function RecipePage({ params }: RecipePageProps) {
  const { id } = use(params)
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logDate, setLogDate] = useState<string>(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })
  const [logLocation, setLogLocation] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [logSaving, setLogSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showLogErrorAlert, setShowLogErrorAlert] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/recipes/${id}`)
        if (!res.ok) throw new Error('Recipe not found')
        const data = await res.json()
        setRecipe(data)
        setActiveImage(data.imageUrl || data.galleryUrls?.[0] || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const fetchRecipe = async () => {
    try {
      const res = await fetch(`/api/recipes/${id}`)
      if (!res.ok) {
        throw new Error('Recipe not found')
      }
      const data = await res.json()
      setRecipe(data)
      setActiveImage(data.imageUrl || data.galleryUrls?.[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete recipe')
      }

      router.push('/')
    } catch (err) {
      setErrorMessage('Failed to delete recipe')
      setShowErrorAlert(true)
    }
  }

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipe) return
    setLogSaving(true)
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: logDate, location: logLocation || undefined, notes: logNotes || undefined })
      })
      if (!res.ok) throw new Error('Failed to add log')
      const updated = await res.json()
      setRecipe(updated)
      setShowLogForm(false)
      setLogLocation('')
      setLogNotes('')
    } catch (err) {
      setShowLogErrorAlert(true)
    } finally {
      setLogSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The recipe you\'re looking for doesn\'t exist.'}</p>
          <Link href="/" className="text-indigo-700 hover:text-indigo-900">
            ← Back to recipes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-indigo-700 hover:text-indigo-900 mb-4 inline-block">
          ← Back to recipes
        </Link>
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold text-gray-900">{recipe.title}</h1>
          <div className="flex gap-2">
            <Button href={`/recipes/${recipe.id}/edit`} size="sm">Edit</Button>
            <Button onClick={() => setShowDeleteConfirm(true)} variant="danger" size="sm">Delete</Button>
          </div>
        </div>
      </div>

      {(activeImage || recipe.imageUrl) && (
        <button
          onClick={() => {
            const imgs = [recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]
            const idx = imgs.findIndex(u => u === (activeImage || recipe.imageUrl))
            setLightboxIndex(Math.max(0, idx))
            setLightboxOpen(true)
          }}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
        >
          <img
            src={activeImage || recipe.imageUrl!}
            alt={recipe.title}
            className="w-full max-w-2xl h-72 object-cover rounded-xl mb-4 border border-black/5"
          />
        </button>
      )}

      {recipe.galleryUrls && recipe.galleryUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[recipe.imageUrl, ...recipe.galleryUrls.filter(u => u && u !== recipe.imageUrl)].filter(Boolean).map((url) => (
            <button
              key={url}
              onClick={() => setActiveImage(url as string)}
              className={`h-16 w-24 rounded-md overflow-hidden border transition ${activeImage === url ? 'border-indigo-600' : 'border-black/10 hover:border-black/30'}`}
            >
              <img src={url as string} alt="Thumbnail" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false)
            if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % ([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).length)
            if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + ([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).length) % ([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).length)
          }}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="relative max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightboxOpen(false)} className="absolute -top-10 right-4 text-white/80 hover:text-white" aria-label="Close">
              ✕
            </button>
            <div className="flex items-center gap-4">
              <button
                className="text-white/80 hover:text-white text-3xl"
                aria-label="Previous image"
                onClick={() => setLightboxIndex((i) => (i - 1 + ([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).length) % ([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).length)}
              >
                ‹
              </button>
              <img
                src={([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[])[lightboxIndex]}
                alt="Preview"
                className="max-h-[80vh] w-auto mx-auto rounded-lg border border-white/20"
              />
              <button
                className="text-white/80 hover:text-white text-3xl"
                aria-label="Next image"
                onClick={() => setLightboxIndex((i) => (i + 1) % ([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).length)}
              >
                ›
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {([recipe.imageUrl, ...recipe.galleryUrls].filter(Boolean) as string[]).map((u, idx) => (
                <button key={u} onClick={() => setLightboxIndex(idx)} className={`h-14 w-20 rounded border ${idx === lightboxIndex ? 'border-indigo-500' : 'border-white/30'}`} aria-label={`Go to image ${idx + 1}`}>
                  <img src={u} alt="Thumb" className="h-full w-full object-cover rounded" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {recipe.description && (
        <p className="text-gray-700 text-lg mb-6">{recipe.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur p-4 rounded-xl border border-black/5">
          <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/70 backdrop-blur p-4 rounded-xl border border-black/5">
          <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.tags.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <a
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 bg-white/70 backdrop-blur p-4 rounded-xl border border-black/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Cooking Log</h3>
          {!showLogForm && (
            <Button
              onClick={() => setShowLogForm(true)}
              size="sm"
            >
              Log
            </Button>
          )}
        </div>

        {showLogForm && (
          <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date</label>
              <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs text-gray-600 mb-1">Location</label>
              <input type="text" value={logLocation} onChange={(e) => setLogLocation(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="e.g., Home, Friend's place" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Notes</label>
              <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} rows={1} className="w-full p-2 border border-gray-300 rounded" placeholder="Optional notes" />
            </div>
            <div className="md:col-span-4 flex gap-2">
              <button type="submit" disabled={logSaving} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">{logSaving ? 'Saving…' : 'Save Log'}</button>
              <button type="button" onClick={() => setShowLogForm(false)} className="px-4 py-2 text-gray-700">Cancel</button>
            </div>
          </form>
        )}

        {Array.isArray(recipe.cookLogs as unknown as Array<{ date?: string }> ) && (recipe.cookLogs as unknown as Array<unknown>).length > 0 && (
          <ul className="space-y-2 text-sm text-gray-700">
            {(recipe.cookLogs as unknown as Array<{ date: string; location?: string; notes?: string }>)
              .slice()
              .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
              .map((log, idx) => (
                <li key={idx} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{log.date}</div>
                    {(log.location || log.notes) && (
                      <div className="text-gray-600">{[log.location, log.notes].filter(Boolean).join(' — ')}</div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <AlertDialog
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        title="Error"
        message={errorMessage}
      />

      <AlertDialog
        isOpen={showLogErrorAlert}
        onClose={() => setShowLogErrorAlert(false)}
        title="Error"
        message="Failed to add cooking log. Please try again."
      />
    </div>
  )
}
