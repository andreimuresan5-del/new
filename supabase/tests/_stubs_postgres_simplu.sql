-- Înlocuitori pentru părțile pe care le oferă Supabase în producție.
create role anon;
create role authenticated;
create role service_role;

create schema auth;
create schema storage;
grant usage on schema auth, storage to anon, authenticated;

-- auth.uid() citește, la test, un setting de sesiune (în Supabase vine din JWT).
create function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create table auth.users (
  instance_id uuid, id uuid primary key, aud text, role text, email text unique,
  encrypted_password text, email_confirmed_at timestamptz,
  raw_app_meta_data jsonb, raw_user_meta_data jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  confirmation_token text, recovery_token text,
  email_change_token_new text, email_change text
);

create table auth.identities (
  id uuid primary key, provider_id text, user_id uuid references auth.users (id),
  identity_data jsonb, provider text, last_sign_in_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table storage.buckets (
  id text primary key, name text not null, public boolean default false,
  created_at timestamptz default now()
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text, owner uuid, metadata jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to authenticated;
grant select on storage.buckets to authenticated;
