# Agent de monitorizare a concurenței

Agent AI care scanează la fiecare 2 zile concurenții și zonele urmărite și raportează doar ce s-a
schimbat: **meniuri și prețuri**, **recenzii/rating**, **promoții și social media**,
**deschideri noi**. Rezultatele apar în aplicație la **Concurență** (doar owner).

## Cum funcționează

```
pg_cron (la 15 min) ──► Edge Function `competitor-scan`
                          │ alege ținta cea mai veche nescanată în ultimele 44h
                          │ (un concurent sau o zonă urmărită)
                          ▼
                        Claude (web_search + web_fetch, pe serverele Anthropic)
                          │ primește: linkurile țintei + snapshot-ul de data trecută
                          │           + titlurile constatărilor din ultimele 30 de zile
                          │ întoarce: raport structurat (submit_scan_report)
                          ▼
                        competitor_snapshots  ← starea nouă (memoria pentru data viitoare)
                        competitor_findings   ← doar schimbările (feed-ul din UI)
                        competitor_scan_runs  ← jurnal: status, erori, tokeni
```

- O scanare = o țintă, ca funcția să rămână sub limita de timp a Edge Functions.
  Fiecare țintă e rescanată după 44h (≈ o dată la 2 zile; constanta
  `RESCAN_AFTER_HOURS` din `index.ts`).
- „Scanează acum” din UI pornește imediat scanarea unei ținte (cu JWT-ul owner-ului).
- Model: `claude-sonnet-5-5` (constanta `MODEL` din `agent.ts`), effort `medium`, cu fallback automat pe server dacă un
  răspuns e refuzat. Max 8 căutări + 8 pagini citite per scanare.

## Fișiere

| Fișier | Rol |
|---|---|
| `supabase/migrations/20261011000000_competitor_intel.sql` | Tabele + RLS (doar owner) |
| `supabase/functions/competitor-scan/index.ts` | HTTP, autorizare, alegere țintă, scriere în DB |
| `supabase/functions/competitor-scan/agent.ts` | Prompt, tool-uri, bucla cu Claude |
| `supabase/cron/competitor_scan.sql` | Programarea pg_cron (se rulează manual) |
| `src/features/competitors/` | UI: feed constatări + administrare concurenți/zone |

## Setup

1. Aplică migrarea: `npx supabase db reset` (local) sau `npx supabase db push` (cloud).
2. Secretele funcției:
   ```bash
   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   npx supabase secrets set COMPETITOR_SCAN_CRON_SECRET=$(openssl rand -hex 32)
   ```
   Local (`supabase functions serve`): pune aceleași variabile în `supabase/functions/.env`
   (nu se commituie).
3. Deploy: `npx supabase functions deploy competitor-scan`
4. Programare automată: în SQL Editor, creează secretele din Vault descrise în capul
   fișierului `supabase/cron/competitor_scan.sql`, apoi rulează fișierul.
   Intenționat nu e migrare — `db reset` local nu pornește apeluri plătite.
5. În aplicație: **Concurență → Concurenți și zone** → adaugă concurenții (site, Google
   Maps, linkuri Glovo/Wolt/Tazz/Bolt, Facebook, Instagram, note) și zonele pentru
   deschideri noi. Apasă „Scanează acum” pe unul ca test.

## De știut

- **Cost**: estimat ~70–200 lei/lună pentru 5 concurenți + 1 zonă (Sonnet, la 2 zile).
  Pune un plafon lunar de cheltuieli în contul Claude (Console → Limits).
  Fiecare scanare consumă tokeni (căutările web se taxează separat). Tokenii
  per rulare sunt în `competitor_scan_runs`; verifică după primele zile.
- **Limita de timp**: Edge Functions au limită de execuție (mai mică pe planul Free).
  Dacă vezi rulări rămase `running` sau erori de timeout, redu `max_uses` în `agent.ts`
  sau mută funcția pe un plan cu limită mai mare.
- **Surse blocate**: unele platforme (ex. Glovo/Wolt) pot bloca citirea automată;
  agentul le trece în `unreachable_sources` și caută informația pe alte căi.
- O scanare eșuată nu se reia până la runda următoare (~2 zile) (ținta e marcată la pornire, ca rulările
  paralele să nu o dubleze); eroarea apare în UI și în `competitor_scan_runs`.
