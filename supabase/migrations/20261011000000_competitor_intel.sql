-- Agent de monitorizare a concurenței.
--
-- Edge Function-ul `competitor-scan` (supabase/functions/competitor-scan) rulează
-- periodic (pg_cron, vezi supabase/cron/competitor_scan.sql), alege ținta cea mai
-- veche nescanată (un concurent sau o zonă urmărită pentru deschideri noi), o
-- cercetează pe web cu Claude și scrie aici:
--   * competitor_snapshots — starea curentă (meniu/prețuri, rating-uri, promoții),
--     memoria agentului: scanarea următoare compară cu ultimul snapshot;
--   * competitor_findings  — doar schimbările/noutățile, ce vede owner-ul în UI;
--   * competitor_scan_runs — jurnal de rulări (status, erori, tokeni consumați).
--
-- Funcția scrie cu service role (ocolește RLS). Din UI, totul e doar pentru owner.

create type competitor_finding_category as enum (
  'price_change',   -- preț modificat la un produs existent
  'menu_change',    -- produse noi / scoase din meniu
  'review',         -- recenzii noi relevante, schimbare de rating
  'promotion',      -- ofertă, reducere, campanie
  'social',         -- postare / anunț pe social media sau site
  'new_opening'     -- locație sau concept nou
);

create type competitor_finding_importance as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------------------
-- competitors — cine e urmărit și unde îl găsește agentul
-- ---------------------------------------------------------------------------
create table competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  website_url text,
  google_maps_url text,
  -- linkuri Glovo / Wolt / Tazz / Bolt Food etc.
  delivery_urls text[] not null default '{}',
  facebook_url text,
  instagram_url text,
  -- context pentru agent: ce produse să urmărească, cu ce ne comparăm etc.
  notes text,
  active boolean not null default true,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- competitor_watch_areas — zone în care agentul caută deschideri noi
-- ---------------------------------------------------------------------------
create table competitor_watch_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- ce caută agentul, ex. "restaurante și fast-food noi în Cluj-Napoca, zona Mărăști"
  search_query text not null,
  active boolean not null default true,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- competitor_snapshots — starea observată la fiecare scanare
-- ---------------------------------------------------------------------------
create table competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors (id) on delete cascade,
  watch_area_id uuid references competitor_watch_areas (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  state jsonb not null,
  summary text,
  check (num_nonnulls(competitor_id, watch_area_id) = 1)
);

create index competitor_snapshots_competitor_idx on competitor_snapshots (competitor_id, scanned_at desc);
create index competitor_snapshots_area_idx on competitor_snapshots (watch_area_id, scanned_at desc);

-- ---------------------------------------------------------------------------
-- competitor_findings — schimbări detectate (feed-ul din UI)
-- ---------------------------------------------------------------------------
create table competitor_findings (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors (id) on delete cascade,
  watch_area_id uuid references competitor_watch_areas (id) on delete cascade,
  snapshot_id uuid references competitor_snapshots (id) on delete set null,
  category competitor_finding_category not null,
  importance competitor_finding_importance not null default 'medium',
  title text not null,
  summary text not null,
  source_url text,
  detected_at timestamptz not null default now(),
  read_at timestamptz,
  check (num_nonnulls(competitor_id, watch_area_id) = 1)
);

create index competitor_findings_detected_idx on competitor_findings (detected_at desc);
create index competitor_findings_unread_idx on competitor_findings (detected_at desc) where read_at is null;

-- ---------------------------------------------------------------------------
-- competitor_scan_runs — jurnal de rulări
-- ---------------------------------------------------------------------------
create table competitor_scan_runs (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references competitors (id) on delete cascade,
  watch_area_id uuid references competitor_watch_areas (id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'ok', 'error')),
  error text,
  findings_count integer,
  input_tokens integer,
  output_tokens integer,
  check (num_nonnulls(competitor_id, watch_area_id) = 1)
);

create index competitor_scan_runs_started_idx on competitor_scan_runs (started_at desc);

-- ---------------------------------------------------------------------------
-- RLS — doar owner-ul
-- ---------------------------------------------------------------------------
alter table competitors enable row level security;
alter table competitor_watch_areas enable row level security;
alter table competitor_snapshots enable row level security;
alter table competitor_findings enable row level security;
alter table competitor_scan_runs enable row level security;

create policy competitors_owner on competitors
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy competitor_watch_areas_owner on competitor_watch_areas
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy competitor_snapshots_select on competitor_snapshots
  for select using (current_staff_role() = 'owner');

create policy competitor_findings_select on competitor_findings
  for select using (current_staff_role() = 'owner');

-- UPDATE doar pentru marcarea ca citit (read_at); restul coloanelor sunt scrise de agent
create policy competitor_findings_update on competitor_findings
  for update using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy competitor_scan_runs_select on competitor_scan_runs
  for select using (current_staff_role() = 'owner');

grant select, insert, update, delete on competitors, competitor_watch_areas to authenticated;
grant select on competitor_snapshots, competitor_findings, competitor_scan_runs to authenticated;
grant update (read_at) on competitor_findings to authenticated;
