import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import { Recipe } from '@/types/recipe'

async function getRecipes(): Promise<Recipe[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/recipes`, {
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Recipe Collection</h1>
        <Link
          href="/recipes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Recipe
        </Link>
      </div>

      <div className="mb-8 max-w-lg">
        <SearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {recipe.imageUrl && (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {recipe.title}
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
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
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
          </Link>
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
          <Link
            href="/recipes/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Recipe
          </Link>
        </div>
      )}
    </div>
  )
}
