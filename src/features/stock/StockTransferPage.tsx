import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useLocations, useProductionCenter } from '../locations/api'
import { useParLevels, useStockLevels, useTransferSemipreparat } from './api'

export function StockTransferPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: productionCenter } = useProductionCenter()
  const { data: locations } = useLocations()
  const { data: levels } = useStockLevels()
  const { data: parLevels } = useParLevels()
  const transfer = useTransferSemipreparat()

  const [sourceId, setSourceId] = useState('')
  const [recipeId, setRecipeId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [portions, setPortions] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Un cont legat de o locație poate trimite numai din locația lui (funcția din
  // baza de date o impune oricum) — îi arătăm doar pe ea ca sursă.
  const selectableSources = profile?.location_id
    ? (locations ?? []).filter((l) => l.id === profile.location_id)
    : (locations ?? [])

  // Sursă implicită, aleasă o singură dată: locația contului, altfel centrul,
  // dacă mai e marcat vreunul. Ref-ul împiedică un răspuns întârziat să
  // suprascrie alegerea omului.
  const sourcePreselected = useRef(false)
  useEffect(() => {
    if (sourcePreselected.current) return
    const preselect = profile?.location_id ?? productionCenter?.id
    if (!preselect) return
    sourcePreselected.current = true
    setSourceId(preselect)
  }, [profile?.location_id, productionCenter])

  const sourceStock = (levels ?? []).filter(
    (r) => r.location_id === sourceId && r.portions_on_hand > 0,
  )
  const destinations = (locations ?? []).filter((l) => l.id !== sourceId)
  const selectedStock = sourceStock.find((r) => r.recipe_id === recipeId)
  const sourceName = (locations ?? []).find((l) => l.id === sourceId)?.name

  // Schimbarea sursei poate invalida rețeta sau destinația deja alese.
  useEffect(() => {
    if (recipeId && !sourceStock.some((r) => r.recipe_id === recipeId)) setRecipeId('')
    if (destinationId && destinationId === sourceId) setDestinationId('')
  }, [sourceId, recipeId, destinationId, sourceStock])

  const destinationStock =
    (levels ?? []).find((r) => r.recipe_id === recipeId && r.location_id === destinationId)
      ?.portions_on_hand ?? 0
  const parLevel = parLevels?.find(
    (p) => p.recipe_id === recipeId && p.location_id === destinationId,
  )?.target_portions
  const suggested =
    parLevel != null
      ? Math.max(0, Math.min(parLevel - destinationStock, selectedStock?.portions_on_hand ?? 0))
      : null

  const suggestedAppliedForRef = useRef<string | null>(null)
  useEffect(() => {
    const key = `${sourceId}|${recipeId}|${destinationId}`
    if (!recipeId || !destinationId) return
    if (suggestedAppliedForRef.current === key) return
    suggestedAppliedForRef.current = key
    if (suggested != null && suggested > 0) setPortions(String(suggested))
  }, [sourceId, recipeId, destinationId, suggested])

  async function submit() {
    setError(null)
    if (!sourceId || !recipeId || !destinationId || !portions) return
    try {
      await transfer.mutateAsync({
        recipeId,
        sourceLocationId: sourceId,
        destinationLocationId: destinationId,
        portions: Number(portions),
        notes: notes || null,
      })
      navigate('/stock')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la transfer')
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="text-xl font-semibold text-gray-900">Transfer semipreparat</h1>
      <p className="mt-1 text-sm text-gray-500">
        Mută porții de la o locație la alta. Fiecare locație produce pentru ea, deci
        transferul e pentru când una ajută alta — nu e calea obișnuită prin care ajunge
        stocul la locație.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">De la locație</label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">alege</option>
            {selectableSources.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rețetă</label>
          <select
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            disabled={!sourceId}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50"
          >
            <option value="">alege</option>
            {sourceStock.map((r) => (
              <option key={r.recipe_id} value={r.recipe_id}>
                {r.recipes?.name} ({r.portions_on_hand} porții disponibile)
              </option>
            ))}
          </select>
          {!sourceId ? (
            <p className="mt-1 text-xs text-gray-500">Alege întâi locația de plecare.</p>
          ) : (
            sourceStock.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Niciun semipreparat pe stoc la {sourceName ?? 'această locație'} momentan.
              </p>
            )
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Către locație</label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            disabled={!sourceId}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-50"
          >
            <option value="">alege</option>
            {destinations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Porții</label>
          <input
            type="number"
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
            max={selectedStock?.portions_on_hand}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {selectedStock && (
            <p className="mt-1 text-xs text-gray-500">
              Disponibil la {sourceName ?? 'sursă'}: {selectedStock.portions_on_hand} porții
              {destinationId && (
                <>
                  {' · '}stoc curent la destinație: {destinationStock} porții
                  {parLevel != null && ` · prag: ${parLevel}`}
                </>
              )}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Note (opțional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={
              !sourceId || !recipeId || !destinationId || !portions || transfer.isPending
            }
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {transfer.isPending ? 'Se trimite...' : 'Trimite'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700"
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  )
}
