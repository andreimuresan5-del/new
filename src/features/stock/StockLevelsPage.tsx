import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRecipes } from '../recipes/api'
import { useParLevels, useStockLevels } from './api'

interface Row {
  recipeName: string
  current: number
  target: number | null
}

export function StockLevelsPage() {
  const { profile } = useAuth()
  const { data: levels, isLoading } = useStockLevels()
  const { data: parLevels } = useParLevels()
  const { data: recipes } = useRecipes()
  const canTransfer = profile?.role === 'production_staff' || profile?.role === 'kitchen_manager'
  const canEditParLevels = profile?.role === 'kitchen_manager' || profile?.role === 'owner'

  const byLocation = new Map<string, { name: string; rows: Map<string, Row> }>()

  function bucket(locationId: string, locationName: string) {
    if (!byLocation.has(locationId)) byLocation.set(locationId, { name: locationName, rows: new Map() })
    return byLocation.get(locationId)!.rows
  }

  for (const row of levels ?? []) {
    if (row.portions_on_hand === 0) continue
    const rows = bucket(row.location_id, row.locations?.name ?? 'Locație')
    rows.set(row.recipe_id, {
      recipeName: row.recipes?.name ?? 'rețetă',
      current: row.portions_on_hand,
      target: null,
    })
  }

  for (const par of parLevels ?? []) {
    const rows = bucket(par.location_id, par.locations?.name ?? 'Locație')
    const existing = rows.get(par.recipe_id)
    if (existing) {
      existing.target = par.target_portions
    } else {
      rows.set(par.recipe_id, {
        recipeName: par.recipes?.name ?? 'rețetă',
        current: 0,
        target: par.target_portions,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Stoc semipreparat</h1>
        <div className="flex gap-2">
          {canEditParLevels && (
            <Link
              to="/stock/par-levels"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
            >
              Praguri
            </Link>
          )}
          {canTransfer && (
            <Link
              to="/stock/transfer"
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            >
              + Transfer
            </Link>
          )}
        </div>
      </div>

      {isLoading && <p className="mt-4 text-gray-500">Se încarcă...</p>}

      {Array.from(byLocation.entries()).map(([locationId, { name, rows }]) => (
        <div key={locationId} className="mt-4">
          <h2 className="text-sm font-medium text-gray-700">{name}</h2>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {Array.from(rows.values()).map((row) => {
              const deficit = row.target != null ? Math.max(0, row.target - row.current) : 0
              return (
                <li key={row.recipeName} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span>{row.recipeName}</span>
                  <span className="flex items-center gap-2">
                    {row.target != null && (
                      <span className="text-xs text-gray-400">prag {row.target}</span>
                    )}
                    {deficit > 0 && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        necesar +{deficit}
                      </span>
                    )}
                    <span className="font-medium text-gray-900">{row.current} porții</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {!isLoading && byLocation.size === 0 && (
        <p className="mt-4 text-gray-500">
          Niciun stoc de semipreparat momentan.{' '}
          {recipes && recipes.length > 0 && canEditParLevels && (
            <Link to="/stock/par-levels" className="font-medium underline">
              Setează praguri
            </Link>
          )}
        </p>
      )}
    </div>
  )
}
