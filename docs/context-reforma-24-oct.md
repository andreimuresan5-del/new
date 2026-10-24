# Context complet — discuția din 24 octombrie 2026 (Andrei + Claude)

Rezumatul tuturor analizelor, deciziilor și întrebărilor deschise din conversația de pe claude.ai despre reforma Drunken Rat SRL. Completează `docs/plan-reforma.md` (planul aplicației). Sumele sunt în lei dacă nu scrie altfel.

---

## 1. Firma și locațiile

- **Drunken Rat SRL** = o singură firmă pentru ambele locații: **Drunken Rat** (pub/gastro bar, Timișoara, locația Symbai „Unirii”, id 2) și **Astur** (restaurant, Dumbrăvița, locația Symbai „Dumbravita”, id 1). Plus **centrul de producție** (aplicația CP).
- Administratori: **Andrei** și **Alex** (frați). Văd tot, decid împreună sau separat, după problemă. Fiecare problemă are un responsabil: Andrei, Alex sau amândoi.
- POS și stocuri: **Symbai** (din 09.07.2026; înainte Syrve). Contabilitate: SAGA, firmă de contabilitate externă.
- Asistenți pe WhatsApp: **Mitică** (grupul „Symbai Operațional”: producții, pierderi, masa personalului, recepții) și **Banuț** (grupul „Symbai Financiar”: P&L pe locații la câteva zile).

## 2. Vânzări (fișierul Vanzari_Astur_DrunkenRat_2025_2026.xlsx)

- 2025 an complet: **8,71 mil. lei cu TVA** (~7,7 mil. fără TVA, ~1,5 mil. €). 2026 la ritmul actual: ~9,1 mil. cu TVA.
- „Fără venit” din Syrve sunt tot vânzări (Andrei a confirmat), nu produse gratuite.
- 01.01–19.10, 2026 față de 2025: **Astur +30,8%**, **Drunken Rat −8,3%** (H1 −9,9%, iul–oct −5,7%), grup +4,6%.
- DR scade cel mai mult luni–marți (−11/−12%). Astur e foarte sezonier: ~155k pe lună în ian–feb, ~466k în august.

## 3. Contabilitate (balanța 31.08 + raportul „Unde este firma la 30.09.2026”)

- Ian–aug 2026: venit net **5,20 mil.**, profit contabil **426k** (8,2%). La 30.09: vânzări 9 luni 5,78 mil., profit **313k** (−113k în septembrie, de clarificat cu contabilul).
- Pe 100 lei vânduți (9 luni 2026): materii prime **37,3**, salarii pe acte **22,9**, consumabile 5,1.
- **318.544 lei ieșiți fără documente** în 9 luni; **645.056 lei** sold total în afara firmei (conturile 542 și 461).
- **Credite:** 275k rate în 9 luni, datorie rămasă **729k**, dobândă ~79k pe an. Principalul nu apare în profit: de aceea firma arată profit și nu are bani.
- **Card POS neajuns în cont:** ~4.800 lei pe lună (~57k pe an). Suspect principal: bacșișul pe card dat cash ospătarilor.
- **Cash în case:** 190.140 lei, de ~4 ori peste plafonul legal de 50.000.
- 2025: profit contabil 493k, dividende distribuite 465k.
- Andrei: câștigă personal ~20.000 € pe an, iar ~60.000 € s-au dus pe credite.

## 4. Raportul lui Banuț (20–22 oct, fără TVA)

| | Vânzări | Marfă | Salarii | Rezultat |
|---|---|---|---|---|
| Drunken Rat | 37.450 | 29,6% | 25,2% | +5.117 |
| Astur | 22.193 | 32,0% | **40,4%** (52% pe 22.10) | **−1.299** |
| Grup | 59.644 | 30,5% | 30,8% | +3.818 |

- **Salariile reale ~31%**, nu 22,9% ca în contabilitate: Banuț numără și partea plătită cash. Confirmă că banii fără documente sunt în mare parte salarii. **Salariile sunt cea mai mare pârghie.**
- **Astur a intrat în pierderea de iarnă** (~−13k pe lună la ritmul ăsta). Pentru DR s-a stabilit deja echipa de iarnă, pentru Astur nu.
- Marfa din Banuț e cea din rețete, nu cea reală după inventar.

## 5. Marfa: analiza Symbai (aug–sep 2026)

