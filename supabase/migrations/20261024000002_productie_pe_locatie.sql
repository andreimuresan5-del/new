-- Reparație: producția nu mai e legată de un centru de producție.
--
-- Modelul din iulie 2026 presupunea: marfa intră într-un singur loc, centrul
-- produce sous vide, Drunken Rat și Astur primesc doar semipreparat. În octombrie
-- 2026 realitatea e alta — centrul nu e activ, fiecare locație își cumpără marfa
-- și produce la ea în bucătărie.
--
-- Ce se schimbă aici:
--   1. Șeful de bucătărie al unei locații poate loga producție la locația lui.
--   2. `transfer_semipreparat` primește locația sursă ca parametru, în loc să
--      caute centrul. Fără asta, cu niciun centru marcat, funcția citea stocul
--      locației NULL, găsea 0 și răspundea „stoc insuficient" chiar cu stoc pe masă.
--   3. Transferul rămâne posibil între oricare două locații, dar nu mai e calea
--      obligatorie prin care ajunge stocul la o locație.
--
-- Ce NU se schimbă: `locations.is_production_center` și indexul lui unic parțial
-- rămân. Coloana devine opțională (zero sau un centru), nu obligatorie. Dacă
-- centrul se deschide mai târziu, se marchează din nou și totul funcționează —
-- nu mai e nevoie de altă migrare.
--
-- `finalize_production_portions` înregistra deja mișcarea de stoc la locația
-- logului, nu la centru, deci partea aceea era corectă; i se lărgește doar
-- verificarea de rol.

comment on column locations.is_production_center is
  'Opțional: cel mult o locație poate fi marcată centru de producție (index unic parțial). '
  'Zero centre e o stare validă — fiecare locație produce la ea. Folosit doar ca valoare '
  'implicită în formulare, niciodată ca sursă obligatorie.';

-- ---------------------------------------------------------------------------
-- 1. Producția se loghează la locația unde s-a produs
-- ---------------------------------------------------------------------------
-- Logarea producției e un act de bucătărie, deci se adaugă `head_chef`. Rolul
-- `location_manager` NU primește dreptul: managerul verifică, nu gătește.
-- Clauza de locație rămâne cea de dinainte, deci un șef de bucătărie poate loga
-- numai la locația lui.
drop policy production_logs_insert on production_logs;
create policy production_logs_insert on production_logs
  for insert with check (
    current_staff_role() in ('production_staff', 'kitchen_manager', 'head_chef')
    and (current_staff_location_id() is null or location_id = current_staff_location_id())
  );

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
  -- Verificare fail-closed pe NULL: în plpgsql `NOT IN` cu NULL dă NULL, iar IF
  -- tratează NULL ca fals, deci `if v_role not in (...)` ar sări verificarea.
  if v_role is null or v_role not in ('production_staff', 'kitchen_manager', 'head_chef') then
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

  -- Stocul crește la locația unde s-a produs efectiv.
  insert into stock_movements (recipe_id, location_id, quantity, movement_type, production_log_id, created_by)
  values (v_recipe_id, v_location_id, p_portions, 'productie', p_log_id, auth.uid())
  on conflict (production_log_id) where movement_type = 'productie'
  do update set quantity = excluded.quantity, created_at = now(), created_by = excluded.created_by;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Transferul primește sursa ca parametru
-- ---------------------------------------------------------------------------
-- Semnătura se schimbă (4 → 5 argumente), deci vechea funcție se șterge explicit:
-- altfel ar rămâne alături de cea nouă, ca supraîncărcare, iar un apel cu 4
-- argumente ar continua să caute centrul inexistent.
drop function if exists transfer_semipreparat(uuid, uuid, numeric, text);

create function transfer_semipreparat(
  p_recipe_id uuid,
  p_source_location_id uuid,
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
  v_current_stock numeric;
  v_role staff_role;
  v_staff_location_id uuid;
begin
  v_role := current_staff_role();
  -- Managerul de locație poate muta stoc între locații (act de aprovizionare),
  -- de aceea e inclus aici, deși nu poate loga producție.
  if v_role is null or v_role not in
     ('production_staff', 'kitchen_manager', 'head_chef', 'location_manager') then
    raise exception 'not authorized';
  end if;

  if p_portions <= 0 then
    raise exception 'portions must be positive';
  end if;

  if p_source_location_id is null or p_destination_location_id is null then
    raise exception 'source and destination are required';
  end if;

  if p_source_location_id = p_destination_location_id then
    raise exception 'source and destination must differ';
  end if;

  -- Un rol de locație poate trimite numai din locația lui. Rolurile fără locație
  -- pe profil (centru, conturi care acoperă ambele locații) pot trimite de oriunde.
  v_staff_location_id := current_staff_location_id();
  if v_staff_location_id is not null and p_source_location_id <> v_staff_location_id then
    raise exception 'not authorized to send from this location';
  end if;

  select coalesce(sum(quantity), 0) into v_current_stock
    from stock_movements
    where recipe_id = p_recipe_id and location_id = p_source_location_id;

  if v_current_stock < p_portions then
    raise exception 'insufficient stock: % available, % requested', v_current_stock, p_portions;
  end if;

  insert into stock_movements (recipe_id, location_id, quantity, movement_type, related_location_id, notes, created_by)
  values (p_recipe_id, p_source_location_id, -p_portions, 'transfer_out', p_destination_location_id, p_notes, auth.uid());

  insert into stock_movements (recipe_id, location_id, quantity, movement_type, related_location_id, notes, created_by)
  values (p_recipe_id, p_destination_location_id, p_portions, 'transfer_in', p_source_location_id, p_notes, auth.uid());
end;
$$;

grant execute on function transfer_semipreparat(uuid, uuid, uuid, numeric, text) to authenticated;
