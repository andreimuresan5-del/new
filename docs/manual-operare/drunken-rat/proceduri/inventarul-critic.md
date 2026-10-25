# Inventarul critic zilnic — Drunken Rat

**Cine:** [șeful de bucătărie](../posturi/sef-bucatarie.md) pentru bucătărie;
[barmanul](../posturi/barman.md) pentru bar.
**Când:** **până la 12:00**, trimis [managerului](../posturi/manager-locatie.md).
**Unde se înregistrează:** Symbai, pe gestiunea corectă.

[← procedurile Drunken Rat](../README.md)

---

## Ce apără

Nu lipsa în sine. **Timpul până o afli.**

Un inventar lunar îți spune, pe 31, că lipsesc 8 kg de coaste. Nu îți spune în care zi, pe care tură,
cu ce preparat. Un inventar zilnic pe o listă scurtă îți spune **a doua zi** — când încă își amintește
cineva ce s-a întâmplat.

> Scopul nu e să numeri tot. Scopul e ca, atunci când lipsește ceva, să afli mâine, nu peste o lună.

Inventarul **complet** rămâne lunar. Lista scurtă se face zilnic.

## Lista scurtă nu e stabilită la Drunken Rat

La Astur există deja — pui, ceafă, obrăjori, burrata, mozzarella — și e aleasă pe fapte: exact pe ele
s-au văzut cele mai mari lipsuri.

La Drunken Rat lipsurile sunt mici (+4,7% bucătărie, +2,6% bar), deci lista nu se poate alege după
„unde pierdem". Se alege după **ce ar costa cel mai mult dacă s-ar pierde**: valoare mare pe kilogram
înmulțită cu rulaj mare.

**Propunerea mea, de confirmat:**

| Produs | De ce |
|---|---|
| **Coaste** | Produsul casei — peste 350.000 de porții în 14 ani. Orice procent pe el e bani |
| **Carne de burger** | Intră în trei din cele patru Icons: Ribs Burger, Black Angus Beef Burger |
| **Rață** | Valoare mare pe kilogram, se încălzește la microunde deci se porționează dinainte |

*De calibrat: lista se închide de șeful de bucătărie împreună cu managerul, din prețurile reale din
Symbai, nu din memorie. Trei până la cinci produse — mai multe nu se numără zilnic, mai puține nu
acoperă nimic.*

## Pașii

**1. Se numără înainte de prânz**, pe marfa de ieri, nu după ce intră comanda de azi. Altfel numeri
un amestec.

**2. Bucătăria se cântărește.** Marfa de bucătărie la Drunken Rat se mișcă în kilograme — 4.403 din
liniile de inventar sunt în unități de greutate. Se cântărește net, fără ambalaj.

**3. Barul se cântărește și el** — vezi mai jos, are o problemă proprie.

**4. Se trece în Symbai**, pe gestiunea corectă, în aceeași zi.

**5. Diferența față de așteptat se citește pe loc.** Dacă e mare, se caută explicația azi: o producție
nescrisă, o pierdere netrecută, masa personalului nebonată, o recepție neînregistrată. Toate patru au
locul lor — [formularul de seară](formular-seara-bucatarie.md),
[recepția](receptia-cantarita.md), [masa personalului](masa-personalului.md).

**6. Se trimite managerului până la 12:00.**

## Barul: se cântărește deja, dar pe lângă sistem

**Metoda e corectă.** Sticla deschisă se pune pe cântar, se scade tara, rezultatul se trece în litri.
Se vede în Symbai: cantitățile au trei zecimale — 0,854 l Chivas, 1,784 l Beefeater, 0,386 l Malfy
Rosa. Alea sunt cifre de pe cântar, nu din ochi.

Problema e că **tot calculul se face în afara sistemului.** Verificat pe 25.10.2026:

| Ce | Starea |
|---|---|
| Tara pe produs (`tare_weight_kg`) | **0 din 603** produse de bar |
| Densitatea (`density_kg_per_l`) | **0 din 603** |
| Conținutul net declarat | **0 din 603** |
| Cântar conectat la Symbai | **niciunul** |
| Linii de inventar cu greutatea brută trecută | **0 din 2.457**, pe toată firma |

Symbai suportă fluxul întreg: pui tara și densitatea **o dată** pe produs, treci la numărare
**greutatea brută de pe cântar**, și conversia în litri o face el, identic de fiecare dată.

Azi conversia o face omul, din tară ținută minte sau pe hârtie. Consecința practică: aceeași sticlă
cântărită de doi oameni poate ieși cu două cantități, și **nu se poate verifica după fapt cine a
greșit** — în sistem a intrat doar rezultatul, nu greutatea.

> **Symbai nu se modifică fără acordul explicit al lui Andrei.** Completarea tarei și a densităților e
> o decizie de luat, nu o reparație de făcut din mers.

## Trei lucruri rupte, care trebuie știute înainte de a cere socoteală

Verificate în Symbai pe 25.10.2026, perioada 25.09–24.10.

