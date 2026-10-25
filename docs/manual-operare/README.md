# Manual de operare — Drunken Rat SRL

Cum se lucrează, pe fiecare post. Scopul: **orice om nou să poată prelua un post citind o singură
pagină**, iar administratorii să nu mai fie singurii care știu cum merg lucrurile.

---

## Un manual pe locație, nu unul comun

> **[Manualul Drunken Rat](drunken-rat/)** · **[Manualul Astur](astur/)**

Cele două locații au posturi asemănătoare pe nume, dar **diferă prin posturi și prin dotări**, iar
unde dotarea diferă, procedura diferă. Câteva exemple:

| | Drunken Rat | Astur |
|---|---|---|
| Ce e | Pub / gastro bar, 11:00–02:00 | Restaurant de cartier, prânzul face ~60% |
| Echipamentul care dictează procedurile | Plancha/grill, 2 friteuze, cuptor **doar** pentru producție | **Josper** pe cărbune (4.900–5.800 lei/lună de cărbune), cuptor de pizza |
| Bucătăria | 3 stații, 4 oameni până la 15:00, 3 după | 10 oameni |
| Bar | 2 barmani, bar propriu, se vând și țigări | Bar aproape fără pierderi, fără post de barman dedicat |
| Posturi care există doar aici | Ambalare pentru livrare | Pizzaiolo, meniul zilei ca sistem, pachete de evenimente |
| Închiderea | După 02:00 — banca e închisă | Se închide mai devreme |

De aceea **nu există o pagină „șef de bucătărie" comună.** Șeful de bucătărie de la Drunken Rat
coordonează 3–4 oameni pe 3 stații și nu are cărbune în gestiune; cel de la Astur coordonează 10
oameni și răspunde de Josper. Aceeași denumire, două posturi diferite.

Ce e **chiar** identic — regulile de mai jos — se scrie aici, o singură dată.

## Cum e organizat fiecare manual

**`posturi/`** — o pagină pentru fiecare post al locației. Ce răspunde omul, programul zilei cu ore,
ce proceduri execută, ce i se măsoară, ce **nu** intră în sarcina lui.

**`proceduri/`** — pașii concreți, pentru locația aceea, cu echipamentul și orele ei.

Un post trimite la procedurile lui. În interiorul unei locații, o procedură se scrie o dată și se
linkează din fiecare post care o execută.

## Cum se modifică

Manualul stă în proiectul aplicației, pe GitHub, deci are istoric: se vede cine a schimbat ce și când,
și se poate reveni.

- **Modificare de conținut** (o oră, un prag, un pas nou): se cere lui Claude, se scrie, se face
  `git pull` pe calculator. Nu se editează în două locuri deodată.
- **Modificare care privește o singură locație** se face în manualul ei. Nu se „sincronizează" cu
  cealaltă din reflex — dacă schimbarea e validă la amândouă, se spune explicit.
- **Decizii care privesc oamenii** (salarii, KPI în lei, înlocuiri): **nu** intră aici. Stau în
  `CLAUDE.local.md`, local. Aici intră doar ce poate citi omul de la post.
- **Ce e estimare, nu măsurătoare**, se marchează „de calibrat". Nu se șterge marcajul până nu
  măsoară cineva.

## Reguli care se aplică la toate posturile, în amândouă locațiile

- **Ce nu e scris, nu s-a întâmplat.** Marfa consumată și nescrisă apare ca lipsă pe numele tău.
- **Nicio ieșire de bani fără document.** Niciun leu din casă fără bon de ieșire.
- **Symbai e sistemul în care se operează.** Nu se ține evidență paralelă pe hârtie sau pe telefon.
- **Alergenii se verifică pe eticheta reală a produsului**, nu se presupun.
- **Ce rămâne nerezolvat se scrie la predarea turei**, nu se spune.
- **Marfa se cântărește la recepție**, înainte de semnătură.

## Centrul de producție

Nu are posturi scrise: **nu e activ** în octombrie 2026, fiecare locație produce la ea. Rolurile
`kitchen_manager` și `production_staff` există în aplicație, dar nu au oameni pe ele.
