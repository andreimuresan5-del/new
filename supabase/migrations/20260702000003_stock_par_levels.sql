-- Prag țintă (par level) de semipreparat per rețetă/locație — bază pentru decizia de
-- transfer ("cât trimit ca să ajung la nivelul dorit"), nu doar vizibilitate pe stoc curent.

create table stock_par_levels (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id),
  location_id uuid not null references locations (id),
  target_portions numeric not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references staff_profiles (id),
  unique (recipe_id, location_id)
);

alter table stock_par_levels enable row level security;

create policy stock_par_levels_select on stock_par_levels
  for select using (auth.uid() is not null);

create policy stock_par_levels_insert on stock_par_levels
  for insert with check (current_staff_role() in ('kitchen_manager', 'owner'));

create policy stock_par_levels_update on stock_par_levels
  for update using (current_staff_role() in ('kitchen_manager', 'owner'))
  with check (current_staff_role() in ('kitchen_manager', 'owner'));

grant select on stock_par_levels to authenticated;
grant insert, update on stock_par_levels to authenticated;
