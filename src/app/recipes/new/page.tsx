'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import AlertDialog from '@/components/ui/AlertDialog'
import { CreateRecipeInput } from '@/types/recipe'

export default function NewRecipePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = useState<CreateRecipeInput>({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prepTime: undefined,
    cookTime: undefined,
    servings: undefined,
    difficulty: undefined,
    tags: [],
    imageUrl: ''
  })
  const [tagsInput, setTagsInput] = useState('')
  const ingredientRefs = useRef<Array<HTMLInputElement | null>>([])
  const instructionRefs = useRef<Array<HTMLTextAreaElement | null>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const finalTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      const cleanedData = {
        ...formData,
        ingredients: (formData.ingredients || []).filter(i => i.trim()),
        instructions: (formData.instructions || []).filter(i => i.trim()),
        tags: finalTags,
        prepTime: formData.prepTime || undefined,
        cookTime: formData.cookTime || undefined,
        servings: formData.servings || undefined,
        imageUrl: formData.imageUrl || undefined,
        description: formData.description || undefined,
        galleryUrls: photos
      }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })

      if (!res.ok) {
        let msg = 'Failed to create recipe'
        try {
          const data = await res.json()
          if (data?.error) msg = data.error
        } catch {}
        throw new Error(msg)
      }

      const recipe = await res.json()
      router.push(`/recipes/${recipe.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create recipe'
      setErrorMessage(message)
      setShowErrorAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), '']
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).map((ing, i) => i === index ? value : ing)
    }))
  }

  const handleIngredientKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setFormData(prev => {
        const list = [...(prev.ingredients || [])]
        list.splice(index + 1, 0, '')
        return { ...prev, ingredients: list }
      })
      // Focus the newly created input after DOM updates
      if (typeof window !== 'undefined') {
        const focusNext = () => ingredientRefs.current[index + 1]?.focus()
        if ('requestAnimationFrame' in window) {
          requestAnimationFrame(() => requestAnimationFrame(focusNext))
        } else {
          setTimeout(focusNext, 0)
        }
      }
    }
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }))
  }

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: (prev.instructions || []).filter((_, i) => i !== index)
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: (prev.instructions || []).map((inst, i) => i === index ? value : inst)
    }))
  }

  const handleInstructionKeyDown = (index: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter inserts a new step below and focuses it. Shift+Enter = newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      setFormData(prev => {
        const list = [...(prev.instructions || [])]
        list.splice(index + 1, 0, '')
        return { ...prev, instructions: list }
      })
      if (typeof window !== 'undefined') {
        const focusNext = () => instructionRefs.current[index + 1]?.focus()
        if ('requestAnimationFrame' in window) {
          requestAnimationFrame(() => requestAnimationFrame(focusNext))
        } else {
          setTimeout(focusNext, 0)
        }
      }
    }
  }

  const handleTagsBlur = () => {
    setFormData(prev => ({
      ...prev,
      tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }))
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setUploadError(null)
    try {
      const uploaded: string[] = []
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = await res.json() as { url?: string; error?: string }
        if (!res.ok || !data.url) throw new Error(data?.error || 'Upload failed')
        uploaded.push(data.url)
      }
      setPhotos(prev => [...prev, ...uploaded])
      setFormData(prev => ({ ...prev, imageUrl: prev.imageUrl || uploaded[0] }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputEl) inputEl.value = '' // allow re-selecting same file
    }
  }

  const setCoverPhoto = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }))
  }

  const removePhoto = (url: string) => {
    setPhotos(prev => prev.filter(u => u !== url))
    setFormData(prev => ({ ...prev, imageUrl: prev.imageUrl === url ? '' : prev.imageUrl }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-indigo-700 hover:text-indigo-900 mb-4 inline-block">
          ← Back to recipes
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Add New Recipe</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter recipe title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Brief description of the recipe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button type="button" onClick={() => !uploading && fileInputRef.current?.click()} disabled={uploading}>
                Upload a photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploading}
                multiple
                className="hidden"
              />
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="animate-spin h-4 w-4 text-indigo-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Uploading...
              </div>
            )}
            {uploadError && <div className="text-sm text-red-600">{uploadError}</div>}
            {photos.length > 0 && (
              <div
                className="grid grid-cols-3 sm:grid-cols-4 gap-3"
                onDragOver={(e) => e.preventDefault()}
              >
                {photos.map((url, index) => (
                  <div
                    key={url}
                    className="group relative"
                    tabIndex={0}
                    aria-label={`Photo ${index + 1}. Use arrow keys to reorder.`}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        if (index === 0) return
                        setPhotos(prev => {
                          const arr = [...prev]
                          const [moved] = arr.splice(index, 1)
                          arr.splice(index - 1, 0, moved)
                          return arr
                        })
                        e.preventDefault()
                      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        if (index === photos.length - 1) return
                        setPhotos(prev => {
                          const arr = [...prev]
                          const [moved] = arr.splice(index, 1)
                          arr.splice(index + 1, 0, moved)
                          return arr
                        })
                        e.preventDefault()
                      }
                    }}
                    onDrop={(e) => {
                      const from = Number(e.dataTransfer.getData('text/plain'))
                      if (Number.isNaN(from)) return
                      const to = index
                      if (from === to) return
                      setPhotos(prev => {
                        const arr = [...prev]
                        const [moved] = arr.splice(from, 1)
                        arr.splice(to, 0, moved)
                        return arr
                      })
                    }}
                  >
                    <div
                      className="absolute left-1 top-1 z-10 inline-flex items-center gap-1 text-xs text-gray-700 bg-white/90 backdrop-blur rounded-md px-2 py-1 border border-black/10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
                      aria-label="Drag to reorder"
                    >
                      <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 5h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z" />
                      </svg>
                      <span className="hidden sm:inline">Drag</span>
                    </div>
                    <img src={url} alt="Uploaded" className="h-24 w-full object-cover rounded-lg border border-black/5" />
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => setCoverPhoto(url)} className="text-xs text-indigo-700 hover:text-indigo-900">{formData.imageUrl === url ? 'Cover' : 'Set cover'}</button>
                      <button type="button" onClick={() => removePhoto(url)} className="text-xs text-red-600 hover:text-red-800">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
              Prep Time (min)
            </label>
            <input
              type="number"
              id="prepTime"
              min="0"
              value={formData.prepTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 mb-2">
              Cook Time (min)
            </label>
            <input
              type="number"
              id="cookTime"
              min="0"
              value={formData.cookTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
              Servings
            </label>
            <input
              type="number"
              id="servings"
              min="1"
              value={formData.servings || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value ? Number(e.target.value) : undefined }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={formData.difficulty || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' || undefined }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients *
          </label>
          {(formData.ingredients || []).map((ingredient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                onKeyDown={(e) => handleIngredientKeyDown(index, e)}
                ref={(el) => { ingredientRefs.current[index] = el }}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={`Ingredient ${index + 1}`}
                required={index === 0}
              />
              {(formData.ingredients || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-indigo-700 hover:text-indigo-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            + Add ingredient
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions *
          </label>
          {(formData.instructions || []).map((instruction, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                onKeyDown={(e) => handleInstructionKeyDown(index, e)}
                ref={(el) => { instructionRefs.current[index] = el }}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={`Step ${index + 1}`}
                rows={2}
                required={index === 0}
              />
              {(formData.instructions || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="text-indigo-700 hover:text-indigo-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            + Add instruction
          </button>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            onBlur={handleTagsBlur}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="vegetarian, quick, healthy"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? 'Creating...' : 'Create Recipe'}
          </Button>
          <Button href="/" variant="secondary" size="lg">Cancel</Button>
        </div>
      </form>

      <AlertDialog
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        title="Error"
        message={errorMessage}
      />
    </div>
  )
}
