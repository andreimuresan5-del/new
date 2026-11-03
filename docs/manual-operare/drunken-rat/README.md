# Manualul Drunken Rat

Pub / gastro bar, Str. G. Coșbuc nr. 1, Timișoara. Deschis zilnic **11:00–02:00**.
Locația „Unirii" în Symbai (id 2).

[← înapoi la manualul grupului](../README.md) · [manualul Astur](../astur/)

---

## Ce trebuie să știi despre locația asta înainte de orice procedură

**Programul lung.** Se închide după 02:00. Toate procedurile de bani se lovesc de asta: banca e
închisă, deci depunerea nu se poate face în aceeași zi. Vezi
[Închiderea zilei](proceduri/inchiderea-zilei.md).

**Iarna: doar interior.** 9 mese, maxim 60 de persoane. Capacitatea e plafonul: nu se rezolvă o seară
slabă cu mai multe locuri, ci cu bon mediu și cu livrare.

**Bucătăria are 3 stații:**

1. salate și focaccia;
2. aragaz + friteuza 1 — tempura și pané;
3. plancha/grill + friteuza 2 — doar cartofi.

Cuptorul e **numai pentru producție**, nu pentru linie. Coastele și rața se încălzesc la microunde.
**Nu există Josper la Drunken Rat** — cărbunele și lemnul sunt doar la Astur.

**Oameni în bucătărie:** 4 până la 15:00, 3 după. De aici vine și intervalul mort de la 15:00.

**Se vând țigări.** Contează la bani (se revând aproape la cost) și **nu intră** în calculul lipsei de
marfă a bucătăriei.

## Vânzările, ca să se înțeleagă unde apasă

Drunken Rat **scade**: −8,3% la 19 octombrie față de 2025 (H1 −9,9%, iul–oct −5,7%). Cel mai mult pe
**luni și marți**. În schimb e locația profitabilă: în zilele 20–22 octombrie a dat rezultat pozitiv,
cu marfă 29,6% și personal 25,2% din vânzări — iar Astur, în aceeași perioadă, pierdere.

Lipsa la inventar față de rețete: **bucătărie +4,7%**, **bar +2,6%**. Mult mai puțin decât la Astur
(+18,5% bucătărie), de aceea ținta e de la început sub 5%, fără perioadă de tranziție.

## Posturile de la Drunken Rat

| Post | Rol în aplicație | Stare |
|---|---|---|
| [Manager de locație](posturi/manager-locatie.md) | `location_manager` | **scris** |
| [Șef de bucătărie](posturi/sef-bucatarie.md) | `head_chef` · Symbai: `Sef Bucatarie` (id 27) | **scris** |
| [Șef de tură](posturi/sef-tura.md) | `shift_lead` | **scris** |
| [Bucătar](posturi/bucatar.md) | — | **scris** |
| [Ospătar](posturi/ospatar.md) | — | **scris** |
| [Barman](posturi/barman.md) | — | **scris** |
| [Vase și curățenie](posturi/vase-curatenie.md) | — | **scris** |
| [Ambalare (livrare)](posturi/ambalare.md) | — | **scris** — post care la Astur nu există separat |
| [Administrator](posturi/administrator.md) | `owner` | **scris** — ce rămâne la voi, plus **lista deciziilor care blochează manualul** |

### Structura de iarnă, decisă anterior — 15 oameni, **plus managerul**

4 ospătari · 2 barmani · 4 bucătari pe rotație 3 zile lucrate / 1 liberă (mereu 3 la lucru) ·
1 șef de bucătărie · 2 oameni pentru vase și curățenie · 1 la ambalare · 1 pe proiectul de brand nou
de livrare.

**Managerul de locație nu era în lista aia de 15** — există, confirmat pe 25.10.2026, deci echipa de
iarnă e de **16 oameni**. Contează la calculul costului de personal pe zi: cu un om mai mult decât
s-a numărat când s-a făcut structura.

## Procedurile de la Drunken Rat

