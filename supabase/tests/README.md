# Teste de comportament pe baza de date

Regula din `docs/plan-reforma.md`: migrările se aplică direct pe Supabase-ul live,
deci se testează **întâi** local. Fișierele de aici fac testul repetabil.

## Varianta normală: Supabase local (pe calculatorul tău)

```bash
npx supabase start
npx supabase db reset        # aplică toate migrările + seed.sql
psql "$(npx supabase status -o env | grep DB_URL | cut -d= -f2-)" -f supabase/tests/productie_pe_locatie.sql
```

Cu Supabase pornit, `auth` și `storage` sunt reale — **nu** rula fișierul de stub-uri.

## Varianta fără Docker: Postgres simplu + stub-uri

Pentru o sesiune în cloud (sau orice mașină fără Docker), `_stubs_postgres_simplu.sql`
creează minimul pe care Supabase l-ar fi oferit: rolurile `anon`/`authenticated`,
schema `auth` cu `auth.uid()` și `auth.users`, și schema `storage`. `auth.uid()` citește
acolo un setting de sesiune (`request.jwt.claim.sub`) în loc de JWT, deci testele pot
schimba utilizatorul cu `set request.jwt.claim.sub = '<uuid>'`.

```bash
createdb cp
psql -d cp -v ON_ERROR_STOP=1 -f supabase/tests/_stubs_postgres_simplu.sql
for f in supabase/migrations/*.sql; do psql -d cp -v ON_ERROR_STOP=1 -q -f "$f" || break; done
psql -d cp -f supabase/tests/productie_pe_locatie.sql
```

Stub-urile sunt doar pentru test. Nu sunt migrări și nu ajung niciodată pe baza reală.

## Ce acoperă `productie_pe_locatie.sql`

Scenariul „fiecare locație cu marfa ei", fără niciun centru de producție marcat:

- șeful de bucătărie al unei locații poate loga producție **la locația lui**
- la finalizarea porțiilor, stocul crește **acolo unde s-a produs**
- transferul între două locații funcționează (cazul care înainte răspundea
  „stoc insuficient" cu stoc pe masă)
- se resping: producția la altă locație, trimiterea din altă locație, sursă egală cu
  destinația, mai multe porții decât există, și transferul sau finalizarea făcute de
  un șef de tură

Rulat pe Postgres 16 la 24.10.2026: toate au trecut.
