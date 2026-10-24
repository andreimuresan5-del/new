import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useLocations } from '../locations/api'
import type { StaffRole } from '../../lib/database.types'
import { ROLE_LABELS, ROLE_ORDER, isLocationRole } from '../../lib/roles'
import { useTeam, useUpdateTeamMember, type TeamMember } from './api'

function errorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('staff_profiles_location_role_needs_location')) {
    return 'Rolul ales lucrează pe o singură locație: alege locația.'
  }
  if (msg.includes('cel puțin un administrator')) {
    return 'Trebuie să rămână cel puțin un administrator.'
  }
  return 'Nu s-a salvat. Verifică conexiunea și încearcă din nou.'
}

function MemberRow({ member, canEdit }: { member: TeamMember; canEdit: boolean }) {
  const { data: locations } = useLocations()
  const update = useUpdateTeamMember()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(member.name)
  const [role, setRole] = useState<StaffRole>(member.role)
  const [locationId, setLocationId] = useState<string>(member.location_id ?? '')
  const [error, setError] = useState<string | null>(null)

  const needsLocation = isLocationRole(role)

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

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">{member.name}</p>
          <p className="text-sm text-gray-500">
            {ROLE_LABELS[member.role] ?? member.role}
            {member.locations?.name ? ` · ${member.locations.name}` : ''}
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
      <div className="flex gap-2">
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
      </div>
    </li>
  )
}

export function TeamPage() {
  const { profile } = useAuth()
  const { data: team, isLoading, error } = useTeam()
  const canEdit = profile?.role === 'owner'

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-semibold text-gray-900">Echipa</h1>
      <p className="mt-1 text-sm text-gray-500">
        {canEdit
          ? 'Rolul decide ce vede fiecare. Managerii, șefii de bucătărie și șefii de tură văd doar locația lor.'
          : 'Echipa locației tale.'}
      </p>

      {isLoading && <p className="mt-6 text-gray-500">Se încarcă...</p>}
      {error && <p className="mt-6 text-red-600">Echipa nu s-a putut încărca.</p>}

      {team && (
        <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {team.map((m) => (
            <MemberRow key={m.id} member={m} canEdit={canEdit} />
          ))}
        </ul>
      )}

      {canEdit && (
        <p className="mt-4 text-sm text-gray-500">
          Conturile noi se creează deocamdată din Supabase (vezi README); aici le stabilești rolul și locația.
        </p>
      )}
    </div>
  )
}
