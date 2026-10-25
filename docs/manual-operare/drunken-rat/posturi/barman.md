# Barman — Drunken Rat

**Rol în aplicație:** nu are rol separat — intră pe locație ca restul echipei de sală
**Locația:** Drunken Rat (Symbai: „Unirii", id 2) · **Depinde de:** [șeful de
tură](sef-tura.md), peste el [managerul](manager-locatie.md)
**Câți:** **2** în structura de iarnă · **Programul locației:** 11:00–02:00

> La **Astur** nu există post de barman dedicat, iar barul de acolo aproape nu pierde (~0% lipsă față
> de rețete). Pagina asta e despre barul de la Drunken Rat, care pierde +2,6%.

---

## Ce răspunde

Drunken Rat e **pub / gastro bar**. Barul nu e un raft lângă bucătărie — e jumătate din identitatea
locației și, iarna, cu doar interior, e locul unde se stă.

Ce ține de postul ăsta și de nimeni altcineva:

1. **Gramajul turnat** — exact cât scrie în rețetă, nu „cât se vede bine".
2. **Ca fiecare pahar turnat să fie bonat.**
3. **Țigările.**
4. **Stocul de bar** — ce e în raft să fie și în Symbai.

### De ce gramajul e tot postul

La bar, lipsa față de rețete e **+2,6%** (la Astur ~0). Pare puțin. Nu e, și motivul e important:

> **La bar nu există pierdere de preparare.** O bucată de carne se fasonează, se gătește, scade — de
> aici vine o parte din lipsa bucătăriei, și e explicabilă. **O sticlă, nu.** O sticlă are un număr
> fix de porții în ea, calculat la gram. Dacă din ea ies mai puține porții bonate decât ar trebui,
> există trei explicații care depind de bar:
>
> 1. s-a turnat **peste gramaj**;
> 2. s-a turnat și **nu s-a bonat**;
> 3. s-a **spart sau vărsat**, și nu s-a trecut la pierderi.

Toate trei se repară la fel: **măsoară** și **bonează pe loc**.

**Există și o a patra, care nu e a barului:** stocul din Symbai era greșit înainte să toarne cineva
ceva. Nu e teorie — se vede în date, și e mai mare decât ar trebui. Vezi secțiunea de mai jos.

De asta barul rămâne singurul loc din casă unde lipsa se poate explica **exact** — dar numai după ce
evidența e curată. Până atunci, „+2,6%" nu e o măsurătoare a turnatului.

## Inventarul de bar: se cântărește

Barul **nu se estimează din ochi** și nu se numără doar la sticle întregi. Sticla deschisă se
**cântărește**, se scade tara, și rezultatul se trece în litri. Se vede în Symbai: cantitățile
numărate au trei zecimale — 0,854 l de Chivas, 1,784 l de Beefeater, 0,386 l de Malfy Rosa. Alea nu
sunt cifre estimate, sunt cifre de pe cântar. **Metoda e corectă.**

Problema nu e metoda, e că **toată partea de calcul se face pe lângă sistem.** Ce am verificat în
Symbai pe 25.10.2026:

| Ce | Starea |
|---|---|
| Tara sticlelor, pe produs (`tare_weight_kg`) | **0 din 603** produse de bar |
| Densitatea, pe produs (`density_kg_per_l`) | **0 din 603** |
| Conținutul net declarat | **0 din 603** |
| Cântar conectat la Symbai | **niciunul** |
| Linii de inventar cu greutatea brută și tara trecute | **0 din 2.457**, pe toată firma |

Symbai are câmpurile pentru exact fluxul ăsta: pui tara și densitatea o dată pe produs, treci la
inventar **greutatea brută**, și conversia în litri o face el, identic de fiecare dată. Azi conversia
o face omul, din tară ținută minte sau pe hârtie, cu o densitate presupusă.

**De ce contează:** o aceeași sticlă cântărită de doi barmani diferiți poate ieși cu două cantități
diferite, și nimeni nu poate verifica după fapt care a greșit — pentru că în sistem a intrat doar
rezultatul, nu greutatea de pe cântar. Cu brutul trecut, se poate reface calculul oricând.

> **Nu am modificat nimic în Symbai** — doar am citit. Completarea tarei și a densităților e o decizie
> de luat, și e descrisă la „de calibrat".

### Două lucruri rupte în evidența barului

Astea nu sunt ale barmanului, dar îl costă pe el la inventar, deci trebuie să le știe.

**1. Inventarul se deschide și se abandonează.** Între 25.09 și 23.10 au fost **14 sesiuni** de
inventar la Bar Drunken Rat, cu 7.367 de linii deschise. **Numărate efectiv: 402.** Adică 5% — cam o
sesiune, întinsă pe 14. Un inventar neterminat nu e un inventar parțial, e zero: diferența pe
produsele nenumărate rămâne necunoscută și se adună la luna următoare.

