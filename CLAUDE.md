# Context pentru Claude — Andrei, Drunken Rat SRL

Context pentru orice sesiune nouă de Claude (Claude Code sau chat). Citește-l întreg înainte de orice lucru. Sumele sunt în lei dacă nu scrie altfel.

> **Citește și `CLAUDE.local.md` din același folder.** Acolo stau situația financiară (secțiunea 3) și salariile cu deciziile de reformă (secțiunea 4) — date care nu au ce căuta într-un repository, deci nu sunt aici. Dacă fișierul lipsește din folderul tău, cere-l lui Andrei.

@CLAUDE.local.md

---

## 1. Cine e Andrei și cum lucrăm

- **Andrei**, antreprenor din Timișoara. Conduce grupul **Drunken Rat SRL** împreună cu fratele lui, **Alex**. Amândoi sunt administratori, văd tot și decid împreună sau separat, după problemă.
- Puncte forte: vânzări, negociere, management operațional.
- Țintă pe 5 ani: ~5 mil. € cifră de afaceri pe grup și ieșirea din operarea zilnică prin sisteme. **Prioritatea acum (oct 2026) e profitabilitatea locațiilor existente,** nu linii noi de venit.
- Lucrează bazat pe date și iterativ: de la idee repede la model cantitativ și la instrumente concrete.
- Când pornește ceva nou vrea **execuție premium**, nu varianta ieftină (calitate, ambalaj, poziționare).
- **Limba: română.** Răspunsuri directe, cu cifre și cu concluzia la început.

### Reguli permanente
- **Symbai: doar citire.** Nu modifica nimic în Symbai fără acordul explicit al lui Andrei.
- **Descrierile din meniu:** fără nume de furnizori sau branduri (ex. fără „Fil Sam” la cârnăciori) și fără detalii de servire inutile clientului (ex. „servit pe ardezie”). Cârnăciorii vin cu muștar de casă și focaccia, fără murături. Măslinele sunt verzi, în tempura (nu panko), dar numele rămâne „Măsline pané”.
- **Alergenii** se verifică pe eticheta reală a produsului, nu se presupun.
- **În gyros nu se pune varză.**
- În exporturile Syrve (până la 08.07.2026), coloana „fără venit” înseamnă **vânzări reale**, nu produse gratuite.
- **Plăți la negru:** nu se proiectează. Partea variabilă a salariilor se calculează ca plată pe stat.

---

## 2. Firma și locațiile

- **Drunken Rat SRL** e o singură firmă pentru toate locațiile. Contabilitate în SAGA, la o firmă de contabilitate externă.
- **Drunken Rat:** pub / gastro bar, Str. G. Coșbuc nr. 1, Timișoara, deschis zilnic 11:00–02:00. ~14 ani de activitate, peste 350.000 de porții de coaste vândute. Symbai: locația „Unirii” (id 2), brand id 1. Site drunkenratpub.ro (a pierdut drunkenrat.ro). Iarna: doar interior, 9 mese, maxim 60 de persoane. Bucătăria are 3 stații: salate și focaccia; aragaz + friteuza 1 (tempura/pané); plancha/grill + friteuza 2 (doar cartofi). Cuptorul e doar pentru producție, iar coastele și rața se încălzesc la microunde. 4 oameni în bucătărie până la 15:00, 3 după.
- **Astur:** restaurant în Dumbrăvița, cartier-dormitor. Symbai: locația „Dumbravita” (id 1), brand id 3. Merge bine la prânz; iarna seara e moartă în toată zona. 10 oameni în bucătărie. Bucătăria are friteuze și **Josper** (cuptor pe cărbune), **nu plancha** — de aici vine tot consumul de cărbune și lemn al grupului (4.900–5.800 lei pe lună; la Drunken Rat, zero).
- **Centrul de producție (CP):** sous vide, ~135 m², deservește ambele locații (și VERTICAL în viitor). Are aplicația lui (vezi secțiunea 9).
- **Asistenți pe WhatsApp:** **Mitică** (grupul „Symbai Operațional”: producții, pierderi, masa personalului, recepții, din formularele de seară) și **Banuț** (grupul „Symbai Financiar”: P&L pe locații la câteva zile). Grupul comun a devenit haotic: ~6 oameni, ambele locații, cererile se pierd.

