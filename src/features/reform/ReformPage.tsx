import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocations } from '../locations/api'
import {
  STATUS_LABELS,
  STATUS_ORDER,
  useAdministrators,
  useReformIssues,
  type ReformIssue,
} from './api'

const STATUS_PILL: Record<string, string> = {
  nou: 'bg-blue-50 text-blue-800',
  lucru: 'bg-amber-50 text-amber-800',
  blocat: 'bg-red-50 text-red-800',
  gata: 'bg-green-50 text-green-800',
}

const STATUS_STRIPE: Record<string, string> = {
  nou: 'bg-blue-700',
  lucru: 'bg-amber-600',
  blocat: 'bg-red-700',
  gata: 'bg-green-700',
}

export function formatLei(value: number | null) {
  if (value == null) return null
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('ro-RO', { maximumFractionDigits: 2 })} mil`
  }
  return `${Math.round(value / 1000).toLocaleString('ro-RO')}k`
}

export function formatDate(value: string | null) {
  if (!value) return null
  const [y, m, d] = value.split('-')
  return `${d}.${m}.${y}`
}

export function ReformPage() {
  const { data: issues } = useReformIssues()
  const { data: administrators } = useAdministrators()
  const { data: locations } = useLocations()
  const [filter, setFilter] = useState('deschise')

  const all = issues ?? []
  const open = all.filter((i) => i.status !== 'gata')
  const blocked = open.filter((i) => i.status === 'blocat')
  const inPlay = open.reduce((sum, i) => sum + (i.value_per_year ?? 0), 0)

  function passes(issue: ReformIssue) {
    if (filter === 'deschise') return issue.status !== 'gata'
    if (filter === 'gata') return issue.status === 'gata'
    if (filter === 'toate') return true
    if (filter === 'grup') return issue.location_id === null
    if (filter.startsWith('loc:')) return issue.location_id === filter.slice(4)
    if (filter.startsWith('adm:')) {
      return issue.reform_issue_owners.some((o) => o.administrator_id === filter.slice(4))
    }
    return true
  }

  const shown = all
    .filter(passes)
    .slice()
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
        (b.value_per_year ?? 0) - (a.value_per_year ?? 0),
    )

  const chips: { key: string; label: string }[] = [
    { key: 'deschise', label: 'Deschise' },
    { key: 'toate', label: 'Toate' },
    { key: 'grup', label: 'Grup' },
    ...(locations ?? []).map((l) => ({ key: `loc:${l.id}`, label: l.name })),
    ...(administrators ?? []).map((a) => ({ key: `adm:${a.id}`, label: a.name })),
    { key: 'gata', label: 'Rezolvate' },
  ]

  const adminName = (id: string) => administrators?.find((a) => a.id === id)?.name

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Reforma</h1>
        <Link to="/reforma/decizii" className="text-sm font-medium text-gray-600 underline">
          Decizii
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Problemele de reașezare a companiei, cu responsabil, termen și valoarea pe an.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <p className="text-xs text-gray-500">Deschise</p>
          <p className="text-lg font-semibold tabular-nums text-gray-900">{open.length}</p>
          <p className="text-xs text-gray-500">din {all.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <p className="text-xs text-gray-500">Blocate</p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              blocked.length > 0 ? 'text-red-700' : 'text-gray-900'
            }`}
          >
            {blocked.length}
          </p>
          <p className="text-xs text-gray-500">aștept ceva</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
          <p className="text-xs text-gray-500">În joc</p>
          <p className="text-lg font-semibold tabular-nums text-gray-900">
            {formatLei(inPlay) ?? '0'}
          </p>
          <p className="text-xs text-gray-500">lei pe an</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter(c.key)}
            aria-pressed={filter === c.key}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${
              filter === c.key
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {shown.map((issue) => (
          <Link
            key={issue.id}
            to={`/reforma/${issue.id}`}
            className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3"
          >
            <span
              aria-hidden="true"
              className={`w-1 shrink-0 rounded ${STATUS_STRIPE[issue.status]}`}
            />
            <span className="min-w-0 flex-1">
              <span
                className={`block font-medium ${
                  issue.status === 'gata' ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {issue.title}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    STATUS_PILL[issue.status]
                  }`}
                >
                  {STATUS_LABELS[issue.status]}
                </span>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {issue.locations?.name ?? 'Grup'}
                </span>
                {issue.value_per_year != null && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-rose-900">
                    {formatLei(issue.value_per_year)} lei/an
                  </span>
                )}
                {issue.reform_issue_owners.length > 0 && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {issue.reform_issue_owners
                      .map((o) => adminName(o.administrator_id))
                      .filter(Boolean)
                      .join(' + ')}
                  </span>
                )}
                {issue.due_date && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    până la {formatDate(issue.due_date)}
                  </span>
                )}
              </span>
              {issue.next_step && (
                <span className="mt-1.5 block text-sm text-gray-500">
                  Pasul următor: {issue.next_step}
                </span>
              )}
            </span>
          </Link>
        ))}

        {shown.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
            {all.length === 0
              ? 'Încă nu e nicio problemă în listă. Apasă „Adaugă problemă” ca să o treci pe prima.'
              : 'Nimic la acest filtru.'}
          </p>
        )}
      </div>

      <div className="mt-5">
        <Link
          to="/reforma/nou"
          className="inline-block rounded-md bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Adaugă problemă
        </Link>
      </div>
    </div>
  )
}
