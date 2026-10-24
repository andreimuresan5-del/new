\set ON_ERROR_STOP on
\pset pager off
-- Conturi de probă, câte unul pe rol, plus date de probă pe fiecare locație.
-- DOAR pentru Supabase local, după `npx supabase db reset` (folosește locațiile
-- și owner-ul din seed.sql). Nu se rulează niciodată pe proiectul live.
--
-- Logarea în aplicație: PIN-ul din tabelul de mai jos (e și parola contului).
-- Owner-ul de probă e chiar contul din seed.sql (Andrei).
--
-- | Cont                     | Rol              | Locație     | PIN    |
-- |--------------------------|------------------|-------------|--------|
-- | Probă Manager DR         | location_manager | Drunken Rat | 710001 |
-- | Probă Manager Astur      | location_manager | Astur       | 710002 |
-- | Probă Șef bucătărie DR   | head_chef        | Drunken Rat | 710003 |
-- | Probă Șef bucătărie Astur| head_chef        | Astur       | 710004 |
-- | Probă Șef tură DR        | shift_lead       | Drunken Rat | 710005 |
-- | Probă Șef tură Astur     | shift_lead       | Astur       | 710006 |
-- | Probă Kitchen manager    | kitchen_manager  | —           | 710007 |
-- | Probă Producție          | production_staff | —           | 710008 |
-- | Probă Marketing          | marketing        | —           | 710009 |

begin;

create temporary table t_conturi (id uuid, name text, role staff_role, location_id uuid, pin text, email text) on commit drop;
insert into t_conturi values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Probă Manager DR',          'location_manager', '11111111-1111-1111-1111-111111111111', '710001', 'proba-manager-dr@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'Probă Manager Astur',       'location_manager', '22222222-2222-2222-2222-222222222222', '710002', 'proba-manager-astur@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'Probă Șef bucătărie DR',    'head_chef',        '11111111-1111-1111-1111-111111111111', '710003', 'proba-chef-dr@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000004', 'Probă Șef bucătărie Astur', 'head_chef',        '22222222-2222-2222-2222-222222222222', '710004', 'proba-chef-astur@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000005', 'Probă Șef tură DR',         'shift_lead',       '11111111-1111-1111-1111-111111111111', '710005', 'proba-tura-dr@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000006', 'Probă Șef tură Astur',      'shift_lead',       '22222222-2222-2222-2222-222222222222', '710006', 'proba-tura-astur@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000007', 'Probă Kitchen manager',     'kitchen_manager',  null,                                   '710007', 'proba-kitchen-manager@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000008', 'Probă Producție',           'production_staff', null,                                   '710008', 'proba-productie@kitchen.internal'),
  ('aaaaaaaa-0000-4000-8000-000000000009', 'Probă Marketing',           'marketing',        null,                                   '710009', 'proba-marketing@kitchen.internal');

-- Același tipar ca owner-ul din seed.sql: direct în auth.users/auth.identities.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
       crypt(pin, gen_salt('bf')), now(),
       '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
from t_conturi;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
from t_conturi;

insert into staff_profiles (id, name, role, location_id, pin_code, auth_email)
select id, name, role, location_id, pin, email from t_conturi;

-- Date de probă: o rețetă, producție + HACCP + stoc + stoc țintă pe fiecare
-- dintre cele trei locații, și câte o problemă/decizie în Reforma.
insert into recipes (id, name, category) values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'Probă — Coaste sous vide', 'probă');
insert into recipe_versions (id, recipe_id, version_number, estimated_portions) values
  ('bbbbbbbb-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000001', 1, 20);
update recipes set current_version_id = 'bbbbbbbb-0000-4000-8000-000000000002'
  where id = 'bbbbbbbb-0000-4000-8000-000000000001';

insert into production_logs (id, recipe_version_id, location_id, user_id, batch_size, portions_produced) values
  ('cccccccc-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-4000-8000-000000000003', 1, 20),
  ('cccccccc-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000004', 1, 20),
  ('cccccccc-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-000000000002', '44444444-1111-4444-1111-444444444444', 'aaaaaaaa-0000-4000-8000-000000000008', 1, 20);

insert into haccp_logs (production_log_id, checkpoint_name, temp_c, user_id)
select id, 'Răcire', 3, user_id from production_logs where id::text like 'cccccccc-%';

insert into stock_movements (recipe_id, location_id, quantity, movement_type, production_log_id, notes)
select 'bbbbbbbb-0000-4000-8000-000000000001', location_id, 20, 'productie', id, 'probă'
from production_logs where id::text like 'cccccccc-%';

insert into stock_par_levels (recipe_id, location_id, target_portions) values
  ('bbbbbbbb-0000-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', 15),
  ('bbbbbbbb-0000-4000-8000-000000000001', '22222222-2222-2222-2222-222222222222', 10),
  ('bbbbbbbb-0000-4000-8000-000000000001', '44444444-1111-4444-1111-444444444444', 30);

insert into reform_issues (title, status, location_id) values
  ('Probă — problemă la Drunken Rat', 'nou', '11111111-1111-1111-1111-111111111111'),
  ('Probă — problemă la Astur',       'nou', '22222222-2222-2222-2222-222222222222');
insert into reform_decisions (statement, state, location_id) values
  ('Probă — decizie la Astur', 'propus', '22222222-2222-2222-2222-222222222222');

commit;

select s.name, s.role, coalesce(l.name, '—') as locatie
from staff_profiles s left join locations l on l.id = s.location_id
order by s.role, s.name;
