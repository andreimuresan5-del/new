-- Programare agent concurență — de rulat MANUAL (SQL Editor), o singură dată per
-- proiect, după deploy-ul funcției. Nu e migrare ca `supabase db reset` local să nu
-- pornească singur apeluri plătite către API-ul Claude.
--
-- Înainte, salvează în Vault URL-ul proiectului și secretul de cron (același ca
-- secretul funcției COMPETITOR_SCAN_CRON_SECRET):
--
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<secret lung, aleator>', 'competitor_scan_cron_secret');
--   select vault.create_secret('<anon key>', 'anon_key');
--
-- La fiecare 15 minute funcția scanează o singură țintă scadentă (nescanată în
-- ultimele 44h, adică ~o dată la 2 zile); când nu e nimic scadent, iese imediat.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'competitor-scan',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/competitor-scan',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'competitor_scan_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);

-- Oprire: select cron.unschedule('competitor-scan');
