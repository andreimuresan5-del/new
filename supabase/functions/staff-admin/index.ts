// Edge Function: conturile echipei.
//
// De ce pe server și nu din client: crearea unui cont atinge `auth.users`, iar
// pentru asta e nevoie de service role — cheia aceea nu ajunge niciodată în
// browser. Funcția e singura cale prin care se fac, se închid și se redeschid
// conturile, și verifică la fiecare apel că cel care cere e `owner`.
//
// Acțiuni (POST, body JSON, câmpul `action`):
//   create     { name, role, location_id?, pin? }  → cont nou; întoarce PIN-ul
//   reset_pin  { id, pin? }                        → PIN nou; întoarce PIN-ul
//   disable    { id }                              → închide contul (+ blochează auth)
//   enable     { id }                              → redeschide contul
//   delete     { id }                              → șterge definitiv, numai dacă
//                                                    omul nu are activitate înregistrată
//
// PIN-ul se întoarce o singură dată, la create și reset_pin: după migrarea
// `20261024000004_ascunde_pin_code` nimeni nu-l mai poate citi din tabel, nici
// owner-ul. Dacă se pierde, se resetează — nu se recuperează.
//
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY sunt injectate
// automat de Supabase. Funcția nu are nevoie de alte secrete.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

const LOCATION_ROLES = ['location_manager', 'head_chef', 'shift_lead'] as const
const ROLES = [
  'owner',
  'location_manager',
  'head_chef',
  'shift_lead',
  'kitchen_manager',
  'production_staff',
  'marketing',
] as const
type Role = (typeof ROLES)[number]

// Aceeași listă ca în constrângerea `staff_profiles_pin_not_trivial`. Ținută în
// două locuri intenționat: aici ca să dăm un mesaj omenesc, în baza de date ca
// plasă pentru orice altă cale de scriere.
const PIN_URI = new Set([
  '000000', '111111', '222222', '333333', '444444',
  '555555', '666666', '777777', '888888', '999999',
  '123456', '654321', '012345', '543210', '123123', '121212',
])

/** Cel care cere trebuie să fie owner activ. Întoarce id-ul lui, sau null. */
async function callerOwnerId(req: Request, db: SupabaseClient): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )
  const { data: user, error } = await userClient.auth.getUser()
  if (error || !user.user) return null

  // rolul se citește cu service role, nu din JWT: un token vechi poate purta un
  // rol pe care omul nu-l mai are
  const { data: profile } = await db
    .from('staff_profiles')
    .select('role, disabled_at')
    .eq('id', user.user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'owner' || profile.disabled_at) return null
  return user.user.id
}

function pinNou(): string {
  for (let i = 0; i < 50; i++) {
    const pin = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
    if (!PIN_URI.has(pin)) return pin
  }
  throw new Error('Nu s-a putut genera un PIN.')
}

/** PIN liber: generat, verificat că nu e deja luat de altcineva. */
async function pinLiber(db: SupabaseClient): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const pin = pinNou()
    const { data } = await db.from('staff_profiles').select('id').eq('pin_code', pin).maybeSingle()
    if (!data) return pin
  }
  throw new Error('Nu s-a găsit un PIN liber. Încearcă din nou.')
}

/** Email sintetic, din nume. Nu se trimite nicio poștă pe el — e doar identificatorul contului. */
function emailDinNume(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  const sufix = crypto.randomUUID().slice(0, 8)
  return `${slug || 'cont'}-${sufix}@kitchen.internal`
}

function validPin(pin: unknown): string | null {
  if (typeof pin !== 'string' || !/^[0-9]{6}$/.test(pin)) return null
  return pin
}

type Body = {
  action?: string
  id?: string
  name?: string
  role?: string
  location_id?: string | null
  pin?: string
}

async function create(db: SupabaseClient, ownerId: string, body: Body) {
  const name = (body.name ?? '').trim()
  if (!name) return json({ error: 'Scrie numele.' }, 400)
  if (!ROLES.includes(body.role as Role)) return json({ error: 'Alege un rol.' }, 400)
  const role = body.role as Role

  const locationId = body.location_id || null
  if (LOCATION_ROLES.includes(role as (typeof LOCATION_ROLES)[number]) && !locationId) {
    return json({ error: 'Rolul ales lucrează pe o singură locație: alege locația.' }, 400)
  }

  let pin: string
  if (body.pin !== undefined && body.pin !== '') {
    const p = validPin(body.pin)
    if (!p) return json({ error: 'PIN-ul are exact 6 cifre.' }, 400)
    if (PIN_URI.has(p)) return json({ error: 'PIN prea previzibil. Alege altul sau lasă-l generat.' }, 400)
    const { data: luat } = await db.from('staff_profiles').select('id').eq('pin_code', p).maybeSingle()
    if (luat) return json({ error: 'PIN-ul e deja folosit de altcineva.' }, 409)
    pin = p
  } else {
    pin = await pinLiber(db)
  }

  const email = emailDinNume(name)
  const { data: created, error: authError } = await db.auth.admin.createUser({
    email,
    password: pin,
    email_confirm: true,
  })
  if (authError || !created.user) {
    console.error('staff-admin create: auth', authError)
    return json({ error: 'Contul nu s-a putut crea.' }, 500)
  }

  const { error: profileError } = await db.from('staff_profiles').insert({
    id: created.user.id,
    name,
    role,
    location_id: locationId,
    pin_code: pin,
    auth_email: email,
    created_by: ownerId,
  })

  if (profileError) {
    // contul de auth a fost creat, profilul nu: îl desfacem, altfel rămâne un
    // cont fără rând în staff_profiles, care se poate loga și nu apare nicăieri
    await db.auth.admin.deleteUser(created.user.id)
    console.error('staff-admin create: profil', profileError)
    return json({ error: mesajEroareDb(profileError.message) }, 400)
  }

  return json({ id: created.user.id, name, pin })
}

