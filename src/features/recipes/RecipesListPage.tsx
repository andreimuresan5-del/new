import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRecipes } from './api'

export function RecipesListPage() {
  const { profile } = useAuth()
  const { data: recipes, isLoading, error } = useRecipes()
  const canEdit = profile?.role === 'kitchen_manager' || profile?.role === 'owner'

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Rețete</h1>
        {canEdit && (
          <Link
            to="/recipes/new"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
          >
            + Rețetă nouă
          </Link>
        )}
      </div>

      {isLoading && <p className="mt-4 text-gray-500">Se încarcă...</p>}
      {error && <p className="mt-4 text-red-600">Eroare la încărcare.</p>}

      <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {recipes?.map((recipe) => (
          <li key={recipe.id}>
            <Link
              to={`/recipes/${recipe.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{recipe.name}</p>
                {recipe.category && <p className="text-sm text-gray-500">{recipe.category}</p>}
              </div>
              {!recipe.current_version_id && (
                <span className="text-xs font-medium text-amber-600">fără versiune</span>
              )}
            </Link>
          </li>
        ))}
        {recipes?.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500">Nicio rețetă încă.</li>
        )}
      </ul>
    </div>
  )
}
