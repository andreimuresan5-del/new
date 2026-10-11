-- Chat: poze atașate și acțiuni făcute de agent.
--   * image_path — poza trimisă de utilizator, în bucket-ul privat `marketing-uploads`;
--   * actions — ce a creat agentul în aplicație la mesajul ăsta (ciorne în Plan,
--     cereri de eveniment, meniul zilei, răspunsuri la recenzii), pentru afișare.
alter table marketing_chat_messages
  add column image_path text,
  add column actions jsonb;

-- Pozele din chat sunt private: le văd doar owner-ul și echipa de marketing.
insert into storage.buckets (id, name, public)
values ('marketing-uploads', 'marketing-uploads', false)
on conflict (id) do nothing;

create policy marketing_uploads_team_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'marketing-uploads' and current_staff_role() in ('owner', 'marketing'));

create policy marketing_uploads_team_select on storage.objects
  for select to authenticated
  using (bucket_id = 'marketing-uploads' and current_staff_role() in ('owner', 'marketing'));
