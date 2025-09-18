import Link from 'next/link'
import { headers } from 'next/headers'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import SearchBar from '@/components/SearchBar'
import { Recipe } from '@/types/recipe'

async function getRecipes(): Promise<Recipe[]> {
  try {
    const hdrs = await headers()
    const host = hdrs.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const base = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
    const res = await fetch(`${base}/api/recipes`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      return []
    }

    return res.json()
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return []
  }
}

export default async function HomePage() {
  const recipes = await getRecipes()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600">
          recipook.
        </h1>
        <Button href="/recipes/new">Add Recipe</Button>
      </div>

      <div className="mb-8 max-w-lg">
        <SearchBar />
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
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?tag=${encodeURIComponent(tag)}`}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      {tag}
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

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            No recipes yet
          </h2>
          <p className="text-gray-500 mb-6">
            Start by adding your first recipe to build your collection.
          </p>
          <Button href="/recipes/new" size="lg">Add Your First Recipe</Button>
        </div>
      )}
    </div>
  )
}
