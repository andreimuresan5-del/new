import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useLocations } from '../locations/api'
import type { StaffRole } from '../../lib/database.types'
import { ROLE_LABELS, ROLE_ORDER, isLocationRole } from '../../lib/roles'
import {
  useCreateStaff,
  useResetPin,
  useSetStaffDisabled,
  useTeam,
  useUpdateTeamMember,
  type TeamMember,
} from './api'

function errorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('staff_profiles_location_role_needs_location')) {
    return 'Rolul ales lucrează pe o singură locație: alege locația.'
  }
  if (msg.includes('administrator')) {
    return 'Trebuie să rămână cel puțin un administrator activ.'
  }
  // mesajele venite din staff-admin sunt deja scrise pentru om
  if (/[a-zăâîșț]\s/i.test(msg) && msg.length < 160 && !msg.includes('status code')) return msg
  return 'Nu s-a salvat. Verifică conexiunea și încearcă din nou.'
}

/**
 * PIN-ul se arată o singură dată. După migrarea care l-a scos din coloanele
 * citibile, nimeni nu-l mai poate afla — nici owner-ul. Dacă se pierde, se
 * resetează.
 */
function PinNou({ name, pin, onClose }: { name: string; pin: string; onClose: () => void }) {
  return (
    <div className="mt-4 rounded-lg border-2 border-gray-900 bg-white p-4">
      <p className="text-sm text-gray-600">PIN pentru {name}</p>
      <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-gray-900">{pin}</p>
      <p className="mt-2 text-sm text-gray-700">
        <strong>Notează-l acum și dă-i-l lui.</strong> Nu se mai poate afla după ce închizi caseta —
        dacă se pierde, se face un PIN nou.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Am notat
      </button>
    </div>
  )
}

