\set ON_ERROR_STOP on
\pset pager off
-- Fixtures: două locații, NICIUN centru de producție marcat (realitatea de acum).
insert into locations (id, name, is_production_center) values
  ('a0000000-0000-0000-0000-000000000001', 'Astur', false),
  ('d0000000-0000-0000-0000-000000000002', 'Drunken Rat', false);

insert into recipes (id, name) values ('c0000000-0000-0000-0000-00000000000a', 'Pulpe sous vide');
insert into recipe_versions (id, recipe_id, version_number) values
  ('e0000000-0000-0000-0000-00000000000b', 'c0000000-0000-0000-0000-00000000000a', 1);
update recipes set current_version_id = 'e0000000-0000-0000-0000-00000000000b'
  where id = 'c0000000-0000-0000-0000-00000000000a';

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'chef.astur@kitchen.internal'),
  ('22222222-2222-2222-2222-222222222222', 'chef.dr@kitchen.internal'),
  ('33333333-3333-3333-3333-333333333333', 'tura.astur@kitchen.internal');

insert into staff_profiles (id, name, role, location_id, pin_code, auth_email) values
  ('11111111-1111-1111-1111-111111111111', 'Chef Astur', 'head_chef',
   'a0000000-0000-0000-0000-000000000001', '100001', 'chef.astur@kitchen.internal'),
  ('22222222-2222-2222-2222-222222222222', 'Chef DR', 'head_chef',
   'd0000000-0000-0000-0000-000000000002', '100002', 'chef.dr@kitchen.internal'),
  ('33333333-3333-3333-3333-333333333333', 'Șef tură Astur', 'shift_lead',
   'a0000000-0000-0000-0000-000000000001', '100003', 'tura.astur@kitchen.internal');

\echo ''
\echo '=== Premisa bug-ului vechi: există vreun centru? ==='
select coalesce((select name from locations where is_production_center), 'NICIUNUL — codul vechi căuta stocul locației NULL') as centru;

-- Helper pentru testele negative: rulează o comandă și spune doar dacă a picat.
create function t_expect_fail(p_label text, p_sql text) returns text
language plpgsql as $$
begin
  execute p_sql;
  return 'FAIL  ' || p_label || ' — a trecut, deși trebuia respins';
exception when others then
  return 'ok    ' || p_label || ' — respins: ' || split_part(sqlerrm, E'\n', 1);
end;
$$;

\echo ''
\echo '=== 1. Șeful de bucătărie Astur loghează producție LA ASTUR ==='
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
insert into production_logs (id, recipe_version_id, location_id, user_id, batch_size)
values ('f0000000-0000-0000-0000-00000000000c', 'e0000000-0000-0000-0000-00000000000b',
        'a0000000-0000-0000-0000-000000000001', auth.uid(), 20);
select 'ok    log de producție creat la Astur' as rezultat;

\echo ''
\echo '=== 2. Finalizare porții — unde ajunge stocul? ==='
select finalize_production_portions('f0000000-0000-0000-0000-00000000000c', 18);
reset role;
select l.name as locatie, s.portions_on_hand as porcii
  from stock_levels s join locations l on l.id = s.location_id
  where s.recipe_id = 'c0000000-0000-0000-0000-00000000000a';

\echo ''
\echo '=== 3. Transfer Astur -> Drunken Rat (bug-ul vechi: „stoc insuficient") ==='
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select transfer_semipreparat(
  'c0000000-0000-0000-0000-00000000000a',
  'a0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  5, 'ajutor pentru weekend');
reset role;
select l.name as locatie, s.portions_on_hand as porcii
  from stock_levels s join locations l on l.id = s.location_id
  where s.recipe_id = 'c0000000-0000-0000-0000-00000000000a'
  order by l.name;

\echo ''
\echo '=== 4. Ce trebuie respins ==='
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select t_expect_fail('Chef Astur loghează producție la Drunken Rat',
  $$insert into production_logs (recipe_version_id, location_id, user_id)
    values ('e0000000-0000-0000-0000-00000000000b','d0000000-0000-0000-0000-000000000002', auth.uid())$$);
select t_expect_fail('Chef Astur trimite DIN Drunken Rat',
  $$select transfer_semipreparat('c0000000-0000-0000-0000-00000000000a',
      'd0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001',1,null)$$);
select t_expect_fail('Sursă = destinație',
  $$select transfer_semipreparat('c0000000-0000-0000-0000-00000000000a',
      'a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',1,null)$$);
select t_expect_fail('Mai multe porții decât există',
  $$select transfer_semipreparat('c0000000-0000-0000-0000-00000000000a',
      'a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002',999,null)$$);
set request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
select t_expect_fail('Șeful de tură face transfer',
  $$select transfer_semipreparat('c0000000-0000-0000-0000-00000000000a',
      'a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000002',1,null)$$);
select t_expect_fail('Șeful de tură finalizează porții',
  $$select finalize_production_portions('f0000000-0000-0000-0000-00000000000c', 30)$$);
reset role;

\echo ''
\echo '=== 5. Vechea funcție cu 4 argumente mai există? ==='
select count(*) as semnaturi_vechi from pg_proc
 where proname = 'transfer_semipreparat' and pronargs = 4;
