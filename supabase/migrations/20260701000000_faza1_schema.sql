-- Faza 1: locații, staff, rețete + versionare, producție, HACCP
-- Notă: tabelul `users` din spec devine `staff_profiles` (referă auth.users)
-- ca să evităm coliziunea cu schema internă `auth` a Supabase.

create extension if not exists pgcrypto;

create type staff_role as enum ('production_staff', 'kitchen_manager', 'owner');

-- ---------------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------------
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text
);

-- ---------------------------------------------------------------------------
-- staff_profiles
-- ---------------------------------------------------------------------------
create table staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role staff_role not null,
  location_id uuid references locations (id),
  -- PIN-ul e și parola contului auth.users asociat (vezi RPC de login mai jos) — tradeoff
  -- acceptat pentru Faza 1: aplicație internă, rețea locală, fără expunere publică.
  pin_code text not null unique check (pin_code ~ '^[0-9]{6}$'),
  auth_email text not null unique,
  created_at timestamptz not null default now()
);

create index staff_profiles_location_id_idx on staff_profiles (location_id);

-- Helper-e folosite în politicile RLS de mai jos. SECURITY DEFINER ca să nu
-- intre în recursie cu RLS-ul propriei tabele staff_profiles.
create function current_staff_role()
returns staff_role
language sql
stable
security definer
set search_path = public
as $$
  select role from staff_profiles where id = auth.uid();
$$;

create function current_staff_location_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select location_id from staff_profiles where id = auth.uid();
$$;

-- Login cu PIN: clientul (neautentificat) trimite PIN-ul, primește email-ul
-- sintetic asociat, apoi face signInWithPassword(email, pin). Nu expune nimic
-- în plus față de ce userul a introdus deja.
create function get_login_email_by_pin(pin text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select auth_email from staff_profiles where pin_code = pin;
$$;

revoke all on function get_login_email_by_pin(text) from public;
grant execute on function get_login_email_by_pin(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- ingredients
-- ---------------------------------------------------------------------------
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null,
  current_cost_per_unit numeric
);

-- ---------------------------------------------------------------------------
-- recipes / recipe_versions (append-only, versionat pentru audit HACCP)
-- ---------------------------------------------------------------------------
create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  current_version_id uuid,
  created_at timestamptz not null default now()
);

create table recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  version_number integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references staff_profiles (id),
  sous_vide_temp_c numeric,
  sous_vide_time_min integer,
  cooling_protocol text,
  finishing_time_cold text,
  finishing_time_hot text,
  notes text,
  unique (recipe_id, version_number)
);

create index recipe_versions_recipe_id_idx on recipe_versions (recipe_id);

alter table recipes
  add constraint recipes_current_version_id_fkey
  foreign key (current_version_id) references recipe_versions (id);

-- version_number se calculează automat, formularul din UI nu-l gestionează
create function set_recipe_version_number()
returns trigger
language plpgsql
as $$
begin
  if new.version_number is null then
    select coalesce(max(version_number), 0) + 1
      into new.version_number
      from recipe_versions
      where recipe_id = new.recipe_id;
  end if;
  return new;
end;
$$;

create trigger recipe_versions_set_version_number
  before insert on recipe_versions
  for each row
  execute function set_recipe_version_number();

create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references recipe_versions (id) on delete cascade,
  ingredient_id uuid not null references ingredients (id),
  quantity numeric not null,
  unit text not null
);

create index recipe_ingredients_recipe_version_id_idx on recipe_ingredients (recipe_version_id);

-- ---------------------------------------------------------------------------
-- production_logs / haccp_logs
-- ---------------------------------------------------------------------------
create table production_logs (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references recipe_versions (id),
  location_id uuid not null references locations (id),
  user_id uuid not null references staff_profiles (id) default auth.uid(),
  started_at timestamptz,
  finished_at timestamptz,
  batch_size numeric,
  actual_temp_c numeric,
  actual_time_min integer,
  created_at timestamptz not null default now()
);

create index production_logs_location_id_idx on production_logs (location_id);
create index production_logs_recipe_version_id_idx on production_logs (recipe_version_id);

