-- (1) Evenimente private / petreceri de firmă și (3) bucla de rezultate.

-- ---------------------------------------------------------------------------
-- Rezultate: ce a adus fiecare material publicat. Le trece echipa manual;
-- agentul le primește la planul săptămânal și la raportul lunar.
-- ---------------------------------------------------------------------------
alter table marketing_items
  add column published_at timestamptz,
  add column result_reach integer,        -- câți oameni au văzut
  add column result_engagement integer,   -- aprecieri + comentarii + distribuiri
  add column result_orders integer,       -- comenzi / rezervări aduse (estimat)
  add column result_note text;

-- Ce știe agentul despre evenimente: capacitate interior/terasă, ce oferim, restricții.
alter table marketing_brands add column event_info text;

-- ---------------------------------------------------------------------------
-- event_packages — pachetele de eveniment (propuse de agent, ajustate de echipă)
-- ---------------------------------------------------------------------------
create table event_packages (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references marketing_brands (id) on delete cascade,
  name text not null,
  description text not null,     -- meniu + ce include
  price_per_person numeric,
  min_guests integer,
  max_guests integer,
  season text,                   -- iarna / vara / tot anul
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type event_lead_status as enum ('new', 'offer_sent', 'negotiating', 'confirmed', 'lost');

-- ---------------------------------------------------------------------------
-- event_leads — cereri de eveniment și drumul lor până la rezervare
-- ---------------------------------------------------------------------------
create table event_leads (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references marketing_brands (id) on delete cascade,
  name text not null,            -- firma sau persoana
  contact_person text,
  phone text,
  email text,
  source text,                   -- telefon / facebook / email / recomandare / prospectare
  event_type text,               -- ex. petrecere de Crăciun, aniversare, botez
  event_date date,
  guests integer,
  budget text,
  package_id uuid references event_packages (id) on delete set null,
  status event_lead_status not null default 'new',
  lost_reason text,
  notes text,
  next_followup_date date,
  -- ultima ofertă / ultimul mesaj scris de agent (editabil)
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index event_leads_brand_status_idx on event_leads (brand_id, status);
create index event_leads_followup_idx on event_leads (next_followup_date) where status in ('new', 'offer_sent', 'negotiating');

alter table marketing_runs drop constraint marketing_runs_task_check;
alter table marketing_runs add constraint marketing_runs_task_check check (task in (
  'weekly_plan', 'review_reply', 'menu_text', 'event_packages', 'event_message', 'monthly_report'
));

alter table event_packages enable row level security;
alter table event_leads enable row level security;

create policy event_packages_team on event_packages
  for all using (current_staff_role() in ('owner', 'marketing'))
  with check (current_staff_role() in ('owner', 'marketing'));

create policy event_leads_team on event_leads
  for all using (current_staff_role() in ('owner', 'marketing'))
  with check (current_staff_role() in ('owner', 'marketing'));

grant select, insert, update, delete on event_packages, event_leads to authenticated;
