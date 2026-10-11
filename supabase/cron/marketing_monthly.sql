-- Raport de marketing lunar, pe 1 ale lunii la 06:00 UTC, pentru luna trecută.
-- De rulat MANUAL (SQL Editor), după deploy-ul funcției `marketing-agent`.
-- Folosește aceleași secrete din Vault ca restul programărilor (vezi competitor_scan.sql).

select cron.schedule(
  'marketing-monthly',
  '0 6 1 * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/marketing-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'competitor_scan_cron_secret')
    ),
    body := '{"task": "monthly_report"}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);

-- Oprire: select cron.unschedule('marketing-monthly');
