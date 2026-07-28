-- Scalare marinadă după greutatea reală a materiei prime + porții produse (completate la final)

-- Ingredient "principal" per versiune de rețetă — ancora pentru scalarea cantităților
-- (de obicei carnea/materia primă de bază). Cel mult unul per versiune.
alter table recipe_ingredients add column is_primary boolean not null default false;

create unique index recipe_ingredients_one_primary_per_version
  on recipe_ingredients (recipe_version_id)
  where is_primary;

-- Porții produse — determinat abia după portionare, deci se completează separat,
-- nu neapărat odată cu restul logului. Coloană editabilă ulterior, spre deosebire
-- de câmpurile HACCP (temp/timp), care rămân imuabile o dată logate.
alter table production_logs add column portions_produced integer;

grant update (portions_produced) on production_logs to authenticated;

create policy production_logs_update_portions on production_logs
  for update using (
    current_staff_role() in ('production_staff', 'kitchen_manager')
    and (current_staff_location_id() is null or location_id = current_staff_location_id())
  ) with check (
    current_staff_role() in ('production_staff', 'kitchen_manager')
    and (current_staff_location_id() is null or location_id = current_staff_location_id())
  );
