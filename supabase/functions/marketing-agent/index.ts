// Edge Function: agentul de marketing.
//
// Body `{ task, brand_id?, ... }`:
//   * `weekly_plan` — plan pe 7 zile (postări + oferte). Rulează în fundal (202).
//     Din pg_cron (header `x-cron-secret`, fără brand_id) → pentru toate brandurile
//     cu weekly_plan_enabled. Din UI (owner) → pentru brand_id.
//   * `review_reply` — `{ review, platform?, rating?, author? }` → răspuns, sincron.
//   * `menu_text` — `{ products }` (un produs pe linie) → descrieri, sincron.
//
// Tot ce produce agentul intră în marketing_items cu status `draft`; owner-ul aprobă.
//
// Secrete: ANTHROPIC_API_KEY (sau `Anthropic_api_key`), COMPETITOR_SCAN_CRON_SECRET
// (același secret de cron ca la Iscoada). SUPABASE_* sunt injectate automat.

import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { menuTexts, reviewReply, weeklyPlan, type Brand } from './agent.ts'

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

const BRAND_COLUMNS =
  'id, name, description, audience, tone, differentiators, address, opening_hours, website_url, facebook_url, instagram_url, menu_text, extra_notes'

const WEEKDAYS = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă']

// owner sau rolul `marketing`
async function canUseMarketing(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data, error } = await userClient.rpc('current_staff_role')
  return !error && (data === 'owner' || data === 'marketing')
}

async function loadBrand(db: SupabaseClient, id: string): Promise<Brand & { id: string }> {
  const { data, error } = await db.from('marketing_brands').select(BRAND_COLUMNS).eq('id', id).single()
  if (error) throw error
  return data as Brand & { id: string }
}

async function startRun(db: SupabaseClient, brandId: string, task: string) {
  const { data, error } = await db.from('marketing_runs').insert({ brand_id: brandId, task }).select('id').single()
  if (error) throw error
  return data.id as string
}

async function finishRun(
  db: SupabaseClient,
  runId: string,
  result: { error?: unknown; items?: number; inputTokens?: number; outputTokens?: number },
) {
  await db.from('marketing_runs').update({
    status: result.error ? 'error' : 'ok',
    finished_at: new Date().toISOString(),
    error: result.error ? (result.error instanceof Error ? result.error.message : String(result.error)) : null,
    items_count: result.items ?? null,
    input_tokens: result.inputTokens ?? null,
    output_tokens: result.outputTokens ?? null,
  }).eq('id', runId)
}

async function competitorNotes(db: SupabaseClient): Promise<string[]> {
  const since = new Date(Date.now() - 30 * 24 * 3600_000).toISOString()
  const [snapshots, findings] = await Promise.all([
    db.from('competitor_snapshots').select('summary, scanned_at, competitors(name)')
      .not('competitor_id', 'is', null).order('scanned_at', { ascending: false }).limit(20),
    db.from('competitor_findings').select('title, competitors(name)')
      .not('competitor_id', 'is', null).gte('detected_at', since).order('detected_at', { ascending: false }).limit(30),
  ])
  if (snapshots.error) throw snapshots.error
  if (findings.error) throw findings.error

  type Named = { competitors: { name: string } | null }
  const latest = new Map<string, string>()
  for (const s of snapshots.data as unknown as (Named & { summary: string | null })[]) {
    const name = s.competitors?.name
    if (name && s.summary && !latest.has(name)) latest.set(name, s.summary)
  }
  return [
    ...[...latest].map(([name, summary]) => `${name}: ${summary}`),
    ...(findings.data as unknown as (Named & { title: string })[]).map((f) => `${f.competitors?.name}: ${f.title}`),
  ]
}

async function recentTitles(db: SupabaseClient, brandId: string, statuses: string[]) {
  const since = new Date(Date.now() - 42 * 24 * 3600_000).toISOString()
  const { data, error } = await db.from('marketing_items').select('title')
    .eq('brand_id', brandId).in('kind', ['post', 'promo']).in('status', statuses)
    .gte('created_at', since).order('created_at', { ascending: false }).limit(30)
  if (error) throw error
  return data.map((r) => r.title as string)
}

