import { Link } from 'react-router-dom'
import { useRecipes } from '../recipes/api'
import { useProductionLogs } from '../production/api'

export function OwnerDashboardPage() {
  const { data: recipes } = useRecipes()
  const { data: logs } = useProductionLogs()

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Vizualizare agregată, read-only.</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link to="/recipes" className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Rețete</p>
          <p className="text-2xl font-semibold text-gray-900">{recipes?.length ?? '—'}</p>
        </Link>
        <Link to="/production" className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Loguri producție (recente)</p>
          <p className="text-2xl font-semibold text-gray-900">{logs?.length ?? '—'}</p>
        </Link>
        <Link to="/marketing" className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Marketing</p>
          <p className="text-2xl font-semibold text-gray-900">Plan →</p>
        </Link>
      </div>
    </div>
  )
}
