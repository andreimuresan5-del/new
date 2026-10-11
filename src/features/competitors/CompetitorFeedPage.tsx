import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CATEGORY_LABELS,
  useFindings,
  useMarkFindingsRead,
  type FindingCategory,
  type FindingImportance,
} from './api'

const importanceClass: Record<FindingImportance, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-gray-100 text-gray-700',
}

const importanceLabel: Record<FindingImportance, string> = {
  high: 'Important',
  medium: 'De urmărit',
  low: 'Info',
}

export function CompetitorFeedPage() {
  const [onlyUnread, setOnlyUnread] = useState(true)
  const [category, setCategory] = useState<FindingCategory | 'all'>('all')
  const { data: findings, isLoading } = useFindings(onlyUnread)
  const markRead = useMarkFindingsRead()

  const visible = (findings ?? []).filter((f) => category === 'all' || f.category === category)
  const unreadVisibleIds = visible.filter((f) => !f.read_at).map((f) => f.id)

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Iscoada</h1>
        <Link to="/concurenta/setari" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Concurenți și zone →
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Ce s-a schimbat la concurență: prețuri, meniuri, recenzii, promoții, deschideri noi.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FindingCategory | 'all')}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="all">Toate categoriile</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm text-gray-600">
          <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
          Doar necitite
        </label>
        {unreadVisibleIds.length > 0 && (
          <button
            type="button"
            onClick={() => markRead.mutate(unreadVisibleIds)}
            disabled={markRead.isPending}
            className="ml-auto text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Marchează toate citite
          </button>
        )}
      </div>

      {isLoading && <p className="mt-6 text-sm text-gray-500">Se încarcă...</p>}
      {!isLoading && visible.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          Nimic nou. Iscoada verifică la fiecare 2 zile concurenții și zonele active.
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {visible.map((f) => (
          <li
            key={f.id}
            className={`rounded-lg border bg-white p-4 ${f.read_at ? 'border-gray-200 opacity-70' : 'border-gray-300'}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded px-1.5 py-0.5 font-medium ${importanceClass[f.importance]}`}>
                {importanceLabel[f.importance]}
              </span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{CATEGORY_LABELS[f.category]}</span>
              <span className="font-medium text-gray-900">
                {f.competitors?.name ?? f.competitor_watch_areas?.name}
              </span>
              <span className="ml-auto text-gray-500">{new Date(f.detected_at).toLocaleDateString('ro-RO')}</span>
            </div>
            <p className="mt-2 font-medium text-gray-900">{f.title}</p>
            <p className="mt-1 text-sm text-gray-600">{f.summary}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              {f.source_url && /^https?:\/\//.test(f.source_url) && (
                <a href={f.source_url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                  Sursă
                </a>
              )}
              {!f.read_at && (
                <button
                  type="button"
                  onClick={() => markRead.mutate([f.id])}
                  className="font-medium text-gray-500 hover:text-gray-900"
                >
                  Citit
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
