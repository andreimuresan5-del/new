import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useLocations } from '../locations/api'
import { useStockLevels } from '../stock/api'
import { ROLE_LABELS } from '../../lib/roles'

// Pagina de start pentru managerul de locație, șeful de bucătărie și șeful de tură.
// Tot ce se vede aici e deja filtrat pe locația lor de regulile din baza de date.
export function LocationHomePage() {
  const { profile } = useAuth()
  const { data: locations } = useLocations()
  const { data: levels, isLoading } = useStockLevels()

  const locationName = locations?.find((l) => l.id === profile?.location_id)?.name ?? 'Locația ta'
  const stock = (levels ?? []).filter((l) => l.portions_on_hand !== 0)

  return (
    <div className="mx-auto max-w-2xl p-4">
      <p className="text-sm text-gray-500">{profile ? ROLE_LABELS[profile.role] : ''}</p>
      <h1 className="text-xl font-semibold text-gray-900">{locationName}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link to="/recipes" className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Rețete</p>
          <p className="text-lg font-semibold text-gray-900">Fișe tehnice →</p>
        </Link>
        {profile?.role === 'location_manager' && (
          <Link to="/echipa" className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Echipa</p>
            <p className="text-lg font-semibold text-gray-900">Cine lucrează aici →</p>
          </Link>
        )}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Semipreparat de la centrul de producție
      </h2>
      {isLoading && <p className="mt-3 text-gray-500">Se încarcă...</p>}
      {!isLoading && stock.length === 0 && (
        <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
          Nu e niciun semipreparat pe stoc la {locationName}. Apare aici după primul transfer de la centrul de producție.
        </p>
      )}
      {stock.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {stock.map((row) => (
            <li key={`${row.recipe_id}-${row.location_id}`} className="flex justify-between px-4 py-3">
              <span className="text-gray-900">{row.recipes?.name ?? 'rețetă'}</span>
              <span className="font-medium tabular-nums text-gray-900">{row.portions_on_hand} porții</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
