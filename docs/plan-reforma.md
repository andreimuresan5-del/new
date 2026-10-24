# Reforma Drunken Rat SRL — aplicația de control

Context pentru orice sesiune nouă de lucru pe acest proiect (CP). Decizii luate cu Andrei pe 24.10.2026.

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
7. **Reforma, Decizii, Scorecarduri** — mutate din prototipul de pe claude.ai; KPI-uri și bonusuri calculate automat (disciplina = sarcini făcute la timp).
8. **Banii** — POS vs bancă zilnic, profit pe livrări (Glovo/Wolt, comisioanele nu sunt încă completate în Symbai).

## KPI-uri hotărâte (propuse, de confirmat pe act adițional)

- **Manager DR:** 4.000 lei net fix + până la 3.000 bonus. Condiție de bază: disciplina banilor. KPI: lipsa la inventar față de rețete, cost personal %, vânzări față de anul trecut, calitate.
- **Manager Astur:** aceeași arhitectură; ponderi: cost personal 40%, lipsă marfă 30%, vânzări extrasezon 20%, calitate 10%.
- **Șefi de bucătărie:** 4.500 fix + până la 2.500. Lipsa la inventar față de rețete (DR ≤5% întreg, 5–8% jumătate; Astur nov–dec ≤10%/≤15%, apoi ca DR), rețete și înregistrări complete, calitate și porționare, HACCP. Fără țigări în calcul.

## Prototipuri

Ecranele pe roluri (administrator, manager, șef bucătărie, șef tură, notificări, închidere pas cu pas) sunt în canvas-ul „Aplicația de control pe roluri” de pe claude.ai.
