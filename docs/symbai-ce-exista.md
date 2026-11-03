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

> **Recitit pe 02.11.2026.** Jumătate din tabelul ăsta s-a schimbat în opt zile — Alex lucrează cu
> echipa Symbai pe exact punctele astea (197 de tichete deschise de firmă până acum, cu corecturi
> livrate în câteva zile). Cifrele de mai jos sunt cele de azi, nu cele din 25.10.

| Ce | Starea la 02.11.2026 | Față de 25.10 |
|---|---|---|
| **Liste de sarcini** | **Tot două, în toată firma:** „To do Andrei" (DR, fără recurență) și „DESCHIDERE TERASA" (Astur, rol 16, dimineața, zilnic, 10:00). Cele 8 proceduri din manualul DR nu sunt în niciuna. | neschimbat |
| **Reguli de masă a personalului** | **Tot zero.** Funcția e pornită, nicio regulă creată. De aceea masa echipei se bonează ca „din partea casei". | neschimbat |
| **Inventar la consumabile** | **Tot zero sesiuni**, la ambele locații. Deci cifra lunară rămâne cumpărare, nu consum. | neschimbat |
| **Inventar de bar, DR** | 15 sesiuni, **661 de linii numărate**, ultima **azi, 02.11**. | era 402 |
| **Tara și densitatea sticlelor** | **121 din 607** produse de bar au tară, densitate și cântărire activă. Cântarul e în aplicația Symbai Staff, pe ecranul de numărare. | era **zero** |
| **Inventar la țigări** | DR: o sesiune, 14 linii, 31.10. Astur: trei sesiuni, ultima 01.11. | era zero la DR |
| **Comisionul platformelor de livrare** | Necompletat pe niciun canal — `get_delivery_pnl` îl cere ca să calculeze. | neschimbat |
| **Ridicarea personală la bonare** | Zero comenzi marcate la DR în septembrie. | neschimbat |
| **Obiecte de inventar** | Un singur produs marcat așa, în tot sistemul. | neschimbat |

**Cântărirea barului s-a rezolvat prin tichet, nu prin cod de-al nostru.** Alex a cerut-o pe 29.10
(SYM-00785), Symbai a livrat pe 01.11 unealta `configure_product_weighing`, care completează tara,
conținutul și densitatea pe până la 200 de produse dintr-un apel. Merită reținut ca tipar: **drumul
cel mai scurt la o lipsă din Symbai e un tichet, nu o aplicație pe lângă.**

Ce a rămas neschimbat în opt zile e tot **configurare pe care o putem face noi**: listele de sarcini,
regula de masă a personalului, inventarul la consumabile, comisionul pe canale. Unealta există,
nimeni n-a apăsat pe ea.

---

## 4. Motivele de pierdere — **făcut pe 02.11.2026**

Manualul propunea cinci motive de pierdere în formularul de seară, și **niciunul nu exista** ca motiv
de ieșire în Symbai. Cu acordul lui Andrei, patru au fost create (`create_stock_exit_type`), toate în
categoria „Pierderi, risipă & casare":

