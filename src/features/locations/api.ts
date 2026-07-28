import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('id, name').order('name')
      if (error) throw error
      return data
    },
  })
}

// Producția (sous vide) se loghează mereu la centrul de producție — Drunken Rat/Astur
// sunt puncte de vânzare care primesc doar semipreparat, nu materie primă.
export function useProductionCenter() {
  return useQuery({
    queryKey: ['locations', 'production_center'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .eq('is_production_center', true)
        .single()
      if (error) throw error
      return data
    },
  })
}
