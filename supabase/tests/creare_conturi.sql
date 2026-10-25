\set ON_ERROR_STOP on
\pset pager off
-- Ce apără migrarea `20261025000000_creare_conturi`:
--   * firma nu rămâne niciodată fără administrator activ — nici prin ștergere,
--     nici prin dezactivare;
--   * un cont închis nu se mai poate loga cu PIN;
--   * PIN-urile banale nu intră în bază;
--   * `disabled_at` NU se poate scrie din client — închiderea trece obligatoriu
--     prin `staff-admin`, care blochează și contul de auth.
--
-- Capcană de reținut, aceeași ca la testul Reforma: cu RLS, un `update` pe rânduri
-- invizibile nu dă eroare, atinge zero rânduri. Aici însă ce verificăm e un GRANT
-- pe coloană, care dă eroare — de asta testul de la final chiar așteaptă o excepție.

insert into locations (id, name) values
  ('a0000000-0000-0000-0000-000000000001', 'Astur'),
  ('d0000000-0000-0000-0000-000000000002', 'Drunken Rat');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'andrei@kitchen.internal'),
  ('00000000-0000-0000-0000-00000000000b', 'alex@kitchen.internal'),
  ('00000000-0000-0000-0000-00000000000c', 'manager.dr@kitchen.internal');

insert into staff_profiles (id, name, role, location_id, pin_code, auth_email) values
  ('00000000-0000-0000-0000-00000000000a', 'Andrei', 'owner', null, '200001', 'andrei@kitchen.internal'),
  ('00000000-0000-0000-0000-00000000000c', 'Manager DR', 'location_manager',
   'd0000000-0000-0000-0000-000000000002', '200003', 'manager.dr@kitchen.internal');

-- Helper pentru testele negative: rulează o comandă și spune doar dacă a picat.
create function t_expect_fail(p_label text, p_sql text) returns text
language plpgsql as $$
begin
  execute p_sql;
  return 'NU A PICAT (problemă) — ' || p_label;
exception when others then
  return 'a picat, corect — ' || p_label || ' [' || left(sqlerrm, 70) || ']';
end;
$$;

\echo ''
\echo '=== 1. PIN-urile banale nu intră ==='
select t_expect_fail('PIN 123456', $$
  insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f1', 'x1@kitchen.internal');
  insert into staff_profiles (id, name, role, pin_code, auth_email)
  values ('00000000-0000-0000-0000-0000000000f1', 'PIN banal', 'production_staff', '123456', 'x1@kitchen.internal');
$$);
select t_expect_fail('PIN 111111', $$
  insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f2', 'x2@kitchen.internal');
  insert into staff_profiles (id, name, role, pin_code, auth_email)
  values ('00000000-0000-0000-0000-0000000000f2', 'PIN banal', 'production_staff', '111111', 'x2@kitchen.internal');
$$);

\echo ''
\echo '=== 2. Singurul administrator nu poate fi închis, nici șters ==='
select count(*) as owneri_activi from staff_profiles where role = 'owner' and disabled_at is null;
select t_expect_fail('dezactivarea ultimului owner',
  $$update staff_profiles set disabled_at = now() where id = '00000000-0000-0000-0000-00000000000a'$$);
select t_expect_fail('ștergerea ultimului owner',
  $$delete from staff_profiles where id = '00000000-0000-0000-0000-00000000000a'$$);
select t_expect_fail('ștergerea prin cascadă din auth.users',
  $$delete from auth.users where id = '00000000-0000-0000-0000-00000000000a'$$);

\echo 'Andrei e încă aici și încă activ:'
select name, role, disabled_at is null as activ from staff_profiles
where id = '00000000-0000-0000-0000-00000000000a';

\echo ''
\echo '=== 3. Cu doi administratori, unul poate fi închis ==='
insert into staff_profiles (id, name, role, location_id, pin_code, auth_email, created_by) values
  ('00000000-0000-0000-0000-00000000000b', 'Alex', 'owner', null, '200002', 'alex@kitchen.internal',
   '00000000-0000-0000-0000-00000000000a');
\echo 'created_by a prins autorul:'
select s.name, a.name as creat_de from staff_profiles s
  left join staff_profiles a on a.id = s.created_by
  where s.id = '00000000-0000-0000-0000-00000000000b';

update staff_profiles set disabled_at = now() where id = '00000000-0000-0000-0000-00000000000b';
\echo 'Alex închis, Andrei rămâne singurul activ:'
select name, disabled_at is null as activ from staff_profiles where role = 'owner' order by name;

\echo 'Și acum Andrei redevine ultimul activ, deci nu se mai poate închide:'
select t_expect_fail('dezactivarea lui Andrei după ce Alex e închis',
  $$update staff_profiles set disabled_at = now() where id = '00000000-0000-0000-0000-00000000000a'$$);

\echo 'Reactivarea nu e blocată niciodată:'
update staff_profiles set disabled_at = null where id = '00000000-0000-0000-0000-00000000000b';
select count(*) as owneri_activi from staff_profiles where role = 'owner' and disabled_at is null;

\echo ''
\echo '=== 4. Un om care nu e owner se închide fără discuție ==='
update staff_profiles set disabled_at = now() where id = '00000000-0000-0000-0000-00000000000c';
select name, disabled_at is not null as inchis from staff_profiles
where id = '00000000-0000-0000-0000-00000000000c';

\echo ''
\echo '=== 5. Contul închis nu se mai poate loga cu PIN ==='
\echo 'PIN 200003 (Manager DR, închis) — trebuie să vină gol:'
select coalesce(get_login_email_by_pin('200003'), '(gol — corect, nu se poate loga)') as rezultat;
\echo 'PIN 200001 (Andrei, activ) — trebuie să vină emailul:'
select coalesce(get_login_email_by_pin('200001'), '(gol — PROBLEMĂ)') as rezultat;
\echo 'După redeschidere, PIN-ul funcționează iar:'
update staff_profiles set disabled_at = null where id = '00000000-0000-0000-0000-00000000000c';
select coalesce(get_login_email_by_pin('200003'), '(gol — PROBLEMĂ)') as rezultat;

\echo ''
\echo '=== 6. Din aplicație, owner-ul NU poate închide un cont direct ==='
\echo 'Închiderea trebuie să treacă prin staff-admin, care blochează și contul de auth.'
\echo 'Fără asta, cu logare pe email omul ar intra în continuare.'
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select current_staff_role() as rol_curent;
select t_expect_fail('owner scrie disabled_at din client',
  $$update staff_profiles set disabled_at = now() where id = '00000000-0000-0000-0000-00000000000c'$$);
\echo 'Dar poate în continuare schimba numele, rolul și locația (drepturile de la pasul 1):'
update staff_profiles set name = 'Manager DR (redenumit)'
  where id = '00000000-0000-0000-0000-00000000000c';
select name from staff_profiles where id = '00000000-0000-0000-0000-00000000000c';
reset role;
reset request.jwt.claim.sub;

\echo ''
\echo '=== Starea finală ==='
select name, role, disabled_at is null as activ from staff_profiles order by role, name;

drop function t_expect_fail(text, text);
