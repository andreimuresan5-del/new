-- Meniul zilei → story Instagram/Facebook generat în aplicație.
--   * daily_menus — meniul fiecărei zile (agentul îl folosește și la plan/chat);
--   * marketing_brands.logo_url + bucket public `brand-assets` pentru logo și poze.

alter table marketing_brands add column logo_url text;

create table daily_menus (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references marketing_brands (id) on delete cascade,
  menu_date date not null,
  items text not null,       -- un fel pe linie
  price text,                -- ex. „35 lei”
  headline text,             -- titlul de pe story (ales din propunerile agentului sau scris)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, menu_date)
);

alter table daily_menus enable row level security;

create policy daily_menus_team on daily_menus
  for all using (current_staff_role() in ('owner', 'marketing'))
  with check (current_staff_role() in ('owner', 'marketing'));

grant select, insert, update, delete on daily_menus to authenticated;

alter table marketing_runs drop constraint marketing_runs_task_check;
alter table marketing_runs add constraint marketing_runs_task_check check (task in (
  'weekly_plan', 'review_reply', 'menu_text', 'event_packages', 'event_message', 'monthly_report', 'chat', 'story_headline'
));

-- Logo-ul și pozele de story sunt publice (apar oricum pe Instagram); doar echipa le încarcă.
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy brand_assets_team_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'brand-assets' and current_staff_role() in ('owner', 'marketing'));

create policy brand_assets_team_update on storage.objects
  for update to authenticated
  using (bucket_id = 'brand-assets' and current_staff_role() in ('owner', 'marketing'));

create policy brand_assets_team_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'brand-assets' and current_staff_role() in ('owner', 'marketing'));
