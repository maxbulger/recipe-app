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
  galleryUrls: string[]
  cookLogs?: CookLog[]
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface CookLog {
  date: string // ISO date string (yyyy-mm-dd or full ISO)
  location?: string
  notes?: string
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
  galleryUrls?: string[]
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  id: string
}