---

## 3. Situația financiară (oct 2026)

**În `CLAUDE.local.md`** — vânzări, contabilitate, raportul lui Banuț, analiza mărfii, consumabilele pe locații, partea casei, livrări, bănci.

## 4. Reforma („reașezarea") companiei

**În `CLAUDE.local.md`** — ordinea priorităților, salariile și KPI-urile pe fiecare rol, structura de iarnă. Definiția indicatorului de consumabile și ponderile, fără sume, sunt în `docs/plan-reforma.md`.

## 5. Meniuri

- **Meniul nou à la carte Drunken Rat:** 40 de preparate în 9 secțiuni (Starters, House Made, Focaccia, Sharing boards, Icons, Mains, Salate, XXL, Garnituri și Deserturi). Food cost-ul mediu afișat e ~22%, ținta sub 30% (de verificat dacă e calculat pe prețul cu TVA sau fără). Construit în conversații anterioare, cu un **dosar tehnic ANSVSA** separat (rețete, alergeni, costuri, fișe SF/FT) și o pagină cu fluxul pe stații.
  - Icons: Ribs Burger, Black Angus Beef Burger, Coaste cu white BBQ, Fleică din baton.
  - Plan: întâi toate rețetele și pozele, apoi costurile reale din prețurile Symbai, apoi politicile de preț.
  - Urmează refacerea meniului zilei (aceleași feluri de ~2 ani) și a meniului de livrare.
- **Meniul de livrare comun DR + Astur:** registru Excel cu 4 foi (presupuneri, rețete, food cost, meniu final), ~20 de preparate. Prețuri segmentate Tier A/B; cârnăciorii și micii la 49 lei, cu kimchi.
- **Se potrivește meniul DR la Astur? (analiza din 24.10)** Astur vinde altfel:
  - meniul zilei luni–vineri ~20% din vânzări; prânzul (11–15) ~60%; după ora 20 sub 7%
  - evenimente și platouri ~9%; clasice de familie (gyros la jar, coaste, șnițel, fleică, mici, mini-șnițele, papanași)
  - **pizza doar ~3,4%** (primele 5); bon mediu 125 lei; livrări ~11%
  - **Concluzie:** ~60–70% nucleu comun cu DR (aceleași rețete, producție centralizată), plus partea proprie Astur: meniul zilei ca sistem, copii, pachete de evenimente, brunch. Fără XXL-urile scumpe și fără starterele de bar. **Pizza: decizie de luat** — diferențiator (5–6 pizza foarte bune + panuzzo) sau produs secundar.
- **Astur, alte proiecte:** brunch/mic-dejun de iarnă de la 7:00, după modelul Black Elk Espresso (Sydney), cu feluri numite, platou „Masa de Familie” și linia „Colțul de Iarnă”; fără pizzaiolo dimineața. Sandviș din jumătate de pallina de pizza (300 g), 5 variante rotative pe săptămână, din mise en place-ul existent. Street shop: pizza la felie, panuzzo, stromboli.

---

## 6. Alte proiecte (nu sunt prioritare acum)

- **Linia de noapte a CP:** 32 de produse (wraps, salate, bowls, mic-dejun, băuturi cold brew, shot-uri), cutii modulare, food cost țintă 28%, ambalaj premium. Doar proiectată și costată, nimic implementat.
- **Produse sous vide numerotate:** Produsul 1 = piept de porc confit cu șorici copt separat. Friteuza nu ajunge la 200°C.
- **VERTICAL:** concept fast-casual de tip Chipotle (wrap, bowl, salată; 4 proteine), pe producția centralizată.
- **Vault by Drunken Rat:** spațiu de evenimente la subsol, în pauză.

