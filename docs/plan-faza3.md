---
name: project-centru-productie-faza3-plans
description: Decizie de design pentru Faza 3 (cost/randament) a aplicației Control Centru de Producție — legătură formală rețetă-componentă
metadata: 
  node_type: memory
  type: project
  originSessionId: 6fd4ea36-b423-49b0-85d7-5463fbfe3ddd
---

Decizie confirmată de Andrei (owner) pentru Faza 3 a aplicației de control producție (proiect `CP`, spec în `spec-centru-productie.md`):

**Legătură formală rețetă-component**: rețetele de tip "finisare"/"componentă" (ex. `Glazură BBQ`, create ca rețete separate încă din Faza 1 tocmai ca să aibă cost urmăribil independent) trebuie legate structural de rețeta de bază care le folosește (ex. Wings sous vide), nu doar printr-o notă text. Scopul: calcul automat de cost teoretic per rețetă = cost componentă de bază + cost componente de finisare folosite. În Faza 1 nu există această relație în schemă — doar referință text în câmpul `notes`.

**De ce**: precondiție pentru raportarea de cost teoretic vs. real din roadmap-ul Fazei 3 (secțiunea 6 din spec).

**Cum se aplică**: când se implementează Faza 3, proiectează un tabel de legătură recipe-component (ex. `recipe_version_components: parent_recipe_version_id, component_recipe_id, quantity_used`) înainte de a construi calculul de cost. Vezi [[project-centru-productie-faza1-schema]] pentru schema curentă.

Notă: standardizarea unităților de măsură (tsp/tbsp → g/ml) a fost mutată din acest plan în Faza 1 — vezi [[project-centru-productie-faza1-schema]], deja aplicată la Wings/Pulpe/Glazură BBQ.

**Forecast vânzări + producție**: Andrei vrea ca aplicația să facă forecast de vânzare și forecast de producție (nu doar raportare istorică cost/randament). Menționat ca intenție viitoare, fără detalii de implementare încă (ex. pe baza istoricului din `sales_import`? interval de timp? per rețetă sau per locație?). Depinde de importul de vânzări (Faza 3) și probabil de legătura rețetă-componentă de mai sus, plus de fluxul de necesar de materie primă pentru centrul de producție (vezi [[project-centru-productie-faza1-schema]], secțiunea despre modelul cu centru de producție). De clarificat scope-ul exact când se ajunge la implementare.

**Viziune lanț aprovizionare (Andrei, confirmată dar neimplementată)** — practic Faza 2 partea de materie primă (nu s-a construit încă — Faza 2 realizată acoperă doar stocul de semipreparat la locații, vezi [[project-centru-productie-faza1-schema]]), plus Faza 3, plus un nivel nou de automatizare:
1. Finalizare meniu — Andrei introduce progresiv toate rețetele reale (în lucru, organic).
2. Încărcare meniuri locații (mapare produs POS ↔ rețetă) — precondiție pentru variance/necesar real.
3. **Furnizori + recepții pe facturi**: stoc de materie primă la centrul de producție (nu doar semipreparat), populat prin recepții — fiecare recepție = factură de la un furnizor, cu prețuri reale per materie primă (actualizează `ingredients.current_cost_per_unit`). Necesită tabel `suppliers` și un tabel de recepții (linii factură: furnizor, materie primă, cantitate, preț).
4. **Poze facturi + mapare denumiri**: Andrei vrea să fotografieze facturile și să mapeze denumirea de pe factură cu denumirea folosită în rețete (ingredient master), ca actualizarea stocului/prețului să pornească din poză. Recomandare dată (neconfirmată încă de Andrei): pornește cu introducere **manuală** a liniilor din factură (poza doar atașată ca referință), OCR/mapare automată abia după ce fluxul manual e verificat — riscul tehnic (acuratețe OCR, variabilitate format factură) e mult mai mare decât restul.
5. **Necesar automat**: modul care calculează automat ce materie primă trebuie comandată, bazat pe stoc curent + praguri/consum — se leagă de `stock_par_levels`/`is_primary` deja construite (vezi [[project-centru-productie-faza1-schema]]).
6. **Comenzi automate către furnizori** prin WhatsApp sau email. Recomandare dată: email întâi (fără dependințe externe), WhatsApp Business API e mult mai complex (cont aprobat, integrare dedicată) — de amânat.

Toate 6 punctele sunt viziunea pe termen lung, nu un plan de implementare imediată — de reconfirmat scope-ul exact (ce anume construim primul) când Andrei decide să înceapă efectiv.
