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
import {
  chatReply,
  eventMessage,
  eventPackages,
  formatReport,
  menuTexts,
  monthlyReport,
  reviewReply,
  storyHeadlines,
  weeklyPlan,
  type ActionExecutor,
  type Brand,
  type ChatTurn,
  type Learnings,
} from './agent.ts'

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
  'id, name, description, audience, tone, differentiators, competition, event_info, address, opening_hours, website_url, facebook_url, instagram_url, menu_text, extra_notes, working_rules'

const WEEKDAYS = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă']

// Utilizatorul logat, dacă e owner sau are rolul `marketing`; altfel null.
async function marketingUser(req: Request): Promise<{ id: string } | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const [{ data: role, error }, { data: auth }] = await Promise.all([
    userClient.rpc('current_staff_role'),
    userClient.auth.getUser(authHeader.replace(/^Bearer /, '')),
  ])
  if (error || !auth.user || (role !== 'owner' && role !== 'marketing')) return null
  return { id: auth.user.id }
}

// Ce vede chat-ul despre starea aplicației: ultimul plan, evenimente, rezultate.
async function chatContext(db: SupabaseClient, brandId: string): Promise<string> {
  const [plan, leads, perf, menus] = await Promise.all([
    db.from('marketing_items').select('kind, status, title, suggested_date').eq('brand_id', brandId)
      .in('kind', ['post', 'promo']).order('created_at', { ascending: false }).limit(8),
    db.from('event_leads').select('name, event_type, event_date, guests, status, next_followup_date').eq('brand_id', brandId)
      .in('status', ['new', 'offer_sent', 'negotiating']).order('next_followup_date', { ascending: true }).limit(10),
    performance(db, brandId),
    db.from('daily_menus').select('menu_date, items, price').eq('brand_id', brandId)
      .order('menu_date', { ascending: false }).limit(5),
  ])
  if (plan.error) throw plan.error
  if (menus.error) throw menus.error
  if (leads.error) throw leads.error
  const list = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join('\n') : '(nimic)')
  return [
    `Data de azi: ${new Date().toISOString().slice(0, 10)}`,
    `Ultimele materiale din plan:\n${list(plan.data.map((i) => `${i.kind === 'promo' ? 'Ofertă' : 'Postare'} „${i.title}” (${i.suggested_date ?? '-'}, ${i.status})`))}`,
    `Cereri de eveniment în lucru:\n${list(leads.data.map((l) => `${l.name}: ${l.event_type ?? 'eveniment'}, ${l.event_date ?? 'dată nestabilită'}, ${l.guests ?? '?'} pers., ${l.status}, recontactare ${l.next_followup_date ?? '-'}`))}`,
    `Rezultatele postărilor publicate:\n${list(perf)}`,
    `Meniul zilei (luni-vineri, 12-16), ultimele zile:\n${list(menus.data.map((m) => `${m.menu_date}: ${(m.items as string).split('\n').join(', ')}${m.price ? ` — ${m.price}` : ''}`))}`,
  ].join('\n\n')
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