### 1. Inventarul se deschide și se abandonează

| Gestiune | Sesiuni | Linii deschise | **Numărate** |
|---|---|---|---|
| Bucătărie Drunken Rat | 25 | 8.950 | **623 — 7%** |
| Bar Drunken Rat | 14 | 7.367 | **402 — 5%** |

Un inventar neterminat nu e un inventar parțial, e **zero**: diferența pe produsele nenumărate rămâne
necunoscută și se adună la luna următoare. 25 de sesiuni deschise și una numărată, întinsă pe toate,
e mai rău decât un singur inventar făcut bine.

**De aici vine valoarea listei scurte:** 3–5 produse numărate complet, zilnic, spun mai mult decât
8.950 de linii deschise și nenumărate.

### 2. Stoc negativ pe jumătate din linii

**Bucătărie DR: 285 din 623 linii numărate (45,7%)** aveau în Symbai cantitate așteptată **sub zero**.
La bar: 128 din 402 (31,8%).

Stoc negativ = s-a vândut din marfă neînregistrată la recepție. Vine inventarul, găsește marfa, iese
plus — de aceea liniile ies 301 plus / 298 minus la bucătărie și 168 / 192 la bar, aproape
jumătate-jumătate. O bucătărie care pierde marfă iese constant pe minus.

> **Cât timp jumătate din linii sunt pe stoc negativ, lipsa calculată nu e o acuzație.** Se repară cu
> [recepția la timp](receptia-cantarita.md), și e reparația 0 a managerului.

### 3. Țigările și consumabilele nu se inventariază deloc

| Gestiune | Produse | Sesiuni de inventar, vreodată |
|---|---|---|
| `Tigari Drunken` | 11 | **0** |
| `Consumabile Drunken` | 74 | **0** |

**Țigările:** 11 produse, se numără în două minute, și se revând aproape la cost — nu există marjă
care să absoarbă o lipsă. Pierzi exact banii.

**Consumabilele: aici e o problemă de măsurare, nu de disciplină.** Dacă gestiunea nu se
inventariază niciodată, cifra lunară de „consumabile" nu poate fi consum — e **cumpărare**. Fără
inventar de început și de sfârșit de lună, consumul real nu se poate calcula; rămâne ce s-a intrat în
luna aceea.

Ce înseamnă concret: creșterea de la **2,94% în august la 3,78% în septembrie** la Drunken Rat poate
fi, în întregime, o lună în care s-a cumpărat mai mult — nu una în care s-a risipit mai mult. O
comandă mare de caserole făcută o dată la două luni arată ca o risipă în luna în care intră și ca o
economie în luna următoare.

> **Consecința pentru KPI:** un prag pus pe cumpărare, nu pe consum, îl pedepsește pe manager exact
> când cumpără bine — în cantitate, cu discount. De aceea pragurile de consumabile **nu intră în
> actul adițional până în ianuarie 2027**, iar primul pas nu e să se explice cifra, ci **să se
> inventarieze gestiunea `Consumabile Drunken`, lunar.** Vezi
> [pagina de manager](../posturi/manager-locatie.md).

---

## Ce NU se face

> **Nu se „numără din ochi".** Nici la bucătărie, nici la bar. Un nivel privit pe sticlă nu e o
> măsurătoare.

> **Nu se trece cantitatea așteptată ca și cum ar fi numărată.** E cel mai ușor lucru de făcut și
> distruge tot rostul procedurii: diferența iese zero și nimeni nu mai caută nimic.

> **Nu se deschide o sesiune de inventar care nu se termină.** Mai bine 3 produse numărate decât 500
> deschise.

---

## Cum se verifică

| Cine | Ce verifică | Când |
|---|---|---|
| Manager | Că lista scurtă a venit până la 12:00, numărată, nu estimată | Zilnic |
| Manager | Produsele cu **stoc negativ** pe fiecare gestiune | Săptămânal |
| Șef de bucătărie | La inventarul lunar: lipsa rămasă după ce scazi tot ce e scris | Lunar |
| Administratori | Procentul de linii numărate din liniile deschise | Lunar |

**Indicatorul de proces, înaintea celui de rezultat:** câte linii s-au numărat din câte s-au deschis.
Azi 5–7%. Fără el, procentul de lipsă e o părere.

---

## De calibrat

- **Lista scurtă de la Drunken Rat** — 3 până la 5 produse, din prețurile reale din Symbai.
  Propunerea: coaste, carne de burger, rață. *Punctul cel mai important.*
- **Lista scurtă de bar** — produsele scumpe pe porție și cele cu rulaj mare, din cele 603.
- **Tara și densitatea în Symbai** — decizie de Andrei.
- **Un cântar conectat la Symbai.** Există suport în sistem, niciun cântar configurat. De verificat
  ce modele acceptă înainte de a cumpăra.
- **Inventar lunar pe `Consumabile Drunken`** — fără el, KPI-ul de consumabile măsoară cumpărarea.
- **Țigările:** propun numărare la fiecare predare de tură. 11 produse.
