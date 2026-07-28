-- CLI-ul Supabase actual nu mai auto-expune tabelele noi către rolurile Data API
-- (anon/authenticated) fără GRANT explicit — RLS-ul de mai sus doar restricționează
-- rândurile, dar fără GRANT la nivel de tabelă Postgres respinge cererea înainte.

grant usage on schema public to anon, authenticated;

grant select on locations, staff_profiles, ingredients, recipes, recipe_versions,
  recipe_ingredients, production_logs, haccp_logs to authenticated;

grant insert on ingredients, recipes, recipe_versions, recipe_ingredients,
  production_logs, haccp_logs to authenticated;

grant update on ingredients, recipes to authenticated;