---

## 7. Aplicația de control (construită în aplicația CP)

### Arhitectură
- **CP:** React PWA + Supabase, publicată pe Vercel. Repository GitHub `andreimuresan5-del/new`. Conturile GitHub și Supabase sunt acum ale lui Andrei; mai târziu vor fi organizații ale firmei și server-ul companiei. **Totul trebuie construit ca să poată fi mutat:** migrări în cod, chei în variabile de mediu, fișiere legate prin cale.
- **Baza de date, varianta B:** migrările se aplică direct pe Supabase-ul live, deci se testează întâi local, cu câte un cont de probă pe rol.
- **Symbai rămâne locul unde se operează** (recepții, transferuri, stocuri, pontaj). Aplicația e stratul de control și nu dublează datele.

### Roluri

| Rol (enum `staff_role`) | Cine | Ce vede |
|---|---|---|
| `owner` | Andrei, Alex | tot: grupul și fiecare locație |
| `location_manager` | managerul locației | doar locația lui |
| `head_chef` | șeful de bucătărie | doar locația lui |
| `shift_lead` | șeful de tură | doar locația lui |
| `kitchen_manager`, `production_staff`, `marketing` | CP și marketing | ca înainte |

### Plan
1. **Roluri și vizibilitate pe locații — făcut**, pe ramura `claude/roluri-locatii`: migrările `20261024000000_location_roles.sql` și `20261024000001_location_roles_policies.sql`, pagina Echipa, pagina „Locația mea”, plan în `docs/plan-reforma.md`. Testat pe o bază locală cu 6 conturi de probă. **De aplicat pe live și de publicat.** Alex trebuie trecut pe rolul owner.
2. **Crearea conturilor din aplicație — făcut** (25.10.2026): Edge Function `staff-admin` + pagina Echipa. Owner-ul creează contul (PIN generat, arătat o singură dată), face PIN nou, și **închide** contul cuiva care pleacă — contul închis nu se mai poate loga, dar rândul rămâne ca să nu dispară producțiile și fișele HACCP de pe numele lui. Migrarea `20261025000000_creare_conturi` + testul `supabase/tests/creare_conturi.sql`. Alex se poate trece pe owner de aici.
3. **Modulul Cereri:** fiecare cerere (recepție, transfer, inventar, întrebare de rețetă) e un card separat, cu locație, autor, stadiu și conversația ei. Notificările merg doar la cine trebuie. Înlocuiește grupurile de WhatsApp.
4. **Mitică în cereri:** răspunde în card și cere confirmarea doar celui care a trimis cererea. Formularul de seară al bucătăriei devine structurat: producție, pierderi cu motiv obligatoriu, masa personalului, ulei.
5. **„Ziua mea” + notificări + follow-up:** rutine zilnice pe rol, ghid pas cu pas (închidere, recepție, inventar). Escaladare: reamintire cu 30 de minute înainte, la termen, apoi manager (+30 min), apoi administratori (+1 h, doar pentru sarcinile critice). Notificări web push, cu WhatsApp privat ca rezervă. Disciplina intră automat în KPI.
6. **Operațional:** recepție din poză, transfer între locații, pontaj (de preferat din telefon, cu locația verificată), închiderea zilei.
7. **Reforma, Decizii, Scorecarduri,** cu KPI-urile și bonusurile calculate automat.
8. **Banii:** POS față de bancă zilnic, profitul pe livrări pe platforme.

### Rutine zilnice propuse (de confirmat cu orele reale ale locațiilor)
- **Manager:** 9:30 pontaj și casa de deschidere · recepții · 12:00 verifică inventarul șefului · 15:00 comenzile pentru mâine · 16:00 programul de mâine față de vânzările estimate · 23:30 validează închiderea și depunerea.
- **Șef bucătărie:** inventarul critic până la 12:00 (la Astur: pui, ceafă, obrăjori, burrata, mozzarella) · HACCP dimineața · planul de producție · recepții cântărite · formularul de seară.
- **Șef tură:** checklist de deschidere · temperaturi · închidere pas cu pas (Z, casa = POS, bacșiș, plic de depunere cu poză, depozit încuiat) · predarea turei.

