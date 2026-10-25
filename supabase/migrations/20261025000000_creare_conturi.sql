-- Reforma, pasul 2: conturile se fac și se închid din aplicație.
--
-- Conturile se creează din Edge Function-ul `staff-admin` (service role), nu de
-- aici: crearea unui cont atinge `auth.users`, iar asta nu se face din client.
-- Migrarea asta pune ce funcția nu poate garanta singură — constrângeri și
-- trigger-e care prind și o modificare făcută direct din dashboard sau din SQL.

-- ---------------------------------------------------------------------------
-- 1. Conturile se dezactivează, nu se șterg.
--
-- Ștergerea unui om cu activitate înregistrată (producții, HACCP, mișcări de
-- stoc) e oprită oricum de cheile străine — și bine, altfel s-ar pierde istoricul
-- cu el. Dar fără o cale de închidere, un om care pleacă rămâne cu cont valid.
-- Cu structura de iarnă (15 oameni + manager la Drunken Rat) asta se întâmplă
-- în câteva săptămâni, nu într-un an.
--
-- `disabled_at` e singura stare care contează: contul nu se mai poate loga, dar
-- rândul rămâne, deci producțiile și fișele HACCP de pe numele lui rămân citibile.
-- ---------------------------------------------------------------------------
alter table staff_profiles
  add column disabled_at timestamptz;

grant select (disabled_at) on staff_profiles to authenticated;

-- Fără `grant update (disabled_at)`: dezactivarea trece OBLIGATORIU prin
-- `staff-admin`, pentru că nu e doar un câmp în tabel. Funcția blochează în
-- același timp și contul din `auth.users`; altfel, cu `VITE_LOGIN_MODE=email`,
-- omul ar putea intra în continuare cu emailul lui sintetic și PIN-ul drept
-- parolă, iar eticheta din interfață n-ar apăra nimic.

comment on column staff_profiles.disabled_at is
  'Când a fost închis contul. Null = activ. Contul dezactivat nu se poate loga (vezi get_login_email_by_pin), dar rândul rămâne ca să nu se piardă istoricul de pe numele lui.';

-- Logarea cu PIN sare peste conturile închise. Fără asta, dezactivarea ar fi
-- doar o etichetă în interfață: PIN-ul ar continua să funcționeze.
-- Pe lângă asta, `staff-admin` blochează și contul din `auth.users`, ca să nu
-- se poată intra nici pe calea email + parolă.
create or replace function get_login_email_by_pin(pin text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select auth_email from staff_profiles where pin_code = pin and disabled_at is null;
$$;

-- ---------------------------------------------------------------------------
-- 2. Nu lăsăm firma fără niciun administrator.
--
-- `staff_profiles_keep_one_owner` acoperea doar schimbarea rolului. Mai existau
-- două căi prin care se putea ajunge la zero administratori: ștergerea contului
-- și, de acum, dezactivarea lui. Amândouă duceau în același loc — nimeni care
-- să poată da roluri, și nicio cale de reparare din aplicație.
-- ---------------------------------------------------------------------------
create function staff_profiles_require_active_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_se_inchide boolean;
  v_ar_mai_ramane int;
begin
  -- La UPDATE ne interesează numai trecerea din activ în inactiv; o reactivare
  -- sau o altă modificare nu pot lăsa firma fără administrator.
  v_se_inchide := tg_op = 'DELETE'
    or (old.disabled_at is null and new.disabled_at is not null);

  if v_se_inchide and old.role = 'owner' then
    select count(*) into v_ar_mai_ramane
    from staff_profiles
    where role = 'owner' and disabled_at is null and id <> old.id;

    if v_ar_mai_ramane = 0 then
      raise exception 'Trebuie să rămână cel puțin un administrator (owner) activ.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger staff_profiles_require_active_owner_on_delete
  before delete on staff_profiles
  for each row execute function staff_profiles_require_active_owner();

create trigger staff_profiles_require_active_owner_on_disable
  before update of disabled_at on staff_profiles
  for each row execute function staff_profiles_require_active_owner();

-- Trigger-ele sunt pe staff_profiles, nu pe auth.users, intenționat: ștergerea
-- unui `auth.users` cade în cascadă pe staff_profiles (FK on delete cascade),
-- deci trigger-ul de aici se declanșează și atunci și anulează toată ștergerea.

-- ---------------------------------------------------------------------------
-- 3. PIN-urile banale nu trec.
--
-- `pin_code` avea deja `unique` și formatul de 6 cifre din Faza 1. Ce lipsea
-- erau PIN-urile previzibile: un „123456" dat „până îl schimbăm" rămâne luni.
-- PIN-ul e și parola contului, iar la 15–16 oameni pe locație nu există nicio
-- șansă să nu circule.
--
-- Lista e scurtă și explicită, nu un algoritm: trebuie să poată fi citită de
-- cineva care se întreabă de ce i-a fost refuzat PIN-ul.
-- ---------------------------------------------------------------------------
alter table staff_profiles
  add constraint staff_profiles_pin_not_trivial
  check (
    pin_code not in (
      '000000', '111111', '222222', '333333', '444444',
      '555555', '666666', '777777', '888888', '999999',
      '123456', '654321', '012345', '543210', '123123', '121212'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Cine a creat contul.
--
-- Nu de dragul auditului în general: fără asta, la prima întrebare „cine i-a dat
-- lui X acces" nu există răspuns. Rămâne null pentru conturile de dinainte —
-- nu inventăm un autor.
-- ---------------------------------------------------------------------------
alter table staff_profiles
  add column created_by uuid references staff_profiles (id) on delete set null;

grant select (created_by) on staff_profiles to authenticated;

comment on column staff_profiles.created_by is
  'Owner-ul care a creat contul din aplicație (Edge Function staff-admin). Null pentru conturile create înainte de pasul 2 sau direct în baza de date.';