function MemberRow({
  member,
  canEdit,
  isSelf,
  onPin,
}: {
  member: TeamMember
  canEdit: boolean
  isSelf: boolean
  onPin: (name: string, pin: string) => void
}) {
  const { data: locations } = useLocations()
  const update = useUpdateTeamMember()
  const resetPin = useResetPin()
  const setDisabled = useSetStaffDisabled()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(member.name)
  const [role, setRole] = useState<StaffRole>(member.role)
  const [locationId, setLocationId] = useState<string>(member.location_id ?? '')
  const [error, setError] = useState<string | null>(null)

  const needsLocation = isLocationRole(role)
  const closed = !!member.disabled_at

  function startEdit() {
    setName(member.name)
    setRole(member.role)
    setLocationId(member.location_id ?? '')
    setError(null)
    setEditing(true)
  }

  async function save() {
    if (!name.trim()) return setError('Scrie numele.')
    if (needsLocation && !locationId) return setError('Rolul ales lucrează pe o singură locație: alege locația.')
    setError(null)
    try {
      await update.mutateAsync({
        id: member.id,
        name: name.trim(),
        role,
        location_id: locationId || null,
      })
      setEditing(false)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  async function newPin() {
    setError(null)
    try {
      const res = await resetPin.mutateAsync({ id: member.id })
      onPin(member.name, res.pin)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  async function toggleClosed() {
    setError(null)
    try {
      await setDisabled.mutateAsync({ id: member.id, disabled: !closed })
      setEditing(false)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className={`truncate font-medium ${closed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
            {member.name}
          </p>
          <p className="text-sm text-gray-500">
            {ROLE_LABELS[member.role] ?? member.role}
            {member.locations?.name ? ` · ${member.locations.name}` : ''}
            {closed ? ' · cont închis' : ''}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700"
          >
            Modifică
          </button>
        )}
      </li>
    )
  }

  return (
    <li className="space-y-3 bg-gray-50 px-4 py-3">
      <label className="block text-sm text-gray-600">
        Nume
        <input
          id={`name-${member.id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-gray-600">
          Rol
          <select
            id={`role-${member.id}`}
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
          >
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-gray-600">
          Locație{needsLocation ? '' : ' (opțional)'}
          <select
            id={`location-${member.id}`}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
          >
            <option value="">{needsLocation ? 'Alege locația' : 'Toate'}</option>
            {(locations ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={update.isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {update.isPending ? 'Se salvează...' : 'Salvează'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Renunță
        </button>
        <button
          type="button"
          onClick={() => void newPin()}
          disabled={resetPin.isPending || closed}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          title={closed ? 'Contul e închis. Redeschide-l mai întâi.' : 'Face un PIN nou și îl arată o dată'}
        >
          {resetPin.isPending ? 'Se face...' : 'PIN nou'}
        </button>
        {!isSelf && (
          <button
            type="button"
            onClick={() => void toggleClosed()}
            disabled={setDisabled.isPending}
            className={`rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              closed ? 'border-gray-300 text-gray-700' : 'border-red-300 text-red-700'
            }`}
          >
            {setDisabled.isPending ? 'Se aplică...' : closed ? 'Redeschide contul' : 'Închide contul'}
          </button>
        )}
      </div>
      {!closed && !isSelf && (
        <p className="text-xs text-gray-500">
          Contul închis nu se mai poate loga, dar rămâne în listă — producțiile și fișele HACCP de pe
          numele lui nu se pierd.
        </p>
      )}
    </li>
  )
}

function AddMember({ onPin }: { onPin: (name: string, pin: string) => void }) {
  const { data: locations } = useLocations()
  const create = useCreateStaff()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState<StaffRole>('shift_lead')
  const [locationId, setLocationId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const needsLocation = isLocationRole(role)

  function reset() {
    setName('')
    setRole('shift_lead')
    setLocationId('')
    setError(null)
  }

  async function submit() {
    if (!name.trim()) return setError('Scrie numele.')
    if (needsLocation && !locationId) return setError('Rolul ales lucrează pe o singură locație: alege locația.')
    setError(null)
    try {
      const res = await create.mutateAsync({
        name: name.trim(),
        role,
        location_id: locationId || null,
      })
      onPin(res.name, res.pin)
      reset()
      setOpen(false)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Adaugă om
      </button>
    )
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-900">Cont nou</p>
      <label className="block text-sm text-gray-600">
        Nume
        <input
          id="nou-nume"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Numele cu care îl strigi"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-gray-600">
          Rol
          <select
            id="nou-rol"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
          >
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-gray-600">
          Locație{needsLocation ? '' : ' (opțional)'}
          <select
            id="nou-locatie"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
          >
            <option value="">{needsLocation ? 'Alege locația' : 'Toate'}</option>
            {(locations ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-gray-500">
        PIN-ul se generează automat și se arată o singură dată, după ce apeși „Creează".
      </p>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={create.isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {create.isPending ? 'Se creează...' : 'Creează'}
        </button>
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Renunță
        </button>
      </div>
    </div>
  )
}

export function TeamPage() {
  const { profile } = useAuth()
  const { data: team, isLoading, error } = useTeam()
  const [pin, setPin] = useState<{ name: string; pin: string } | null>(null)
  const canEdit = profile?.role === 'owner'

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-semibold text-gray-900">Echipa</h1>
      <p className="mt-1 text-sm text-gray-500">
        {canEdit
          ? 'Rolul decide ce vede fiecare. Managerii, șefii de bucătărie și șefii de tură văd doar locația lor.'
          : 'Echipa locației tale.'}
      </p>

      {pin && <PinNou name={pin.name} pin={pin.pin} onClose={() => setPin(null)} />}

      {canEdit && <AddMember onPin={(name, p) => setPin({ name, pin: p })} />}

      {isLoading && <p className="mt-6 text-gray-500">Se încarcă...</p>}
      {error && <p className="mt-6 text-red-600">Echipa nu s-a putut încărca.</p>}

      {team && (
        <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {team.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              canEdit={canEdit}
              isSelf={m.id === profile?.id}
              onPin={(name, p) => setPin({ name, pin: p })}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
