-- Agentul de marketing învață din folosire:
--   * original_body — textul scris de agent, păstrat automat la prima editare a echipei,
--     ca agentul să vadă „am scris așa → echipa a corectat așa”;
--   * rejection_reason — de ce a fost respins (opțional, din UI).

alter table marketing_items
  add column original_body text,
  add column rejection_reason text;

create function marketing_items_keep_original()
returns trigger
language plpgsql
as $$
begin
  if new.body is distinct from old.body and old.original_body is null then
    new.original_body := old.body;
  end if;
  return new;
end;
$$;

create trigger marketing_items_keep_original
  before update on marketing_items
  for each row
  execute function marketing_items_keep_original();
