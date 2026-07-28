import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  useRecipe,
  useRecipeCategories,
  useRecipeIngredients,
  useRecipeVersions,
  useUpdateRecipeDetails,
} from './api'

function field(label: string, value: string | number | null | undefined) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value ?? '—'}</dd>
    </div>
  )
}

function EditDetailsForm({
  recipeId,
  name,
  category,
  onDone,
}: {
  recipeId: string
  name: string
  category: string | null
  onDone: () => void
}) {
  const { data: categoryOptions } = useRecipeCategories()
  const updateDetails = useUpdateRecipeDetails()
  const [nameInput, setNameInput] = useState(name)
  const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>('existing')
  const [categorySelect, setCategorySelect] = useState(category ?? '')
  const [categoryNew, setCategoryNew] = useState('')

  async function save() {
    const finalCategory = categoryMode === 'new' ? categoryNew : categorySelect
    await updateDetails.mutateAsync({ recipeId, name: nameInput, category: finalCategory })
    onDone()
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <label className="block text-sm font-medium text-gray-700">Nume</label>
      <input
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
      />
      <label className="mt-3 block text-sm font-medium text-gray-700">Categorie</label>
      <div className="mt-1 flex gap-2">
        <select
          value={categoryMode}
          onChange={(e) => setCategoryMode(e.target.value as 'existing' | 'new')}
          className="rounded-md border border-gray-300 px-2 py-2 text-sm"
        >
          <option value="existing">Existentă</option>
          <option value="new">Nouă</option>
        </select>
        {categoryMode === 'new' ? (
          <input
            value={categoryNew}
            onChange={(e) => setCategoryNew(e.target.value)}
            placeholder="nume categorie"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
        ) : (
          <select
            value={categorySelect}
            onChange={(e) => setCategorySelect(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">fără categorie</option>
            {categoryOptions?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!nameInput || updateDetails.isPending}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {updateDetails.isPending ? 'Se salvează...' : 'Salvează'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
        >
          Anulează
        </button>
      </div>
    </div>
  )
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { data: recipe } = useRecipe(id)
  const { data: versions } = useRecipeVersions(id)
  const currentVersion = versions?.[0]
  const { data: ingredients } = useRecipeIngredients(currentVersion?.id)
  const canEdit = profile?.role === 'kitchen_manager' || profile?.role === 'owner'
  const [editingDetails, setEditingDetails] = useState(false)

  if (!recipe) return <div className="p-4 text-gray-500">Se încarcă...</div>

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{recipe.name}</h1>
          {recipe.category && <p className="text-sm text-gray-500">{recipe.category}</p>}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditingDetails((v) => !v)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
            >
              {editingDetails ? 'Închide' : 'Editează'}
            </button>
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
            >
              Versiune nouă
            </Link>
          </div>
        )}
      </div>

      {editingDetails && (
        <EditDetailsForm
          recipeId={recipe.id}
          name={recipe.name}
          category={recipe.category}
          onDone={() => setEditingDetails(false)}
        />
      )}

      {currentVersion ? (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4">
            {field('Versiune', `#${currentVersion.version_number}`)}
            {field('Temperatură', currentVersion.sous_vide_temp_c != null ? `${currentVersion.sous_vide_temp_c} °C` : null)}
            {field('Timp sous vide', currentVersion.sous_vide_time_min != null ? `${currentVersion.sous_vide_time_min} min` : null)}
            {field('Protocol răcire', currentVersion.cooling_protocol)}
            {field('Finisare rece', currentVersion.finishing_time_cold)}
            {field('Finisare cald', currentVersion.finishing_time_hot)}
            {field('Porții estimate', currentVersion.estimated_portions)}
            {field(
              'Valabilitate',
              currentVersion.shelf_life_days != null ? `${currentVersion.shelf_life_days} zile` : null,
            )}
          </dl>
          {currentVersion.notes && (
            <p className="mt-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              {currentVersion.notes}
            </p>
          )}

          <h2 className="mt-6 text-sm font-medium text-gray-700">Ingrediente</h2>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {ingredients?.map((ing) => (
              <li key={ing.id} className="flex justify-between px-4 py-2 text-sm">
                <span>
                  {ing.ingredients?.name ?? 'ingredient'}
                  {ing.is_primary && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                      principal
                    </span>
                  )}
                </span>
                <span className="text-gray-500">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
            {ingredients?.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500">Niciun ingredient adăugat.</li>
            )}
          </ul>

          {versions && versions.length > 1 && (
            <>
              <h2 className="mt-6 text-sm font-medium text-gray-700">Istoric versiuni</h2>
              <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                {versions.slice(1).map((v) => (
                  <li key={v.id} className="px-4 py-2 text-sm text-gray-500">
                    #{v.version_number} — {new Date(v.created_at).toLocaleString('ro-RO')}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Rețetă fără versiune încă.{' '}
          {canEdit && (
            <Link to={`/recipes/${recipe.id}/edit`} className="font-medium underline">
              Adaugă parametri
            </Link>
          )}
        </p>
      )}
    </div>
  )
}
