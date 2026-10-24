\set ON_ERROR_STOP on
\pset pager off
-- Ce vede și ce poate scrie fiecare rol. Se rulează după `conturi_proba_roluri.sql`,
-- pe Supabase local. Fiecare cont e simulat cu rolul `authenticated` și `sub`-ul lui
-- în JWT, deci se aplică exact politicile RLS din aplicație.
--
-- Scrierile din teste sunt anulate imediat (vezi `incearca`), deci rularea nu
-- modifică datele. Capcana din README: cu RLS, un update pe rânduri invizibile
-- nu dă eroare, atinge zero rânduri — de aceea se numără rândurile.

begin;

create temporary table rez_vede (
  ordine int, cont text, rol text, echipa text, productie text, haccp text,
  stoc_miscari text, stoc_tinta text, stoc_niveluri text, reforma text, concurenti text
);
create temporary table rez_scrie (ordine int, cont text, test text, rezultat text);
grant insert, select on rez_vede, rez_scrie to authenticated;

-- Eticheta scurtă a locațiilor dintr-un set de rânduri: „DR, Astur, CP” sau „—”.
create function pg_temp.loc(ids uuid[]) returns text language sql stable as $$
  select coalesce(nullif(string_agg(distinct
    case l.name when 'Drunken Rat' then 'DR' when 'Astur' then 'Astur' else 'CP' end, ', '), ''), '—')
  from locations l where l.id = any(ids);
$$;

-- Rulează o comandă și spune dacă a trecut (și câte rânduri a atins) sau a fost
-- respinsă. Orice scriere reușită e anulată prin excepția de la final.
create function pg_temp.incearca(p_sql text) returns text language plpgsql as $$
declare n int;
begin
  begin
    execute p_sql;
    get diagnostics n = row_count;
    raise exception '__ok__%', n;
  exception when others then
    if sqlerrm like '__ok__%' then
      return 'trece, ' || substr(sqlerrm, 7) || ' rânduri';
    end if;
    return 'respins';
  end;
end;
$$;

do $$
declare
  c record;
  i int := 0;
  dr constant uuid := '11111111-1111-1111-1111-111111111111';
  astur constant uuid := '22222222-2222-2222-2222-222222222222';
  versiune constant text := 'bbbbbbbb-0000-4000-8000-000000000002';
  reteta constant text := 'bbbbbbbb-0000-4000-8000-000000000001';
  alt_cont constant text := 'aaaaaaaa-0000-4000-8000-000000000005'; -- Șef tură DR
begin
  for c in
    select s.id, s.name, s.role::text as rol, s.location_id
    from staff_profiles s
    order by array_position(array['owner','location_manager','head_chef','shift_lead',
                                  'kitchen_manager','production_staff','marketing'], s.role::text), s.name
  loop
    i := i + 1;
    perform set_config('request.jwt.claims',
      json_build_object('sub', c.id, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);

    insert into rez_vede select i, c.name, c.rol,
      (select count(*) || ' (' || pg_temp.loc(array_agg(location_id)) || ')' from staff_profiles),
      (select pg_temp.loc(array_agg(location_id)) from production_logs),
      (select count(*)::text from haccp_logs),
      (select pg_temp.loc(array_agg(location_id)) from stock_movements),
      (select pg_temp.loc(array_agg(location_id)) from stock_par_levels),
      (select pg_temp.loc(array_agg(location_id)) from stock_levels),
      (select count(*) from reform_issues) || ' probl. / ' || (select count(*) from reform_decisions) || ' dec.',
      (select count(*)::text from competitors);

    -- Scrieri: producție la locația proprie și la cealaltă.
    insert into rez_scrie values (i, c.name, 'producție la DR', pg_temp.incearca(format(
      'insert into production_logs (recipe_version_id, location_id) values (%L, %L)', versiune, dr)));
    insert into rez_scrie values (i, c.name, 'producție la Astur', pg_temp.incearca(format(
      'insert into production_logs (recipe_version_id, location_id) values (%L, %L)', versiune, astur)));
    -- Stoc țintă la Astur.
    insert into rez_scrie values (i, c.name, 'stoc țintă Astur', pg_temp.incearca(format(
      'update stock_par_levels set target_portions = 99 where recipe_id = %L and location_id = %L', reteta, astur)));
    -- Schimbarea rolului: pe al lui (spre owner) și pe al altui cont.
    insert into rez_scrie values (i, c.name, 'se face owner', pg_temp.incearca(format(
      'update staff_profiles set role = ''owner'' where id = %L', c.id)));
    insert into rez_scrie values (i, c.name, 'schimbă rolul Șef tură DR', pg_temp.incearca(format(
      'update staff_profiles set role = ''head_chef'' where id = %L', alt_cont)));
    -- PIN-urile (sunt parolele conturilor): nimeni nu trebuie să le poată citi.
    insert into rez_scrie values (i, c.name, 'citește PIN-uri', pg_temp.incearca(
      'select pin_code from staff_profiles'));
    -- Lista Reforma.
    insert into rez_scrie values (i, c.name, 'modifică Reforma', pg_temp.incearca(
      'update reform_issues set status = ''gata'''));

    perform set_config('role', 'postgres', true);
  end loop;
end;
$$;

\echo ''
\echo '=== CE VEDE fiecare cont (locații: DR, Astur, CP = centrul de producție) ==='
select cont, rol, echipa, productie, haccp, stoc_miscari, stoc_tinta, stoc_niveluri, reforma, concurenti
from rez_vede order by ordine;

\echo ''
\echo '=== CE POATE SCRIE fiecare cont (scrierile reușite sunt anulate) ==='
\echo '    „citește PIN-uri”: trebuie „respins” la toți (20261024000004_ascunde_pin_code.sql)'
select cont,
  max(rezultat) filter (where test = 'producție la DR')           as "producție DR",
  max(rezultat) filter (where test = 'producție la Astur')        as "producție Astur",
  max(rezultat) filter (where test = 'stoc țintă Astur')          as "stoc țintă Astur",
  max(rezultat) filter (where test = 'se face owner')             as "se face owner",
  max(rezultat) filter (where test = 'schimbă rolul Șef tură DR') as "rol Șef tură DR",
  max(rezultat) filter (where test = 'modifică Reforma')          as "Reforma",
  max(rezultat) filter (where test = 'citește PIN-uri')           as "citește PIN-uri"
from rez_scrie group by ordine, cont order by ordine;

rollback;
