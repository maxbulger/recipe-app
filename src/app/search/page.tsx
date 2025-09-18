'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SearchBar from '@/components/SearchBar'
import { Recipe } from '@/types/recipe'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || ''

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    searchRecipes()
  }, [query, tag])

  const searchRecipes = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (tag) params.append('tag', tag)

      const res = await fetch(`/api/recipes?${params.toString()}`)
      if (!res.ok) {
        throw new Error('Failed to search recipes')
      }

      const data = await res.json()
      setRecipes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search recipes')
    } finally {
      setLoading(false)
    }
  }

  const searchTerm = query || tag
  const searchType = query ? 'search' : 'tag'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-indigo-700 hover:text-indigo-900 mb-4 inline-block">
          ← Back to recipes
        </Link>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {searchTerm ? (
              <>
                {searchType === 'search' ? 'Search Results' : 'Recipes Tagged'}: &quot;{searchTerm}&quot;
              </>
            ) : (
              'Search Recipes'
            )}
          </h1>
          <Button href="/recipes/new">Add Recipe</Button>
        </div>

        <div className="max-w-lg">
          <SearchBar initialSearch={query} />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/80 backdrop-blur rounded-2xl border border-black/5 shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-semibold">Search Error</p>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={searchRecipes}>Try Again</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-6">
            <p className="text-gray-600">
              {recipes.length === 0
                ? 'No recipes found'
                : `Found ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`
              }
              {searchTerm && (
                <span>
                  {' '}for &quot;{searchTerm}&quot;
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id}>
                {recipe.imageUrl && (
                  <Link href={`/recipes/${recipe.id}`}>
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/recipes/${recipe.id}`} className="hover:underline">
                      {recipe.title}
                    </Link>
                  </h2>
                  {recipe.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {recipe.prepTime && (
                      <span>Prep: {recipe.prepTime}min</span>
                    )}
                    {recipe.cookTime && (
                      <span>Cook: {recipe.cookTime}min</span>
                    )}
                    {recipe.servings && (
                      <span>Serves: {recipe.servings}</span>
                    )}
                  </div>
                  {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags.slice(0, 3).map((recipeTag) => (
                        <Link
                          key={recipeTag}
                          href={`/search?tag=${encodeURIComponent(recipeTag)}`}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                        >
                          {recipeTag}
                        </Link>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{recipe.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {recipes.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                No recipes found
              </h2>
              <p className="text-gray-500 mb-6">
                Try searching with different keywords or{' '}
                <Link href="/recipes/new" className="text-indigo-700 hover:text-indigo-900">
                  add a new recipe
                </Link>
                .
              </p>
              <Button href="/" size="lg">Browse All Recipes</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
