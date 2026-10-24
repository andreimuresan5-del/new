import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import type { StaffRole } from '../../lib/database.types'

export interface TeamMember {
  id: string
  name: string
  role: StaffRole
  location_id: string | null
  locations: { name: string } | null
}

// RLS decide ce se vede: owner-ul vede toată firma, managerul de locație doar
// echipa locației lui, ceilalți doar propriul cont.
export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('id, name, role, location_id, locations(name)')
        .order('name')
      if (error) throw error
      return data as unknown as TeamMember[]
    },
  })
}

export interface TeamMemberUpdate {
  id: string
  name: string
  role: StaffRole
  location_id: string | null
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, role, location_id }: TeamMemberUpdate) => {
      const { error } = await supabase
        .from('staff_profiles')
        .update({ name, role, location_id })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