> **Din 03.11.2026 procedurile rulează în Symbai**, ca liste de sarcini recurente cu rol, tură,
> oră-limită, reamintire la −30 de minute și escaladare la manager (+30) și la administratori (+90,
> doar pentru sarcinile critice). Pașii care contează cer dovadă: numărul numerarului numărat, poza
> plicului, temperaturile, litrii de ulei.
>
> **Împărțeala e simplă: Symbai ține pașii, manualul ține motivul.** Omul vede sarcina zilnic; pagina
> de aici o citește o dată, când preia postul, și când nu înțelege de ce. Când se schimbă un pas, se
> schimbă în amândouă.
>
> Cele 8 proceduri au intrat în 6 liste: închiderea zilei (#4) · deschiderea turei (#5) · dimineața
> în bucătărie, cu HACCP, inventarul critic și recepția cântărită (#6) · energie în intervalul mort
> (#7) · formularul de seară, cu masa personalului (#8) · ziua managerului (#9). Predarea turei e un
> pas în #4 și în #5.
>
> **Adăugate pe 04.11.2026**, la cererea lui Andrei: în **#6** trei dovezi HACCP zilnice cu poză
> (fișele de temperatură completate · frigiderele și termometrele · fișa de schimbare a uleiului) plus
> **probele de laborator** pe numele lui Luci, critică, termen 07.11. În **#9** reconcilierea casei
> la ora 10:00 — numerarul numărat față de fila de registru, cu diferența în lei, critică.
>
> **Șefii de tură sunt Ana și Adi** (confirmat de Andrei, 03.11.2026), amândoi trecuți în Symbai pe
> rolul `Sef Tura Sala`, care primește listele #4 și #5. Rolul n-avea dreptul de a vedea sarcinile —
> adăugat, împreună cu registrul de casă.
>
> **Sarcina ajunge la cine e azi în tură sau în program, nu la rol** (verificat pe 04.11.2026: Ana și
> Adi, același rol, aceeași zi — Adi pontat primește 12 sarcini, Ana cu tura închisă primește zero).
> Sunt **două căi**: pontajul, sau programul din Planificator. **Logarea nu e niciuna din ele** —
> aplicația ținută deschisă nu pune pe nimeni în tură.
>
> La Drunken Rat, azi: pontaj da (barul și sala 30 de zile din 31, **bucătăria 5, managerul 11**),
> **program în Planificator — niciodată.** De aceea listele #6, #7, #8 și #9 sunt încărcate corect și
> nu ajung la nimeni. Din noiembrie indicatorul „sarcini la timp" cântărește **25 din 100** în bonusul
> managerului, pe toată locația.
>
> **Drumul cel mai scurt e programul.** Managerul are oricum sarcina de la 16:00 „programul de mâine
> față de vânzarea estimată" — făcut în Planificator și nu pe hârtie, toți cei programați își văd
> listele a doua zi, fără să depindă de cine bate intrarea.
>
> **Și încă una:** instanțele zilei se creează **la prima deschidere** a ecranului de sarcini, nu
> peste noapte, și **nu se generează retroactiv**. O zi în care nimeni nu deschide sarcinile nu lasă
> nicio urmă — nici pentru KPI, nici pentru un control. De aceea aplicația trebuie să fie pe primul
> ecran al celui care începe tura.

| Procedură | Cine o execută | Ce apără |
|---|---|---|
| [Recepția cântărită](proceduri/receptia-cantarita.md) | Șef de bucătărie · manager pentru bar, țigări, consumabile | Cantitatea plătită, și **stocul negativ**: 45,7% din liniile de bucătărie, 31,8% din cele de bar |
| [Inventarul critic zilnic](proceduri/inventarul-critic.md) | Șef de bucătărie · barman | Timpul până afli de o lipsă: a doua zi, nu peste o lună |
| [Deschiderea turei](proceduri/deschiderea-turei.md) | Șef de tură | Casa de deschidere, marfa stricată peste noapte, HACCP |
| [Închiderea zilei](proceduri/inchiderea-zilei.md) | Șef de tură, verificată de manager | Cash peste plafon, încasările de card care nu ajung în cont |
| [Formularul de seară al bucătăriei](proceduri/formular-seara-bucatarie.md) | Șef de bucătărie | Consumul neînregistrat — ~45% din lipsuri |
| [Masa personalului](proceduri/masa-personalului.md) | Șef de bucătărie | Marfa echipei, trecută pe ingrediente și nu ca „din partea casei" |
| [Predarea turei](proceduri/predarea-turei.md) | Toți | Ce rămâne nerezolvat între ture |
| [Energie în intervalul mort](proceduri/energie-interval-mort.md) | Șef de tură bucătărie | GPL-ul, curentul, durata de viață a uleiului |

**De scris:**

1. **Ambalarea pentru livrare, pas cu pas** — după ce se stabilește lista de ambalaje folosite
   efectiv. Postul [ambalare](posturi/ambalare.md) e scris; procedura detaliată, nu.
2. **Comanda de consumabile** — după ce se lămurește creșterea din septembrie. *Vezi „de calibrat".*
3. **Transferul între locații** — după ce modulul intră pe live.

## Evidența nu e curată — de citit înainte de a cere socoteală cuiva

Verificat în Symbai pe 25.10.2026, perioada 25.09–24.10. Afectează **orice** procent de lipsă din
manual:

| Gestiune | Linii deschise la inventar | Numărate | Din numărate, pe **stoc negativ** |
|---|---|---|---|
| Bucătărie Drunken Rat | 8.950 | **623 — 7%** | **285 — 45,7%** |
| Bar Drunken Rat | 7.367 | **402 — 5%** | **128 — 31,8%** |
| `Tigari Drunken` (11 produse) | — | **0 sesiuni, vreodată** | — |
| `Consumabile Drunken` (74 produse) | — | **0 sesiuni, vreodată** | — |

Trei consecințe:

1. **Lipsa de +4,7% la bucătărie și +2,6% la bar nu e credibilă** până la un inventar complet pe stoc
   pozitiv. Stocul negativ înseamnă marfă vândută înainte de a fi înregistrată la recepție — vine
   inventarul, găsește marfa, iese plus. De aceea liniile ies aproape jumătate plus, jumătate minus.
2. **Inventarul se deschide și se abandonează**, la amândouă gestiunile. 25 de sesiuni cu 7% din
   linii numărate e mai rău decât un singur inventar făcut complet.
3. **Consumabilele nu se inventariază niciodată**, deci cifra lunară nu e consum — e **cumpărare**.
   Creșterea de la 2,94% (august) la 3,78% (septembrie) poate fi doar o lună în care s-a cumpărat mai
   mult. Detaliile și ce înseamnă pentru KPI: [inventarul critic](proceduri/inventarul-critic.md).

Se repară cu [recepția la timp](proceduri/receptia-cantarita.md) și cu
[inventarul dus până la capăt](proceduri/inventarul-critic.md).

## De calibrat la Drunken Rat

- **Lista de inventar critic.** La Astur e deja definită (pui, ceafă, obrăjori, burrata, mozzarella),
  pentru că acolo s-au văzut lipsurile. La DR trebuie aleasă altfel: din produsele cu cea mai mare
  valoare pe kilogram și cel mai mare consum — propunerea e coaste, carne de burger, rață.
- **Tara și densitatea sticlelor, în Symbai.** Barul se cântărește deja, dar conversia se face pe
  lângă sistem. **Decizie de Andrei** — Symbai nu se modifică fără acordul lui.
- **Inventar lunar pe `Consumabile Drunken`**, fără care KPI-ul de consumabile măsoară cumpărarea.
- **Pontajul în bucătărie și al managerului.** 5 zile din 31 la bucătărie, 11 la manager (octombrie).
  Cât timp nu se pontează, niciuna din procedurile de bucătărie nu ajunge la om, oricât de bine e
  scrisă. **Primul lucru de rezolvat din tot capitolul de sarcini.**
- ~~Rol și PIN pentru șeful de bucătărie~~ — **făcut pe 04.11.2026.** LUCIAN-ELVIS CURCA e pe rolul
  nou `Sef Bucatarie` (36 de drepturi, zero avertismente de acces), cu cont activ și PIN generat de
  server; ecusonul se tipărește din Personal → Listă Personal. Listele #6 și #8 sunt pe rolul lui.
  **Scorecardul lui se poate face acum** — nu mai e blocat de lipsa rolului.
- **Formularul de seară (#8) are termen 23:00 și e al șefului de bucătărie.** Dacă el pleacă la
  15:00, ori ora e greșită, ori proprietarul. **De ales una din două.**
- **Un bucătar desemnat pe tura de seară** — procedura de energie de la 15:00 n-are proprietar după
  plecarea șefului de bucătărie.
- **Ora la care managerul duce plicul la bancă** dimineața, din cauza programului până la 02:00.
- **Fondul de rest** al casei.
- **Limitele de temperatură** pe fiecare echipament, scrise pe fișa HACCP.
