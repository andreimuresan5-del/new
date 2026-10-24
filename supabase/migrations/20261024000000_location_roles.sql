-- Reforma: roluri pe locație pentru Drunken Rat și Astur.
--   location_manager — managerul unei locații
--   head_chef        — șeful de bucătărie al unei locații
--   shift_lead       — șeful de tură al unei locații
-- Administratorii (Andrei, Alex) folosesc rolul existent `owner`: văd tot.
--
-- Valorile noi de enum trebuie comise înainte să fie folosite în politici,
-- de aceea politicile sunt în migrarea următoare (același tipar ca la `marketing`).
alter type staff_role add value if not exists 'location_manager';
alter type staff_role add value if not exists 'head_chef';
alter type staff_role add value if not exists 'shift_lead';
