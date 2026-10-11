-- Rol separat pentru cine se ocupă de marketing (ex. Bianca): vede doar pagina
-- Marketing, nu rețete/producție/stoc. Valoarea nouă de enum trebuie comisă
-- înainte să fie folosită în politici, de aceea politicile sunt în migrarea următoare.
alter type staff_role add value if not exists 'marketing';