async function runWeeklyPlan(db: SupabaseClient, anthropic: Anthropic, brandId: string) {
  const runId = await startRun(db, brandId, 'weekly_plan')
  try {
    const brand = await loadBrand(db, brandId)
    const now = new Date()
    const [notes, approved, rejected] = await Promise.all([
      competitorNotes(db),
      recentTitles(db, brandId, ['approved', 'published']),
      recentTitles(db, brandId, ['rejected']),
    ])
    const { output, inputTokens, outputTokens } = await weeklyPlan(anthropic, brand, {
      startDate: now.toISOString().slice(0, 10),
      startWeekday: WEEKDAYS[now.getUTCDay()],
      competitorNotes: notes,
      approvedTitles: approved,
      rejectedTitles: rejected,
    })

    const batchId = crypto.randomUUID()
    const rows = [
      ...output.posts.map((p) => ({
        brand_id: brandId, batch_id: batchId, kind: 'post', title: p.title, body: p.body,
        channel: p.channel, suggested_date: p.date, suggested_time: p.time, image_idea: p.image_idea,
        rationale: output.summary,
      })),
      ...output.promos.map((p) => ({
        brand_id: brandId, batch_id: batchId, kind: 'promo', title: p.title, body: p.details,
        channel: p.channel, suggested_date: p.start_date, rationale: `${p.rationale} (${p.start_date} → ${p.end_date})`,
      })),
    ]
    if (rows.length > 0) {
      const { error } = await db.from('marketing_items').insert(rows)
      if (error) throw error
    }
    await finishRun(db, runId, { items: rows.length, inputTokens, outputTokens })
  } catch (err) {
    console.error('weekly_plan failed', brandId, err)
    await finishRun(db, runId, { error: err })
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const cronSecret = Deno.env.get('COMPETITOR_SCAN_CRON_SECRET')
  const fromCron = !!cronSecret && req.headers.get('x-cron-secret') === cronSecret
  if (!fromCron && !(await canUseMarketing(req))) return json({ error: 'unauthorized' }, 401)

  const body = (await req.json().catch(() => ({}))) as {
    task?: string
    brand_id?: string
    review?: string
    platform?: string | null
    rating?: number | null
    author?: string | null
    products?: string
  }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') ?? Deno.env.get('Anthropic_api_key')
  const anthropic = new Anthropic({ apiKey })

  if (body.task === 'weekly_plan') {
    let brandIds: string[]
    if (body.brand_id) brandIds = [body.brand_id]
    else if (fromCron) {
      const { data, error } = await db.from('marketing_brands').select('id').eq('weekly_plan_enabled', true)
      if (error) return json({ error: error.message }, 500)
      brandIds = data.map((b) => b.id as string)
    } else return json({ error: 'brand_id lipsă' }, 400)

    EdgeRuntime.waitUntil((async () => {
      for (const id of brandIds) await runWeeklyPlan(db, anthropic, id)
    })())
    return json({ status: 'started', brands: brandIds.length }, 202)
  }

  if (!body.brand_id) return json({ error: 'brand_id lipsă' }, 400)
  const brandId = body.brand_id

  if (body.task === 'review_reply') {
    const review = body.review?.trim()
    if (!review) return json({ error: 'Textul recenziei lipsește' }, 400)
    const runId = await startRun(db, brandId, 'review_reply')
    try {
      const brand = await loadBrand(db, brandId)
      const { output, inputTokens, outputTokens } = await reviewReply(anthropic, brand, {
        text: review, platform: body.platform ?? null, rating: body.rating ?? null, author: body.author ?? null,
      })
      const { data, error } = await db.from('marketing_items').insert({
        brand_id: brandId, kind: 'review_reply', channel: body.platform ?? null,
        title: `Recenzie${body.author ? ` ${body.author}` : ''}${body.rating != null ? ` (${body.rating}★)` : ''}: ${review.slice(0, 60)}`,
        body: output.reply, rationale: output.internal_note || null, input: review,
      }).select('*').single()
      if (error) throw error
      await finishRun(db, runId, { items: 1, inputTokens, outputTokens })
      return json({ item: data })
    } catch (err) {
      await finishRun(db, runId, { error: err })
      return json({ error: err instanceof Error ? err.message : String(err) }, 500)
    }
  }

  if (body.task === 'menu_text') {
    const products = body.products?.trim()
    if (!products) return json({ error: 'Lista de produse lipsește' }, 400)
    const runId = await startRun(db, brandId, 'menu_text')
    try {
      const brand = await loadBrand(db, brandId)
      const { output, inputTokens, outputTokens } = await menuTexts(anthropic, brand, products)
      const { data, error } = await db.from('marketing_items').insert(
        output.items.map((m) => ({
          brand_id: brandId, kind: 'menu_text', title: m.title, body: m.description, input: m.product,
        })),
      ).select('*')
      if (error) throw error
      await finishRun(db, runId, { items: data.length, inputTokens, outputTokens })
      return json({ items: data })
    } catch (err) {
      await finishRun(db, runId, { error: err })
      return json({ error: err instanceof Error ? err.message : String(err) }, 500)
    }
  }

  return json({ error: 'task necunoscut' }, 400)
})