- **Rețetele sunt bune:** consumul teoretic e ~28,6% din vânzări. În august: contabilitate 34,2% = rețete 28,6 + lipsuri la inventar 2,9 + **țigări 2,1** (revândute aproape la cost) + diverse 0,6.
- Lipsa la inventar față de rețete: **Bucătărie Astur +18,5%** (august +27,7%), Bucătărie DR +4,7%, Bar DR +2,6%, Bar Astur ~0.
- **~45% din lipsuri sunt consum neînregistrat**, nu pierderi: ulei de friteuză (Astur 375 l, DR 228 l, aproape nimic în rețete), ulei de măsline Astur 124 l, roșii decojite Astur 171 kg, orez, unt, smântână, microplante.
- **Pierderi reale, aproape toate la Astur:** pulpe de pui dezosate 150 kg lipsă din 589 kg intrate (25%), ceafă 137 kg lipsă la 216 kg în rețete, obrăjori 23 kg la 26 kg, burrata, mozzarella, bresaola, creveți. Făina Caputo ~11% (acceptabil).
- Masa personalului se trece pe ingrediente doar de pe la sfârșitul lui septembrie, deci o parte din lipsa de pui din aug–sep e probabil mâncarea personalului nebonată.
- Pierderi trecute „fără motiv” sau „Altul”: în aplicație motivul trebuie să fie obligatoriu, dintr-o listă.
- Scanarea rețetelor e curată tehnic. Singurul produs vândut fără rețetă: **Ciorba de fasole cu afumătură** (Astur).
- Consumabilele includ echipamente (sous vide, robot, cântar, ventilator), plante (~4.700 la Astur) și cărbune/lemn de grătar.
- Valoare: ~35k lei lipsuri în 2 luni (~210k pe an). Pierderea reală controlabilă după repararea rețetelor e **~100k pe an**, concentrată la Astur.
- Symbai are ~7.500 documente cu costul încă nerecalculat: sumele în lei pot varia puțin, cantitățile sunt finale.

## 6. Produse din partea casei la Astur (15.09–23.10)

- **56.321 lei la preț de meniu (~13% din vânzări)**, toate aprobate din contul lui Alex. Motive principale: Protocol 16.550, echipa de fotbal ~9.000 (mai multe intrări), Staff/Personal ~13.000, consumul administratorilor ~7.800.
- La ritmul ăsta: ~500k pe an la preț de meniu (~150k la cost). **De discutat cu Alex:** buget lunar fix pentru protocol și sponsorizări, masa personalului din meniul zilei.

## 7. Ce vinde Astur (Symbai, 09.07–23.10, 1,43 mil. cu TVA, 9.402 bonuri)

- **Meniul zilei luni–vineri: ~20%** din vânzări. **Prânzul 11–15: ~60%** din încasări; după ora 20 sub 7%.
- Evenimente și platouri ~9% (mix grill, aperitiv, mediteranean, open bar, meniu eveniment), plus avansuri.
- Clasice de familie: gyros la jar, coaste, șnițel cu piure, fleică, mici, mini-șnițele pentru copii, papanași.
- **Pizza:** primele 5 doar ~3,4%. Bon mediu 125 lei. Livrări ~11% (Wolt 32,5k, Glovo 16,1k în 5,5 săptămâni).
- **Concluzie pentru meniu:** meniul nou DR (40 de preparate, pagina de pe claude.ai) se potrivește la Astur în proporție de ~60–70%, ca nucleu comun cu aceeași producție. Lipsesc meniul zilei ca sistem, secțiunea pentru copii, pachetele de evenimente, brunch-ul. Nu se potrivesc XXL-urile scumpe și starterele de bar. **Pizza: decizie de luat:** diferențiator (5–6 pizza foarte bune + panuzzo) sau produs secundar.

## 8. Reforma salarială: decizii

- **Manager Drunken Rat:** azi 7.000 net indiferent de rezultate (minimul pe acte, restul cash). Propus: **4.000 fix + până la 3.000 pe KPI.** KPI: condiție de bază = disciplina banilor (casa reconciliată zilnic, depunere zilnică, fără ieșiri fără document, inventar zilnic); lipsa la inventar față de rețete; cost personal %; vânzări față de anul trecut; calitate. Status: propus.
- **Manager Astur:** aceeași arhitectură, ponderi: cost personal 40%, lipsă marfă 30%, vânzări extrasezon 20%, calitate 10%. **Lipsește salariul actual.**
- **Șefi de bucătărie:** **4.500 fix + până la 2.500 pe KPI.** Condiție de bază: inventar critic zilnic, pierderi și masa personalului în Symbai, recepție cântărită, HACCP. KPI: lipsa față de rețete 1.200 (DR ≤5% întreg, 5–8% jumătate; Astur nov–dec ≤10%/≤15%, apoi ca DR), rețete și înregistrări complete 400, calitate și porționare 500, HACCP 400. Fără țigări în calcul.
  - Șef DR: azi **4.500** net → doar câștig posibil (max 7.000).
  - Șef Astur: azi **7.000** net → poate pierde 2.500. **Decis:** structura întreagă, fără prag garantat; dacă nu acceptă, e înlocuit (performanță foarte slabă). Înainte de anunț: înlocuitor identificat, inventar complet făcut de manager sau de Andrei, carnea și brânzeturile sub cheie, rețetele complete în Symbai. Pașii legali (act adițional, eventual încetare) se verifică cu contabilul sau cu un avocat.