create table haccp_logs (
  id uuid primary key default gen_random_uuid(),
  production_log_id uuid not null references production_logs (id) on delete cascade,
  checkpoint_name text not null,
  temp_c numeric,
  "timestamp" timestamptz not null default now(),
  user_id uuid references staff_profiles (id) default auth.uid()
);

create index haccp_logs_production_log_id_idx on haccp_logs (production_log_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table locations enable row level security;
alter table staff_profiles enable row level security;
alter table ingredients enable row level security;
alter table recipes enable row level security;
alter table recipe_versions enable row level security;
alter table recipe_ingredients enable row level security;
alter table production_logs enable row level security;
alter table haccp_logs enable row level security;

-- locations: citire pentru orice user autentificat, fără scriere din UI
create policy locations_select on locations
  for select using (auth.uid() is not null);

-- staff_profiles: fiecare vede propriul rând; manageri/owner văd tot.
-- Fără INSERT/UPDATE din UI (provisioning se face din Supabase Studio, vezi README).
create policy staff_profiles_select_self on staff_profiles
  for select using (id = auth.uid());

create policy staff_profiles_select_managers on staff_profiles
  for select using (current_staff_role() in ('kitchen_manager', 'owner'));

-- ingredients: citire pentru toți, scriere pentru manageri/owner
create policy ingredients_select on ingredients
  for select using (auth.uid() is not null);

create policy ingredients_insert on ingredients
  for insert with check (current_staff_role() in ('kitchen_manager', 'owner'));

create policy ingredients_update on ingredients
  for update using (current_staff_role() in ('kitchen_manager', 'owner'))
  with check (current_staff_role() in ('kitchen_manager', 'owner'));

-- recipes: citire pentru toți, scriere pentru manageri/owner
-- (UPDATE e necesar doar pentru a seta current_version_id după insert versiune nouă)
create policy recipes_select on recipes
  for select using (auth.uid() is not null);

create policy recipes_insert on recipes
  for insert with check (current_staff_role() in ('kitchen_manager', 'owner'));

create policy recipes_update on recipes
  for update using (current_staff_role() in ('kitchen_manager', 'owner'))
  with check (current_staff_role() in ('kitchen_manager', 'owner'));

-- recipe_versions: append-only — fără UPDATE/DELETE pentru nimeni (audit HACCP)
create policy recipe_versions_select on recipe_versions
  for select using (auth.uid() is not null);

create policy recipe_versions_insert on recipe_versions
  for insert with check (current_staff_role() in ('kitchen_manager', 'owner'));

-- recipe_ingredients: append-only, urmează același principiu ca recipe_versions
create policy recipe_ingredients_select on recipe_ingredients
  for select using (auth.uid() is not null);

create policy recipe_ingredients_insert on recipe_ingredients
  for insert with check (current_staff_role() in ('kitchen_manager', 'owner'));

-- production_logs: staff/manager doar pe locația proprie (sau ambele, dacă
-- location_id e null pe profil — staff care lucrează pe ambele locații); owner vede tot, nu inserează
create policy production_logs_select on production_logs
  for select using (
    current_staff_role() = 'owner'
    or current_staff_location_id() is null
    or location_id = current_staff_location_id()
  );

create policy production_logs_insert on production_logs
  for insert with check (
    current_staff_role() in ('production_staff', 'kitchen_manager')
    and (current_staff_location_id() is null or location_id = current_staff_location_id())
  );

-- haccp_logs: legat de production_logs prin location_id (aceeași regulă pt. location_id null)
create policy haccp_logs_select on haccp_logs
  for select using (
    current_staff_role() = 'owner'
    or current_staff_location_id() is null
    or exists (
      select 1 from production_logs pl
      where pl.id = haccp_logs.production_log_id
        and pl.location_id = current_staff_location_id()
    )
  );

create policy haccp_logs_insert on haccp_logs
  for insert with check (
    current_staff_role() in ('production_staff', 'kitchen_manager')
    and (
      current_staff_location_id() is null
      or exists (
        select 1 from production_logs pl
        where pl.id = haccp_logs.production_log_id
          and pl.location_id = current_staff_location_id()
      )
    )
  );
