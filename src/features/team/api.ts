import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import type { StaffRole } from '../../lib/database.types'

export interface TeamMember {
  id: string
  name: string
  role: StaffRole
  location_id: string | null
  disabled_at: string | null
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
        .select('id, name, role, location_id, disabled_at, locations(name)')
        .order('name')
      if (error) throw error
      // activii primii, apoi conturile închise
      return (data as unknown as TeamMember[]).sort(
        (a, b) => Number(!!a.disabled_at) - Number(!!b.disabled_at),
      )
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

// ---------------------------------------------------------------------------
// Conturile: create, PIN, închidere. Trec prin Edge Function-ul `staff-admin`,
// pentru că ating `auth.users` — adică cer service role, care nu are ce căuta
// în browser. Funcția verifică la fiecare apel că cel care cere e owner.
// ---------------------------------------------------------------------------

type StaffAdminBody = {
  action: 'create' | 'reset_pin' | 'disable' | 'enable' | 'delete'
  id?: string
  name?: string
  role?: StaffRole
  location_id?: string | null
  pin?: string
}

/**
 * Apelează `staff-admin` și scoate la suprafață mesajul în română trimis de
 * funcție. Fără asta, supabase-js întoarce doar „non-2xx status code", iar
 * motivul adevărat (PIN luat, rol fără locație) ar rămâne în consolă.
 */
async function staffAdmin<T>(body: StaffAdminBody): Promise<T> {
  const { data, error } = await supabase.functions.invoke('staff-admin', { body })
  if (error) {
    const ctx = (error as { context?: Response }).context
    if (ctx && typeof ctx.json === 'function') {
      const payload = (await ctx.json().catch(() => null)) as { error?: string } | null
      if (payload?.error) throw new Error(payload.error)
    }
    throw error
  }
  return data as T
}

export interface NewStaff {
  name: string
  role: StaffRole
  location_id: string | null
  pin?: string
}

/** Întoarce PIN-ul contului nou. Se arată o singură dată: nu se mai poate citi. */
export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (staff: NewStaff) =>
      staffAdmin<{ id: string; name: string; pin: string }>({ action: 'create', ...staff }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

/** Întoarce PIN-ul nou. Tot o singură dată. */
export function useResetPin() {
  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin?: string }) =>
      staffAdmin<{ id: string; pin: string }>({ action: 'reset_pin', id, pin }),
  })
}

export function useSetStaffDisabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      staffAdmin<{ id: string; disabled: boolean }>({
        action: disabled ? 'disable' : 'enable',
        id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
