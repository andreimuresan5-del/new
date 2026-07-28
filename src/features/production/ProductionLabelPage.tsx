import { Link, useParams } from 'react-router-dom'
import { useRecipeVersion } from '../recipes/api'
import { useProductionLog } from './api'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ro-RO')
}

function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function ProductionLabelPage() {
  const { id } = useParams<{ id: string }>()
  const { data: log } = useProductionLog(id)
  const { data: recipeVersion } = useRecipeVersion(log?.recipe_versions?.id)

  if (!log) return <div className="min-h-svh bg-white p-4 text-gray-500">Se încarcă...</div>

  const productionDate = log.finished_at
  const expirationDate =
    productionDate && recipeVersion?.shelf_life_days != null
      ? addDays(productionDate, recipeVersion.shelf_life_days)
      : null

  return (
    <div className="min-h-svh bg-white p-4 text-gray-900">
      <style>{`
        @media print {
          .no-print { display: none; }
          @page { size: 60mm 40mm; margin: 2mm; }
          body { margin: 0; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl">
        <div className="no-print mb-4 flex items-center justify-between">
          <Link to={`/production/${id}`} className="text-sm font-medium text-gray-500">
            ← Înapoi
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Printează
          </button>
        </div>

        {!recipeVersion?.shelf_life_days && (
          <p className="no-print mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Rețeta nu are valabilitate (zile) setată — data expirării nu poate fi calculată.
            Adaug-o din pagina rețetei.
          </p>
        )}

        <div className="mx-auto w-[60mm] border border-gray-300 bg-white p-2 text-black print:border-0">
          <p className="text-sm font-bold leading-tight">{log.recipe_versions?.recipes?.name ?? 'Rețetă'}</p>
          <p className="mt-1 text-xs leading-tight">Producție: {formatDate(productionDate)}</p>
          <p className="text-xs leading-tight">Expiră: {formatDate(expirationDate)}</p>
          <p className="text-xs leading-tight">Angajat: {log.staff_profiles?.name ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
