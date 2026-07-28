import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  useAddHaccpCheckpoint,
  useFinalizeProductionPortions,
  useHaccpLogsForProductionLog,
  useProductionLog,
  useUpdateProductionCompletion,
} from './api'

function toLocalInputValue(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function ProductionLogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { data: log } = useProductionLog(id)
  const { data: checkpoints } = useHaccpLogsForProductionLog(id)
  const updatePortions = useFinalizeProductionPortions()
  const updateCompletion = useUpdateProductionCompletion()
  const addCheckpoint = useAddHaccpCheckpoint()

  const [portionsInput, setPortionsInput] = useState('')
  const [finishedAtInput, setFinishedAtInput] = useState('')
  const [actualTempInput, setActualTempInput] = useState('')
  const [actualTimeInput, setActualTimeInput] = useState('')
  const [checkpointName, setCheckpointName] = useState('')
  const [checkpointTemp, setCheckpointTemp] = useState('')

  const canEdit = profile?.role === 'production_staff' || profile?.role === 'kitchen_manager'

  const completionInitializedRef = useRef(false)
  useEffect(() => {
    if (!log || completionInitializedRef.current) return
    completionInitializedRef.current = true
    setFinishedAtInput(toLocalInputValue(log.finished_at))
    setActualTempInput(log.actual_temp_c?.toString() ?? '')
    setActualTimeInput(log.actual_time_min?.toString() ?? '')
  }, [log])

  if (!log) return <div className="p-4 text-gray-500">Se încarcă...</div>

  async function submitPortions() {
    if (!id || !portionsInput) return
    await updatePortions.mutateAsync({ id, portions: Number(portionsInput) })
    setPortionsInput('')
  }

  async function submitCompletion() {
    if (!id) return
    await updateCompletion.mutateAsync({
      id,
      finishedAt: finishedAtInput ? new Date(finishedAtInput).toISOString() : null,
      actualTempC: actualTempInput ? Number(actualTempInput) : null,
      actualTimeMin: actualTimeInput ? Number(actualTimeInput) : null,
    })
  }

  async function submitCheckpoint() {
    if (!id || !checkpointName) return
    await addCheckpoint.mutateAsync({
      productionLogId: id,
      checkpointName,
      tempC: checkpointTemp ? Number(checkpointTemp) : null,
    })
    setCheckpointName('')
    setCheckpointTemp('')
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          {log.recipe_versions?.recipes?.name ?? 'Rețetă'}{' '}
          <span className="text-gray-400">#{log.recipe_versions?.version_number}</span>
        </h1>
        {log.finished_at && (
          <Link
            to={`/production/${id}/etichete`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
          >
            Printează etichetă
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-500">
        {log.locations?.name}
        {log.staff_profiles?.name && ` · ${log.staff_profiles.name}`}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <dt className="text-sm text-gray-500">Pornit</dt>
          <dd className="font-medium text-gray-900">
            {log.started_at ? new Date(log.started_at).toLocaleString('ro-RO') : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Finalizat</dt>
          <dd className="font-medium text-gray-900">
            {log.finished_at ? new Date(log.finished_at).toLocaleString('ro-RO') : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Batch size</dt>
          <dd className="font-medium text-gray-900">{log.batch_size ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Temp. reală</dt>
          <dd className="font-medium text-gray-900">
            {log.actual_temp_c != null ? `${log.actual_temp_c} °C` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Timp real</dt>
          <dd className="font-medium text-gray-900">
            {log.actual_time_min != null ? `${log.actual_time_min} min` : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Porții produse</dt>
          <dd className="font-medium text-gray-900">{log.portions_produced ?? '—'}</dd>
        </div>
      </dl>

      {canEdit && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">Finalizează procesul</label>
          <p className="mt-1 text-xs text-gray-500">
            Pentru producții pe mai multe zile (ex. marinat seara, sous vide a doua zi) — de
            completat când procesul chiar se termină, nu la pornire.
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <input
              type="datetime-local"
              value={finishedAtInput}
              onChange={(e) => setFinishedAtInput(e.target.value)}
              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 sm:col-span-1"
            />
            <input
              type="number"
              step="0.1"
              value={actualTempInput}
              onChange={(e) => setActualTempInput(e.target.value)}
              placeholder="temp °C"
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            <input
              type="number"
              value={actualTimeInput}
              onChange={(e) => setActualTimeInput(e.target.value)}
              placeholder="timp min"
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={() => void submitCompletion()}
            disabled={updateCompletion.isPending}
            className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {updateCompletion.isPending ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      )}

      {canEdit && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">
            {log.portions_produced != null ? 'Actualizează porțiile produse' : 'Adaugă porțiile produse'}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            De completat după portionare, când numărul real e cunoscut.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              value={portionsInput}
              onChange={(e) => setPortionsInput(e.target.value)}
              placeholder="ex: 22"
              className="w-32 rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={() => void submitPortions()}
              disabled={!portionsInput || updatePortions.isPending}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {updatePortions.isPending ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </div>
      )}

      <h2 className="mt-6 text-sm font-medium text-gray-700">Checkpoint-uri HACCP</h2>
      <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {checkpoints?.map((c) => (
          <li key={c.id} className="flex justify-between px-4 py-2 text-sm">
            <span>{c.checkpoint_name}</span>
            <span className="text-gray-500">
              {c.temp_c != null ? `${c.temp_c}°C` : ''} · {new Date(c.timestamp).toLocaleString('ro-RO')}
            </span>
          </li>
        ))}
        {checkpoints?.length === 0 && (
          <li className="px-4 py-3 text-sm text-gray-500">Niciun checkpoint.</li>
        )}
      </ul>

      {canEdit && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={checkpointName}
            onChange={(e) => setCheckpointName(e.target.value)}
            placeholder="nume checkpoint (ex: temp. la intrare sous vide)"
            className="flex-1 min-w-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.1"
            value={checkpointTemp}
            onChange={(e) => setCheckpointTemp(e.target.value)}
            placeholder="temp °C"
            className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void submitCheckpoint()}
            disabled={!checkpointName || addCheckpoint.isPending}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            + Adaugă checkpoint
          </button>
        </div>
      )}
    </div>
  )
}
