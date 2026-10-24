-- Marketingul nu mai vede producția, HACCP-ul și stocurile.
--
-- Rolul `marketing` a fost adăugat după regulile din Faza 1 și 2, care erau
-- permisive: „oricine e logat vede". Nu a fost o decizie, ci o moștenire — ecranul
-- de Marketing nu citește niciuna din tabelele astea (doar meniul zilei, brandurile,
-- evenimentele, rezultatele și chatul lui). Deci restrângerea nu rupe nimic.
--
-- Agentul de marketing de pe server nu e afectat: rulează cu cheia de serviciu,
-- care trece pe lângă regulile de acces.
--
-- `is distinct from` în loc de `<>`: la comparație simplă, un cont fără profil
-- (rol NULL) ar da NULL, iar rândul ar fi ascuns — adică am schimba comportamentul
-- și pentru alte conturi decât marketing. `is distinct from` tratează NULL ca
-- valoare diferită, deci singurul rol afectat e chiar `marketing`.
--
-- Rețetele rămân vizibile intenționat: numele preparatelor sunt material de
-- marketing, iar ecranele nu le expun oricum rolului ăsta.

-- Loguri de producție
drop policy production_logs_select on production_logs;
create policy production_logs_select on production_logs
  for select using (
    current_staff_role() is distinct from 'marketing'
    and (
      current_staff_role() = 'owner'
      or current_staff_location_id() is null
      or location_id = current_staff_location_id()
    )
  );

-- Checkpoint-uri HACCP (temperaturi, timpi)
drop policy haccp_logs_select on haccp_logs;
create policy haccp_logs_select on haccp_logs
  for select using (
    current_staff_role() is distinct from 'marketing'
    and (
      current_staff_role() = 'owner'
      or current_staff_location_id() is null
      or exists (
        select 1 from production_logs pl
        where pl.id = haccp_logs.production_log_id
          and pl.location_id = current_staff_location_id()
      )
    )
  );

-- Mișcări de stoc (și, prin ele, view-ul stock_levels)
drop policy stock_movements_select on stock_movements;
create policy stock_movements_select on stock_movements
  for select using (
    auth.uid() is not null
    and current_staff_role() is distinct from 'marketing'
    and (not is_location_role() or location_id = current_staff_location_id())
  );

-- Praguri de stoc
drop policy stock_par_levels_select on stock_par_levels;
create policy stock_par_levels_select on stock_par_levels
  for select using (
    auth.uid() is not null
    and current_staff_role() is distinct from 'marketing'
    and (not is_location_role() or location_id = current_staff_location_id())
  );
