import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

export type ItemKind = 'post' | 'promo' | 'review_reply' | 'menu_text' | 'report'
export type ItemStatus = 'draft' | 'approved' | 'rejected' | 'published'

export interface Brand {
  id: string
  name: string
  description: string | null
  audience: string | null
  tone: string | null
  differentiators: string | null
  competition: string | null
  event_info: string | null
  logo_url: string | null
  logo_dark_url: string | null
  color_scheme: string
  address: string | null
  opening_hours: string | null
  website_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  menu_text: string | null
  extra_notes: string | null
  weekly_plan_enabled: boolean
}

export type BrandInput = Omit<Brand, 'id' | 'name' | 'logo_url' | 'logo_dark_url' | 'color_scheme'>

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
  published_at: string | null
  result_reach: number | null
  result_engagement: number | null
  result_orders: number | null
  result_note: string | null
  created_at: string
}

export type ResultFields = Pick<MarketingItem, 'result_reach' | 'result_engagement' | 'result_orders' | 'result_note'>

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
  return useLatestRun(brandId, 'weekly_plan')
}

export function useLatestRun(brandId: string | undefined, task: string) {
  return useQuery({
    queryKey: ['marketing_runs', brandId, task],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_runs')
        .select('id, task, status, error, started_at')
        .eq('brand_id', brandId!)
        .eq('task', task)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as MarketingRun | null
    },
    // cât timp se generează, verificăm la 10s
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 10_000 : false),
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<MarketingItem, 'status' | 'body' | 'title' | 'rejection_reason' | 'published_at'> & ResultFields> }) => {
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

// ---------------------------------------------------------------------------
// Evenimente
// ---------------------------------------------------------------------------

export type LeadStatus = 'new' | 'offer_sent' | 'negotiating' | 'confirmed' | 'lost'

export interface EventPackage {
  id: string
  brand_id: string
  name: string
  description: string
  price_per_person: number | null
  min_guests: number | null
  max_guests: number | null
  season: string | null
  active: boolean
}

export type EventPackageInput = Omit<EventPackage, 'id' | 'brand_id'>

export interface EventLead {
  id: string
  brand_id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  source: string | null
  event_type: string | null
  event_date: string | null
  guests: number | null
  budget: string | null
  package_id: string | null
  status: LeadStatus
  lost_reason: string | null
  notes: string | null
  next_followup_date: string | null
  last_message: string | null
  created_at: string
}

export type EventLeadInput = Omit<EventLead, 'id' | 'brand_id' | 'created_at' | 'last_message'>

export function usePackages(brandId: string | undefined) {
  return useQuery({
    queryKey: ['event_packages', brandId],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase.from('event_packages').select('*')
        .eq('brand_id', brandId!).order('active', { ascending: false }).order('created_at', { ascending: false })
      if (error) throw error
      return data as EventPackage[]
    },
  })
}

export function useSavePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<EventPackageInput> }) => {
      const { error } = await supabase.from('event_packages')
        .update({ ...input, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event_packages'] }),
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('event_packages').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event_packages'] }),
  })
}

export function useGeneratePackages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { brandId: string; request: string }) =>
      invokeAgent({ task: 'event_packages', brand_id: input.brandId, request: input.request }) as Promise<{ note: string }>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event_packages'] }),
  })
}

export function useLeads(brandId: string | undefined) {
  return useQuery({
    queryKey: ['event_leads', brandId],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase.from('event_leads').select('*')
        .eq('brand_id', brandId!).order('created_at', { ascending: false }).limit(200)
      if (error) throw error
      return data as EventLead[]
    },
  })
}

export function useSaveLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, brandId, input }: { id?: string; brandId: string; input: Partial<EventLeadInput> & { last_message?: string } }) => {
      const { error } = id
        ? await supabase.from('event_leads').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id)
        : await supabase.from('event_leads').insert({ ...input, brand_id: brandId })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event_leads'] }),
  })
}

export function useGenerateLeadMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { brandId: string; leadId: string; purpose: 'offer' | 'followup' | 'prospecting'; channel: 'email' | 'whatsapp' }) =>
      invokeAgent({
        task: 'event_message',
        brand_id: input.brandId,
        lead_id: input.leadId,
        purpose: input.purpose,
        channel: input.channel,
      }) as Promise<{ internal_note: string }>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event_leads'] }),
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (brandId: string) => invokeAgent({ task: 'monthly_report', brand_id: brandId }),
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['marketing_runs'] }), 1500)
    },
  })
}

