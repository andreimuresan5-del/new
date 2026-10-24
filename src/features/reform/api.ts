import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export type ReformStatus = 'nou' | 'lucru' | 'blocat' | 'gata'
export type ReformDecisionState = 'propus' | 'decis'

export const STATUS_LABELS: Record<ReformStatus, string> = {
  nou: 'De început',
  lucru: 'În lucru',
  blocat: 'Blocat',
  gata: 'Rezolvat',
}

// Blocatele sus: alea așteaptă ceva de la administratori.
export const STATUS_ORDER: ReformStatus[] = ['blocat', 'lucru', 'nou', 'gata']

export interface ReformAdministrator {
  id: string
  name: string
  staff_profile_id: string | null
  sort_order: number
}

export interface ReformIssue {
  id: string
  title: string
  status: ReformStatus
  location_id: string | null
  area: string | null
  value_per_year: number | null
  due_date: string | null
  next_step: string | null
  notes: string | null
  updated_at: string
  updated_by: string | null
  locations: { name: string } | null
  staff_profiles: { name: string } | null
  reform_issue_owners: { administrator_id: string }[]
}

export interface ReformDecision {
  id: string
  statement: string
  state: ReformDecisionState
  decided_on: string | null
  location_id: string | null
  updated_at: string
  locations: { name: string } | null
  staff_profiles: { name: string } | null
}

export function useAdministrators() {
  return useQuery({
    queryKey: ['reform_administrators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reform_administrators')
        .select('id, name, staff_profile_id, sort_order')
        .order('sort_order')
        .order('name')
      if (error) throw error
      return data as ReformAdministrator[]
    },
  })
}

export function useReformIssues() {
  return useQuery({
    queryKey: ['reform_issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reform_issues')
        .select(
          'id, title, status, location_id, area, value_per_year, due_date, next_step, notes, updated_at, updated_by, locations(name), staff_profiles(name), reform_issue_owners(administrator_id)',
        )
        .order('due_date', { nullsFirst: false })
      if (error) throw error
      return data as unknown as ReformIssue[]
    },
  })
}

export function useReformIssue(id: string | undefined) {
  return useQuery({
    queryKey: ['reform_issues', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reform_issues')
        .select(
          'id, title, status, location_id, area, value_per_year, due_date, next_step, notes, updated_at, updated_by, locations(name), staff_profiles(name), reform_issue_owners(administrator_id)',
        )
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as ReformIssue
    },
  })
}

export interface IssueInput {
  title: string
  status: ReformStatus
  locationId: string | null
  area: string | null
  valuePerYear: number | null
  dueDate: string | null
  nextStep: string | null
  notes: string | null
  administratorIds: string[]
}

// Problema și responsabilii ei se salvează în două pași (rândul, apoi legăturile).
// `updated_at`/`updated_by` vin din trigger, nu de aici, ca să nu depindă de client.
export function useSaveIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: IssueInput }) => {
      const row = {
        title: input.title,
        status: input.status,
        location_id: input.locationId,
        area: input.area,
        value_per_year: input.valuePerYear,
        due_date: input.dueDate,
        next_step: input.nextStep,
        notes: input.notes,
      }

      let issueId = id
      if (issueId) {
        const { error } = await supabase.from('reform_issues').update(row).eq('id', issueId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('reform_issues')
          .insert(row)
          .select('id')
          .single()
        if (error) throw error
        issueId = (data as { id: string }).id
      }

      const { error: delError } = await supabase
        .from('reform_issue_owners')
        .delete()
        .eq('issue_id', issueId)
      if (delError) throw delError

      if (input.administratorIds.length > 0) {
        const { error: insError } = await supabase.from('reform_issue_owners').insert(
          input.administratorIds.map((administratorId) => ({
            issue_id: issueId,
            administrator_id: administratorId,
          })),
        )
        if (insError) throw insError
      }

      return issueId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reform_issues'] })
    },
  })
}

export function useDeleteIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reform_issues').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reform_issues'] })
    },
  })
}

export function useReformDecisions() {
  return useQuery({
    queryKey: ['reform_decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reform_decisions')
        .select(
          'id, statement, state, decided_on, location_id, updated_at, locations(name), staff_profiles(name)',
        )
        .order('decided_on', { ascending: false, nullsFirst: false })
      if (error) throw error
      return data as unknown as ReformDecision[]
    },
  })
}

export interface DecisionInput {
  statement: string
  state: ReformDecisionState
  decidedOn: string | null
  locationId: string | null
}

export function useSaveDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: DecisionInput }) => {
      const row = {
        statement: input.statement,
        state: input.state,
        decided_on: input.decidedOn,
        location_id: input.locationId,
      }
      if (id) {
        const { error } = await supabase.from('reform_decisions').update(row).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('reform_decisions').insert(row)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reform_decisions'] })
    },
  })
}

export function useDeleteDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reform_decisions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reform_decisions'] })
    },
  })
}
