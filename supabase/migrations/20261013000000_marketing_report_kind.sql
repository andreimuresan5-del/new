-- Raportul lunar e tot un material al agentului (marketing_items.kind = 'report').
-- Separat de migrarea următoare: o valoare nouă de enum trebuie comisă înainte de folosire.
alter type marketing_item_kind add value if not exists 'report';
