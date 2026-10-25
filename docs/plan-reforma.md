# Reforma Drunken Rat SRL — aplicația de control

Context pentru orice sesiune nouă de lucru pe acest proiect (CP). Decizii luate cu Andrei pe 24.10.2026.

Citește și `docs/proceduri-bucatarie.md` — procedurile zilnice de bucătărie, care devin sarcini în aplicație la pasul 5.

Citește și:
- `CLAUDE.md` din rădăcina proiectului — contextul complet: cifrele și analizele din spatele planului (vânzări, contabilitate, marfă, partea casei, reforma salarială, întrebările deschise). Fișierul ăsta spune *ce* construim; acela spune *de ce* și cu ce numere. **Nu e în repository, intenționat** — conține salarii și alte cifre sensibile, și e ținut în afara GitHub prin `.gitignore`. Dacă lipsește din folderul tău, cere-l lui Andrei.
- `docs/agent-concurenta.md` — agentul Iscoada, înainte de a atinge modulul de concurență.
- Secțiunea „Ce e construit și ce trebuie deployat” de mai jos, înainte de orice deploy.

## De ce

Grupul (Drunken Rat, Timișoara + Astur, Dumbrăvița, o singură firmă) vinde ~1,5 mil. € pe an fără TVA, dar profitul ajunge greu la administratori: costul real cu personalul ~31% (parte plătită cash), lipsuri la inventar concentrate în bucătăria Astur, produse din partea casei ~13% din vânzări la Astur, bani ieșiți fără documente, credite. Aplicația trebuie să dea control pe locații fără ca administratorii să fie fizic acolo.

## Oameni și roluri

| Rol (enum `staff_role`) | Cine | Ce vede |
|---|---|---|
| `owner` | Andrei și Alex (administratori, decid împreună sau separat) | Tot: grup + fiecare locație |
| `location_manager` | managerul fiecărei locații | doar locația lui |
| `head_chef` | șeful de bucătărie al fiecărei locații | doar locația lui |
| `shift_lead` | șeful de tură | doar locația lui |
| `kitchen_manager`, `production_staff` | centrul de producție | ca înainte |
| `marketing` | marketing | ca înainte |

Regula de locație e în baza de date (RLS), nu doar în ecrane. Rolurile de locație au obligatoriu `location_id`.

## Reguli de lucru

- Baza de date: varianta B — migrările se aplică direct pe Supabase-ul live, deci se testează întâi local (`supabase start` sau un Postgres local cu stub-uri pentru `auth`/`storage`) cu câte un cont de probă pe fiecare rol.
- Orice modificare de schemă = migrare în `supabase/migrations/`, niciodată click în dashboard.
- Nicio cheie sau URL în cod: variabile de mediu.
- Fișierele din storage se leagă prin cale, nu prin URL complet.
- Totul trebuie să poată fi mutat mai târziu pe conturile firmei (GitHub org, Supabase org) și pe server-ul companiei.
- Symbai rămâne sistemul în care se operează (recepții, transferuri, stocuri, pontaj). Aplicația e stratul de control și nu dublează datele.

## Plan

1. **Roluri și vizibilitate pe locații** — făcut pe ramura `claude/roluri-locatii` (migrările `20261024000000*` și `20261024000001*`, pagina Echipa, pagina „Locația mea”). De aplicat pe live.
2. **Crearea conturilor din aplicație** — funcție pe server (service role) apelabilă doar de owner.
3. **Modulul Cereri** — fiecare cerere (recepție, transfer, inventar, întrebare de rețetă) e un card separat, cu tip, locație, autor, stadiu și conversația ei. Notificări doar către cine trebuie. Înlocuiește grupurile de WhatsApp unde azi se amestecă tot.
4. **Mitică în cereri** — asistentul care azi citește formularele de seară și facturile în grupul „Symbai Operațional” răspunde în cardul cererii și cere confirmarea doar celui care a trimis-o. Depinde de accesul la Symbai din server (de lămurit: cheie API Symbai).
5. **Ziua mea + notificări + follow-up** — rutine zilnice pe rol (manager, șef bucătărie, șef tură), ghid pas cu pas pentru închidere/recepție/inventar, reamintire cu 30 min înainte, la termen, apoi manager (+30 min), apoi administratori (+1 h, doar sarcini critice). Notificări web push (PWA), cu WhatsApp privat ca rezervă.
6. **Operațional** — recepție din poză, transfer între locații, pontaj, închiderea zilei.
7. **Reforma, Decizii, Scorecarduri** — lista de probleme și deciziile sunt **făcute** (`src/features/reform/`, migrarea `20261024000003_reforma`), mutate din Panoul de pe claude.ai și vizibile numai pentru `owner`. Datele reale intră din `supabase/import/reforma.sql`, ținut în afara repository-ului. Rămân scorecardurile: KPI-uri și bonusuri calculate automat (disciplina = sarcini făcute la timp) — au nevoie de lipsa la inventar din Symbai, costul cu personalul și vânzările, care încă nu intră în aplicație.
8. **Banii** — POS vs bancă zilnic, profit pe livrări (Glovo/Wolt, comisioanele nu sunt încă completate în Symbai).

