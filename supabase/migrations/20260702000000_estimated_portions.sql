-- Porții estimate la cantitatea de referință a rețetei (ex: din rețeta de bază ies 14
-- porții) — folosit ca prognoză, scalat automat împreună cu ingredientele la producție.
-- Distinct de production_logs.portions_produced, care e numărul real, completat la final.

alter table recipe_versions add column estimated_portions integer;
