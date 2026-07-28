import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocations, useProductionCenter } from '../locations/api'
import { useParLevels, useStockLevels, useTransferSemipreparat } from './api'

export function StockTransferPage() {
  const navigate = useNavigate()
  const { data: productionCenter } = useProductionCenter()
  const { data: locations } = useLocations()
  const { data: levels } = useStockLevels()
  const { data: parLevels } = useParLevels()
  const transfer = useTransferSemipreparat()

  const [recipeId, setRecipeId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [portions, setPortions] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const centerStock = (levels ?? []).filter(
    (r) => r.location_id === productionCenter?.id && r.portions_on_hand > 0,
  )
  const destinations = (locations ?? []).filter((l) => l.id !== productionCenter?.id)
  const selectedStock = centerStock.find((r) => r.recipe_id === recipeId)

  const destinationStock =
    (levels ?? []).find((r) => r.recipe_id === recipeId && r.location_id === destinationId)
      ?.portions_on_hand ?? 0
  const parLevel = parLevels?.find(
    (p) => p.recipe_id === recipeId && p.location_id === destinationId,
  )?.target_portions
  const suggested =
    parLevel != null ? Math.max(0, Math.min(parLevel - destinationStock, selectedStock?.portions_on_hand ?? 0)) : null

  const suggestedAppliedForRef = useRef<string | null>(null)
  useEffect(() => {
    const key = `${recipeId}|${destinationId}`
    if (!recipeId || !destinationId) return
    if (suggestedAppliedForRef.current === key) return
    suggestedAppliedForRef.current = key
    if (suggested != null && suggested > 0) setPortions(String(suggested))
  }, [recipeId, destinationId, suggested])

  async function submit() {
    setError(null)
    if (!recipeId || !destinationId || !portions) return
    try {
      await transfer.mutateAsync({
        recipeId,
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
        De la {productionCenter?.name ?? 'centrul de producție'} către o locație.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rețetă</label>
          <select
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">alege</option>
            {centerStock.map((r) => (
              <option key={r.recipe_id} value={r.recipe_id}>
                {r.recipes?.name} ({r.portions_on_hand} porții disponibile)
              </option>
            ))}
          </select>
          {centerStock.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Niciun semipreparat disponibil la centru momentan.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Către locație</label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
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
              Disponibil la centru: {selectedStock.portions_on_hand} porții
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
            disabled={!recipeId || !destinationId || !portions || transfer.isPending}
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