## Ce e construit și ce trebuie deployat

Starea la 24.10.2026. Pe ramura `claude/roluri-locatii` e scris și funcțional local mai mult decât pasul 1 din plan — **nimic din lista de mai jos nu e aplicat pe proiectul live**. Fără pașii 2–4 de aici, migrările se aplică dar agenții rămân morți, fără niciun semnal.

### Module care nu apar în cei 8 pași

| Modul | Unde | Documentație |
|---|---|---|
| **Iscoada** — monitorizare concurență: meniuri, prețuri, recenzii, promoții, deschideri noi; scanare la ~2 zile; feed doar pentru owner | `src/features/competitors/`, `supabase/functions/competitor-scan/` | `docs/agent-concurenta.md` |
| **Agent marketing** — plan săptămânal și lunar, story „Meniul zilei”, chat cu poze și acțiuni, evenimente, rezultate | `src/features/marketing/`, `supabase/functions/marketing-agent/` | — |
| **Roluri pe locație** (pasul 1) — pagina Echipa, pagina „Locația mea” | `src/features/team/`, `src/features/locationHome/`, `src/lib/roles.ts` | — |
| **Reforma** (pasul 7, prima parte) — lista de probleme și deciziile, mutate din Panoul de pe claude.ai; doar `owner` | `src/features/reform/` | — |

### 1. Migrări neaplicate (19)

De la `20261011000000_competitor_intel.sql` până la `20261024000005_restrange_marketing.sql`, în ordinea din numele fișierelor. Se testează întâi local (`supabase start` + `supabase db reset`), apoi `npx supabase db push` — conform regulii din „Reguli de lucru”.

Patru dintre ele schimbă drepturi, nu doar adaugă — de aceea proba locală nu e opțională:

| Migrare | Ce schimbă |
|---|---|
| `20261024000002_productie_pe_locatie` | producția se loghează la locația unde s-a produs; centrul de producție devine opțional; transferul primește locația sursă |
| `20261024000003_reforma` | tabelele listei Reforma, vizibile numai pentru `owner` |
| `20261024000004_ascunde_pin_code` | retrage dreptul de citire pe `staff_profiles` și îl redă pe coloane, fără `pin_code` — PIN-ul e și parola contului |
| `20261024000005_restrange_marketing` | scoate rolul `marketing` din producție, HACCP, stocuri și praguri |

**Starea probei locale la 24.10.2026, seara:** toate cele 28 de migrări aplicate pe o bază locală proaspătă, importul listei Reforma intrat complet (19 probleme, 6 decizii, 2 administratori), logarea cu PIN funcțională, iar `supabase/tests/vizibilitate_roluri.sql` trecut pe toate cele 10 conturi de probă. Rămâne de făcut pe live: copie de siguranță, `db push`, importul, publicarea.

### 2. Secrete pentru Edge Functions

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx supabase secrets set COMPETITOR_SCAN_CRON_SECRET=$(openssl rand -hex 32)
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` și `SUPABASE_SERVICE_ROLE_KEY` sunt injectate automat de Supabase. Pentru rulare locală, aceleași variabile în `supabase/functions/.env` (nu se commituie).

### 3. Deploy funcții

```bash
npx supabase functions deploy competitor-scan
npx supabase functions deploy marketing-agent
```

### 4. Vault + cron — de rulat MANUAL în SQL Editor

Intenționat nu sunt migrări, ca `db reset` local să nu pornească apeluri plătite către API-ul Claude.

Întâi secretele din Vault, o dată per proiect:

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
select vault.create_secret('<același secret ca COMPETITOR_SCAN_CRON_SECRET>', 'competitor_scan_cron_secret');
select vault.create_secret('<anon key>', 'anon_key');
```

Apoi fișierele:

| Fișier | Ce programează |
|---|---|
| `supabase/cron/competitor_scan.sql` | la 15 min; scanează o singură țintă scadentă (~o dată la 2 zile per concurent) |
| `supabase/cron/marketing_weekly.sql` | luni, 05:00 UTC — plan săptămânal |
| `supabase/cron/marketing_monthly.sql` | ziua 1 a lunii, 06:00 UTC — raport lunar |

### 5. Înainte de publicarea online — obligatoriu

`supabase/cron/online_hardening.sql` **nu e opțional**: revocă `execute` pe `get_login_email_by_pin(text)` pentru `anon` și `authenticated`. Online, PIN-ul de 6 cifre se poate ghici prin încercări repetate, iar funcția îl verifică fără autentificare. Se rulează manual pe proiectul live, iar în Vercel se pune `VITE_LOGIN_MODE=email` — owner-ul intră cu email + parolă; local rămâne logarea cu PIN pentru bucătărie.

