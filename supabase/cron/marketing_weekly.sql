-- Plan de marketing automat, lunea la 05:00 UTC (08:00 vara / 07:00 iarna, ora României).
-- De rulat MANUAL (SQL Editor), după deploy-ul funcției `marketing-agent`.
-- Folosește aceleași secrete din Vault ca agentul de concurență (vezi competitor_scan.sql).

select cron.schedule(
  'marketing-weekly',
  '0 5 * * 1',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/marketing-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'competitor_scan_cron_secret')
    ),
    body := '{"task": "weekly_plan"}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);

-- Oprire: select cron.unschedule('marketing-weekly');
