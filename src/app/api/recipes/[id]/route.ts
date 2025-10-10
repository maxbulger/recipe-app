import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateRecipeSchema } from '@/lib/validations/recipe'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const { id } = await params
    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const { id } = await params
    const body = await request.json()

    // Validate request body with Zod
    const validationResult = updateRecipeSchema.safeParse({ ...body, id })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        ingredients: validatedData.ingredients,
        instructions: validatedData.instructions,
        prepTime: validatedData.prepTime,
        cookTime: validatedData.cookTime,
        servings: validatedData.servings,
        difficulty: validatedData.difficulty,
        tags: validatedData.tags,
        imageUrl: validatedData.imageUrl === '' ? undefined : validatedData.imageUrl,
        galleryUrls: validatedData.galleryUrls || []
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error updating recipe:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const { id } = await params
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.recipe.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
