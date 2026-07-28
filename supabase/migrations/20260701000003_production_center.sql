-- Model real de business: materia primă intră doar în centrul de producție, care
-- livrează semipreparat (produs sous vide) către locații. Producția (sous vide)
-- se loghează mereu la centrul de producție, nu la Drunken Rat/Astur.

alter table locations add column is_production_center boolean not null default false;

-- Cel mult un centru de producție (index unic parțial, la fel ca pattern-ul de la
-- recipe_ingredients.is_primary)
create unique index locations_one_production_center
  on locations ((true))
  where is_production_center;
