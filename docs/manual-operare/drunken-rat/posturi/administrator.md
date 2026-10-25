# Administrator — Drunken Rat

**Rol în aplicație:** `owner` · **Cine:** Andrei și Alex
**Vizibilitate:** tot — grupul și fiecare locație
**Decid:** împreună sau separat, după problemă

> Pagina asta e scrisă la final, pentru că e singura care se definește prin **ce nu mai trebuie să
> facă.** Celelalte posturi descriu ce face omul. Ăsta descrie ce rămâne după ce celelalte funcționează.

---

## Ce rămâne la administratori, permanent

Lucruri care nu se delegă, nici după ce manualul merge:

| Ce | De ce nu se delegă |
|---|---|
| **Oamenii** — salarii, structura de bonus, ponderile KPI, înlocuiri | Costă bani și schimbă echipa |
| **Prețurile și meniul** | Decid poziționarea, nu operarea |
| **Investițiile și echipamentul** | Cântar, dozatoare, veselă, reparații mari |
| **Bugetul de protocol și „din partea casei"** | Fără buget, devine nelimitat |
| **Configurația Symbai** | Vezi regula de mai jos |
| **Relația cu contabilul** și banii fără documente | Vezi `CLAUDE.local.md` și `docs/plan-reforma.md` |
| **Creditele** | Idem |

> **Symbai: doar citire.** Nimeni nu modifică nimic în Symbai fără acordul explicit al lui Andrei.
> Regula se aplică și asistenților, și oricărei sesiuni de Claude.

**Cifrele** — vânzări, profit, credite, salarii, bani fără documente — **nu sunt în manual**, și nu
din neglijență: manualul e scris ca să-l citească omul de la post. Ele stau în `CLAUDE.local.md`,
local, și în `docs/plan-reforma.md` partea fără sume.

## Ce trebuie să **înceteze** să fie al lor

Ținta de cinci ani e ieșirea din operarea zilnică prin sisteme. Practic, asta înseamnă ca lucrurile de
mai jos să nu mai ajungă la ei:

- **aprobările zilnice** — un produs din partea casei, o oră de program, o comandă de marfă;
- **verificarea închiderii de casă** — e a [managerului](manager-locatie.md), la 9:30;
- **escaladarea pentru orice** — pasul 5 din `plan-reforma.md` prevede escaladare la administratori
  doar pentru sarcinile critice, după manager, cu o oră întârziere;
- **răspunsul la întrebări care au răspunsul scris** în manual. Dacă o întrebare revine, lipsește o
  pagină — se scrie pagina, nu se răspunde a treia oară.

> **Testul manualului:** dacă într-o săptămână normală niciun administrator nu a fost întrebat ceva
> care e deja scris aici, manualul funcționează. Dacă a fost, lipsește o pagină sau nu se citește.

## Ritmul lor, la Drunken Rat

Nu zilnic — ăsta e tot rostul. **Lunar**, pe locație:

| Ce se citește | De unde |
|---|---|
| Cost de personal, % din vânzări | Referința DR: 25,2% (20–22 oct) |
| Lipsa la inventar față de rețete, pe gestiune | Dar **numai dacă** inventarul s-a terminat — vezi mai jos |
| Consumabile operaționale, % din vânzări | Azi 3,78%, în creștere de la 2,94% |
| Vânzări față de anul trecut | DR la −8,3%, cel mai mult luni și marți |
| Diferențele de casă, însumate | Din formularele de închidere |
| Zile lipsă din fișa HACCP | Lunar |
| **Linii de inventar numărate din deschise** | Azi 5–7%. Indicator de proces, înaintea celui de rezultat |
| Produse cu **stoc negativ**, pe gestiune | Ținta e zero |

### Un avertisment pe care nu-l dă nimeni altcineva

> **Nu cereți socoteală pe un procent de lipsă până nu e curată evidența.** La Drunken Rat, 45,7% din
> liniile de inventar de bucătărie și 31,8% din cele de bar stăteau pe **stoc negativ** — marfă
> vândută înainte de a fi înregistrată la recepție. Liniile ies aproape jumătate plus, jumătate minus,
> ceea ce nu arată furt, arată evidență ruptă.
>
> Un bonus negat pe baza unei cifre din evidența asta se va dovedi, la primul inventar corect,
> nedrept — și atunci se pierde și cifra, și încrederea în sistem.
>
> Detalii: [inventarul critic](../proceduri/inventarul-critic.md) și
> [recepția cântărită](../proceduri/receptia-cantarita.md).

## Procedurile lor

Nu execută proceduri de locație. **Verifică** rezultatele lor, lunar, din tabelul de mai sus.

Ce au totuși de făcut în aplicație:

- **Alex trebuie trecut pe rolul `owner`** — încă nu e. Până atunci nu vede tot.
- **Crearea conturilor din aplicație** e pasul 2 din `plan-reforma.md`, și e rezervată rolului `owner`.
- **Migrările se testează local înainte**, cu un cont de probă pe rol, și abia apoi se aplică pe baza
  live (varianta B).

---

