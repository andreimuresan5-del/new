# Control Centru de Producție (Faza 1)

Rețete + versionare, loguri producție, loguri HACCP. Vezi `spec-centru-productie.md` pentru specul complet și roadmap.

## Prerechizite

- Node.js LTS + npm
- Docker Desktop (pentru Supabase local) — necesită WSL2 pe Windows, care necesită un restart după prima activare (`wsl --install`)

## Pornire dev

```bash
npm install
npx supabase start      # pornește Postgres/Auth/Studio local (Docker)
npx supabase db reset   # aplică migrațiile + seed.sql
npm run dev
```

După `supabase start`, rulează `npx supabase status` și verifică că `API URL` și `anon key` coincid cu cele din `.env.local` (fișierul e deja populat cu cheia standard de dev local, dar verifică oricum — dacă JWT secret-ul local a fost schimbat, cheia diferă).

- App: http://127.0.0.1:5173
- Supabase Studio (DB, tabele, auth users): http://127.0.0.1:54323
- Emailuri de test (nefolosit în Faza 1, PIN-only): http://127.0.0.1:54324

## Login

Autentificare cu PIN (6 cifre), nu email/parolă vizibil. Cont inițial seed-uit:

- **Andrei (owner)** — PIN: `482913` (schimbă-l după primul login, vezi mai jos)

## Adăugare angajați noi (fără UI momentan)

Nu există încă un ecran de management utilizatori (nu era în scope-ul Fazei 1). Adaugă manual din Supabase Studio → SQL Editor (`http://127.0.0.1:54323`), rulând:

```sql
-- generează un id nou
select gen_random_uuid();

-- înlocuiește <id>, <pin> (6 cifre), <nume> mai jos
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000', '<id>', 'authenticated', 'authenticated',
  '<id>@kitchen.internal', crypt('<pin>', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), '<id>', '<id>', jsonb_build_object('sub', '<id>', 'email', '<id>@kitchen.internal'), 'email', now(), now(), now());

insert into staff_profiles (id, name, role, location_id, pin_code, auth_email)
values ('<id>', '<nume>', 'production_staff', '<location_id sau null>', '<pin>', '<id>@kitchen.internal');
```

Pentru a schimba PIN-ul unui cont existent (ex. cel al lui Andrei după primul login):

```sql
update auth.users set encrypted_password = crypt('<pin nou>', gen_salt('bf')) where id = '33333333-3333-3333-3333-333333333333';
update staff_profiles set pin_code = '<pin nou>' where id = '33333333-3333-3333-3333-333333333333';
```

## Note arhitecturale

- `recipe_versions` e append-only la nivel de RLS (fără UPDATE/DELETE) — editarea unei rețete creează mereu o versiune nouă, pentru audit HACCP.
- Tabelul `users` din spec e `staff_profiles` în schema reală, ca să nu se suprapună cu `auth.users` intern Supabase.
- PIN-ul e chiar parola contului Supabase Auth asociat (email sintetic generat) — tradeoff acceptat pentru Faza 1 (aplicație internă, rețea locală).
- PWA: cache pentru app shell/assets (instalabil, funcționează offline pentru citire), NU offline queue pentru scrieri — scrierile tot necesită conexiune la Supabase.
- Tipurile din `src/lib/database.types.ts` sunt scrise manual pentru bootstrap; regenerează-le cu `npx supabase gen types typescript --local > src/lib/database.types.ts` odată ce ai DB-ul local pornit, ca sursă de adevăr.

## Faza 1 — ce urmează după ce merge local

1. Login ca Andrei (owner), verifică dashboard-ul.
2. Adaugă un cont `kitchen_manager` din Studio (vezi mai sus) și loghează-te cu el.
3. Creează rețetele reale **Wings sous vide** și **Pulpe dezosate sous vide** din `/recipes/new` — parametrii (temp, timp, protocol răcire, finisare) se completează direct în formular.
4. Adaugă un cont `production_staff`, loghează-te cu el, verifică acces read-only la rețete și creează un log de producție + checkpoint-uri HACCP din `/production/new`.
