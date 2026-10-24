import { useState } from 'react'
import { useLocations } from '../locations/api'
import { useRecipes } from '../recipes/api'
import { useParLevels, useUpsertParLevel } from './api'

function ParInput({
  recipeId,
  locationId,
  initialValue,
}: {
  recipeId: string
  locationId: string
  initialValue: number | undefined
}) {
  const upsert = useUpsertParLevel()
  const [value, setValue] = useState(initialValue?.toString() ?? '')

  async function save() {
    if (value === '' || Number(value) === initialValue) return
    await upsert.mutateAsync({ recipeId, locationId, targetPortions: Number(value) })
  }

  return (
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => void save()}
      placeholder="—"
      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
    />
  )
}

export function ParLevelsPage() {
  const { data: recipes } = useRecipes()
  const { data: locations } = useLocations()
  const { data: parLevels } = useParLevels()

  // Toate locațiile, nu doar punctele de vânzare: fiecare locație produce pentru
  // ea, deci fiecare are nevoie de un prag propriu.
  const allLocations = locations ?? []
  const activeRecipes = (recipes ?? []).filter((r) => r.current_version_id)

  function findTarget(recipeId: string, locationId: string) {
    return parLevels?.find((p) => p.recipe_id === recipeId && p.location_id === locationId)
      ?.target_portions
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="text-xl font-semibold text-gray-900">Praguri stoc (par level)</h1>
      <p className="mt-1 text-sm text-gray-500">
        Câte porții vrei să existe pe fiecare locație. Folosit ca indicator „necesar"
        pe pagina de stoc și ca sugestie de cantitate la transfer.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left font-medium text-gray-700">Rețetă</th>
              {allLocations.map((l) => (
                <th key={l.id} className="px-3 py-2 text-left font-medium text-gray-700">
                  {l.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeRecipes.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2">{r.name}</td>
                {allLocations.map((l) => (
                  <td key={l.id} className="px-3 py-2">
                    <ParInput recipeId={r.id} locationId={l.id} initialValue={findTarget(r.id, l.id)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
