-- „Întreabă marketerul”: chat-ul Biancăi cu agentul. O conversație per utilizator
-- și brand; agentul vede profilul brandului și ce se întâmplă în aplicație.
create table marketing_chat_messages (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references marketing_brands (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index marketing_chat_messages_thread_idx on marketing_chat_messages (user_id, brand_id, created_at);

alter table marketing_chat_messages enable row level security;

-- fiecare își vede doar conversația proprie; scrierea o face funcția (service role)
create policy marketing_chat_select_own on marketing_chat_messages
  for select using (user_id = auth.uid() and current_staff_role() in ('owner', 'marketing'));

create policy marketing_chat_delete_own on marketing_chat_messages
  for delete using (user_id = auth.uid() and current_staff_role() in ('owner', 'marketing'));

grant select, delete on marketing_chat_messages to authenticated;

alter table marketing_runs drop constraint marketing_runs_task_check;
alter table marketing_runs add constraint marketing_runs_task_check check (task in (
  'weekly_plan', 'review_reply', 'menu_text', 'event_packages', 'event_message', 'monthly_report', 'chat'
));
