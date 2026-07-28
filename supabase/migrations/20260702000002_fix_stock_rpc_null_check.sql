-- Fix: `IF role NOT IN (...) THEN RAISE` nu respinge corect când current_staff_role()
-- e NULL (NOT IN cu NULL => NULL, iar IF tratează NULL ca fals — verificarea era sărită
-- silențios în loc să blocheze). Corect: fail-closed explicit pe NULL.

create or replace function finalize_production_portions(p_log_id uuid, p_portions integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_location_id uuid;
  v_recipe_id uuid;
  v_role staff_role;
  v_staff_location_id uuid;
begin
  v_role := current_staff_role();
  if v_role is null or v_role not in ('production_staff', 'kitchen_manager') then
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

  v_staff_location_id := current_staff_location_id();
  if v_staff_location_id is not null and v_location_id <> v_staff_location_id then
    raise exception 'not authorized for this location';
  end if;

  update production_logs set portions_produced = p_portions where id = p_log_id;

  insert into stock_movements (recipe_id, location_id, quantity, movement_type, production_log_id, created_by)
  values (v_recipe_id, v_location_id, p_portions, 'productie', p_log_id, auth.uid())
  on conflict (production_log_id) where movement_type = 'productie'
  do update set quantity = excluded.quantity, created_at = now(), created_by = excluded.created_by;
end;
$$;

create or replace function transfer_semipreparat(
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
  v_role staff_role;
begin
  v_role := current_staff_role();
  if v_role is null or v_role not in ('production_staff', 'kitchen_manager') then
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
