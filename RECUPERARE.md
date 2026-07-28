# Notă de recuperare a proiectului

Codul din acest repo a fost **reconstruit din istoricul de sesiuni Claude Code**
(`.claude/projects/C--Users-Muresan-Andrei-CP/*.jsonl`), pentru că proiectul nu
fusese niciodată commit-uit într-un repo git.

Reconstrucția s-a făcut rejucând în ordine cronologică toate operațiile `Write` și
`Edit` înregistrate în istoric (doar cele care au reușit; cele eșuate au fost sărite).

## Verificare

Reconstrucția a fost validată, nu doar presupusă:

- `npx tsc -b --noEmit` — trece, **0 erori**
- `npm run build` — trece, 153 module transformate, PWA generat

## Ce e recuperat integral (din Write/Edit)

Toate cele 41 de fișiere sursă scrise de-a lungul proiectului: aplicația React
(`src/`), cele 9 migrări Supabase (`supabase/migrations/`), `supabase/seed.sql`,
`vite.config.ts`, `postcss.config.js`, `README.md`, `.env.example`.

`index.html` și `.gitignore` au fost recuperate din rezultatele `Read` din istoric,
plus modificările aplicate ulterior lor.

## Ce a fost REGENERAT (nu recuperat) — de verificat

Aceste fișiere au fost create de scaffolding (`npm create vite`) și nu apar niciodată
scrise sau citite în istoric, deci au fost rescrise de la zero:

| Fișier | Observație |
|---|---|
| `package.json` | Dependințele sunt exact cele instalate în istoric. **Versiunile sunt aproximate** — dacă ai `package.json` original pe disc, folosește-l pe acela. |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | Configurația standard a template-ului `react-ts`. |
| `src/vite-env.d.ts` | Standard Vite + tipurile `vite-plugin-pwa/client`. |

## Ce LIPSEȘTE și trebuie refăcut local

### 1. `supabase/config.toml`

Generat de `npx supabase init`, nu e în istoric. Rulează:

```bash
npx supabase init --workdir .
```

Apoi aplică cele 3 modificări făcute în proiectul original:

- `site_url = "http://127.0.0.1:5173"` (în loc de `:3000`), plus `additional_redirect_urls`
  actualizat pe același port
- `[auth]` → `enable_signup = false` (blochează înregistrarea publică)
- `[auth.email]` → `enable_signup = true` — **atenție, trebuie `true`**. Flag-ul ăsta
  controlează providerul de email în ansamblu, inclusiv login-ul cu parolă; dacă e
  `false`, `signInWithPassword` nu mai funcționează și login-ul cu PIN se rupe.
  Blocarea signup-ului public se face din `[auth] enable_signup`, nu de aici.

### 2. `.env.local`

Nu se commituie (e prins de `*.local` în `.gitignore`). Creează-l după `npx supabase start`:

```bash
npx supabase status   # afișează API URL și anon key
```

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key din supabase status>
```

### 3. `spec-centru-productie.md`

Specul complet nu e în istoric — a fost atașat din
`C:\Users\Muresan Andrei\Desktop\spec-centru-productie.md`. **Fișierul e în continuare
pe Desktop-ul tău**, adaugă-l în repo dacă vrei să fie versionat.

### 4. `node_modules/` și `dist/`

Se regenerează cu `npm install` / `npm run build`.

## Pornire

```bash
npm install
npx supabase init --workdir .   # doar prima dată, apoi aplică modificările de mai sus
npx supabase start
npx supabase db reset           # aplică migrațiile + seed.sql
npm run dev
```

Restul instrucțiunilor (login cu PIN, adăugare angajați) sunt în `README.md`.

## Documentație de arhitectură

Notele de arhitectură din memoria proiectului au fost salvate în `docs/`:

- `docs/arhitectura-faza1-si-faza2.md` — deciziile și tradeoff-urile din Faza 1 și 2
  (auth pe PIN, `recipe_versions` append-only, ledger de stoc, bug-uri găsite și reparate)
- `docs/plan-faza3.md` — planul pentru Faza 3 (legătură rețetă-componentă, cost,
  forecast, lanț de aprovizionare)
