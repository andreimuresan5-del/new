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
2. ~~Comisionul pe fiecare canal de livrare~~ — **făcut pe 03.11.2026**, din facturile platformelor.
   Vezi secțiunea 9.
3. ~~Cele 8 proceduri din manual, ca liste de sarcini~~ — **făcut pe 03.11.2026**, vezi secțiunea 7.
   Textul original: cu rol, tură, recurență și oră-limită. Avem
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

### Configurate pe 03.11.2026, la cererea lui Andrei („pornește acum")

Două scorecarduri, pentru cele **două roluri care există în Symbai** și au schema decisă:

| id | Scorecard | Rol / locație | Bonus brut la 100 de puncte |
|---|---|---|---|
| 1 | Manager Drunken Rat | `Manager` (brand 1) / Unirii | 5.130 |
| 2 | Șef bucătărie Astur | `Bucatar Sef` (brand 3) / Dumbravita | 4.275 |

> **Două atenționări pe sumele alea.** Sunt **brutul derivat** din netul decis (3.000 și 2.500), cu
> raportul net/brut de 0,585 — verificat că dă costul de firmă din `CLAUDE.local.md` (~4.300 peste fix
> pentru un șef). **De confirmat cu contabilul**; se schimbă cu un apel și nimic nu se plătește fără
> aprobare.

> **Lipsesc două roluri în Symbai:** nu există `Manager` pe brandul Astur și nu există `Bucatar Sef`
> pe brandul Drunken Rat. Deci scorecardul managerului de la Astur și al șefului de bucătărie de la DR
> **nu se pot face** până nu există rolurile. De decis dacă se creează sau oamenii sunt pe alte roluri.

### Rulajul pe octombrie: ce a ieșit

Am rulat ambele scorecarduri pe o lună încheiată, înainte să conteze. **Amândouă dau bonus zero**,
dar nu din punctaj — din condițiile de bază.

| | Manager DR | Șef bucătărie Astur |
|---|---|---|
| Punctaj | 46 / 100 | 48 / 100 |
| Condiții de bază | **toate patru picate** | **picată** (inventar zilnic) |
| Bonus | **0** | **0** |

**Condițiile de bază la Drunken Rat, octombrie** — astea sunt cifrele care contează:

| Condiția | Zile ratate din 31 |
|---|---|
| Casa reconciliată zilnic | **31 din 31** — 31 de file închise, niciuna cu numerarul numărat |
| Depunere zilnică | **29 din 31** |
| Nicio ieșire fără document | 1 (15.10) |
| Inventar zilnic | 18 |

### Șapte lucruri pe care le-a scos rulajul

1. **„Casa reconciliată" nu înseamnă „casa închisă".** Fila se închide în fiecare zi, dar **fără
   numerarul numărat** — adică exact pasul 2 din [închiderea zilei](manual-operare/drunken-rat/proceduri/inchiderea-zilei.md).
   Treizeci și una de zile din treizeci și una. Asta e, singură, cea mai mare schimbare de
   comportament pe care o cere reforma.
2. **Vânzările an/an nu se pot calcula.** Istoricul din Symbai începe la 01.07.2026 (balanța
   inițială), deci „aceeași lună de anul trecut" e **zero** până în iulie 2027. Configurasem
   indicatorul cu pondere 30 la DR; l-am coborât la 1 (se arată, nu dă bani) și am mutat ponderea pe
   lipsa la inventar, cost personal, sarcini și calitate. *Altfel 30% din bonus era pierdut pe un
   indicator care nu se poate măsura.*
3. **Sarcinile la timp: „nicio sarcină scadentă în lună".** Confirmă negru pe alb de ce listele de
   sarcini sunt prioritatea: 25% din bonusul managerului stă pe un indicator care azi n-are date.
4. **Consumabilele ies 0%** — numărătorul e **0,73 lei** pe toată luna. Nimeni nu scoate consumabile
   pe motivele de ieșire; se trec altfel. Definiția pe motiv e corectă, dar nu are date până nu se
   face descărcarea lunară pe motivul potrivit.
5. **Lipsa la inventar la DR e negativă: −0,71%**, adică **plus** la inventar. Consistent cu ce
   găsisem: recepții înregistrate târziu, stoc pe minus, apoi inventarul găsește marfa.
6. **Lipsa la bucătăria Astur în octombrie: 4,98%** — nu 18,5% ca în analiza august–septembrie.
   **Asta cere lămurire înainte de orice decizie despre om**, fiindcă decizia de înlocuire s-a luat pe
   +18,5%. Atenție: 13 produse n-au inventar la ambele capete, deci cifra e parțială.