## Deciziile care blochează manualul

Adunate din toate paginile. Fără ele, manualul nu se poate termina — nu pentru că n-am ce scrie, ci
pentru că ar fi scris pe presupuneri.

### A. Decizii de administratori

1. **Ponderile KPI pentru managerul de la Drunken Rat.** La Astur sunt decise; la DR situația e
   inversă — personalul e bun, consumabilele sunt rele, vânzările scad. Nu se pot copia.
2. **Structura de bonus pentru posturile fără una:** șef de tură, ospătar, barman, bucătar, ambalare,
   vase și curățenie. Azi niciunul nu are. De remarcat asimetria: **șeful de tură decide în fiecare
   noapte dacă managerul își ia condiția de bază**, dar el nu are nicio parte variabilă.
3. **Trecerea bonusurilor pe stat**, pentru toată schema.
4. **Cine aprobă „din partea casei" la DR și până la ce valoare.** La Astur toate aprobările trec prin
   contul lui Alex; la DR nu e stabilit.
5. **Cine e șef de tură, pe ce ture**, și dacă primește o indemnizație. Postul nu există separat în
   structura de iarnă.
6. **Un bucătar desemnat pe tura de seară.** Fără el, procedura de la 15:00 n-are proprietar după
   plecarea șefului de bucătărie.
7. **Fondul de rest** al casei — o sumă fixă. Fără ea, „casa de deschidere e corectă" nu înseamnă
   nimic.
8. **Ora și modul depunerii**, cu programul până la 02:00: managerul dimineața, sau bancomat de
   depuneri.
9. **Bacșișul de card plătit pe salariu**, lunar, în loc de cash din casă. Ar închide gaura de ~4.800
   lei pe lună. De verificat cu contabilul.

### B. Reparații în Symbai — **doar cu acordul lui Andrei**

10. **Tara și densitatea sticlelor** pe produsele de bar. Barul se cântărește deja corect, dar
    conversia se face pe lângă sistem, deci nu se poate verifica după fapt cine a greșit.
11. **Tip de produs separat pentru obiecte de inventar**, și mutarea durabilelor acolo. Azi un singur
    produs e marcat așa în tot Symbai; restul, ~3.000 lei pe lună, stau la Consumabile.
12. **Comisioanele pe platforme**, necompletate pe niciun canal, și **costul măslinelor tempura**,
    care blochează raportul de profit pe livrări.
13. **Marcarea ridicării personale** — pașii concreți pe casă sau pe telefon, ca „se marchează" să fie
    o instrucțiune.

### C. Măsurători care lipsesc — nu se pot inventa

14. **Bon mediu la Drunken Rat.** Nu s-a măsurat. Fără el nu se știe dacă scăderea de 8,3% e mai
    puțini clienți sau clienți care consumă mai puțin — două probleme diferite, cu două soluții.
15. **Cât costă masa personalului la DR.** Niciodată măsurat. Prima lună scrisă pe ingrediente dă
    cifra.
16. **Inventar lunar pe `Consumabile Drunken`** — zero sesiuni vreodată, deci cifra de consumabile e
    cumpărare, nu consum. Până atunci, orice prag de KPI pedepsește cumpărarea în cantitate.
17. **Un inventar complet, pe stoc pozitiv**, la bucătărie și la bar. Abia după el se pot fixa ținte
    pe lipsă.
18. **Cât durează închiderea** după 02:00, ca să se știe la ce oră pleacă omul de fapt.

### D. Liste de stabilit, cu oamenii de la post

19. **Lista de inventar critic DR**, 3–5 produse. Propunerea: coaste, carne de burger, rață.
20. **Lista scurtă de bar**, din cele 603 produse.
21. **Lista de ambalaje folosite efectiv**, 4–5 tipuri.
22. **Lista de motive de pierdere**, confirmată cu șeful de bucătărie de la DR — separat de Astur.
23. **Zonele și frecvențele de curățenie.**
24. **Limitele de temperatură** pe fiecare echipament, scrise pe fișa HACCP.
25. **Orele reale ale rutinelor** pe locație — tot manualul are ore propuse, nu confirmate.

### E. Achiziții de decis

26. **Jigger sau dozatoare pe sticlă** la bar. Dozatoarele rezolvă gramajul singure la băuturile de
    bază, dar costă și schimbă viteza de lucru.
27. **Un cântar conectat la Symbai.** Există suport în sistem, niciun cântar configurat. De verificat
    ce modele acceptă înainte de a cumpăra.

---

## De calibrat

- **Ritmul de verificare:** lunar e propunerea mea. Până se stabilizează disciplina banilor, poate
  trebuie săptămânal pe diferențele de casă și pe stocul negativ.
- **Cine vede rapoartele financiare.** În grupul lui Banuț sunt și alți membri în afară de
  administratori — întrebare deschisă din `CLAUDE.md`.
- **Ce se întâmplă când manualul contrazice realitatea.** Regula de acum: se corectează manualul, nu
  se ignoră. Dar cineva trebuie să fie responsabil să o facă — azi nu e nimeni.
