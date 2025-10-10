import { z } from 'zod'

export const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'At least one instruction is required'),
  prepTime: z.number().int().min(0, 'Prep time must be a positive number').optional(),
  cookTime: z.number().int().min(0, 'Cook time must be a positive number').optional(),
  servings: z.number().int().min(1, 'Servings must be at least 1').optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  galleryUrls: z.array(z.string().url('Must be a valid URL')).default([])
})

export const updateRecipeSchema = createRecipeSchema.partial().extend({
  id: z.string().cuid('Invalid recipe ID')
})

export type CreateRecipeData = z.infer<typeof createRecipeSchema>
export type UpdateRecipeData = z.infer<typeof updateRecipeSchema>
