-- Faza 2: stoc de semipreparat (produs sous vide finit), în porții — nu materie primă.
-- Drunken Rat/Astur nu mai țin materie primă, doar semipreparat primit de la centru.
--
-- Model: ledger append-only (stock_movements), nivelul curent = SUM(quantity) per
-- rețetă+locație (view stock_levels), nu o coloană materializată — evită desincronizări.
-- Singurele căi de scriere sunt cele două funcții SECURITY DEFINER de mai jos; nu există
-- GRANT de INSERT direct pe tabelă.

create type stock_movement_type as enum ('productie', 'transfer_out', 'transfer_in');

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id),
  location_id uuid not null references locations (id),
  quantity numeric not null,
  movement_type stock_movement_type not null,
  related_location_id uuid references locations (id),
  production_log_id uuid references production_logs (id),
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references staff_profiles (id)
);

-- Cel mult o mișcare de tip "productie" per log de producție — refacerea numărului de
-- porții (portions_produced e editabil) actualizează mișcarea existentă, nu duplică.
create unique index stock_movements_one_production_per_log
  on stock_movements (production_log_id)
  where movement_type = 'productie';

create index stock_movements_recipe_location_idx on stock_movements (recipe_id, location_id);

create view stock_levels as
  select recipe_id, location_id, sum(quantity) as portions_on_hand
  from stock_movements
  group by recipe_id, location_id;

alter table stock_movements enable row level security;

-- Doar SELECT direct — orice scriere trece prin funcțiile de mai jos, ca ledger-ul să
-- rămână corect (verificare stoc suficient la transfer, o singură mișcare per log).
create policy stock_movements_select on stock_movements
  for select using (auth.uid() is not null);

-- Înlocuiește update-ul direct pe production_logs.portions_produced: actualizează
-- porțiile ȘI înregistrează mișcarea de stoc la centrul de producție, atomic.
create function finalize_production_portions(p_log_id uuid, p_portions integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_location_id uuid;
  v_recipe_id uuid;
begin
  if current_staff_role() not in ('production_staff', 'kitchen_manager') then
    raise exception 'not authorized';
  end if;

  select pl.location_id, rv.recipe_id
    into v_location_id, v_recipe_id
    from production_logs pl
    join recipe_versions rv on rv.id = pl.recipe_version_id
    where pl.id = p_log_id;

  if v_location_id is null then
    raise exception 'production log not found';
  end if;

  if current_staff_location_id() is not null and v_location_id <> current_staff_location_id() then
    raise exception 'not authorized for this location';
  end if;

  update production_logs set portions_produced = p_portions where id = p_log_id;

  insert into stock_movements (recipe_id, location_id, quantity, movement_type, production_log_id, created_by)
  values (v_recipe_id, v_location_id, p_portions, 'productie', p_log_id, auth.uid())
  on conflict (production_log_id) where movement_type = 'productie'
  do update set quantity = excluded.quantity, created_at = now(), created_by = excluded.created_by;
end;
$$;

-- Transfer semipreparat de la centrul de producție către o locație — verifică stocul
-- disponibil și creează ambele laturi ale mișcării (ieșire + intrare) atomic.
create function transfer_semipreparat(
  p_recipe_id uuid,
  p_destination_location_id uuid,
  p_portions numeric,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_center_id uuid;
  v_current_stock numeric;
begin
  if current_staff_role() not in ('production_staff', 'kitchen_manager') then
    raise exception 'not authorized';
  end if;

  if p_portions <= 0 then
    raise exception 'portions must be positive';
  end if;

  select id into v_center_id from locations where is_production_center;

  select coalesce(sum(quantity), 0) into v_current_stock
    from stock_movements
    where recipe_id = p_recipe_id and location_id = v_center_id;

  if v_current_stock < p_portions then
    raise exception 'insufficient stock: % available, % requested', v_current_stock, p_portions;
  end if;

  insert into stock_movements (recipe_id, location_id, quantity, movement_type, related_location_id, notes, created_by)
  values (p_recipe_id, v_center_id, -p_portions, 'transfer_out', p_destination_location_id, p_notes, auth.uid());

  insert into stock_movements (recipe_id, location_id, quantity, movement_type, related_location_id, notes, created_by)
  values (p_recipe_id, p_destination_location_id, p_portions, 'transfer_in', v_center_id, p_notes, auth.uid());
end;
$$;

grant select on stock_movements, stock_levels to authenticated;

revoke all on function finalize_production_portions(uuid, integer) from public;
revoke all on function transfer_semipreparat(uuid, uuid, numeric, text) from public;
grant execute on function finalize_production_portions(uuid, integer) to authenticated;
grant execute on function transfer_semipreparat(uuid, uuid, numeric, text) to authenticated;
