import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateRecipeInput } from '@/types/recipe'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const body: UpdateRecipeInput = await request.json()

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
        title: body.title,
        description: body.description,
        ingredients: body.ingredients,
        instructions: body.instructions,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        servings: body.servings,
        difficulty: body.difficulty,
        tags: body.tags,
        imageUrl: body.imageUrl
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const recipe = await prisma.recipe.update({
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