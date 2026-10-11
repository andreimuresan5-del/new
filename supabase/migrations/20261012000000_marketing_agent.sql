-- Agent de marketing (pornit pentru Astur, gândit per brand).
--
-- Edge Function-ul `marketing-agent` (supabase/functions/marketing-agent) pregătește
-- materiale pe care owner-ul le citește, le editează și le aprobă în aplicație —
-- agentul nu publică nimic singur:
--   * plan săptămânal: postări Facebook/Instagram + oferte propuse (cron, luni dimineața);
--   * răspunsuri la recenzii (la cerere, recenzia e lipită de owner);
--   * texte de meniu pentru livrare/site (la cerere).

create type marketing_item_kind as enum ('post', 'promo', 'review_reply', 'menu_text');
create type marketing_item_status as enum ('draft', 'approved', 'rejected', 'published');

-- ---------------------------------------------------------------------------
-- marketing_brands — profilul pe care îl primește agentul ca context
-- ---------------------------------------------------------------------------
create table marketing_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location_id uuid references locations (id),
  -- ce fel de local e, concept, atmosferă
  description text,
  -- cine sunt clienții
  audience text,
  -- cum vorbim: prietenos, premium, cu umor etc.
  tone text,
  -- ce ne diferențiază de concurență
  differentiators text,
  address text,
  opening_hours text,
  website_url text,
  facebook_url text,
  instagram_url text,
  -- meniul cu prețuri, lipit ca text liber
  menu_text text,
  -- orice altceva: evenimente recurente, ce să evite agentul etc.
  extra_notes text,
  weekly_plan_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- marketing_items — tot ce produce agentul, cu statusul aprobării
-- ---------------------------------------------------------------------------
create table marketing_items (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references marketing_brands (id) on delete cascade,
  kind marketing_item_kind not null,
  status marketing_item_status not null default 'draft',
  title text not null,
  body text not null,
  -- facebook / instagram / google / wolt / glovo / site / in_local
  channel text,
  suggested_date date,
  suggested_time text,
  image_idea text,
  -- de ce propune agentul asta (ofertele mai ales)
  rationale text,
  -- ce a primit agentul: textul recenziei, produsul descris
  input text,
  -- toate materialele dintr-un plan săptămânal au același batch
  batch_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index marketing_items_brand_created_idx on marketing_items (brand_id, created_at desc);
create index marketing_items_batch_idx on marketing_items (batch_id);

-- ---------------------------------------------------------------------------
-- marketing_runs — jurnal de rulări (status, erori, tokeni)
-- ---------------------------------------------------------------------------
create table marketing_runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references marketing_brands (id) on delete cascade,
  task text not null check (task in ('weekly_plan', 'review_reply', 'menu_text')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'ok', 'error')),
  error text,
  items_count integer,
  input_tokens integer,
  output_tokens integer
);

create index marketing_runs_brand_started_idx on marketing_runs (brand_id, started_at desc);

-- ---------------------------------------------------------------------------
-- RLS — doar owner-ul
-- ---------------------------------------------------------------------------
alter table marketing_brands enable row level security;
alter table marketing_items enable row level security;
alter table marketing_runs enable row level security;

create policy marketing_brands_owner on marketing_brands
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy marketing_items_owner on marketing_items
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy marketing_runs_select on marketing_runs
  for select using (current_staff_role() = 'owner');

grant select, insert, update, delete on marketing_brands, marketing_items to authenticated;
grant select on marketing_runs to authenticated;