// Doar concurenții scanați care țin de brandul ăsta (competitors.brand_id).
async function competitorNotes(db: SupabaseClient, brandId: string): Promise<string[]> {
  const since = new Date(Date.now() - 30 * 24 * 3600_000).toISOString()
  const [snapshots, findings] = await Promise.all([
    db.from('competitor_snapshots').select('summary, scanned_at, competitors!inner(name, brand_id)')
      .eq('competitors.brand_id', brandId).order('scanned_at', { ascending: false }).limit(20),
    db.from('competitor_findings').select('title, competitors!inner(name, brand_id)')
      .eq('competitors.brand_id', brandId).gte('detected_at', since).order('detected_at', { ascending: false }).limit(30),
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

// Ce a învățat agentul din folosire, pentru un tip de material:
// editările echipei (original → final), respingerile cu motiv și exemple aprobate.
async function loadLearnings(db: SupabaseClient, brandId: string, kinds: string[]): Promise<Learnings> {
  const base = () => db.from('marketing_items').select('title, body, original_body, rejection_reason, input')
    .eq('brand_id', brandId).in('kind', kinds).order('updated_at', { ascending: false })
  const [edits, rejections, approved] = await Promise.all([
    base().not('original_body', 'is', null).in('status', ['approved', 'published']).limit(5),
    base().eq('status', 'rejected').limit(10),
    base().is('original_body', null).in('status', ['approved', 'published']).limit(5),
  ])
  if (edits.error) throw edits.error
  if (rejections.error) throw rejections.error
  if (approved.error) throw approved.error
  return {
    edits: edits.data.map((r) => ({ original: r.original_body as string, final: r.body as string })),
    rejections: rejections.data.map((r) => ({ title: r.title as string, reason: r.rejection_reason as string | null })),
    approved: approved.data.map((r) => ({ input: r.input as string | null, text: r.body as string })),
  }
}

const fmtResult = (r: { result_reach: number | null; result_engagement: number | null; result_orders: number | null; result_note: string | null }) =>
  `${r.result_reach ?? '?'} vizualizări / ${r.result_engagement ?? '?'} interacțiuni / ${r.result_orders ?? '?'} comenzi-rezervări${r.result_note ? ` — ${r.result_note}` : ''}`

// Postările publicate în ultimele 8 săptămâni, cu rezultatele trecute de echipă.
async function performance(db: SupabaseClient, brandId: string): Promise<string[]> {
  const since = new Date(Date.now() - 56 * 24 * 3600_000).toISOString()
  const { data, error } = await db.from('marketing_items')
    .select('title, kind, channel, suggested_date, result_reach, result_engagement, result_orders, result_note')
    .eq('brand_id', brandId).eq('status', 'published').in('kind', ['post', 'promo'])
    .gte('created_at', since).order('created_at', { ascending: false }).limit(30)
  if (error) throw error
  return data
    .filter((r) => r.result_reach != null || r.result_engagement != null || r.result_orders != null || r.result_note)
    .map((r) => `${r.kind === 'promo' ? 'Ofertă' : 'Postare'} „${r.title}” (${r.channel ?? '-'}, ${r.suggested_date ?? '-'}): ${fmtResult(r)}`)
}

// Ce s-a întâmplat cu cererile de eveniment: ce se confirmă și ce pierdem (și de ce).
async function eventOutcomes(db: SupabaseClient, brandId: string): Promise<string[]> {
  const { data, error } = await db.from('event_leads')
    .select('name, event_type, guests, status, lost_reason, event_packages(name)')
    .eq('brand_id', brandId).in('status', ['confirmed', 'lost'])
    .order('updated_at', { ascending: false }).limit(20)
  if (error) throw error
  type Row = { name: string; event_type: string | null; guests: number | null; status: string; lost_reason: string | null; event_packages: { name: string } | null }
  return (data as unknown as Row[]).map((l) =>
    `${l.status === 'confirmed' ? 'CONFIRMAT' : 'PIERDUT'}: ${l.event_type ?? 'eveniment'}, ${l.guests ?? '?'} pers.` +
    `${l.event_packages ? `, pachet „${l.event_packages.name}”` : ''}${l.lost_reason ? ` — motiv: ${l.lost_reason}` : ''}`)
}

// Acțiunile pe care le poate face chat-ul. Totul intră ca ciornă / cerere nouă.
function chatActions(db: SupabaseClient, brandId: string): ActionExecutor {
  const latestBatch = async () => {
    const { data } = await db.from('marketing_items').select('batch_id').eq('brand_id', brandId)
      .not('batch_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle()
    // adăugăm la planul curent, ca materialul să apară în tabul Plan
    return (data?.batch_id as string | undefined) ?? crypto.randomUUID()
  }
  return async (raw) => {
    // fără `strict`, câmpurile opționale pot lipsi din input
    const a = { ...raw, input: Object.fromEntries(Object.entries(raw.input).map(([k, v]) => [k, v ?? null])) } as typeof raw
    switch (a.tool) {
      case 'add_post': {
        const i = a.input
        const { error } = await db.from('marketing_items').insert({
          brand_id: brandId, batch_id: await latestBatch(), kind: 'post', title: i.title, body: i.body,
          channel: i.channel, suggested_date: i.date, suggested_time: i.time, image_idea: i.image_idea,
        })
        if (error) throw error
        return `Postarea „${i.title}” e în tabul Plan, de aprobat.`
      }
      case 'add_promo': {
        const i = a.input
        const { error } = await db.from('marketing_items').insert({
          brand_id: brandId, batch_id: await latestBatch(), kind: 'promo', title: i.title, body: i.details,
          channel: i.channel, suggested_date: i.start_date,
          rationale: `${i.rationale}${i.start_date ? ` (${i.start_date} → ${i.end_date ?? '?'})` : ''}`,
        })
        if (error) throw error
        return `Oferta „${i.title}” e în tabul Plan, de aprobat.`
      }
      case 'add_event_lead': {
        const i = a.input
        const { error } = await db.from('event_leads').insert({
          brand_id: brandId, name: i.name, contact_person: i.contact_person, phone: i.phone, email: i.email,
          event_type: i.event_type, event_date: i.event_date, guests: i.guests, budget: i.budget, notes: i.notes,
          source: 'chat', next_followup_date: new Date().toISOString().slice(0, 10),
        })
        if (error) throw error
        return `Cererea „${i.name}” e în tabul Evenimente.`
      }
      case 'save_daily_menu': {
        const i = a.input
        if (!/^\d{4}-\d{2}-\d{2}$/.test(i.menu_date)) throw new Error('Data trebuie să fie YYYY-MM-DD')
        // același format ca în tabul Meniul zilei (StoryTab)
        const items = [
          i.ciorba && `Ciorbă: ${i.ciorba}`,
          i.supa && `Supă cremă: ${i.supa}`,
          ...(i.mains ?? []).slice(0, 3).map((m) => `Fel principal: ${m}`),
        ].filter(Boolean).join('\n')
        const { error } = await db.from('daily_menus').upsert(
          { brand_id: brandId, menu_date: i.menu_date, items, price: i.price, updated_at: new Date().toISOString() },
          { onConflict: 'brand_id,menu_date' },
        )
        if (error) throw error
        return `Meniul zilei pentru ${i.menu_date} e în tabul Meniul zilei, gata de story.`
      }
      case 'save_rule': {
        const rule = a.input.rule.trim()
        if (!rule) throw new Error('Regula e goală')
        const { data, error: readError } = await db.from('marketing_brands').select('working_rules').eq('id', brandId).single()
        if (readError) throw readError
        const day = new Date().toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest' })
        const rules = [data.working_rules?.trim(), `- ${rule} (${day})`].filter(Boolean).join('\n')
        const { error } = await db.from('marketing_brands').update({ working_rules: rules, updated_at: new Date().toISOString() }).eq('id', brandId)
        if (error) throw error
        return 'Regula e salvată în Profil, la Reguli de lucru.'
      }
      case 'add_review_reply': {
        const i = a.input
        const { error } = await db.from('marketing_items').insert({
          brand_id: brandId, kind: 'review_reply', channel: i.platform,
          title: `Recenzie${i.rating != null ? ` (${i.rating}★)` : ''}: ${i.review.slice(0, 60)}`,
          body: i.reply, input: i.review,
        })
        if (error) throw error
        return 'Răspunsul e în tabul Recenzii, de aprobat.'
      }
      default:
        throw new Error('Acțiune necunoscută')
    }
  }
}

async function runMonthlyReport(db: SupabaseClient, anthropic: Anthropic, brandId: string, from: Date, to: Date, month: string) {
  const runId = await startRun(db, brandId, 'monthly_report')
  try {
    const brand = await loadBrand(db, brandId)
    const range = <T extends { gte: (c: string, v: string) => T; lt: (c: string, v: string) => T }>(q: T, col: string) =>
      q.gte(col, from.toISOString()).lt(col, to.toISOString())
    const [items, leads] = await Promise.all([
      range(db.from('marketing_items')
        .select('kind, status, title, channel, suggested_date, result_reach, result_engagement, result_orders, result_note, rejection_reason, original_body')
        .eq('brand_id', brandId), 'created_at'),
      range(db.from('event_leads')
        .select('name, event_type, guests, status, lost_reason, source, event_packages(name)')
        .eq('brand_id', brandId), 'created_at'),
    ])
    if (items.error) throw items.error
    if (leads.error) throw leads.error

    type Item = { kind: string; status: string; title: string; channel: string | null; suggested_date: string | null; result_reach: number | null; result_engagement: number | null; result_orders: number | null; result_note: string | null; rejection_reason: string | null; original_body: string | null }
    type Lead = { name: string; event_type: string | null; guests: number | null; status: string; lost_reason: string | null; source: string | null; event_packages: { name: string } | null }
    const it = items.data as Item[]
    const ld = leads.data as unknown as Lead[]
    const count = (k: string, st?: string) => it.filter((i) => i.kind === k && (!st || i.status === st)).length
    const published = it.filter((i) => i.status === 'published' && (i.kind === 'post' || i.kind === 'promo'))
    const data = [
      `Materiale generate: ${count('post')} postări, ${count('promo')} oferte, ${count('review_reply')} răspunsuri la recenzii, ${count('menu_text')} texte de meniu.`,
      `Publicate: ${published.length}; aprobate nepublicate: ${it.filter((i) => i.status === 'approved').length}; respinse: ${it.filter((i) => i.status === 'rejected').length}; editate de echipă înainte de aprobare: ${it.filter((i) => i.original_body).length}.`,
      published.length
        ? `Rezultatele materialelor publicate:\n${published.map((p) => `- ${p.kind === 'promo' ? 'Ofertă' : 'Postare'} „${p.title}” (${p.channel ?? '-'}, ${p.suggested_date ?? '-'}): ${fmtResult(p)}`).join('\n')}`
        : 'Niciun material marcat ca publicat.',
      it.some((i) => i.rejection_reason)
        ? `Motive de respingere:\n${it.filter((i) => i.rejection_reason).map((i) => `- „${i.title}”: ${i.rejection_reason}`).join('\n')}`
        : '',
      ld.length
        ? `Cereri de eveniment noi: ${ld.length} (${['new', 'offer_sent', 'negotiating', 'confirmed', 'lost'].map((s) => `${s}: ${ld.filter((l) => l.status === s).length}`).join(', ')}).\n` +
          ld.map((l) => `- ${l.event_type ?? 'eveniment'}, ${l.guests ?? '?'} pers., sursa ${l.source ?? '-'}, ${l.status}${l.event_packages ? `, pachet „${l.event_packages.name}”` : ''}${l.lost_reason ? ` — pierdut: ${l.lost_reason}` : ''}`).join('\n')
        : 'Nicio cerere de eveniment înregistrată.',
    ].filter(Boolean).join('\n\n')

    const { output, inputTokens, outputTokens } = await monthlyReport(anthropic, brand, month, data)
    const { error } = await db.from('marketing_items').insert({
      brand_id: brandId, kind: 'report', title: output.title, body: formatReport(output),
    })
    if (error) throw error
    await finishRun(db, runId, { items: 1, inputTokens, outputTokens })
  } catch (err) {
    console.error('monthly_report failed', brandId, err)
    await finishRun(db, runId, { error: err })
  }
}

async function runWeeklyPlan(db: SupabaseClient, anthropic: Anthropic, brandId: string) {
  const runId = await startRun(db, brandId, 'weekly_plan')
  try {
    const brand = await loadBrand(db, brandId)
    const now = new Date()
    // sâmbăta și duminica planul e pentru săptămâna care începe lunea următoare
    const dow = now.getUTCDay()
    const start = dow === 6 || dow === 0 ? new Date(now.getTime() + (dow === 6 ? 2 : 1) * 86400_000) : now
    const startDate = start.toISOString().slice(0, 10)
    const weekEnd = new Date(start.getTime() + 6 * 86400_000).toISOString().slice(0, 10)
    const [notes, approved, learnings, perf, menus, packages] = await Promise.all([
      competitorNotes(db, brandId),
      recentTitles(db, brandId, ['approved', 'published']),
      loadLearnings(db, brandId, ['post', 'promo']),
      performance(db, brandId),
      db.from('daily_menus').select('menu_date, items, price').eq('brand_id', brandId)
        .gte('menu_date', startDate).lte('menu_date', weekEnd).order('menu_date'),
      db.from('event_packages').select('name, price_per_person, min_guests, max_guests, season')
        .eq('brand_id', brandId).eq('active', true),
    ])
    if (menus.error) throw menus.error
    if (packages.error) throw packages.error
    const { output, inputTokens, outputTokens } = await weeklyPlan(anthropic, brand, {
      startDate,
      startWeekday: WEEKDAYS[start.getUTCDay()],
      competitorNotes: notes,
      approvedTitles: approved,
      performance: perf,
      dailyMenus: menus.data.map((m) => `${m.menu_date}: ${(m.items as string).split('\n').join(', ')}${m.price ? ` — ${m.price}` : ''}`),
      eventPackages: packages.data.map((p) => `${p.name}: ${p.price_per_person ?? '?'} lei/pers., ${p.min_guests ?? '?'}–${p.max_guests ?? '?'} pers.${p.season ? `, ${p.season}` : ''}`),
    }, learnings)

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
  const user = fromCron ? null : await marketingUser(req)
  if (!fromCron && !user) return json({ error: 'unauthorized' }, 401)

  const body = (await req.json().catch(() => ({}))) as {
    task?: string
    brand_id?: string
    review?: string
    platform?: string | null
    rating?: number | null
    author?: string | null
    products?: string
    request?: string
    lead_id?: string
    purpose?: 'offer' | 'followup' | 'prospecting'
    channel?: 'email' | 'whatsapp'
    message?: string
    image_path?: string | null
    menu_date?: string
    items?: string
    price?: string | null
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

  if (body.task === 'monthly_report') {
    // din cron (ziua 1): luna trecută, pentru toate brandurile; din UI: luna curentă până azi
    const now = new Date()
    const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const [from, to] = fromCron && !body.brand_id
      ? [new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)), thisMonth]
      : [thisMonth, now]
    const month = from.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric', timeZone: 'UTC' }) +
      (to === now ? ' (până azi)' : '')
    let brandIds: string[]
    if (body.brand_id) brandIds = [body.brand_id]
    else if (fromCron) {
      const { data, error } = await db.from('marketing_brands').select('id')
      if (error) return json({ error: error.message }, 500)
      brandIds = data.map((b) => b.id as string)
    } else return json({ error: 'brand_id lipsă' }, 400)
    EdgeRuntime.waitUntil((async () => {
      for (const id of brandIds) await runMonthlyReport(db, anthropic, id, from, to, month)
    })())
    return json({ status: 'started' }, 202)
  }

  if (!body.brand_id) return json({ error: 'brand_id lipsă' }, 400)
  const brandId = body.brand_id

  if (body.task === 'chat') {
    const message = body.message?.trim() ?? ''
    const imagePath = body.image_path ?? null
    if (!user) return json({ error: 'Chat-ul e doar pentru utilizatori logați' }, 400)
    if (!message && !imagePath) return json({ error: 'Mesajul lipsește' }, 400)
    // poza trebuie să fie din folderul brandului, încărcată de echipă (vezi useSendChat)
    if (imagePath && !imagePath.startsWith(`${brandId}/`)) return json({ error: 'Poză invalidă' }, 400)
    const runId = await startRun(db, brandId, 'chat')
    try {
      const { error: insertError } = await db.from('marketing_chat_messages')
        .insert({ brand_id: brandId, user_id: user.id, role: 'user', content: message, image_path: imagePath })
      if (insertError) throw insertError
      const [brand, context, history] = await Promise.all([
        loadBrand(db, brandId),
        chatContext(db, brandId),
        // ultimele 30 de mesaje, inclusiv cel de acum
        db.from('marketing_chat_messages').select('role, content, image_path').eq('brand_id', brandId).eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(30),
      ])
      if (history.error) throw history.error
      const rows = (history.data as { role: 'user' | 'assistant'; content: string; image_path: string | null }[]).reverse()
      const turns: ChatTurn[] = rows.map((r) => ({ role: r.role, content: r.content, hadImage: !!r.image_path }))
      // doar poza mesajului curent ajunge la model; pozele vechi rămân ca mențiune
      if (imagePath) {
        const { data: file, error } = await db.storage.from('marketing-uploads').download(imagePath)
        if (error) throw error
        const bytes = new Uint8Array(await file.arrayBuffer())
        let bin = ''
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
        const type = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg'
        turns[turns.length - 1] = { role: 'user', content: message, image: { mediaType: type, data: btoa(bin) } }
      }
      // conversația trebuie să înceapă cu un mesaj al utilizatorului
      while (turns.length && turns[0].role !== 'user') turns.shift()

      const execute = chatActions(db, brandId)
      const { output, inputTokens, outputTokens } = await chatReply(anthropic, brand, context, turns, execute)
      const { data, error } = await db.from('marketing_chat_messages')
        .insert({
          brand_id: brandId, user_id: user.id, role: 'assistant', content: output.text,
          actions: output.actions.length ? output.actions : null,
        }).select('*').single()
      if (error) throw error
      await finishRun(db, runId, { items: 1 + output.actions.length, inputTokens, outputTokens })
      return json({ message: data })
    } catch (err) {
      await finishRun(db, runId, { error: err })
      return json({ error: err instanceof Error ? err.message : String(err) }, 500)
    }
  }

  if (body.task === 'story_headline') {
    const items = body.items?.trim()
    if (!items || !body.menu_date) return json({ error: 'Meniul zilei lipsește' }, 400)
    const runId = await startRun(db, brandId, 'story_headline')
    try {
      const [brand, recent] = await Promise.all([
        loadBrand(db, brandId),
        db.from('daily_menus').select('headline').eq('brand_id', brandId).not('headline', 'is', null)
          .order('menu_date', { ascending: false }).limit(10),
      ])
      if (recent.error) throw recent.error
      const weekday = WEEKDAYS[new Date(`${body.menu_date}T12:00:00Z`).getUTCDay()]
      const { output, inputTokens, outputTokens } = await storyHeadlines(
        anthropic, brand, { date: body.menu_date, weekday, items, price: body.price ?? null },
        recent.data.map((r) => r.headline as string),
      )
      await finishRun(db, runId, { items: output.headlines.length, inputTokens, outputTokens })
      return json(output)
    } catch (err) {
      await finishRun(db, runId, { error: err })
      return json({ error: err instanceof Error ? err.message : String(err) }, 500)
    }
  }

  if (body.task === 'event_packages') {
    const runId = await startRun(db, brandId, 'event_packages')
    try {
      const [brand, existing, outcomes] = await Promise.all([
        loadBrand(db, brandId),
        db.from('event_packages').select('name, price_per_person, season').eq('brand_id', brandId).eq('active', true),
        eventOutcomes(db, brandId),
      ])
      if (existing.error) throw existing.error
      const { output, inputTokens, outputTokens } = await eventPackages(
        anthropic, brand, body.request?.trim() ?? '',
        existing.data.map((p) => `${p.name} (${p.price_per_person ?? '?'} lei/pers., ${p.season ?? '-'})`),
        outcomes,
      )
      const { data, error } = await db.from('event_packages')
        .insert(output.packages.map((p) => ({ ...p, brand_id: brandId }))).select('*')
      if (error) throw error
      await finishRun(db, runId, { items: data.length, inputTokens, outputTokens })
      return json({ packages: data, note: output.note })
    } catch (err) {
      await finishRun(db, runId, { error: err })
      return json({ error: err instanceof Error ? err.message : String(err) }, 500)
    }
  }

  if (body.task === 'event_message') {
    if (!body.lead_id) return json({ error: 'lead_id lipsă' }, 400)
    const runId = await startRun(db, brandId, 'event_message')
    try {
      const [brand, lead, outcomes] = await Promise.all([
        loadBrand(db, brandId),
        db.from('event_leads')
          .select('name, contact_person, event_type, event_date, guests, budget, status, notes, last_message, event_packages(name, description, price_per_person, min_guests, max_guests)')
          .eq('id', body.lead_id).eq('brand_id', brandId).single(),
        eventOutcomes(db, brandId),
      ])
      if (lead.error) throw lead.error
      type Pkg = { name: string; description: string; price_per_person: number | null; min_guests: number | null; max_guests: number | null }
      const pkg = (lead.data as unknown as { event_packages: Pkg | null }).event_packages
      const noLearnings: Learnings = { edits: [], rejections: [], approved: [] }
      const { output, inputTokens, outputTokens } = await eventMessage(
        anthropic, brand, lead.data,
        pkg ? `${pkg.name}: ${pkg.description} — ${pkg.price_per_person ?? '?'} lei/pers., ${pkg.min_guests ?? '?'}-${pkg.max_guests ?? '?'} pers.` : null,
        body.purpose ?? 'offer', body.channel ?? 'email', outcomes, noLearnings,
      )
      const followup = new Date(Date.now() + output.followup_in_days * 24 * 3600_000).toISOString().slice(0, 10)
      const { data, error } = await db.from('event_leads')
        .update({ last_message: output.message, next_followup_date: followup, updated_at: new Date().toISOString() })
        .eq('id', body.lead_id).select('*').single()
      if (error) throw error
      await finishRun(db, runId, { items: 1, inputTokens, outputTokens })
      return json({ lead: data, internal_note: output.internal_note })
    } catch (err) {
      await finishRun(db, runId, { error: err })
      return json({ error: err instanceof Error ? err.message : String(err) }, 500)
    }
  }

  if (body.task === 'review_reply') {
    const review = body.review?.trim()
    if (!review) return json({ error: 'Textul recenziei lipsește' }, 400)
    const runId = await startRun(db, brandId, 'review_reply')
    try {
      const [brand, learnings] = await Promise.all([
        loadBrand(db, brandId),
        loadLearnings(db, brandId, ['review_reply']),
      ])
      const { output, inputTokens, outputTokens } = await reviewReply(anthropic, brand, {
        text: review, platform: body.platform ?? null, rating: body.rating ?? null, author: body.author ?? null,
      }, learnings)
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
      const [brand, learnings] = await Promise.all([
        loadBrand(db, brandId),
        loadLearnings(db, brandId, ['menu_text']),
      ])
      const { output, inputTokens, outputTokens } = await menuTexts(anthropic, brand, products, learnings)
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
