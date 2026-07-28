-- Producție multi-zi (ex. wings la marinat seara, sous vide a doua zi, finalizat abia
-- atunci): finished_at/actual_temp_c/actual_time_min trebuie completate ulterior, nu doar
-- la creare — la fel ca portions_produced. Policy-ul de UPDATE există deja
-- (production_logs_update_portions verifică rol+locație), extindem doar coloanele permise.
grant update (finished_at, actual_temp_c, actual_time_min) on production_logs to authenticated;

-- Valabilitate (zile) per versiune de rețetă — bază pentru calculul datei de expirare
-- pe etichetele HACCP (data producție + valabilitate).
alter table recipe_versions add column shelf_life_days integer;