**2. O treime din liniile numărate stăteau pe stoc negativ.** Din cele 402 linii numărate la Bar DR,
**128 (31,8%)** aveau în Symbai o cantitate așteptată **sub zero**. Stoc negativ înseamnă un singur
lucru: s-a vândut din marfă care nu era încă înregistrată ca recepționată. Apoi vine inventarul,
găsește sticlele, și iese **plus**. De aceea liniile sunt aproape pe jumătate plus (168) și pe
jumătate minus (192) — un bar care fură iese constant pe minus, nu jumătate-jumătate.

> **Concluzia, spusă direct:** o parte din cele +2,6% nu e marfă pierdută, e **recepție înregistrată
> târziu**. Cât anume, nu se poate spune până nu se termină un inventar întreg pe stoc pozitiv.
> Recepțiile de bar sunt ale [managerului](manager-locatie.md).

## Ziua lui

### La începutul turei

| Ce | Detaliu |
|---|---|
| **Stocul de lucru** | Ce lipsește se cere **acum**, nu la 20:00 când se termină. Lipsa de la bar într-o seară plină e vânzare pierdută, nu inconvenient |
| **Țigările** | Numărate la preluare. Se predau numărate |
| **Frigiderele și vitrinele** | Temperaturile de deschidere le trece șeful de tură în fișa HACCP. Pe tură, ușile închise și termometrul citit sunt ale barmanului |
| **Scurgerile** | Pompe, tubulatură de bere, garnituri. Berea vărsată la cuplare se trece la pierderi, nu „se pierde" |

### Pe tură

**Se toarnă la măsură.** Jigger sau dozator, nu din ochi. Diferența dintre 50 ml estimați și 50 ml
măsurați e, la o seară plină, câteva porții pe sticlă — exact cele 2,6%.

**Se bonează înainte de a se turna, nu după.** Bonarea de la final de seară, „din memorie", e
mecanismul care produce lipsa. Un pahar turnat și nebonat nu se mai recuperează niciodată: la inventar
apare ca lipsă pe numele barului.

**Nimic gratuit fără aprobare.** Un shot oferit, o bere pentru un client nemulțumit, ceva pentru
echipa de la masa din colț — se **bonează** ca din partea casei, cu motiv și cu aprobarea cui are
drept. Nu se „uită". Un produs dat gratis și bonat corect e o decizie de marketing; unul dat gratis și
nebonat e lipsă de inventar.

**Ce se sparge sau se varsă se trece la pierderi**, cu cantitatea și motivul. Un pahar scăpat e un
accident normal. Un pahar scăpat și nescris devine, la sfârșit de lună, suspiciune.

> **Ce nu e scris, nu s-a întâmplat.** Marfa consumată și neînregistrată apare la inventar ca lipsă,
> pe numele barului. Nu există apărare retroactivă.

### Țigările — gestiune separată, regulă separată

Țigările stau în Symbai pe gestiunea lor (`Tigari`), nu la Bar, și se **revând aproape la cost**.

Consecința practică: **nu există marjă care să absoarbă o lipsă.** La o băutură, un pahar pierdut se
acoperă din marja celorlalte. La un pachet de țigări, nu se acoperă din nimic — pierzi exact banii.
De asta se numără la preluare și la predare, de fiecare dată.

> **Azi nu se numără deloc.** Gestiunea `Tigari Drunken` are 11 produse și, în Symbai, **zero sesiuni
> de inventar** — niciuna, vreodată. (La Astur există două, ambele din 25.09.) Verificat pe
> 25.10.2026. Sunt 11 produse: se numără în două minute.

Țigările **nu intră** în calculul lipsei bucătăriei (umflau procentul cu ~2 puncte fără nicio legătură
cu mâncarea). Sunt ale barului și ale managerului.

### Bacșișul pe card

Dacă primești bacșiș pe card și ți se dă cash din casă, suma iese **cu bon de ieșire și semnătura
ta.** Nu e birocrație și nu e neîncredere: pe firmă, ~4.800 lei pe lună încasați pe card nu ajung în
bancă, iar explicația cea mai probabilă e exact asta — bani plecați corect, fără nimic care să
dovedească unde.

Semnătura ta e dovada care te apără pe tine primul. Vezi
[Închiderea zilei](../proceduri/inchiderea-zilei.md), pasul 4.

### La închidere

Dacă barmanul e și **șef de tură** pe seara aceea — se întâmplă, postul de șef de tură nu există
separat în structura de iarnă — atunci execută [închiderea zilei](../proceduri/inchiderea-zilei.md)
întreagă și citește [pagina de șef de tură](sef-tura.md).

Dacă nu, barul se închide cu:

1. **Cântărirea** produselor din lista de [inventar critic](../proceduri/inventarul-critic.md)
   (*listă de stabilit — vezi mai jos*), sticla deschisă la cântar, tara scăzută;