- Ambii șefi au minimul pe economie în contract. **Bonusul trebuie plătit pe stat** (Claude nu proiectează plăți la negru). Cost firmă pe stat: fix ~7.900, maxim ~12.200 lei pe lună per șef. Pentru doi șefi, până la ~115k pe an în plus. **Decizie de luat de administratori pentru toată schema.**

## 9. Aplicația: decizii de arhitectură

- Se construiește în **aplicația CP** (React PWA + Supabase, pe Vercel), nu separat.
- **Varianta B pentru baza de date:** migrările se aplică direct pe Supabase-ul live, deci se testează întâi local, cu câte un cont de probă pe rol.
- Conturile GitHub și Supabase sunt acum ale lui Andrei. Mai târziu: organizații ale firmei și server-ul companiei. Totul trebuie construit ca să poată fi mutat (migrări în cod, chei în variabile de mediu, fișiere legate prin cale).
- **Problema de rezolvat:** grupurile WhatsApp amestecă tot (6 oameni, ambele locații, cereri și răspunsuri amestecate, nimeni nu urmărește ce a cerut). Soluția: **modulul Cereri**, fiecare cerere un card separat, pe locație, cu stadiu și conversația ei, iar notificările doar către cine trebuie.
- **Ghidare și follow-up:** rutine zilnice pe rol, ghid pas cu pas, escaladare (−30 min, termen, +30 min la manager, +1 h la administratori doar pentru sarcinile critice). Disciplina intră automat în KPI.
- **Băncile:** 6 conturi (ING, BT, 2 BRD, 2 ProCredit) au extrasele importate manual, lunar, în Symbai; septembrie e ~95–100% reconciliat. Pentru reconcilierea zilnică a cardurilor e nevoie de extras zilnic.
- **Platformele:** Glovo și Wolt sunt integrate pe ambele locații. **Comisionul nu e completat pe niciun canal.** Profitul pe livrări din Symbai e blocat pentru septembrie de produse fără cost (DR: măsline tempura; Astur: meniurile zilei, open bar V1, open bar kids, meniu copii).

## 10. Întrebări deschise (de la Andrei, după discuția cu Alex)

1. ~~Unde se aplică migrările~~: răspuns = varianta B, direct pe CP.
2. Oferă Symbai o cheie API pentru integrări (ca Mitică să lucreze din aplicație)?
3. Mitică și Banuț rulează prin Symbai Connect pe calculatorul de birou?
4. Orele rutinelor zilnice pe fiecare locație.
5. Cine vede rapoartele financiare (azi în grupul lui Banuț sunt și „Dr” și încă un număr).
6. Bugetul de protocol și sponsorizări la Astur.
7. Plata pe stat a bonusurilor, pentru toată schema.
8. Organizațiile GitHub și Supabase ale firmei.

**Date de primit de la Andrei:** lista salariilor reale de la Astur (pentru echipa de iarnă: ținta ~2.400 lei personal pe zi la ~8.000 vânzări); procentele de comision Glovo și Wolt pe locații; salariul actual al managerului Astur; fișele de cont 601, 6028, 622, 628 și balanța pe decembrie 2025, de la contabil.

## 11. Pagini făcute pe claude.ai (le deschide Andrei din contul lui)

- **Panou Drunken & Astur:** cifrele grupului + lista Reforma (18 probleme, cu responsabil, stadiu, valoare pe an) + Decizii. Datele se pot exporta în aplicație.
- **Aplicația de control pe roluri:** 9 ecrane de prototip (administrator grup și locație, manager operațional, o cerere de recepție cu Mitică, șef bucătărie, șef tură, „Ziua mea”, notificări și escaladare, închidere pas cu pas).
- **Meniul Drunken Rat** și **dosarul tehnic** (rețete, alergeni, costuri), din conversațiile anterioare.
