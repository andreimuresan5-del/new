import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export type ItemKind = 'post' | 'promo' | 'review_reply' | 'menu_text'
export type ItemStatus = 'draft' | 'approved' | 'rejected' | 'published'

export interface Brand {
  id: string
  name: string
  description: string | null
  audience: string | null
  tone: string | null
  differentiators: string | null
  address: string | null
  opening_hours: string | null
  website_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  menu_text: string | null
  extra_notes: string | null
  weekly_plan_enabled: boolean
}

export type BrandInput = Omit<Brand, 'id' | 'name'>

export interface MarketingItem {
  id: string
  brand_id: string
  kind: ItemKind
  status: ItemStatus
  title: string
  body: string
  channel: string | null
  suggested_date: string | null
  suggested_time: string | null
  image_idea: string | null
  rationale: string | null
  input: string | null
  batch_id: string | null
  // textul agentului înainte de prima editare a echipei (setat automat în DB)
  original_body: string | null
  rejection_reason: string | null
  created_at: string
}

export interface MarketingRun {
  id: string
  task: string
  status: 'running' | 'ok' | 'error'
  error: string | null
  started_at: string
}

export function useBrands() {
  return useQuery({
    queryKey: ['marketing_brands'],
    queryFn: async () => {
      const { data, error } = await supabase.from('marketing_brands').select('*').order('name')
      if (error) throw error
      return data as Brand[]
    },
  })
}

export function useSaveBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BrandInput }) => {
      const { error } = await supabase
        .from('marketing_brands')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_brands'] })
    },
  })
}

export function useItems(brandId: string | undefined, kinds: ItemKind[]) {
  return useQuery({
    queryKey: ['marketing_items', brandId, kinds],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_items')
        .select('*')
        .eq('brand_id', brandId!)
        .in('kind', kinds)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as MarketingItem[]
    },
  })
}

export function useLatestWeeklyRun(brandId: string | undefined) {
  return useQuery({
    queryKey: ['marketing_runs', brandId, 'weekly_plan'],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_runs')
        .select('id, task, status, error, started_at')
        .eq('brand_id', brandId!)
        .eq('task', 'weekly_plan')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as MarketingRun | null
    },
    // cât timp se generează planul, verificăm la 10s
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 10_000 : false),
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<MarketingItem, 'status' | 'body' | 'title' | 'rejection_reason'>> }) => {
      const { error } = await supabase
        .from('marketing_items')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_items'] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('marketing_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_items'] })
    },
  })
}

async function invokeAgent(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('marketing-agent', { body })
  if (error) throw error
  return data
}

export function useGenerateWeeklyPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (brandId: string) => invokeAgent({ task: 'weekly_plan', brand_id: brandId }),
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['marketing_runs'] }), 1500)
    },
  })
}

export function useGenerateReviewReply() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { brandId: string; review: string; platform: string | null; rating: number | null; author: string | null }) =>
      invokeAgent({
        task: 'review_reply',
        brand_id: input.brandId,
        review: input.review,
        platform: input.platform,
        rating: input.rating,
        author: input.author,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_items'] })
    },
  })
}

export function useGenerateMenuTexts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { brandId: string; products: string }) =>
      invokeAgent({ task: 'menu_text', brand_id: input.brandId, products: input.products }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_items'] })
    },
  })
}