2. **pierderile trecute**, cu motiv;
3. **țigările predate**, numărate;
4. frigiderele închise, scurgerile curățate;
5. ce lipsește pentru mâine, **scris** la predarea turei — nu spus.

## Procedurile lui

- [Închiderea zilei](../proceduri/inchiderea-zilei.md) — doar dacă e șef de tură pe seara aceea
- [Inventarul critic zilnic](../proceduri/inventarul-critic.md) — partea de bar, cântărită; lista scurtă încă de stabilit
- [Recepția cântărită](../proceduri/receptia-cantarita.md) — bar și țigări; o face managerul, barmanul verifică la preluare
- [Deschiderea turei](../proceduri/deschiderea-turei.md) — partea de bar
- [Predarea turei](../proceduri/predarea-turei.md)

## Ce i se măsoară

> **Pentru postul ăsta nu există structură de bonus.** Decisă e doar pentru manageri și șefi de
> bucătărie. *Decizie deschisă de administratori.*

Ce se măsoară oricum:

| Indicator | Ținta |
|---|---|
| **Inventar terminat** | **Toate liniile deschise, numărate.** Azi 5%. Fără asta, indicatorul următor nu înseamnă nimic |
| **Lipsa la bar față de rețete** | Azi **+2,6%**, dar cifra e necredibilă până la inventarul întreg. Ținta sub 1% se fixează **după** două inventare complete, pe stoc pozitiv |
| **Pierderi trecute cu motiv** | Toate. Un bar care raportează zero pierderi lunar nu e un bar atent, e un bar care nu scrie |
| **Lipsa la țigări** | **Zero.** Nu e procent, e numărătoare. Azi nu se numără deloc |
| **Produse date gratuit, bonate** | Toate, cu motiv și aprobare |

Și indicatorul care contează cu adevărat: **cât din lipsa de la bar rămâne neexplicată după
pierderile scrise.** Un barman care trece corect 3 pahare sparte stă mai bine decât unul care nu
trece nimic și are 3 pahare lipsă.

## Ce NU intră în sarcina lui

> **Comenzile de bar.** Semnalează ce lipsește; comandă și recepționează
> [managerul](manager-locatie.md). Consumabilele (pahare, șervețele, paie) sunt în KPI-ul
> managerului, nu al barului.

> **Prețurile și rețetele de cocktail.** Rețetele sunt în Symbai și **sunt bune** — consumul teoretic
> pe grup e ~28,6%. Nu se „ajustează" la bar. Dacă o rețetă e greșită, se spune, se corectează în
> Symbai, și de atunci se toarnă după ea.

> **Banii din casă**, dacă nu e el șef de tură.

> **Marfa din bucătărie.**

## De calibrat

**În ordinea asta** — primele două fac cifrele credibile, restul le folosește.

1. **Un inventar de bar dus până la capăt**, pe toate liniile, cu recepțiile înregistrate înainte ca
   să nu mai existe stoc negativ. Până atunci, orice procent de lipsă e discutabil și nu se poate
   cere nimănui socoteală pe el. *E cel mai important punct deschis al postului, și nu e al
   barmanului — e al managerului.*
2. **Tara și densitatea, puse în Symbai**, pe produsele de bar (`tare_weight_kg`,
   `density_kg_per_l`, conținutul net), și trecerea la înregistrarea **greutății brute** la inventar.
   Tara există deja, dar pe hârtie sau în cap. Mutată în sistem: conversia devine identică de fiecare
   dată, se poate verifica după fapt, și nu mai depinde de cine a cântărit. **Decizie de Andrei** —
   Symbai nu se modifică fără acordul lui.
3. **Lista de inventar zilnic de bar** — nu tot barul: produsele scumpe pe porție și cele cu cel mai
   mare rulaj. Inventarul complet rămâne lunar; lista scurtă se cântărește zilnic.
4. **Cu ce se măsoară la turnat:** jigger, dozatoare pe sticlă, sau amândouă. Dozatoarele rezolvă
   gramajul singure la băuturile de bază, dar costă și schimbă viteza de lucru. Decizie de
   administratori, cu un cost de echipament.
5. **Un cântar conectat la Symbai.** Există suport în sistem și niciun cântar configurat. Ar scoate
   complet transcrierea manuală. De verificat ce cântare acceptă Symbai înainte de a cumpăra.
6. **Cât de des se numără țigările** — propun la fiecare predare de tură. 11 produse.
7. **Dacă barmanul poate fi șef de tură** și pe ce seri.

### Cum se află, în final, de unde vin cele 2,6%

Numai după punctele 1–3. Atunci, lista scurtă cântărită zilnic două săptămâni spune care din două:

- **lipsă mică și constantă, pe toate produsele** → e **gramaj**. Se rezolvă cu punctul 4.
- **lipsă mare pe câteva produse, în anumite ture** → e **bonare**. Se rezolvă altfel, și se vede cine.

Dacă după curățarea evidenței lipsa aproape dispare, atunci n-a fost niciodată o problemă de bar.