7. **P&L-ul lunii e incomplet la ambele locații** și **blochează aprobarea bonusului**: 6 produse la
   DR și 9 la Astur n-au cost FIFO realizat (cafelele, open bar, două meniuri). De reparat înainte de
   prima aprobare reală.

Cost personal, pentru referință: **DR 21,07%** din 408.453 lei vânzări nete (mai bun decât cele 25,2%
din eșantionul de trei zile); **Astur 33,7%** din 248.368.

## 7. Procedurile, încărcate ca liste de sarcini (03.11.2026)

**SYM-00801 e implementat și el** — listele au acum `reminderMinutes` și o scară de escaladare pe
trepte (`escalationSteps`), cu țintă `manager` / `admin` / `shift_lead` / un rol anume, și
`criticalOnly` pe treaptă. Exact lanțul cerut. Sarcinile au, pe deasupra, `critical: true`, care le
trece și peste orele de liniște ale omului.

Cele 8 proceduri din manual au intrat în **6 liste recurente**, cu 28 de sarcini-șablon. Lista
generează singură instanțele zilei.

| # | Lista | Rol țintă | Tură | Oră-limită | Pași |
|---|---|---|---|---|---|
| 4 | Închiderea zilei | `Sef Tura Sala` | noaptea | 03:00 | 7 |
| 5 | Deschiderea turei | `Sef Tura Sala` | dimineața | 11:30 | 5 |
| 6 | Dimineața în bucătărie | `Bucatar` | dimineața | 12:00 | 4 |
| 7 | Energie în intervalul mort | `Bucatar` | după-amiaza | 17:45 | 2 |
| 8 | Formularul de seară al bucătăriei | `Bucatar` | seara | 23:00 | 4 |
| 9 | Ziua managerului | `Manager` | dimineața | 16:00 | 6 |

Escaladarea: reamintire **30 de minute înainte**, la termen omul, **managerul la +30**, iar
**administratorii la +90** — numai pentru sarcinile marcate critice. La lista managerului,
administratorii la +120, fără pasul intermediar.

### Partea care face diferența: dovada la finalizare

Nu sunt bife. Pașii care contează cer o dovadă, iar dovada e exact ce lipsea în octombrie:

| Pasul | Dovada cerută |
|---|---|
| Numără banii din casă și scrie suma | **număr** — și scris înainte de a te uita în Symbai |
| Casa = POS: scrie diferența | **număr** |
| Plicul de depunere | **poză** + **semnătura managerului** la verificare |
| Bacșiș card plătit cash | **notă** cu suma și cui s-a dat |
| Casa de deschidere, fondul de rest | **număr** |
| Temperaturi frigidere (HACCP) | **număr** |
| Țigările la preluare | **număr** |
| Inventarul critic | **notă** + verificare de manager |
| Uleiul de friteuză | **număr** |
| Du plicul la bancă | **număr** — suma depusă |

**Pasul care repară condiția de bază picată în octombrie e „Numără banii din casă și scrie suma",
cu dovadă numerică.** Fără el, fila se închidea fără numerar numărat în 31 de zile din 31.

### Blocajul: rolul „Sef Tura Sala" are zero angajați

Listele **#4 închiderea** și **#5 deschiderea** — cele mai importante — țintesc rolul `Sef Tura Sala`,
care în Symbai are **0 oameni**. Deci azi nu le vede nimeni; se vor întârzia singure și vor escalada
la manager în fiecare noapte.

E același gol pe care manualul îl semnalează: la Drunken Rat postul de șef de tură nu există separat
în structura de iarnă — e un ospătar sau un barman desemnat. **Până pune cineva pe rolul ăla, cele
două liste nu funcționează.** De decis cine, pe ce seri.

Celelalte patru liste merg: `Bucatar` are 9 oameni, `Manager` are 1.

> **Două lucruri de calibrat după prima săptămână.** Ora-limită a formularului de seară (am pus
> 23:00, iar manualul o lăsase deschisă) și lista de inventar critic pentru DR, care încă nu e
> stabilită — am pus în sarcină propunerea coaste / carne de burger / rață, de fixat cu șeful de
> bucătărie.

## 8. Ana și Adi, pe rolul de șef de tură (03.11.2026)

Andrei: la Drunken Rat șefii de tură sunt **Ana** și **Adi**, și sunt în structura de iarnă. În Symbai:
**ANA MARIA BOLETA** (id 8) și **ADRIAN IONESCU** (id 7) — amândoi erau **fără rol atribuit**, deci
trecuți pe `Sef Tura Sala` (id 7) fără să pierdem nimic. Blocajul de la secțiunea 7 e rezolvat:
listele #4 și #5 ajung acum la cineva.

