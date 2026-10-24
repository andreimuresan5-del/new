-- Reforma, pasul 1: vizibilitate pe locație.
--
-- Principiu: rolurile existente (owner, kitchen_manager, production_staff, marketing)
-- își păstrează EXACT accesul de până acum. Doar rolurile noi de locație
-- (location_manager, head_chef, shift_lead) sunt restrânse la locația lor.

-- ---------------------------------------------------------------------------
-- Helper
-- ---------------------------------------------------------------------------
create function is_location_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_staff_role() in ('location_manager', 'head_chef', 'shift_lead'), false);
$$;

grant execute on function is_location_role() to authenticated;

-- ---------------------------------------------------------------------------
-- staff_profiles: un rol de locație are obligatoriu o locație.
-- Fără locație, politicile existente (ex. production_logs) ar trata contul ca
-- „vede tot” — exact ce nu vrem pentru un manager sau un șef de tură.
-- ---------------------------------------------------------------------------
alter table staff_profiles
  add constraint staff_profiles_location_role_needs_location
  check (role not in ('location_manager', 'head_chef', 'shift_lead') or location_id is not null);

-- Managerul de locație își vede echipa (doar locația lui).
create policy staff_profiles_select_location_team on staff_profiles
  for select using (
    current_staff_role() = 'location_manager'
    and location_id = current_staff_location_id()
  );

-- Owner-ii (administratorii) pot schimba numele, rolul și locația unui cont.
-- PIN-ul și emailul rămân în afara acestui drept (GRANT pe coloane).
create policy staff_profiles_update_owner on staff_profiles
  for update using (current_staff_role() = 'owner')
  with check (current_staff_role() = 'owner');

grant update (name, role, location_id) on staff_profiles to authenticated;

-- Nu lăsăm firma fără niciun owner (de ex. un owner care își schimbă singur rolul).
create function staff_profiles_keep_one_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'owner' and new.role <> 'owner'
     and (select count(*) from staff_profiles where role = 'owner' and id <> old.id) = 0 then
    raise exception 'Trebuie să rămână cel puțin un administrator (owner).';
  end if;
  return new;
end;
$$;

create trigger staff_profiles_keep_one_owner
  before update of role on staff_profiles
  for each row execute function staff_profiles_keep_one_owner();

-- ---------------------------------------------------------------------------
-- Stoc de semipreparat: rolurile de locație văd doar stocul locației lor.
-- Pentru celelalte roluri condiția e identică cu cea de până acum.
-- ---------------------------------------------------------------------------
drop policy stock_movements_select on stock_movements;
create policy stock_movements_select on stock_movements
  for select using (
    auth.uid() is not null
    and (not is_location_role() or location_id = current_staff_location_id())
  );

drop policy stock_par_levels_select on stock_par_levels;
create policy stock_par_levels_select on stock_par_levels
  for select using (
    auth.uid() is not null
    and (not is_location_role() or location_id = current_staff_location_id())
  );

-- View-ul stock_levels rula până acum cu drepturile proprietarului lui, deci
-- ocolea RLS-ul de pe stock_movements. Cu security_invoker aplică regulile
-- celui care citește. Pentru rolurile existente rezultatul nu se schimbă
-- (ele văd oricum toate mișcările), pentru rolurile de locație se filtrează.
alter view stock_levels set (security_invoker = true);
