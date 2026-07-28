import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export interface ActiveRecipeOption {
  id: string
  name: string
  current_version_id: string
}

export interface HaccpCheckpointInput {
  checkpoint_name: string
  temp_c: number | null
  timestamp: string
}

export interface ProductionLogListItem {
  id: string
  started_at: string | null
  finished_at: string | null
  batch_size: number | null
  actual_temp_c: number | null
  actual_time_min: number | null
  portions_produced: number | null
  recipe_versions: {
    id: string
    version_number: number
    recipes: { name: string } | null
  } | null
  locations: { name: string } | null
  staff_profiles: { name: string } | null
}

export interface HaccpCheckpointRow {
  id: string
  checkpoint_name: string
  temp_c: number | null
  timestamp: string
}

export function useActiveRecipes() {
  return useQuery({
    queryKey: ['recipes', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, name, current_version_id')
        .not('current_version_id', 'is', null)
        .order('name')
      if (error) throw error
      return data as ActiveRecipeOption[]
    },
  })
}

export function useProductionLogs() {
  return useQuery({
    queryKey: ['production_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_logs')
        .select(
          'id, started_at, finished_at, batch_size, actual_temp_c, actual_time_min, portions_produced, recipe_versions(id, version_number, recipes!recipe_versions_recipe_id_fkey(name)), locations(name), staff_profiles(name)',
        )
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as unknown as ProductionLogListItem[]
    },
  })
}

export function useProductionLog(id: string | undefined) {
  return useQuery({
    queryKey: ['production_logs', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_logs')
        .select(
          'id, started_at, finished_at, batch_size, actual_temp_c, actual_time_min, portions_produced, recipe_versions(id, version_number, recipes!recipe_versions_recipe_id_fkey(name)), locations(name), staff_profiles(name)',
        )
        .eq('id', id as string)
        .single()
      if (error) throw error
      return data as unknown as ProductionLogListItem
    },
  })
}

export function useHaccpLogsForProductionLog(productionLogId: string | undefined) {
  return useQuery({
    queryKey: ['haccp_logs', productionLogId],
    enabled: !!productionLogId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('haccp_logs')
        .select('id, checkpoint_name, temp_c, timestamp')
        .eq('production_log_id', productionLogId as string)
        .order('timestamp')
      if (error) throw error
      return data as HaccpCheckpointRow[]
    },
  })
}

// Producții multi-zi (ex. marinat seara, sous vide + finalizare a doua zi): aceste câmpuri
// nu sunt cunoscute la creare, se completează/corectează separat, ca portions_produced.
export function useUpdateProductionCompletion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      finishedAt: string | null
      actualTempC: number | null
      actualTimeMin: number | null
    }) => {
      const { error } = await supabase
        .from('production_logs')
        .update({
          finished_at: input.finishedAt,
          actual_temp_c: input.actualTempC,
          actual_time_min: input.actualTimeMin,
        })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production_logs'] })
      queryClient.invalidateQueries({ queryKey: ['production_logs', variables.id] })
    },
  })
}

// Checkpoint-urile HACCP se pot adăuga oricând pe durata procesului (ex. temp. la
// intrarea în sous vide, a doua zi), nu doar la crearea logului.
export function useAddHaccpCheckpoint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { productionLogId: string; checkpointName: string; tempC: number | null }) => {
      const { error } = await supabase.from('haccp_logs').insert({
        production_log_id: input.productionLogId,
        checkpoint_name: input.checkpointName,
        temp_c: input.tempC,
      })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['haccp_logs', variables.productionLogId] })
    },
  })
}

// Setează portions_produced ȘI înregistrează mișcarea de stoc la centrul de producție,
// atomic (RPC SECURITY DEFINER) — singura cale de a seta porții, ca ledger-ul de stoc
// să rămână mereu sincronizat cu producția reală.
export function useFinalizeProductionPortions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; portions: number }) => {
      const { error } = await supabase.rpc('finalize_production_portions', {
        p_log_id: input.id,
        p_portions: input.portions,
      })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production_logs'] })
      queryClient.invalidateQueries({ queryKey: ['production_logs', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['stock_levels'] })
    },
  })
}

export function useCreateProductionLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      recipeVersionId: string
      locationId: string
      startedAt: string
      finishedAt: string
      batchSize: number | null
      actualTempC: number | null
      actualTimeMin: number | null
      portionsProduced: number | null
      checkpoints: HaccpCheckpointInput[]
    }) => {
      const { data: log, error: logError } = await supabase
        .from('production_logs')
        .insert({
          recipe_version_id: input.recipeVersionId,
          location_id: input.locationId,
          started_at: input.startedAt || null,
          finished_at: input.finishedAt || null,
          batch_size: input.batchSize,
          actual_temp_c: input.actualTempC,
          actual_time_min: input.actualTimeMin,
        })
        .select('id')
        .single()
      if (logError) throw logError

      const checkpoints = input.checkpoints.filter((c) => c.checkpoint_name)
      if (checkpoints.length > 0) {
        const { error: checkpointsError } = await supabase.from('haccp_logs').insert(
          checkpoints.map((c) => ({
            production_log_id: log.id,
            checkpoint_name: c.checkpoint_name,
            temp_c: c.temp_c,
            timestamp: c.timestamp || new Date().toISOString(),
          })),
        )
        if (checkpointsError) throw checkpointsError
      }

      // portions_produced trece mereu prin RPC (nu insert direct), ca să înregistreze
      // și mișcarea de stoc la centrul de producție.
      if (input.portionsProduced != null) {
        const { error: portionsError } = await supabase.rpc('finalize_production_portions', {
          p_log_id: log.id,
          p_portions: input.portionsProduced,
        })
        if (portionsError) throw portionsError
      }

      return log.id as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production_logs'] })
    },
  })
}