// ---------------------------------------------------------------------------
// Chat „Întreabă marketerul”
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  image_path: string | null
  // ce a creat agentul în aplicație la mesajul ăsta
  actions: { tool: string; summary: string }[] | null
  created_at: string
}

export function useChatMessages(brandId: string | undefined) {
  return useQuery({
    queryKey: ['marketing_chat', brandId],
    enabled: !!brandId,
    queryFn: async () => {
      // RLS: fiecare vede doar conversația proprie
      const { data, error } = await supabase.from('marketing_chat_messages').select('id, role, content, image_path, actions, created_at')
        .eq('brand_id', brandId!).order('created_at', { ascending: true }).limit(200)
      if (error) throw error
      return data as ChatMessage[]
    },
  })
}

// Poza se micșorează pe telefon înainte de încărcare (max 1600px, JPEG): mai rapid și mai ieftin.
async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Nu am putut procesa poza'))), 'image/jpeg', 0.85),
  )
}

export function useSendChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { brandId: string; message: string; image: File | null }) => {
      let imagePath: string | null = null
      if (input.image) {
        imagePath = `${input.brandId}/chat/${crypto.randomUUID()}.jpg`
        const { error } = await supabase.storage.from('marketing-uploads')
          .upload(imagePath, await shrinkImage(input.image), { contentType: 'image/jpeg' })
        if (error) throw error
      }
      return invokeAgent({ task: 'chat', brand_id: input.brandId, message: input.message, image_path: imagePath })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_chat'] })
      // agentul poate fi creat ciorne / cereri / meniul zilei
      queryClient.invalidateQueries({ queryKey: ['marketing_items'] })
      queryClient.invalidateQueries({ queryKey: ['event_leads'] })
      queryClient.invalidateQueries({ queryKey: ['daily_menus'] })
    },
  })
}

export function useChatImageUrls(paths: string[]) {
  return useQuery({
    queryKey: ['chat_image_urls', paths],
    enabled: paths.length > 0,
    staleTime: 50 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('marketing-uploads').createSignedUrls(paths, 3600)
      if (error) throw error
      return Object.fromEntries(data.map((d) => [d.path, d.signedUrl])) as Record<string, string>
    },
  })
}

export function useClearChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (brandId: string) => {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase.from('marketing_chat_messages').delete()
        .eq('brand_id', brandId).eq('user_id', userData.user!.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing_chat'] }),
  })
}

// ---------------------------------------------------------------------------
// Meniul zilei → story
// ---------------------------------------------------------------------------

export interface DailyMenu {
  id: string
  menu_date: string
  items: string
  price: string | null
  headline: string | null
}

export function useDailyMenus(brandId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: ['daily_menus', brandId, from, to],
    enabled: !!brandId,
    queryFn: async () => {
      const { data, error } = await supabase.from('daily_menus').select('id, menu_date, items, price, headline')
        .eq('brand_id', brandId!).gte('menu_date', from).lte('menu_date', to).order('menu_date')
      if (error) throw error
      return data as DailyMenu[]
    },
  })
}

export function useSaveDailyMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { brandId: string; menu_date: string; items: string; price: string | null; headline: string | null }) => {
      const { error } = await supabase.from('daily_menus').upsert(
        {
          brand_id: input.brandId,
          menu_date: input.menu_date,
          items: input.items,
          price: input.price,
          headline: input.headline,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'brand_id,menu_date' },
      )
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily_menus'] }),
  })
}

export function useStoryHeadlines() {
  return useMutation({
    mutationFn: (input: { brandId: string; menu_date: string; items: string; price: string | null }) =>
      invokeAgent({ task: 'story_headline', brand_id: input.brandId, menu_date: input.menu_date, items: input.items, price: input.price }) as Promise<{
        headlines: string[]
        caption: string
      }>,
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ brandId, file }: { brandId: string; file: File }) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      const path = `${brandId}/logo-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('brand-assets').upload(path, file, { contentType: file.type, upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('brand-assets').getPublicUrl(path)
      // un logo nou încărcat nu are variantă pentru fundal închis → story-ul îl pune pe card alb
      const { error: updateError } = await supabase.from('marketing_brands')
        .update({ logo_url: data.publicUrl, logo_dark_url: null }).eq('id', brandId)
      if (updateError) throw updateError
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing_brands'] }),
  })
}
