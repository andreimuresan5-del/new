import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocations } from '../locations/api'
import { formatDate } from './ReformPage'
import {
  useDeleteDecision,
  useReformDecisions,
  useSaveDecision,
  type ReformDecision,
  type ReformDecisionState,
} from './api'

const STATE_LABELS: Record<ReformDecisionState, string> = {
  propus: 'Propus',
  decis: 'Decis',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function DecisionForm({
  decision,
  onDone,
}: {
  decision?: ReformDecision
  onDone: () => void
}) {
  const { data: locations } = useLocations()
  const save = useSaveDecision()
  const remove = useDeleteDecision()
  const [statement, setStatement] = useState(decision?.statement ?? '')
  const [state, setState] = useState<ReformDecisionState>(decision?.state ?? 'propus')
  const [decidedOn, setDecidedOn] = useState(decision?.decided_on ?? today())
  const [locationId, setLocationId] = useState(decision?.location_id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const input = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2'
  const label = 'block text-sm font-medium text-gray-700'

  async function submit() {
    setError(null)
    if (!statement.trim()) {
      setError('Scrie ce s-a hotărât.')
      return
    }
    try {
      await save.mutateAsync({
        id: decision?.id,
        input: {
          statement: statement.trim(),
          state,
          decidedOn: decidedOn || null,
          locationId: locationId || null,
        },
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a salvat.')
    }
  }

  async function doDelete() {
    if (!decision) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    try {
      await remove.mutateAsync(decision.id)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a șters.')
    }
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4">
      <div className="space-y-4">
        <div>
          <label className={label} htmlFor="dec-text">
            Ce s-a hotărât
          </label>
          <textarea
            id="dec-text"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={4}
            className={input}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="dec-data">
              Data
            </label>
            <input
              id="dec-data"
              type="date"
              value={decidedOn}
              onChange={(e) => setDecidedOn(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className={label} htmlFor="dec-loc">
              Locația
            </label>
            <select
              id="dec-loc"
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
        </div>
        <div>
          <span className={label}>Stare</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(['propus', 'decis'] as ReformDecisionState[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                aria-pressed={state === s}
                className={`rounded-md border px-2 py-2 text-sm font-semibold ${
                  state === s
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {STATE_LABELS[s]}
              </button>
            ))}
          </div>
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
            onClick={onDone}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700"
          >
            Anulează
          </button>
          {decision && (
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
      </div>
    </div>
  )
}

export function ReformDecisionsPage() {
  const { data: decisions } = useReformDecisions()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Decizii</h1>
        <Link to="/reforma" className="text-sm font-medium text-gray-600 underline">
          Problemele
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Ce ați hotărât, cu data. Propus sau decis.
      </p>

      <div className="mt-5 space-y-3">
        {adding && <DecisionForm onDone={() => setAdding(false)} />}

        {(decisions ?? []).map((d) =>
          editingId === d.id ? (
            <DecisionForm key={d.id} decision={d} onDone={() => setEditingId(null)} />
          ) : (
            <button
              key={d.id}
              type="button"
              onClick={() => setEditingId(d.id)}
              className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-left"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    d.state === 'decis'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {STATE_LABELS[d.state]}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {d.locations?.name ?? 'Grup'}
                </span>
                {d.decided_on && (
                  <span className="text-xs text-gray-500">{formatDate(d.decided_on)}</span>
                )}
              </span>
              <span className="mt-2 block text-gray-900">{d.statement}</span>
            </button>
          ),
        )}

        {(decisions ?? []).length === 0 && !adding && (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
            Nicio decizie trecută încă. Apasă „Adaugă decizie” după fiecare hotărâre luată
            împreună.
          </p>
        )}
      </div>

      {!adding && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white"
          >
            Adaugă decizie
          </button>
        </div>
      )}
    </div>
  )
}
