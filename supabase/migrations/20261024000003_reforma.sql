-- Reforma, pasul 7 (prima parte): lista de probleme și deciziile, mutate din
-- pagina „Panou Drunken & Astur" de pe claude.ai în aplicație.
--
-- Acolo datele trăiau în baza de date a paginii, deci rămâneau la Claude și nu
-- s-ar fi mutat niciodată pe serverul firmei. Aici intră lângă rețete, producție
-- și stoc: aceeași logare, aceleași roluri, același telefon.
--
-- ACCES: numai `owner` (Andrei și Alex). Nici rolurile de locație nu văd lista,
-- nici pentru locația lor — conține salariile lor, banii ieșiți fără documente,
-- cash-ul peste plafon și motivul pentru care un șef ar putea fi înlocuit. Regula
-- stă în baza de date, nu doar în ecrane, exact ca la vizibilitatea pe locații.
--
-- Migrarea e numai structură: nicio problemă reală, nicio cifră. Datele intră
-- separat, din fișierul de import ținut în afara repository-ului.

-- ---------------------------------------------------------------------------
-- Cine răspunde de o problemă
-- ---------------------------------------------------------------------------
-- Responsabilitatea exista înainte de conturi: Alex e responsabil pe 16 din 19
-- probleme, dar nu are încă cont în aplicație (crearea conturilor e pasul 2).
-- De aceea administratorul e o înregistrare proprie, legată opțional de un cont:
-- când contul lui Alex există, se completează `staff_profile_id` și legătura e
-- gata — fără să pierdem acum informația.
create table reform_administrators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  staff_profile_id uuid unique references staff_profiles (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Problemele
-- ---------------------------------------------------------------------------
create type reform_status as enum ('nou', 'lucru', 'blocat', 'gata');

create table reform_issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status reform_status not null default 'nou',
  -- NULL = problemă de grup, nu a unei locații anume (14 din 19 sunt așa).
  location_id uuid references locations (id),
  area text,
  -- Valoarea estimată pe an, în lei. NULL = problemă reală, dar necuantificată.
  value_per_year numeric check (value_per_year is null or value_per_year >= 0),
  due_date date,
  next_step text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references staff_profiles (id)
);

create index reform_issues_status_idx on reform_issues (status);
create index reform_issues_location_idx on reform_issues (location_id);

create table reform_issue_owners (
  issue_id uuid not null references reform_issues (id) on delete cascade,
  administrator_id uuid not null references reform_administrators (id) on delete cascade,
  primary key (issue_id, administrator_id)
);

create index reform_issue_owners_admin_idx on reform_issue_owners (administrator_id);

-- ---------------------------------------------------------------------------
-- Deciziile
-- ---------------------------------------------------------------------------
create type reform_decision_state as enum ('propus', 'decis');

create table reform_decisions (
  id uuid primary key default gen_random_uuid(),
  statement text not null,
  state reform_decision_state not null default 'propus',
  decided_on date,
  location_id uuid references locations (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references staff_profiles (id)
);

-- ---------------------------------------------------------------------------
-- Cine a modificat ultima dată — Panoul nu reținea asta, iar voi doi lucrați
-- separat pe aceeași listă. Se completează din trigger, ca să nu depindă de
-- ce trimite clientul.
-- ---------------------------------------------------------------------------
create function reform_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger reform_issues_touch
  before insert or update on reform_issues
  for each row execute function reform_touch();

create trigger reform_decisions_touch
  before insert or update on reform_decisions
  for each row execute function reform_touch();

-- ---------------------------------------------------------------------------
-- Acces: numai administratorii
-- ---------------------------------------------------------------------------
alter table reform_administrators enable row level security;
alter table reform_issues enable row level security;
alter table reform_issue_owners enable row level security;
alter table reform_decisions enable row level security;

-- `for all` acoperă select, insert, update și delete cu aceeași condiție.
create policy reform_administrators_owner on reform_administrators
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy reform_issues_owner on reform_issues
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy reform_issue_owners_owner on reform_issue_owners
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

create policy reform_decisions_owner on reform_decisions
  for all using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

-- GRANT-ul deschide tabela pentru rolul `authenticated`; politicile de mai sus
-- sunt cele care lasă efectiv doar owner-ul să citească sau să scrie.
grant select, insert, update, delete on
  reform_administrators, reform_issues, reform_issue_owners, reform_decisions
  to authenticated;
