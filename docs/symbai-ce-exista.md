# Ce face deja Symbai — verificat pe 02.11.2026

**Concluzia, înainte de orice:** din cei 8 pași ai planului, **5 sunt deja construiți în Symbai**, iar
unul dintre ei (rutinele zilnice pe rol, cu notificări) e exact lucrul la care urma să ne apucăm.
Ce lipsește cu adevărat e **un singur lucru: calculul KPI și bonusurile** — adică miezul reformei.

Restul nu e muncă de construit, e muncă de **configurat și de umplut cu date.** Capacitatea există și
e nefolosită: la 02.11.2026 Symbai are în toată firma **două liste de sarcini** și **zero reguli de
masă a personalului**.

> **Cum a fost verificat.** Prin conexiunea Symbai, doar citire — catalogul de unelte și două citiri
> de date reale (listele de sarcini, motivele de ieșire din stoc, regulile de beneficii). Am
> confirmat **că funcțiile există și ce fac**, nu că fiecare flux merge perfect pe configurația
> noastră. Unde scrie „de probat", exact asta înseamnă.

---

## 1. Ce voiam să construim și ce există deja

| Pasul din plan | În Symbai | Verdict |
|---|---|---|
| **1.** Roluri și vizibilitate pe locații | RBAC pe rol / brand / locație, aplicația **Symbai Staff** configurabilă pe rol (primul ecran, ordinea, politica de PIN, mod terminal partajat sau telefon personal) | **dublură** |
| **2.** Crearea conturilor din aplicație | Angajați, contracte (CIM / PFA / zilier), alocări pe locații, roluri | **dublură** |
| **3.** Modulul Cereri | Jurnal de cereri de aprobare: retururi, discounturi, din partea casei, transferuri de masă/ospătar/produse, deblocări — cu status, aprobator, motiv. Plus cereri de ajustare de stoc venite **din aplicația Staff**, aprobate de manager. Plus cereri de concediu. | **parțial** — vezi mai jos |
| **4.** Formularul de seară al bucătăriei | Ieșiri de stoc cu **motiv** și **beneficiar** (angajat / echipă / client / proprietar), scrise direct din conversație | **dublură** |
| **5.** „Ziua mea" + notificări | **Liste de sarcini cu țintă pe rol, tură și secție**, recurență (zilnic / zile lucrătoare / săptămânal / lunar), oră-limită, „sarcinile mele" grupate Întârziate → Azi → Viitoare, **dashboard de manager** cu procent de finalizare. Notificări push pe telefon, preferințe pe angajat, ore de liniște, și alerte care nu se pot opri (bon fiscal neemis, incident de siguranță). | **dublură completă** |
| **6.** Operațional | Recepție **din poză sau PDF de pe WhatsApp**, cu gard anti-dublă-intrare. Transfer între locații și branduri, cu „pe drum", diferențe și poze la primire. Pontaj din telefon și din kiosk, plus planificator de ture. Închiderea zilei: raport de sfârșit de zi, registru Z, reconciliere casă–bancă. | **dublură** |
| **7.** Scorecarduri, KPI, bonusuri | Doar **înregistrarea** bonusului lunar (suma, scrisă de mână) și contractele cu bonusuri. **Calculul nu există.** | **lipsește — e al nostru** |
| **8.** Banii | Reconciliere casă–bancă cu sugestii și învățare de tipare. **P&L pe livrări complet**: comision din facturile platformei sau din contract, taxe, penalități, promoții, ambalaj pe comandă, personal — profit pe platformă și pe comandă. | **dublură** |

### Și ce mai e, pe care nici nu-l aveam în plan

- **HACCP** cu senzori configurabili pe tip (frigider, congelator, menținere la cald, ambient),
  praguri min/max, jurnal de temperaturi cu raport de **conformitate** și echipamente fără citiri,
  incidente cu severitate și măsuri corective, plan HACCP cu versiune și aprobare.
- **Reguli de beneficiu pentru masa personalului** — canal dedicat, cu plafon pe angajat și pe
  perioadă. Symbai avertizează explicit: consumul personalului trece **numai** pe acest canal, nu pe
  „din partea casei", care e pentru clienți și strică P&L-ul. *Exact regula din manualul nostru.*
- **Raport „din partea casei" la cost FIFO realizat**, pe motive și pe produse — adică analiza celor
  56.321 lei de la Astur, automat, lunar.
