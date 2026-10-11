-- Concurența e specifică fiecărui brand (Astur în Dumbrăvița ≠ concurenții din centru).
--   * marketing_brands.competition — cu cine concurăm, scris de echipă (ex. pizzerii
--     și meniul zilei pe livrare);
--   * competitors.brand_id — concurenții scanați de Iscoada ajung în contextul
--     agentului de marketing doar pentru brandul de care țin.
alter table marketing_brands add column competition text;
alter table competitors add column brand_id uuid references marketing_brands (id) on delete set null;
