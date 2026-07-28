import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export interface StockLevelRow {
  recipe_id: string
  location_id: string
  portions_on_hand: number
  recipes: { name: string } | null
  locations: { name: string } | null
}

export function useStockLevels() {
  return useQuery({
    queryKey: ['stock_levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_levels')
        .select('recipe_id, location_id, portions_on_hand, recipes(name), locations(name)')
        .order('location_id')
      if (error) throw error
      return data as unknown as StockLevelRow[]
    },
  })
}

export interface ParLevelRow {
  id: string
  recipe_id: string
  location_id: string
  target_portions: number
  recipes: { name: string } | null
  locations: { name: string } | null
}

export function useParLevels() {
  return useQuery({
    queryKey: ['stock_par_levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_par_levels')
        .select('id, recipe_id, location_id, target_portions, recipes(name), locations(name)')
      if (error) throw error
      return data as unknown as ParLevelRow[]
    },
  })
}

export function useUpsertParLevel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { recipeId: string; locationId: string; targetPortions: number }) => {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from('stock_par_levels').upsert(
        {
          recipe_id: input.recipeId,
          location_id: input.locationId,
          target_portions: input.targetPortions,
          updated_by: userData.user?.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'recipe_id,location_id' },
      )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_par_levels'] })
    },
  })
}

export function useTransferSemipreparat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      recipeId: string
      destinationLocationId: string
      portions: number
      notes: string | null
    }) => {
      const { error } = await supabase.rpc('transfer_semipreparat', {
        p_recipe_id: input.recipeId,
        p_destination_location_id: input.destinationLocationId,
        p_portions: input.portions,
        p_notes: input.notes,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_levels'] })
    },
  })
}