- **Politică de reduceri**: până la ce procent și ce sumă aplică un om singur, peste ce prag pleacă
  cerere la manager.
- **Producție de fabrică**: ture de producție cu utilaj, zonă și rol; loturi, recipiente, măsurători.

---

## 2. Ce lipsește cu adevărat

**1. Calculul KPI și bonusul.** Symbai are toate cifrele care intră în KPI — lipsa la inventar față
de rețete, costul cu personalul, vânzările, consumabilele, procentul de sarcini făcute la timp — și
are unde să scrie bonusul lunar. Dar **nu le leagă**: nu există scorecard, nu există prag, nu există
„bonusul lui X pe octombrie, calculat". Asta e partea noastră, și e exact miezul reformei.

**2. Lista Reforma și Deciziile.** Lista de probleme ale firmei și deciziile administratorilor nu sunt
un lucru de restaurant. Rămân la noi (construite deja, pasul 7 prima parte).

**3. O cerere liberă, cu conversație.** Cererile din Symbai sunt **tipizate** — retur, discount, din
partea casei, ajustare de stoc, concediu. „Am o întrebare despre rețeta X" sau „a venit marfa, ce fac
cu diferența" nu au un card cu fir de discuție. *Dar:* înainte de a construi modulul Cereri, de
verificat dacă o sarcină cu descriere și comentarii nu acoperă deja cazul. Probabil acoperă 80%.

**4. Urmărirea veselei pe bucăți.** Symbai are „Dare în folosință" pentru obiecte de inventar, dar
numărătoarea paharelor sparte pe fel nu e un raport. De decis dacă merită un raport propriu sau e de
ajuns numărătoarea scrisă.

**5. Scara de escaladare** (reamintire −30 min, la termen, manager +30 min, administratori +1 h).
Sarcinile au oră-limită și grupare „întârziate", notificările există — dar **nu am verificat** dacă
escaladarea automată pe lanțul ăsta se poate configura. *De probat.*

---

## 3. Partea care doare: capacitatea există și nu e folosită

Astea nu sunt lipsuri de software. Sunt lucruri neconfigurate.

| Ce | Starea reală, verificată |
|---|---|
| **Liste de sarcini** | **Două, în toată firma:** „To do Andrei" (Drunken Rat, fără recurență) și „DESCHIDERE TERASA" (Astur, rol 16, dimineața, zilnic, ora-limită 10:00). Cele 8 proceduri din manualul Drunken Rat nu sunt în niciuna. |
| **Reguli de masă a personalului** | **Zero.** Funcția e pornită, nicio regulă creată. De aceea masa echipei se bonează ca „din partea casei" — la Astur, Staff/Personal ~13.000 lei în cinci săptămâni. Symbai spune negru pe alb că asta strică P&L-ul. |
| **Inventar la consumabile și țigări** | Zero sesiuni, vreodată. Deci cifra lunară e cumpărare, nu consum. |
| **Inventar de bar** | 5% din liniile deschise, numărate; o treime din ele pe stoc negativ. |
| **Tara și densitatea sticlelor** | Goale pe toate cele 603 produse de bar, deși barul se cântărește. Niciun cântar conectat. |
| **Comisionul platformelor de livrare** | Necompletat pe niciun canal — iar `get_delivery_pnl` îl cere ca să calculeze profitul. Raportul există, îi lipsește o cifră de configurare. |
| **Ridicarea personală la bonare** | Zero comenzi marcate la DR în septembrie. |
| **Obiecte de inventar** | Un singur produs marcat așa, în tot sistemul. |

**Tiparul e același de șapte ori: unealta există, nimeni n-a apăsat pe ea.** De aceea nu construim.
Configurăm.

---

## 4. Ceva ce schimbă manualul: motivele de pierdere

Manualul propune, în [formularul de seară](manual-operare/drunken-rat/proceduri/formular-seara-bucatarie.md),
cinci motive de pierdere: expirat · deteriorat la manipulare · ars sau greșit la preparare · refuzat
de client · produs neconform la recepție.

**Niciunul nu există ca motiv de ieșire în Symbai.** Motivele configurate azi sunt opt, iar fiecare
are o categorie în P&L:

