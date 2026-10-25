# Manual de operare — Drunken Rat SRL

Cum se lucrează, pe fiecare post. Scopul: **orice om nou să poată prelua un post citind o singură
pagină**, iar administratorii să nu mai fie singurii care știu cum merg lucrurile.

Manualul nu e terminat și nu trebuie să fie. Se scrie pe măsură ce se iau deciziile, se corectează
când realitatea îl contrazice, și se adaugă la el oricând.

---

## Cum e organizat

**[Posturi](posturi/)** — o pagină pentru fiecare post. Ce răspunde omul, programul zilei cu ore,
ce proceduri execută, ce i se măsoară, ce **nu** intră în sarcina lui.

**[Proceduri](proceduri/)** — pașii concreți, scriși o singură dată și folosiți din mai multe posturi.
Închiderea zilei e aceeași procedură fie că o face șeful de tură de la Drunken Rat sau cel de la Astur.

Un post trimite la procedurile lui. O procedură nu se repetă în pagina fiecărui post — se linkează.
Așa, când se schimbă o procedură, se schimbă într-un singur loc.

## Cum se modifică

Manualul stă în proiectul aplicației, pe GitHub, deci are istoric: se vede cine a schimbat ce și când,
și se poate reveni.

- **Modificare de conținut** (o oră, un prag, un pas nou): se cere lui Claude, se scrie, se face
  `git pull` pe calculator. Nu se editează în două locuri deodată.
- **Decizii care privesc oamenii** (salarii, KPI, înlocuiri): **nu** intră aici. Stau în
  `CLAUDE.local.md`, local. Aici intră doar ce poate citi omul de la post.
- **Ce e estimare, nu măsurătoare**, se marchează „de calibrat". Nu se șterge marcajul până nu
  măsoară cineva.

## Posturile

| Post | Rol în aplicație | Stare |
|---|---|---|
| [Șef de bucătărie](posturi/sef-bucatarie.md) | `head_chef` | **scris** |
| Manager de locație | `location_manager` | de scris — e următorul |
| Șef de tură | `shift_lead` | de scris |
| Bucătar | — | de scris |
| Ospătar | — | de scris |
| Barman | — | de scris |
| Vase și curățenie | — | de scris |
| Ambalare (livrare) | — | de scris |
| Administrator | `owner` | de scris la final — ce rămâne la voi după ce posturile de mai sus funcționează |

Centrul de producție (`kitchen_manager`, `production_staff`) nu are posturi scrise:
**nu e activ** în octombrie 2026, fiecare locație produce la ea.

## Procedurile

| Procedură | Cine o execută | Ce apără |
|---|---|---|
| [Închiderea zilei](proceduri/inchiderea-zilei.md) | Șef de tură | Casa peste plafon (190.140 lei), încasările de card care nu ajung în cont (~57.000 lei/an) |
| [Formularul de seară al bucătăriei](proceduri/formular-seara-bucatarie.md) | Șef de bucătărie | Consumul neînregistrat (~45% din lipsuri), pierderile fără motiv, masa personalului, uleiul |
| [Energie în intervalul mort](proceduri/energie-interval-mort.md) | Șef de tură bucătărie | Cărbunele Josperului (4.900–5.800 lei/lună la Astur), GPL-ul, durata de viață a uleiului |

**De scris**, în ordinea banilor pe care îi apără:

1. **Recepția cântărită** — apără cele 150 kg de pulpe de pui lipsă din 589 intrate la Astur (25%) și
   ceafa de 137 kg. Fără cântar la recepție, diferența se vede abia la inventar, când nu mai ai de la
   cine să ceri.
2. **Inventarul critic zilnic** — lista scurtă de la Astur: pui, ceafă, obrăjori, burrata, mozzarella.
3. **Masa personalului** — bonată pe ingrediente, nu „din partea casei".
4. **Deschiderea turei** — checklist, temperaturi de frigidere, casa de deschidere.
5. **Transferul între locații** — după ce modulul intră pe live.

## Reguli care se aplică la toate posturile

- **Ce nu e scris, nu s-a întâmplat.** Marfa consumată și nescrisă apare ca lipsă pe numele tău.
- **Nicio ieșire de bani fără document.** Niciun leu din casă fără bon de ieșire.
- **Symbai e sistemul în care se operează.** Nu se ține evidență paralelă pe hârtie sau pe telefon.
- **Alergenii se verifică pe eticheta reală a produsului**, nu se presupun.
- **Ce rămâne nerezolvat se scrie la predarea turei**, nu se spune.