> **Dar rolul nu avea `tasks_view`.** Cu 63 de permisiuni și 58 de pagini vizibile, rolul „Sef Tura
> Sala" **nu avea dreptul de a vedea sarcinile** — adică Ana și Adi ar fi fost pe rol și tot n-ar fi
> văzut nimic. Adăugate: `tasks_view`, `cashbook.view` (registrul de casă, de care are nevoie
> „casa = POS") și `attendance_view`. Rolul are acum 66.

Două lucruri de verificat cu ei:

- **Ana are unitatea principală la Astur** (brand 3, Dumbrăvița), cu acces și la Drunken Rat. Dacă
  lucrează mai mult la DR, unitatea principală ar trebui schimbată — afectează unde se alocă
  salariul ei. N-am schimbat-o.
- **Rolul nu are `manageCashShift`.** Deschide și închide casa prin `daily_close_access`, dar nu
  gestionează tura de casierie. De verificat practic, la prima închidere, că poate face tot ce cere
  procedura.

## 9. Comisionul de livrare, luat din facturile platformelor (03.11.2026)

Andrei: „comisionul pe canalele de delivery ia-l din facturile lor". Facturile sunt în Symbai — Wolt
57 de facturi din 15.06, Glovo 23 — și spun ratele.

### Wolt nu are o rată, are două

Facturile scriu rata în descrierea fiecărei linii:

| Linia de pe factură | Rata |
|---|---|
| Comision comenzi cu livrare prin Wolt | **23%** |
| Comision comenzi cu livrare prin Wolt **și subscripție Wolt+** | **25,5%** |
| Comision comenzi cu ridicare personală | 23% |
| Comision forfetar de tranzacție | **+1%** |

**Partea mare a comenzilor e la rata mare.** În octombrie, la Drunken Rat: 14.572 lei comision la
25,5% față de 6.321 lei la 23% — adică **70% din comision vine de pe comenzile Wolt+**. La Astur, 77%.

Rata efectivă, calculată de Symbai din facturi: **25,73% la Drunken Rat, 25,87% la Astur.**
Noi aveam în context 24%. Diferența e de ~1,8 puncte pe 84.627 lei de vânzări Wolt într-o lună la
DR — **în jur de 1.500 lei pe lună, numai la o locație.**

### Glovo iese exact 20%

Facturile Glovo nu scriu procentul, dar pe fereastra pe care o acoperă (01–15.10) comisionul împărțit
la vânzări dă **20,00%** la amândouă canalele, la bănuț. Facturile au și linii separate pentru taxa
de platformă (17,50 lei pe perioadă), taxa de comandă Glovo Prime și serviciile de promovare — alea
nu sunt comision și intră separat în P&L.

### Ce am setat

| Canal | Comision | De ce |
|---|---|---|
| Glovo Drunken Rat | **20%** | rata dovedită de facturi |
| Glovo Astur | **20%** | idem |
| Wolt Drunken Rat | 26% | **doar ca rezervă** — raportul ia oricum rata reală din facturi |
| Wolt Astur | 26% | idem |

**De ce conta:** Glovo nu trimite comisionul prin integrare, iar facturile acopereau 15 din 31 de
zile. Pentru restul lunii raportul arăta comision zero, deci „profitul arăta prea bine" — exact
cuvintele lui Symbai. Acum are de unde să completeze.

Pentru octombrie, livrările au dat **1.733 de comenzi, 146.928 lei vânzări, 67.132 lei profit**
(50,8% marjă, 38,74 lei pe comandă). **Pe comandă, Glovo lasă 50,25 lei și Wolt 34,98** — Wolt aduce
de trei ori volumul, dar la o rată mult mai mare.

*Mic rest de curățat:* 3 comenzi de pe platforme nu sunt legate de o notă în POS și nu intră în calcul.

## 10. O întrebare deschisă care se închide aici

Întrebarea 1 din `CLAUDE.md` — *„Oferă Symbai o cheie API pentru integrări, ca Mitică să lucreze din
aplicație?"* — **are răspuns: da, și e deja pornită.** Conexiunea prin care a fost făcută verificarea
asta citește și scrie în Symbai cu drepturile contului. Deci Mitică nu are nevoie de o integrare
construită de noi: are nevoie de aceeași conexiune.

Ce rămâne de lămurit e **unde rulează** (întrebarea 2) și **cu ce drepturi**, nu dacă se poate.
