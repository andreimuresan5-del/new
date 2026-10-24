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

// Centrul de producție e OPȚIONAL. Din octombrie 2026 nu e activ: fiecare locație
// își cumpără marfa și produce la ea în bucătărie. Codul nu trebuie să depindă de
// existența lui — de aceea `maybeSingle()` (întoarce null când nu e marcat niciunul)
// în loc de `single()`, care arunca eroare și lăsa formularele fără locație.
// Rămâne folosit doar ca valoare implicită, niciodată ca sursă obligatorie.
export function useProductionCenter() {
  return useQuery({
    queryKey: ['locations', 'production_center'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .eq('is_production_center', true)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
