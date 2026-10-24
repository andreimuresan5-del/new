\pset pager off
-- Reforma: cine vede și cine poate schimba lista.
--
-- Rulează-l DUPĂ importul datelor (supabase/import/reforma.sql), pe o bază de
-- probă. Vezi README.md din acest folder pentru cum se pornește baza.
--
-- Atenție la o capcană de testare: cu RLS, un UPDATE sau DELETE pe rânduri care
-- nu-i sunt vizibile utilizatorului NU dă eroare — atinge pur și simplu zero
-- rânduri. Deci testul corect numără rândurile afectate, nu așteaptă o excepție.
-- (Prima versiune a acestui test aștepta o excepție și raporta greșit „gaură".)

do $$
declare
  v_owner   uuid := (select id from staff_profiles where role = 'owner' order by created_at limit 1);
  v_manager uuid := (select id from staff_profiles where role = 'location_manager' order by created_at limit 1);
  v_issues  integer;
  v_total   integer;
  v_count   integer;
  v_rows    integer;
begin
  if v_owner is null or v_manager is null then
    raise exception 'Testul are nevoie de un cont owner și un cont location_manager.';
  end if;

  select count(*) into v_total from reform_issues;
  if v_total = 0 then
    raise exception 'Nu e nicio problemă în listă — rulează întâi importul.';
  end if;

  -- --- Administratorul vede tot și poate scrie ---
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  set local role authenticated;

  select count(*) into v_issues from reform_issues;
  if v_issues <> v_total then
    raise exception 'Administratorul ar trebui să vadă toate cele % probleme, vede %', v_total, v_issues;
  end if;

  insert into reform_issues (title) values ('__test owner scrie__');
  delete from reform_issues where title = '__test owner scrie__';

  -- --- Managerul de locație nu vede nimic ---
  perform set_config('request.jwt.claim.sub', v_manager::text, true);

  select count(*) into v_count from reform_issues;
  if v_count <> 0 then
    raise exception 'Managerul nu trebuie să vadă nicio problemă, vede %', v_count;
  end if;

  select count(*) into v_count from reform_decisions;
  if v_count <> 0 then
    raise exception 'Managerul nu trebuie să vadă nicio decizie, vede %', v_count;
  end if;

  select count(*) into v_count from reform_administrators;
  if v_count <> 0 then
    raise exception 'Managerul nu trebuie să vadă administratorii, vede %', v_count;
  end if;

  -- Nici pentru locația lui.
  select count(*) into v_count from reform_issues
   where location_id = (select location_id from staff_profiles where id = v_manager);
  if v_count <> 0 then
    raise exception 'Managerul vede % probleme pe locația lui — nu trebuie niciuna', v_count;
  end if;

  -- --- Managerul nu poate schimba nimic ---
  begin
    insert into reform_issues (title) values ('__test manager scrie__');
    raise exception 'Managerul a putut adăuga o problemă — politica nu ține';
  exception
    when insufficient_privilege or check_violation then null;
  end;

  update reform_issues set title = '__schimbat de manager__';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'UPDATE-ul managerului a atins % rânduri — trebuia zero', v_rows;
  end if;

  delete from reform_issues;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'DELETE-ul managerului a șters % rânduri — trebuia zero', v_rows;
  end if;

  reset role;

  -- --- Lista a rămas intactă ---
  select count(*) into v_count from reform_issues;
  if v_count <> v_total then
    raise exception 'Lista are acum % probleme, erau %', v_count, v_total;
  end if;

  select count(*) into v_count from reform_issues where title like '__schimbat%';
  if v_count <> 0 then
    raise exception 'Au fost modificate % titluri', v_count;
  end if;

  raise notice 'TOATE AU TRECUT: administratorul vede % probleme; managerul vede 0, iar UPDATE și DELETE fără filtru ating 0 rânduri.', v_total;
end $$;
