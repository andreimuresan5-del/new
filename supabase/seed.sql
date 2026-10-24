-- Seed date pentru dev local. Rulează automat la `supabase db reset`.

-- Fiecare locație își cumpără marfa și produce la ea în bucătărie. Centrul de
-- producție există ca spațiu, dar nu e activ (octombrie 2026), deci nu e marcat
-- `is_production_center` — locul producției se alege în formular.
insert into locations (id, name, address) values
  ('11111111-1111-1111-1111-111111111111', 'Drunken Rat', null),
  ('22222222-2222-2222-2222-222222222222', 'Astur', null);

insert into locations (id, name, address, is_production_center) values
  ('44444444-1111-4444-1111-444444444444', 'Centru de producție', null, false);

-- Cont inițial owner (Andrei). PIN: 482913 — de schimbat după primul login
-- (vezi README pentru cum se actualizează PIN-ul unui cont din Studio).
-- Inserăm direct în auth.users/auth.identities (pattern standard de seed pentru
-- Supabase local dev) ca să nu depindem de un flow de signup dezactivat.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated',
  'authenticated',
  'owner-andrei@kitchen.internal',
  crypt('482913', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', ''
);

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '{"sub":"33333333-3333-3333-3333-333333333333","email":"owner-andrei@kitchen.internal"}',
  'email',
  now(),
  now(),
  now()
);

insert into staff_profiles (id, name, role, location_id, pin_code, auth_email) values
  ('33333333-3333-3333-3333-333333333333', 'Andrei', 'owner', null, '482913', 'owner-andrei@kitchen.internal');
