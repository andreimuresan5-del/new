import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export type FindingCategory =
  | 'price_change'
  | 'menu_change'
  | 'review'
  | 'promotion'
  | 'social'
  | 'new_opening'

export type FindingImportance = 'low' | 'medium' | 'high'

export const CATEGORY_LABELS: Record<FindingCategory, string> = {
  price_change: 'Preț',
  menu_change: 'Meniu',
  review: 'Recenzii',
  promotion: 'Promoție',
  social: 'Social / site',
  new_opening: 'Deschidere nouă',
}

export interface Competitor {
  id: string
  name: string
  city: string | null
  website_url: string | null
  google_maps_url: string | null
  delivery_urls: string[]
  facebook_url: string | null
  instagram_url: string | null
  notes: string | null
  active: boolean
  last_scanned_at: string | null
}

export type CompetitorInput = Omit<Competitor, 'id' | 'last_scanned_at'>

export interface WatchArea {
  id: string
  name: string
  search_query: string
  active: boolean
  last_scanned_at: string | null
}

export type WatchAreaInput = Omit<WatchArea, 'id' | 'last_scanned_at'>

export interface Finding {
  id: string
  competitor_id: string | null
  watch_area_id: string | null
  category: FindingCategory
  importance: FindingImportance
  title: string
  summary: string
  source_url: string | null
  detected_at: string
  read_at: string | null
  competitors: { name: string } | null
  competitor_watch_areas: { name: string } | null
}

export interface ScanRun {
  id: string
  competitor_id: string | null
  watch_area_id: string | null
  started_at: string
  finished_at: string | null
  status: 'running' | 'ok' | 'error'
  error: string | null
  findings_count: number | null
}

export function useCompetitors() {
  return useQuery({
    queryKey: ['competitors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('competitors').select('*').order('name')
      if (error) throw error
      return data as Competitor[]
    },
  })
}

export function useWatchAreas() {
  return useQuery({
    queryKey: ['competitor_watch_areas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('competitor_watch_areas').select('*').order('name')
      if (error) throw error
      return data as WatchArea[]
    },
  })
}

export function useFindings(onlyUnread: boolean) {
  return useQuery({
    queryKey: ['competitor_findings', onlyUnread],
    queryFn: async () => {
      let query = supabase
        .from('competitor_findings')
        .select('*, competitors(name), competitor_watch_areas(name)')
        .order('detected_at', { ascending: false })
        .limit(200)
      if (onlyUnread) query = query.is('read_at', null)
      const { data, error } = await query
      if (error) throw error
      return data as unknown as Finding[]
    },
  })
}

export function useUnreadFindingsCount() {
  return useQuery({
    queryKey: ['competitor_findings', 'unread_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('competitor_findings')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useLatestScanRuns() {
  return useQuery({
    queryKey: ['competitor_scan_runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitor_scan_runs')
        .select('id, competitor_id, watch_area_id, started_at, finished_at, status, error, findings_count')
        .order('started_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as ScanRun[]
    },
    // cât timp rulează o scanare, reîmprospătăm statusul
    refetchInterval: (query) =>
      query.state.data?.some((r) => r.status === 'running') ? 10_000 : false,
  })
}

export function useMarkFindingsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('competitor_findings')
        .update({ read_at: new Date().toISOString() })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor_findings'] })
    },
  })
}

export function useSaveCompetitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: CompetitorInput }) => {
      const { error } = id
        ? await supabase.from('competitors').update(input).eq('id', id)
        : await supabase.from('competitors').insert(input)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] })
    },
  })
}

export function useSaveWatchArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: WatchAreaInput }) => {
      const { error } = id
        ? await supabase.from('competitor_watch_areas').update(input).eq('id', id)
        : await supabase.from('competitor_watch_areas').insert(input)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor_watch_areas'] })
    },
  })
}

export function useScanNow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (target: { competitor_id: string } | { watch_area_id: string }) => {
      const { error } = await supabase.functions.invoke('competitor-scan', { body: target })
      if (error) throw error
    },
    onSuccess: () => {
      // rularea apare în jurnal imediat ce funcția o înregistrează
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['competitor_scan_runs'] })
      }, 2000)
    },
  })
}
