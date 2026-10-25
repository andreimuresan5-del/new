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
| [Șef de bucătărie](posturi/sef-bucatarie.md) | `head_chef` | **scris** |
| [Șef de tură](posturi/sef-tura.md) | `shift_lead` | **scris** |
| Bucătar | — | de scris |
| Ospătar | — | de scris |
| Barman | — | de scris |
| Vase și curățenie | — | de scris |
| Ambalare (livrare) | — | de scris — post care la Astur nu există separat |
| Administrator | `owner` | de scris la final |

### Structura de iarnă, decisă anterior — 15 oameni, **plus managerul**

4 ospătari · 2 barmani · 4 bucătari pe rotație 3 zile lucrate / 1 liberă (mereu 3 la lucru) ·
1 șef de bucătărie · 2 oameni pentru vase și curățenie · 1 la ambalare · 1 pe proiectul de brand nou
de livrare.

**Managerul de locație nu era în lista aia de 15** — există, confirmat pe 25.10.2026, deci echipa de
iarnă e de **16 oameni**. Contează la calculul costului de personal pe zi: cu un om mai mult decât
s-a numărat când s-a făcut structura.

## Procedurile de la Drunken Rat

| Procedură | Cine o execută | Ce apără |
|---|---|---|
| [Închiderea zilei](proceduri/inchiderea-zilei.md) | Șef de tură, verificată de manager | Cash peste plafon, încasările de card care nu ajung în cont |
| [Formularul de seară al bucătăriei](proceduri/formular-seara-bucatarie.md) | Șef de bucătărie | Consumul neînregistrat — ~45% din lipsuri |
| [Energie în intervalul mort](proceduri/energie-interval-mort.md) | Șef de tură bucătărie | GPL-ul, curentul, durata de viață a uleiului |

**De scris**, în ordinea banilor pe care îi apără:

1. **Recepția cântărită** — la DR lipsurile sunt mici, dar recepția cântărită e condiție de bază
   pentru bonusul șefului de bucătărie, deci procedura trebuie să existe.
2. **Inventarul critic zilnic** — lista pentru DR nu e încă stabilită. *Vezi „de calibrat".*
3. **Masa personalului** — bonată pe ingrediente, nu „din partea casei".
4. **Deschiderea turei** — checklist, temperaturi, casa de deschidere.
5. **Ambalarea pentru livrare** — postul există doar aici.

## De calibrat la Drunken Rat

- **Lista de inventar critic.** La Astur e deja definită (pui, ceafă, obrăjori, burrata, mozzarella),
  pentru că acolo s-au văzut lipsurile. La DR trebuie aleasă altfel: din produsele cu cea mai mare
  valoare pe kilogram și cel mai mare consum — coaste, carne de burger, rață.
- **Ora la care managerul duce plicul la bancă** dimineața, din cauza programului până la 02:00.
- **Fondul de rest** al casei.
