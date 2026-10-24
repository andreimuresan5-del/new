-- PIN-ul e chiar parola contului (vezi README, login cu PIN). Până acum oricine
-- vedea un rând din staff_profiles îi vedea și PIN-ul: owner-ul, kitchen_manager
-- (toți, inclusiv owner-ul) și managerul de locație (echipa lui) puteau intra
-- în contul altcuiva.
--
-- Dreptul de citire era dat pe tot tabelul (20260701000001_grants.sql), iar un
-- `revoke select (pin_code)` nu are efect cât timp există dreptul pe tabel.
-- Deci se retrage dreptul pe tabel și se dă înapoi pe fiecare coloană, fără pin_code.
--
-- Logarea nu e afectată: get_login_email_by_pin rulează ca security definer.
-- Aplicația nu citește pin_code nicăieri (doar id, name, role, location_id).
revoke select on staff_profiles from authenticated;
grant select (id, name, role, location_id, auth_email, created_at) on staff_profiles to authenticated;
