import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProductionLogs } from './api'

export function ProductionLogListPage() {
  const { profile } = useAuth()
  const { data: logs, isLoading } = useProductionLogs()
  const canLog = profile?.role === 'production_staff' || profile?.role === 'kitchen_manager'

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Producție</h1>
        {canLog && (
          <Link
            to="/production/new"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
          >
            + Log nou
          </Link>
        )}
      </div>

      {isLoading && <p className="mt-4 text-gray-500">Se încarcă...</p>}

      <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {logs?.map((log) => (
          <li key={log.id}>
            <Link to={`/production/${log.id}`} className="block px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {log.recipe_versions?.recipes?.name ?? 'Rețetă'}{' '}
                  <span className="text-gray-400">#{log.recipe_versions?.version_number}</span>
                </p>
                <span className="text-sm text-gray-500">{log.locations?.name}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {log.started_at && new Date(log.started_at).toLocaleString('ro-RO')}
                {log.batch_size != null && ` · batch ${log.batch_size}`}
                {log.actual_temp_c != null && ` · ${log.actual_temp_c}°C`}
                {log.actual_time_min != null && ` · ${log.actual_time_min} min`}
                {log.portions_produced != null
                  ? ` · ${log.portions_produced} porții`
                  : ' · porții nefinalizate'}
              </p>
            </Link>
          </li>
        ))}
        {logs?.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500">Niciun log încă.</li>
        )}
      </ul>
    </div>
  )
}