---

## 8. Întrebări deschise

1. Oferă Symbai o cheie API pentru integrări (ca Mitică să lucreze din aplicație)?
2. Mitică și Banuț rulează prin Symbai Connect pe calculatorul de birou?
3. Orele reale ale rutinelor pe fiecare locație.
4. Cine vede rapoartele financiare (în grupul lui Banuț sunt și alți membri în afară de administratori).
5. Bugetul de protocol și sponsorizări la Astur.
6. Plata pe stat a bonusurilor, pentru toată schema de personal.
7. Organizațiile GitHub și Supabase ale firmei.
8. Septembrie: pierdere reală sau regularizări contabile (−113k)?
9. Pizza la Astur: diferențiator sau produs secundar?

**Date de primit de la Andrei:** salariile reale de la Astur (pentru echipa de iarnă); salariul actual al managerului Astur; fișele de cont 601, 6028, 622, 628 și balanța pe decembrie 2025, de la contabil.

---

## 9. Unde sunt lucrurile

- **Aplicația CP:** GitHub `andreimuresan5-del/new`; ramura de lucru `claude/roluri-locatii` (bazată pe `claude/wizardly-mendel-0anktt`). Documentație în `docs/` (`plan-reforma.md`, `manual-operare/`, `plan-faza3.md`, `arhitectura-faza1-si-faza2.md`, `agent-concurenta.md`).
- **Manual de operare:** `docs/manual-operare/`. **Un manual pe locație, nu unul comun:** `drunken-rat/` și `astur/`. Posturile se numesc la fel, dar diferă prin dotări (Josper și cuptor de pizza doar la Astur; plancha/grill, 2 friteuze și cuptor doar pentru producție la DR), prin mărimea echipei (10 oameni în bucătărie la Astur, 3–4 la DR), prin program (DR până la 02:00; la Astur prânzul face ~60%) și prin posturi care există doar într-un loc (ambalare la DR; pizzaiolo, evenimente și brunch la Astur). **Meniul zilei există la amândouă locațiile** — la DR cu aceleași feluri de ~2 ani, de refăcut; la Astur face ~20% din vânzările de luni–vineri. Fiecare manual are `posturi/` și `proceduri/`. Regulile chiar comune stau o dată în `docs/manual-operare/README.md`. **Nu copia o pagină de la o locație la alta** — se scrie separat. **Manualul Drunken Rat e complet** (25.10.2026): 9 posturi — manager de locație, șef de bucătărie, șef de tură, barman, bucătar, ospătar, ambalare, vase și curățenie, administrator — și 8 proceduri: închiderea zilei, recepția cântărită, deschiderea turei, predarea turei, inventarul critic, formularul de seară al bucătăriei, masa personalului, energia în intervalul mort. Toate punctele „de calibrat" sunt adunate în `posturi/administrator.md`: 27 de decizii, grupate pe cine le ia. **Managerul de locație la DR există** (confirmat 25.10.2026) și nu era numărat în structura de iarnă de 15 oameni, deci echipa e de 16. Astur: doar lista a ce diferă și ce blochează scrierea (`astur/README.md`). Deciziile despre oameni (salarii, sume de bonus) NU intră în manual — rămân în `CLAUDE.local.md`.
- **Pagini pe claude.ai** (contul lui Andrei):
  - „Panou Drunken & Astur”: cifrele grupului, lista Reforma și Deciziile
  - „Aplicația de control pe roluri”: 9 ecrane de prototip
  - meniul Drunken Rat și dosarul tehnic
- **Symbai:** locații Unirii (id 2, Drunken Rat), Dumbravita (id 1, Astur). Gestiuni: Bucatarie/Bar/Tigari/Consumabile pe fiecare locație.

