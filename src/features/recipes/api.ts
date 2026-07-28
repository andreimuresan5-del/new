import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export interface RecipeListItem {
  id: string
  name: string
  category: string | null
  current_version_id: string | null
}

export interface RecipeVersionDetail {
  id: string
  recipe_id: string
  version_number: number
  created_at: string
  sous_vide_temp_c: number | null
  sous_vide_time_min: number | null
  cooling_protocol: string | null
  finishing_time_cold: string | null
  finishing_time_hot: string | null
  notes: string | null
  estimated_portions: number | null
  shelf_life_days: number | null
}

export interface RecipeIngredientRow {
  id: string
  ingredient_id: string
  quantity: number
  unit: string
  is_primary: boolean
  ingredients: { name: string } | null
}

export interface VersionFormValues {
  sous_vide_temp_c: number | null
  sous_vide_time_min: number | null
  cooling_protocol: string
  finishing_time_cold: string
  finishing_time_hot: string
  notes: string
  estimated_portions: number | null
  shelf_life_days: number | null
}

export interface IngredientRowInput {
  ingredientId: string | null
  newIngredientName: string | null
  unit: string
  quantity: number
  isPrimary: boolean
}

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, category, current_version_id')
        .order('name')
      if (error) throw error
      return data as RecipeListItem[]
    },
  })
}

export function useRecipeCategories() {
  return useQuery({
    queryKey: ['recipes', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('category')
        .not('category', 'is', null)
        .order('category')
      if (error) throw error
      const unique = Array.from(new Set(data.map((r) => r.category as string)))
      return unique.sort((a, b) => a.localeCompare(b))
    },
  })
}

export function useRecipe(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['recipes', recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, category, current_version_id')
        .eq('id', recipeId as string)
        .single()
      if (error) throw error
      return data as RecipeListItem
    },
  })
}

export function useRecipeVersions(recipeId: string | undefined) {
  return useQuery({
    queryKey: ['recipe_versions', recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_versions')
        .select(
          'id, recipe_id, version_number, created_at, sous_vide_temp_c, sous_vide_time_min, cooling_protocol, finishing_time_cold, finishing_time_hot, notes, estimated_portions, shelf_life_days',
        )
        .eq('recipe_id', recipeId as string)
        .order('version_number', { ascending: false })
      if (error) throw error
      return data as RecipeVersionDetail[]
    },
  })
}

export function useRecipeVersion(recipeVersionId: string | undefined) {
  return useQuery({
    queryKey: ['recipe_versions', 'byId', recipeVersionId],
    enabled: !!recipeVersionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_versions')
        .select(
          'id, recipe_id, version_number, created_at, sous_vide_temp_c, sous_vide_time_min, cooling_protocol, finishing_time_cold, finishing_time_hot, notes, estimated_portions, shelf_life_days',
        )
        .eq('id', recipeVersionId as string)
        .single()
      if (error) throw error
      return data as RecipeVersionDetail
    },
  })
}

export function useRecipeIngredients(recipeVersionId: string | undefined) {
  return useQuery({
    queryKey: ['recipe_ingredients', recipeVersionId],
    enabled: !!recipeVersionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('id, ingredient_id, quantity, unit, is_primary, ingredients(name)')
        .eq('recipe_version_id', recipeVersionId as string)
      if (error) throw error
      return data as unknown as RecipeIngredientRow[]
    },
  })
}

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('id, name, unit')
        .order('name')
      if (error) throw error
      return data
    },
  })
}

async function resolveIngredientIds(rows: IngredientRowInput[]) {
  const resolved: { ingredient_id: string; quantity: number; unit: string; is_primary: boolean }[] = []
  for (const row of rows) {
    let ingredientId = row.ingredientId
    if (!ingredientId && row.newIngredientName) {
      const { data, error } = await supabase
        .from('ingredients')
        .insert({ name: row.newIngredientName, unit: row.unit })
        .select('id')
        .single()
      if (error) throw error
      ingredientId = data.id
    }
    if (!ingredientId) continue
    resolved.push({
      ingredient_id: ingredientId,
      quantity: row.quantity,
      unit: row.unit,
      is_primary: row.isPrimary,
    })
  }
  return resolved
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      name: string
      category: string
      version: VersionFormValues
      ingredients: IngredientRowInput[]
    }) => {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({ name: input.name, category: input.category || null })
        .select('id')
        .single()
      if (recipeError) throw recipeError

      const { data: userData } = await supabase.auth.getUser()

      const { data: version, error: versionError } = await supabase
        .from('recipe_versions')
        .insert({
          recipe_id: recipe.id,
          created_by: userData.user?.id,
          sous_vide_temp_c: input.version.sous_vide_temp_c,
          sous_vide_time_min: input.version.sous_vide_time_min,
          cooling_protocol: input.version.cooling_protocol || null,
          finishing_time_cold: input.version.finishing_time_cold || null,
          finishing_time_hot: input.version.finishing_time_hot || null,
          notes: input.version.notes || null,
          estimated_portions: input.version.estimated_portions,
          shelf_life_days: input.version.shelf_life_days,
        })
        .select('id')
        .single()
      if (versionError) throw versionError

      const ingredientRows = await resolveIngredientIds(input.ingredients)
      if (ingredientRows.length > 0) {
        const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(
          ingredientRows.map((r) => ({ ...r, recipe_version_id: version.id })),
        )
        if (ingredientsError) throw ingredientsError
      }

      const { error: updateError } = await supabase
        .from('recipes')
        .update({ current_version_id: version.id })
        .eq('id', recipe.id)
      if (updateError) throw updateError

      return recipe.id as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useCreateRecipeVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      recipeId: string
      version: VersionFormValues
      ingredients: IngredientRowInput[]
    }) => {
      const { data: userData } = await supabase.auth.getUser()

      const { data: version, error: versionError } = await supabase
        .from('recipe_versions')
        .insert({
          recipe_id: input.recipeId,
          created_by: userData.user?.id,
          sous_vide_temp_c: input.version.sous_vide_temp_c,
          sous_vide_time_min: input.version.sous_vide_time_min,
          cooling_protocol: input.version.cooling_protocol || null,
          finishing_time_cold: input.version.finishing_time_cold || null,
          finishing_time_hot: input.version.finishing_time_hot || null,
          notes: input.version.notes || null,
          estimated_portions: input.version.estimated_portions,
          shelf_life_days: input.version.shelf_life_days,
        })
        .select('id')
        .single()
      if (versionError) throw versionError

      const ingredientRows = await resolveIngredientIds(input.ingredients)
      if (ingredientRows.length > 0) {
        const { error: ingredientsError } = await supabase.from('recipe_ingredients').insert(
          ingredientRows.map((r) => ({ ...r, recipe_version_id: version.id })),
        )
        if (ingredientsError) throw ingredientsError
      }

      const { error: updateError } = await supabase
        .from('recipes')
        .update({ current_version_id: version.id })
        .eq('id', input.recipeId)
      if (updateError) throw updateError

      return version.id as string
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipe_versions', variables.recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId] })
    },
  })
}

// Numele/categoria sunt metadate ale rețetei, nu date critice HACCP — spre deosebire
// de recipe_versions, se pot edita direct, fără să genereze o versiune nouă.
export function useUpdateRecipeDetails() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { recipeId: string; name: string; category: string }) => {
      const { error } = await supabase
        .from('recipes')
        .update({ name: input.name, category: input.category || null })
        .eq('id', input.recipeId)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipes', 'categories'] })
    },
  })
}