async function resetPin(db: SupabaseClient, body: Body) {
  if (!body.id) return json({ error: 'Lipsește contul.' }, 400)

  let pin: string
  if (body.pin !== undefined && body.pin !== '') {
    const p = validPin(body.pin)
    if (!p) return json({ error: 'PIN-ul are exact 6 cifre.' }, 400)
    if (PIN_URI.has(p)) return json({ error: 'PIN prea previzibil. Alege altul sau lasă-l generat.' }, 400)
    const { data: luat } = await db.from('staff_profiles').select('id').eq('pin_code', p).maybeSingle()
    if (luat && luat.id !== body.id) return json({ error: 'PIN-ul e deja folosit de altcineva.' }, 409)
    pin = p
  } else {
    pin = await pinLiber(db)
  }

  // întâi în tabel: dacă aici cade (PIN luat între timp), parola contului rămâne
  // cea veche și omul se poate loga în continuare
  const { error: dbError } = await db
    .from('staff_profiles')
    .update({ pin_code: pin })
    .eq('id', body.id)
  if (dbError) return json({ error: mesajEroareDb(dbError.message) }, 400)

  const { error: authError } = await db.auth.admin.updateUserById(body.id, { password: pin })
  if (authError) {
    console.error('staff-admin reset_pin: auth', authError)
    return json({ error: 'PIN-ul s-a schimbat în fișa omului, dar nu la logare. Încearcă din nou.' }, 500)
  }

  return json({ id: body.id, pin })
}

async function setDisabled(db: SupabaseClient, body: Body, closing: boolean) {
  if (!body.id) return json({ error: 'Lipsește contul.' }, 400)

  const { error: dbError } = await db
    .from('staff_profiles')
    .update({ disabled_at: closing ? new Date().toISOString() : null })
    .eq('id', body.id)
  if (dbError) return json({ error: mesajEroareDb(dbError.message) }, 400)

  // Blocarea contului de auth e a doua jumătate: fără ea, cu logare pe email
  // omul ar putea intra în continuare. 100 de ani ≈ pentru totdeauna.
  const { error: authError } = await db.auth.admin.updateUserById(body.id, {
    ban_duration: closing ? '876000h' : 'none',
  })
  if (authError) {
    console.error('staff-admin disable: auth', authError)
    return json({ error: 'Contul s-a marcat, dar blocarea la logare n-a reușit. Încearcă din nou.' }, 500)
  }

  return json({ id: body.id, disabled: closing })
}

async function remove(db: SupabaseClient, ownerId: string, body: Body) {
  if (!body.id) return json({ error: 'Lipsește contul.' }, 400)
  if (body.id === ownerId) {
    return json({ error: 'Nu-ți poți șterge propriul cont.' }, 400)
  }

  const { error } = await db.auth.admin.deleteUser(body.id)
  if (error) {
    console.error('staff-admin delete', error)
    return json({ error: mesajEroareDb(error.message) }, 400)
  }
  return json({ id: body.id, deleted: true })
}

/** Erorile bazei de date, traduse în ceva ce se poate citi în interfață. */
function mesajEroareDb(msg: string): string {
  if (msg.includes('staff_profiles_location_role_needs_location')) {
    return 'Rolul ales lucrează pe o singură locație: alege locația.'
  }
  if (msg.includes('staff_profiles_pin_not_trivial')) {
    return 'PIN prea previzibil. Alege altul sau lasă-l generat.'
  }
  if (msg.includes('staff_profiles_pin_code_key')) {
    return 'PIN-ul e deja folosit de altcineva.'
  }
  if (msg.includes('administrator')) {
    return 'Trebuie să rămână cel puțin un administrator activ.'
  }
  // producții, fișe HACCP, mișcări de stoc pe numele lui: cheile străine opresc
  // ștergerea, ca să nu dispară istoricul împreună cu omul
  if (msg.includes('violates foreign key constraint')) {
    return 'Omul are activitate înregistrată (producții, HACCP, stoc) și nu se poate șterge. Închide-i contul.'
  }
  return 'Nu s-a salvat. Verifică datele și încearcă din nou.'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const ownerId = await callerOwnerId(req, db)
  if (!ownerId) return json({ error: 'unauthorized' }, 401)

  const body = (await req.json().catch(() => ({}))) as Body

  switch (body.action) {
    case 'create':
      return await create(db, ownerId, body)
    case 'reset_pin':
      return await resetPin(db, body)
    case 'disable':
      return await setDisabled(db, body, true)
    case 'enable':
      return await setDisabled(db, body, false)
    case 'delete':
      return await remove(db, ownerId, body)
    default:
      return json({ error: 'acțiune necunoscută' }, 400)
  }
})
