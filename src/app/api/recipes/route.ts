import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateRecipeInput } from '@/types/recipe'

export async function GET(request: NextRequest) {
  try {
    // Allow UI preview without a DB by returning an empty list
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json([])
    }
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { tags: { has: search } }
        ]
      }),
      ...(tag && { tags: { has: tag } })
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Prevent creation when database is not configured (read-only preview)
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }
    const body: CreateRecipeInput = await request.json()

    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        description: body.description,
        ingredients: body.ingredients,
        instructions: body.instructions,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        servings: body.servings,
        difficulty: body.difficulty,
        tags: body.tags || [],
        imageUrl: body.imageUrl,
        galleryUrls: body.galleryUrls || [],
        cookLogs: []
      }
    })

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