### 6. După deploy, de verificat

- **Iscoada → Concurenți și zone**: adaugă concurenții (site, Google Maps, linkuri Glovo/Wolt/Tazz/Bolt, Facebook, Instagram) și zonele pentru deschideri noi; apasă „Scanează acum” pe unul, ca test.
- Tokenii consumați și erorile per rulare sunt în `competitor_scan_runs` — verifică după primele zile.
- Cost estimat Iscoada: ~70–200 lei/lună pentru 5 concurenți + 1 zonă. Pune un plafon lunar de cheltuieli în contul Claude (Console → Limits).

## KPI-uri hotărâte (propuse, de confirmat pe act adițional)

- **Manager DR:** 4.000 lei net fix + până la 3.000 bonus. Condiție de bază: disciplina banilor. KPI: lipsa la inventar față de rețete, cost personal %, **consumabile**, vânzări față de anul trecut, calitate.
- **Manager Astur:** aceeași arhitectură; ponderi: cost personal 35%, lipsă marfă 25%, **consumabile 10%**, vânzări extrasezon 20%, calitate 10%.
- **Șefi de bucătărie:** 4.500 fix + până la 2.500. Lipsa la inventar față de rețete (DR ≤5% întreg, 5–8% jumătate; Astur nov–dec ≤10%/≤15%, apoi ca DR), rețete și înregistrări complete, calitate și porționare, HACCP. Fără țigări în calcul. **Consumabilele nu intră la șefii de bucătărie** — managerul comandă și recepționează.

### Consumabile: definiția indicatorului

Hotărât pe 25.10.2026, după analiza pe locații din Symbai (august–septembrie 2026).

**Se măsoară** „consumabile operaționale" ca procent din vânzările fără bacșiș ale locației:

> tot ce iese din gestiunea `Consumabile` a locației, **minus** plantele și amenajările, **minus** obiectele de inventar (ce ține mai mult de un an sau costă peste 500 lei bucata), **minus** cărbunele și lemnul de grătar.

**De ce aceste excluderi**, și nu cifra brută:

| Exclus | Motiv |
|---|---|
| Plante și amenajări | Decizie de administrator, nu consum de bucătărie. În septembrie, 6.830 lei la Astur într-o singură lună; în august, zero. |
| Obiecte de inventar | Pahare, farfurii, cuțite, tocătoare, veioze. Țin ani, nu se consumă. |
| Cărbune și lemn de grătar | Astur are grătar pe jar, Drunken Rat nu cumpără deloc. E diferență de bucătărie, nu de disciplină, și face locațiile incomparabile. Se urmărește separat, legat de volumul de grătar. |

Același tipar ca „fără țigări în calcul" la șefii de bucătărie: din KPI iese ce omul nu controlează.

**Pragurile — NU se trec încă în actul adițional.** Pe cifra brută, Astur pare la 5,53% și Drunken Rat la 4,02% (septembrie); după curățare, Astur e la 2,79% și Drunken Rat la 3,78% — clasamentul se inversează. În august, curățate, erau aproape egale: 3,10% și 2,94%.

Pragurile propuse, de fixat **din ianuarie 2027**, după două luni de date curate: sub 3,0% bonus întreg, 3,0–3,5% jumătate, peste 3,5% zero. Până atunci indicatorul se măsoară și se arată, fără bani legați de el.

**Trei lucruri de reparat înainte de a lega bani de prag:**

1. **Tipurile de produs în Symbai.** Un singur produs din tot sistemul e marcat „obiect de inventar" (o veioză); restul lucrurilor durabile stau la „Consumabile" — circa 3.000 lei pe lună pe ambele locații. Fără separare, pragul are o marjă de eroare de aproape un punct, adică ~4.400 lei pe lună.
2. **Marcarea ridicării personale la bonare.** Câmpul `order_type` există, dar în septembrie există o singură comandă marcată ca ridicare (Astur, 119 lei) și niciuna la Drunken Rat — restul se bonează ca „în sală", deși Drunken Rat a consumat 5.073 lei de ambalaje, inclusiv pahare „Take Away". Fără bifă, ambalajul nu se poate împărți pe canale.
3. **Cărbunele și lemnul pe linia lor.** La Astur, 4.900–5.800 lei pe lună, peste 1% din vânzări.

Pentru referință: livrarea prin platforme e 22,6% din vânzări la Drunken Rat și 8,2% la Astur (septembrie); ambalaje per comandă livrată, 4,20 lei la DR și 5,93 la Astur — maxime, pentru că ambalajul acoperă și ridicarea personală nebonată.

## Prototipuri

Ecranele pe roluri (administrator, manager, șef bucătărie, șef tură, notificări, închidere pas cu pas) sunt în canvas-ul „Aplicația de control pe roluri” de pe claude.ai.
