import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLocations } from '../locations/api'
import { formatDate } from './ReformPage'
import {
  STATUS_LABELS,
  useAdministrators,
  useDeleteIssue,
  useReformIssue,
  useSaveIssue,
  type ReformStatus,
} from './api'

const STATUSES: ReformStatus[] = ['nou', 'lucru', 'blocat', 'gata']

export function ReformIssuePage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === undefined
  const navigate = useNavigate()
  const { data: issue } = useReformIssue(id)
  const { data: administrators } = useAdministrators()
  const { data: locations } = useLocations()
  const save = useSaveIssue()
  const remove = useDeleteIssue()

  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<ReformStatus>('nou')
  const [locationId, setLocationId] = useState('')
  const [area, setArea] = useState('')
  const [value, setValue] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [notes, setNotes] = useState('')
  const [owners, setOwners] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Umplem formularul când sosește problema. Fără asta, câmpurile ar rămâne goale
  // la reîncărcarea paginii de detaliu.
  useEffect(() => {
    if (!issue) return
    setTitle(issue.title)
    setStatus(issue.status)
    setLocationId(issue.location_id ?? '')
    setArea(issue.area ?? '')
    setValue(issue.value_per_year != null ? String(issue.value_per_year) : '')
    setDueDate(issue.due_date ?? '')
    setNextStep(issue.next_step ?? '')
    setNotes(issue.notes ?? '')
    setOwners(issue.reform_issue_owners.map((o) => o.administrator_id))
  }, [issue])

  function toggleOwner(administratorId: string) {
    setOwners((current) =>
      current.includes(administratorId)
        ? current.filter((x) => x !== administratorId)
        : [...current, administratorId],
    )
  }

  async function submit() {
    setError(null)
    if (!title.trim()) {
      setError('Scrie un titlu pentru problemă.')
      return
    }
    const digits = value.replace(/[^\d]/g, '')
    try {
      await save.mutateAsync({
        id,
        input: {
          title: title.trim(),
          status,
          locationId: locationId || null,
          area: area.trim() || null,
          valuePerYear: digits ? Number(digits) : null,
          dueDate: dueDate || null,
          nextStep: nextStep.trim() || null,
          notes: notes.trim() || null,
          administratorIds: owners,
        },
      })
      navigate('/reforma')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a salvat.')
    }
  }

  async function doDelete() {
    if (!id) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      await remove.mutateAsync(id)
      navigate('/reforma')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a șters.')
    }
  }

  const input = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2'
  const label = 'block text-sm font-medium text-gray-700'

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="text-xl font-semibold text-gray-900">
        {isNew ? 'Problemă nouă' : 'Problemă'}
      </h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className={label} htmlFor="reforma-titlu">
            Titlu
          </label>
          <input
            id="reforma-titlu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={input}
          />
        </div>

        <div>
          <span className={label}>Stadiu</span>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`rounded-md border px-2 py-2 text-xs font-semibold ${
                  status === s
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="reforma-locatie">
              Locația
            </label>
            <select
              id="reforma-locatie"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className={input}
            >
              <option value="">Grup</option>
              {locations?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="reforma-domeniu">
              Domeniu
            </label>
            <input
              id="reforma-domeniu"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Bani, Personal, Bucătărie…"
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="reforma-valoare">
              Valoare estimată, lei pe an
            </label>
            <input
              id="reforma-valoare"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="reforma-termen">
              Termen
            </label>
            <input
              id="reforma-termen"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={input}
            />
          </div>
        </div>

        <div>
          <span className={label}>Responsabil</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {administrators?.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleOwner(a.id)}
                aria-pressed={owners.includes(a.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium ${
                  owners.includes(a.id)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
          {administrators?.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Niciun administrator în listă încă.
            </p>
          )}
        </div>

        <div>
          <label className={label} htmlFor="reforma-pas">
            Pasul următor
          </label>
          <input
            id="reforma-pas"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            className={input}
          />
        </div>

        <div>
          <label className={label} htmlFor="reforma-note">
            Detalii și note
          </label>
          <textarea
            id="reforma-note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className={input}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={save.isPending}
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {save.isPending ? 'Se salvează...' : 'Salvează'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reforma')}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700"
          >
            Anulează
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => void doDelete()}
              className={`ml-auto rounded-md border px-4 py-2 font-medium ${
                confirmDelete
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {confirmDelete ? 'Confirmă ștergerea' : 'Șterge'}
            </button>
          )}
        </div>

        {issue && (
          <p className="text-xs text-gray-500">
            Ultima modificare: {issue.staff_profiles?.name ?? 'necunoscut'},{' '}
            {formatDate(issue.updated_at.slice(0, 10))},{' '}
            {new Date(issue.updated_at).toLocaleTimeString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
