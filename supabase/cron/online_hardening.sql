-- De rulat MANUAL pe proiectul online (nu e migrare: local, bucătăria se loghează cu PIN).
-- Online, PIN-ul de 6 cifre se poate ghici prin încercări, iar funcția de mai jos
-- îl verifică fără autentificare. Owner-ul intră cu email + parolă (VITE_LOGIN_MODE=email).
revoke execute on function get_login_email_by_pin(text) from anon, authenticated, public;