| id | Motivul nou | Când se alege |
|---|---|---|
| 9 | **Ars sau greșit la preparare** | Preparat ars, sărat greșit, făcut din altceva decât comanda, sau refăcut |
| 10 | **Deteriorat la manipulare** | Marfa era bună: scăpată, spartă, vărsată la transport, porționare sau depozitare |
| 11 | **Refuzat de client** | Trimis înapoi din sală sau de la livrare și aruncat (diferit de „Refuz client B2B") |
| 12 | **Veselă spartă** | Pahare, farfurii, tacâmuri, ustensile — pe linia lor, ca să nu se amestece în indicatorul managerului |

**Două din lista propusă nu s-au creat, intenționat:**

- **„Expirat"** — există deja „Pierdere / perisabil bucătărie", iar Symbai are pe deasupra o bifă de
  expirat care face cantitatea să se scadă **din loturile expirate întâi**, nu din marfa bună. Un
  motiv separat ar fi fost un al doilea nume pentru același lucru.
- **„Produs neconform la recepție"** — ar fi fost o greșeală. Marfa refuzată la recepție **nu intră
  pe stoc**; se corectează recepția, cu furnizorul. Trecută ca pierdere, plătești marfa pe care ai
  refuzat-o.

De ce trei motive în loc de unul: **arată ce se poate repara.** „Ars la preparare" se repară cu
instruire, „deteriorat la manipulare" cu rafturi și navete, „refuzat de client" la calitate și
porționare. Toate sub „perisabil" nu spun nimic.

Lista completă e acum de **12 motive**. Cele opt care existau:

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

Rămâne consecința a doua, care nu s-a schimbat:

**Definiția indicatorului de consumabile se simplifică mult.** În `plan-reforma.md` am definit-o
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
6. ~~Motivele de pierdere~~ — **făcut pe 02.11.2026**, vezi secțiunea 4.
7. **Tip separat pentru obiectele de inventar**, și mutarea durabilelor acolo.

### De probat înainte de a decide
- Escaladarea automată pe lanțul reamintire → manager → administratori.
- Dacă o sarcină cu descriere și comentarii ține locul unui card de cerere.
- Dacă aplicația Staff poate fi configurată pe rol așa cum avem nevoie (ce ecran vede un barman).

---

## 6. Ce am cerut echipei Symbai (02.11.2026)

Decis de Andrei: ce lipsește, îl cerem lor, nu îl construim. Verificat înainte că niciuna din cele
trei nu era deja cerută în cele 197 de tichete ale firmei.

| Referință | Ce am cerut |
|---|---|
| **SYM-00800** ✅ **IMPLEMENTAT în 3 ore** (răspuns 02.11, 11:44) | **Scorecard pe rol, cu KPI calculat lunar și bonusul rezultat.** Cei cinci indicatori (lipsă la inventar cu gestiune exclusă, cost personal %, consumabile pe motiv de ieșire, vânzări față de anul trecut, procent de sarcini la timp), ponderi pe rol **și** pe locație, trepte pe fiecare indicator, **condiția de bază care anulează tot bonusul**, rezultat lunar pe om cu detalierea, și legătura cu `set_employee_monthly_bonus` — calcul pe care administratorul confirmă, nu care se plătește singur. Am legat-o de SYM-00689 (costul cu personalul proratat greșit): fără acela corect, indicatorul nu se poate folosi la bonus. |
| **SYM-00801** | **Escaladare pe sarcini:** reamintire cu 30 de minute înainte, la termen, managerul la +30, administratorii la +1 h și numai pentru sarcinile critice. Argumentul: la DR se închide după 02:00, fără manager deasupra, iar închiderea casei e cea mai importantă sarcină a zilei. |
| **SYM-00802** | **Fir de discuție pe o sarcină**, cu poze și notificare doar către cei implicați, citibil și scriibil prin MCP ca să poată răspunde asistentul. Am spus explicit că **nu** cerem un modul de tichete interne — am renunțat la el după ce am văzut ce există deja. |

Răspunsurile vin pe mailul lui Andrei și se citesc cu `list_my_symbai_tickets`.

### SYM-00800: implementat. Pasul 7 nu se mai construiește nici el.

Cerut pe 02.11 la 08:48, răspuns la 11:44, **în trei ore**. E în **Personal → Scorecard KPI**, iar
uneltele MCP sunt deja active (verificat `get_kpi_scorecard` pe 03.11).

Ce a intrat, din ce am cerut: scorecard pe rol **×** locație (deci ponderi diferite la Unirii și
Dumbrăvița), ponderi care însumează 100, **trepte** pe fiecare indicator (întreg până la pragul A, o
fracțiune configurabilă — implicit jumătate — până la B, zero peste), **consumabilele calculate pe
motivul de ieșire** exact cum am cerut, lipsa la inventar cu gestiuni excluse (țigările), sarcinile
făcute la timp, vânzările față de aceeași lună de anul trecut, toate raportate la vânzările nete din
P&L. „Calitatea" e indicator introdus de administrator la aprobare.

**Condițiile de bază au intrat întregi** — partea pe care insistasem: casa reconciliată zilnic (fila
închisă **cu numerarul numărat**), depunere zilnică, nicio ieșire de bani fără document, inventar
zilnic. Fiecare cu o toleranță configurabilă de zile ratate. Și bonusul **nu se plătește singur**:
administratorul apasă „Aprobă bonusul", numai după încheierea lunii și numai dacă P&L-ul lunii e
complet.

**SYM-00689 era deja rezolvat**, deci costul cu personalul se poate folosi la bonus.

> **Ce ne-au spus pe lângă, și e cea mai importantă propoziție din tot răspunsul.** Au rulat
> condițiile de bază pe datele de octombrie de la **Dumbrăvița**: casa a fost închisă în toate
> zilele, **dar fără numerarul numărat**; depuneri au fost în **2 zile** din lună; plăți din casă
> **fără document în 5 zile**. Cu condițiile de bază active, **bonusul pe octombrie ar fi ieșit
> zero.**
>
> Asta e exact ce prevedeam, dar acum e măsurat de sistem, nu de noi. Și ridică o decizie pe care
> n-o aveam pe listă: **pornim scorecardul acum, și prima lună iese zero ca mesaj, sau îl pornim
> după ce disciplina banilor e în picioare?** Prima variantă e mai cinstită și mai dură.

**Zero scorecarduri configurate** la 03.11 — funcția e vie și goală. Configurarea cere trei decizii
care încă nu sunt luate: **ponderile pentru Drunken Rat** (la Astur sunt decise), **câte zile ratate
se tolerează** la fiecare condiție de bază, și **de la ce lună pornește**.

## 7. O întrebare deschisă care se închide aici

Întrebarea 1 din `CLAUDE.md` — *„Oferă Symbai o cheie API pentru integrări, ca Mitică să lucreze din
aplicație?"* — **are răspuns: da, și e deja pornită.** Conexiunea prin care a fost făcută verificarea
asta citește și scrie în Symbai cu drepturile contului. Deci Mitică nu are nevoie de o integrare
construită de noi: are nevoie de aceeași conexiune.

Ce rămâne de lămurit e **unde rulează** (întrebarea 2) și **cu ce drepturi**, nu dacă se poate.
