export interface Recipe {
  id: string
  title: string
  description?: string
  ingredients: string[]
  instructions: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  tags: string[]
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface CreateRecipeInput {
  title: string
  description?: string
  ingredients: string[]
  instructions: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  imageUrl?: string
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  id: string
}