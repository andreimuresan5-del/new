// Edge Function: scanează concurența.
//
// Apeluri:
//   * pg_cron (supabase/cron/competitor_scan.sql), cu header-ul `x-cron-secret`:
//     body `{}` → alege ținta activă cea mai veche nescanată în ultimele
//     RESCAN_AFTER_HOURS și o scanează. Cron-ul rulează des, așa că toate țintele
//     ajung scanate o dată la ~2 zile, una câte una (fără să depășim limita de timp a funcției).
//   * UI-ul (owner logat), cu JWT-ul lui: body `{ competitor_id }` sau
//     `{ watch_area_id }` → scanează ținta respectivă imediat („Scanează acum”).
//
// Scanarea rulează în fundal (EdgeRuntime.waitUntil); răspunsul vine imediat cu 202.
//
// Secrete necesare (supabase secrets set ...): ANTHROPIC_API_KEY, COMPETITOR_SCAN_CRON_SECRET.
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY sunt injectate automat.

import Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { runScan, type AreaTarget, type CompetitorTarget, type ScanContext } from './agent.ts'

// 44h, nu 48h: cron-ul rulează la 15 min, așa că o țintă scanată ieri la 10:00
// ajunge scadentă poimâine dimineață, nu poimâine după-amiază
const RESCAN_AFTER_HOURS = 44

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void }

type Target =
  | { kind: 'competitor'; id: string }
  | { kind: 'area'; id: string }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function isOwner(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return false
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data, error } = await userClient.rpc('current_staff_role')
  return !error && data === 'owner'
}

async function pickDueTarget(db: SupabaseClient): Promise<Target | null> {
  const cutoff = new Date(Date.now() - RESCAN_AFTER_HOURS * 3600_000).toISOString()
  const due = `last_scanned_at.is.null,last_scanned_at.lt.${cutoff}`

  const [competitors, areas] = await Promise.all([
    db.from('competitors').select('id, last_scanned_at').eq('active', true).or(due)
      .order('last_scanned_at', { ascending: true, nullsFirst: true }).limit(1),
    db.from('competitor_watch_areas').select('id, last_scanned_at').eq('active', true).or(due)
      .order('last_scanned_at', { ascending: true, nullsFirst: true }).limit(1),
  ])
  if (competitors.error) throw competitors.error
  if (areas.error) throw areas.error

  const c = competitors.data[0]
  const a = areas.data[0]
  if (!c && !a) return null
  if (c && (!a || (c.last_scanned_at ?? '') <= (a.last_scanned_at ?? ''))) return { kind: 'competitor', id: c.id }
  return { kind: 'area', id: a!.id }
}

async function loadContext(db: SupabaseClient, target: Target): Promise<ScanContext> {
  const fk = target.kind === 'competitor' ? 'competitor_id' : 'watch_area_id'
  const since = new Date(Date.now() - 30 * 24 * 3600_000).toISOString()

  const [entity, snapshot, findings] = await Promise.all([
    target.kind === 'competitor'
      ? db.from('competitors')
          .select('name, city, website_url, google_maps_url, delivery_urls, facebook_url, instagram_url, notes')
          .eq('id', target.id).single()
      : db.from('competitor_watch_areas').select('name, search_query').eq('id', target.id).single(),
    db.from('competitor_snapshots').select('state, scanned_at').eq(fk, target.id)
      .order('scanned_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('competitor_findings').select('title').eq(fk, target.id).gte('detected_at', since)
      .order('detected_at', { ascending: false }).limit(50),
  ])
  if (entity.error) throw entity.error
  if (snapshot.error) throw snapshot.error
  if (findings.error) throw findings.error

  const scanTarget = target.kind === 'competitor'
    ? ({ kind: 'competitor', ...entity.data } as CompetitorTarget)
    : ({ kind: 'area', ...entity.data } as AreaTarget)

  return {
    target: scanTarget,
    previousState: snapshot.data?.state ?? null,
    previousScannedAt: snapshot.data?.scanned_at ?? null,
    recentFindingTitles: findings.data.map((f) => f.title),
    today: new Date().toISOString().slice(0, 10),
  }
}

async function scanTarget(db: SupabaseClient, anthropic: Anthropic, target: Target) {
  const table = target.kind === 'competitor' ? 'competitors' : 'competitor_watch_areas'
  const ref: { competitor_id?: string; watch_area_id?: string } = target.kind === 'competitor' ? { competitor_id: target.id } : { watch_area_id: target.id }

  // marcăm ținta ca „în lucru” înainte de scanare, ca rulările cron paralele să n-o reia
  await db.from(table).update({ last_scanned_at: new Date().toISOString() }).eq('id', target.id)

  const { data: run, error: runError } = await db.from('competitor_scan_runs')
    .insert(ref).select('id').single()
  if (runError) throw runError

  try {
    const ctx = await loadContext(db, target)
    const { report, inputTokens, outputTokens } = await runScan(anthropic, ctx)

    const { data: snapshot, error: snapError } = await db.from('competitor_snapshots')
      .insert({ ...ref, state: report.state, summary: report.summary })
      .select('id').single()
    if (snapError) throw snapError

    if (report.findings.length > 0) {
      const { error } = await db.from('competitor_findings').insert(
        report.findings.map((f) => ({ ...f, ...ref, snapshot_id: snapshot.id })),
      )
      if (error) throw error
    }

    await db.from('competitor_scan_runs').update({
      status: 'ok',
      finished_at: new Date().toISOString(),
      findings_count: report.findings.length,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    }).eq('id', run.id)
  } catch (err) {
    console.error('competitor-scan failed', target, err)
    await db.from('competitor_scan_runs').update({
      status: 'error',
      finished_at: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    }).eq('id', run.id)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const cronSecret = Deno.env.get('COMPETITOR_SCAN_CRON_SECRET')
  const fromCron = !!cronSecret && req.headers.get('x-cron-secret') === cronSecret
  if (!fromCron && !(await isOwner(req))) return json({ error: 'unauthorized' }, 401)

  const body = (await req.json().catch(() => ({}))) as { competitor_id?: string; watch_area_id?: string }
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  let target: Target | null
  if (body.competitor_id) target = { kind: 'competitor', id: body.competitor_id }
  else if (body.watch_area_id) target = { kind: 'area', id: body.watch_area_id }
  else target = await pickDueTarget(db)

  if (!target) return json({ status: 'idle', message: 'Nicio țintă de scanat acum.' })

  // pe proiectul de producție secretul a fost salvat ca `Anthropic_api_key`; acceptăm ambele forme
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY') ?? Deno.env.get('Anthropic_api_key')
  const anthropic = new Anthropic({ apiKey })
  EdgeRuntime.waitUntil(scanTarget(db, anthropic, target))
  return json({ status: 'started', target }, 202)
})