| Motiv | Unde intră în profit |
|---|---|
| Consum nerețetat (condimente, ulei, materii prime fără rețetă) | food cost |
| **Consum ambalaje** (caserole, sosiere, pungi) | food cost (608) |
| **Consum consumabile** (curățenie, igienă, hârtie) | întreținere |
| **Dare în folosință** (obiecte de inventar) | întreținere |
| Masă personal | mese personal și protocol |
| Pierdere / perisabil bucătărie | pierderi |
| Reglaje materii prime vechi | pierderi |
| Refuz client B2B (neconform) | pierderi |

Două consecințe:

**a) Lista din manual trebuie aliniată.** Ori scriem în manual motivele care există (atunci bucătăria
are un singur motiv real de pierdere: „perisabil bucătărie"), ori **creăm în Symbai motivele de care
avem nevoie.** A doua variantă e mai bună — un singur motiv de pierdere nu spune nimic, și tot acolo
ajungem la „fără motiv". Dar e o modificare în Symbai, deci cere acordul lui Andrei.

**b) Definiția indicatorului de consumabile se simplifică mult.** În `plan-reforma.md` am definit-o
prin excluderi: tot din gestiunea `Consumabile`, minus plante, minus obiecte de inventar, minus
cărbune. Symbai separă deja asta **prin motivul de ieșire**: ambalajele într-o parte, curățenia în
alta, obiectele de inventar a treia. Indicatorul se poate construi pe motive, nu pe excluderi — mai
curat și mai greu de greșit. *De recalculat definiția pe baza asta.*

Atenție la un detaliu din descrierea motivului „Consum consumabile": *„tot stocul la sfârșit de
lună"*. Adică exact ocolișul pentru lipsa inventarului — se scade tot ce s-a cumpărat. Încă o
confirmare că procentul de consumabile e pe cumpărare.

---

## 5. Ce propun să facem

### Oprim
- **Pasul 3, modulul Cereri** — nu înainte de a verifica dacă sarcinile cu descriere acoperă cazul.
- **Pasul 5, „Ziua mea" și notificările** — există, complet. Aici câștigăm cel mai mult timp.
- **Pasul 6, operațional** — recepția din poză, transferul, pontajul, închiderea: toate există.
- **Pasul 8, banii** — reconcilierea și P&L-ul pe livrări există.

### Păstrăm
- **Pasul 7, scorecarduri și KPI** — singurul lucru care lipsește, și cel mai important.
- **Lista Reforma și Deciziile** — gata, de pus pe live.
- **Manualul de operare** ca text care explică **de ce**. Symbai ține pașii; manualul ține motivul.
  Un om nou citește manualul o dată; sarcinile le vede zilnic.

### Facem în Symbai (configurare, nu programare)
În ordinea în care apără bani:

1. **O regulă de masă a personalului**, cu plafon. Scoate masa echipei din „din partea casei".
2. **Comisionul pe fiecare canal de livrare** — Glovo 20% + TVA, Wolt și Tazz 24% + TVA. Deblochează
   un raport de profit complet pe livrări, pentru 22,6% din vânzările DR.
3. **Cele 8 proceduri din manual, ca liste de sarcini** cu rol, tură, recurență și oră-limită. Avem
   deja orele scrise în manual — se transcriu.
4. **Inventar la consumabile**, de început și de sfârșit de lună. Fără el, KPI-ul de consumabile nu
   măsoară consum.
5. **Tara și densitatea** pe produsele de bar, plus greutatea brută la numărare.
6. **Motivele de pierdere** de care are nevoie bucătăria.
7. **Tip separat pentru obiectele de inventar**, și mutarea durabilelor acolo.

### De probat înainte de a decide
- Escaladarea automată pe lanțul reamintire → manager → administratori.
- Dacă o sarcină cu descriere și comentarii ține locul unui card de cerere.
- Dacă aplicația Staff poate fi configurată pe rol așa cum avem nevoie (ce ecran vede un barman).

---

## 6. O întrebare deschisă care se închide aici

Întrebarea 1 din `CLAUDE.md` — *„Oferă Symbai o cheie API pentru integrări, ca Mitică să lucreze din
aplicație?"* — **are răspuns: da, și e deja pornită.** Conexiunea prin care a fost făcută verificarea
asta citește și scrie în Symbai cu drepturile contului. Deci Mitică nu are nevoie de o integrare
construită de noi: are nevoie de aceeași conexiune.

Ce rămâne de lămurit e **unde rulează** (întrebarea 2) și **cu ce drepturi**, nu dacă se poate.
