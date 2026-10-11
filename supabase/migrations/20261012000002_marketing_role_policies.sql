-- Marketing: owner + rolul `marketing` (vezi migrarea anterioară).
drop policy marketing_brands_owner on marketing_brands;
drop policy marketing_items_owner on marketing_items;
drop policy marketing_runs_select on marketing_runs;

create policy marketing_brands_team on marketing_brands
  for all using (current_staff_role() in ('owner', 'marketing'))
  with check (current_staff_role() in ('owner', 'marketing'));

create policy marketing_items_team on marketing_items
  for all using (current_staff_role() in ('owner', 'marketing'))
  with check (current_staff_role() in ('owner', 'marketing'));

create policy marketing_runs_team on marketing_runs
  for select using (current_staff_role() in ('owner', 'marketing'));
