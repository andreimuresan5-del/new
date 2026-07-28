import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useController, useFieldArray, useForm, useWatch, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCreateRecipe,
  useCreateRecipeVersion,
  useIngredients,
  useRecipe,
  useRecipeCategories,
  useRecipeIngredients,
  useRecipeVersions,
} from './api'

interface IngredientOption {
  id: string
  name: string
}

// Autocomplete construit manual (nu <input list>+<datalist>) — poziția dropdown-ului nativ
// e calculată de browser și poate ieși din containerul aplicației (ex. în PWA/mobil).
// Aici dropdown-ul e ancorat direct la câmp printr-un div "relative", nu la viewport.
function IngredientNameField({
  control,
  index,
  ingredientOptions,
  error,
}: {
  control: Control<FormValues>
  index: number
  ingredientOptions: IngredientOption[] | undefined
  error: string | undefined
}) {
  const { field } = useController({ control, name: `ingredients.${index}.name` })
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const typed = field.value?.trim().toLowerCase() ?? ''
  const filtered = (
    typed ? ingredientOptions?.filter((opt) => opt.name.toLowerCase().includes(typed)) : ingredientOptions
  )?.slice(0, 8)
  const existingMatch = typed
    ? ingredientOptions?.find((opt) => opt.name.trim().toLowerCase() === typed)
    : undefined

  return (
    <div className="relative flex-1 min-w-[140px]" ref={containerRef}>
      <input
        value={field.value ?? ''}
        onChange={(e) => {
          field.onChange(e)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={field.onBlur}
        placeholder="caută sau introdu ingredient"
        autoComplete="off"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
      {open && filtered && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {filtered.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  field.onChange(opt.name)
                  setOpen(false)
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {opt.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {typed && (
        <p className={`mt-0.5 text-xs ${existingMatch ? 'text-green-600' : 'text-amber-600'}`}>
          {existingMatch ? '✓ ingredient existent' : '+ va fi creat ca ingredient nou'}
        </p>
      )}
      {error && <p className="mt-0.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const ingredientRowSchema = z.object({
  name: z.string().min(1, 'Nume ingredient necesar'),
  unit: z.string().min(1, 'Unitate necesară'),
  quantity: z
    .string()
    .min(1, 'Cantitate necesară')
    .refine((v) => Number(v) > 0, 'Cantitate > 0'),
})

const formSchema = z.object({
  name: z.string().min(1, 'Numele rețetei e necesar'),
  categoryMode: z.enum(['existing', 'new']),
  category: z.string().optional(),
  categoryNew: z.string().optional(),
  sous_vide_temp_c: z.string().optional(),
  sous_vide_time_min: z.string().optional(),
  cooling_protocol: z.string().optional(),
  finishing_time_cold: z.string().optional(),
  finishing_time_hot: z.string().optional(),
  notes: z.string().optional(),
  estimatedPortions: z.string().optional(),
  shelfLifeDays: z.string().optional(),
  ingredients: z.array(ingredientRowSchema),
  primaryIndex: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const emptyRow = { name: '', unit: '', quantity: '' }
const resolver = zodResolver(formSchema)

export function RecipeFormPage() {
  const { id: recipeId } = useParams<{ id: string }>()
  const isEdit = !!recipeId
  const navigate = useNavigate()

  const { data: recipe } = useRecipe(recipeId)
  const { data: versions } = useRecipeVersions(recipeId)
  const currentVersion = versions?.[0]
  const { data: currentIngredients } = useRecipeIngredients(currentVersion?.id)
  const { data: ingredientOptions } = useIngredients()
  const { data: categoryOptions } = useRecipeCategories()

  const createRecipe = useCreateRecipe()
  const createVersion = useCreateRecipeVersion()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      name: '',
      categoryMode: 'existing',
      category: '',
      categoryNew: '',
      ingredients: [emptyRow],
      primaryIndex: '0',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })
  const categoryMode = useWatch({ control, name: 'categoryMode' })

  useEffect(() => {
    if (!isEdit || !recipe || !currentVersion) return
    reset({
      name: recipe.name,
      categoryMode: 'existing',
      category: recipe.category ?? '',
      categoryNew: '',
      sous_vide_temp_c: currentVersion.sous_vide_temp_c?.toString() ?? '',
      sous_vide_time_min: currentVersion.sous_vide_time_min?.toString() ?? '',
      cooling_protocol: currentVersion.cooling_protocol ?? '',
      finishing_time_cold: currentVersion.finishing_time_cold ?? '',
      finishing_time_hot: currentVersion.finishing_time_hot ?? '',
      notes: currentVersion.notes ?? '',
      estimatedPortions: currentVersion.estimated_portions?.toString() ?? '',
      shelfLifeDays: currentVersion.shelf_life_days?.toString() ?? '',
      ingredients:
        currentIngredients && currentIngredients.length > 0
          ? currentIngredients.map((ci) => ({
              name: ci.ingredients?.name ?? '',
              unit: ci.unit,
              quantity: ci.quantity.toString(),
            }))
          : [emptyRow],
      primaryIndex:
        currentIngredients && currentIngredients.length > 0
          ? String(Math.max(0, currentIngredients.findIndex((ci) => ci.is_primary)))
          : '0',
    })
  }, [isEdit, recipe, currentVersion, currentIngredients, reset])

  async function onSubmit(values: FormValues) {
    const version = {
      sous_vide_temp_c: values.sous_vide_temp_c ? Number(values.sous_vide_temp_c) : null,
      sous_vide_time_min: values.sous_vide_time_min ? Number(values.sous_vide_time_min) : null,
      cooling_protocol: values.cooling_protocol ?? '',
      finishing_time_cold: values.finishing_time_cold ?? '',
      finishing_time_hot: values.finishing_time_hot ?? '',
      notes: values.notes ?? '',
      estimated_portions: values.estimatedPortions ? Number(values.estimatedPortions) : null,
      shelf_life_days: values.shelfLifeDays ? Number(values.shelfLifeDays) : null,
    }
    const ingredients = values.ingredients
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.name.trim())
      .map(({ row, index }) => {
        const match = ingredientOptions?.find(
          (opt) => opt.name.trim().toLowerCase() === row.name.trim().toLowerCase(),
        )
        return {
          ingredientId: match ? match.id : null,
          newIngredientName: match ? null : row.name.trim(),
          unit: row.unit,
          quantity: Number(row.quantity),
          isPrimary: String(index) === values.primaryIndex,
        }
      })

    if (isEdit && recipeId) {
      await createVersion.mutateAsync({ recipeId, version, ingredients })
      navigate(`/recipes/${recipeId}`)
    } else {
      const category = values.categoryMode === 'new' ? values.categoryNew : values.category
      const newId = await createRecipe.mutateAsync({
        name: values.name,
        category: category ?? '',
        version,
        ingredients,
      })
      navigate(`/recipes/${newId}`)
    }
  }

  const submitting = isSubmitting || createRecipe.isPending || createVersion.isPending

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="text-xl font-semibold text-gray-900">
        {isEdit ? `Versiune nouă — ${recipe?.name ?? ''}` : 'Rețetă nouă'}
      </h1>
      {isEdit && (
        <p className="mt-1 text-sm text-gray-500">
          Salvarea creează o versiune nouă; istoricul rămâne neschimbat (audit HACCP).
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {Object.keys(errors).length > 0 && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Formularul are câmpuri necompletate sau invalide — verifică erorile marcate mai jos.
          </p>
        )}
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nume</label>
              <input
                {...register('name')}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categorie</label>
              <div className="mt-1 flex gap-2">
                <select
                  {...register('categoryMode')}
                  className="rounded-md border border-gray-300 px-2 py-2 text-sm"
                >
                  <option value="existing">Existentă</option>
                  <option value="new">Nouă</option>
                </select>
                {categoryMode === 'new' ? (
                  <input
                    {...register('categoryNew')}
                    placeholder="nume categorie"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                  />
                ) : (
                  <select
                    {...register('category')}
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
            </div>
          </div>
        )}

        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-700">Parametri sous vide</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">Temperatură (°C)</label>
              <input
                type="number"
                step="0.1"
                {...register('sous_vide_temp_c')}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Timp (min)</label>
              <input
                type="number"
                {...register('sous_vide_time_min')}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600">Protocol răcire</label>
              <textarea
                {...register('cooling_protocol')}
                rows={2}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600">
                Finisare din frigider (rece) — varianta operațională de seară
              </label>
              <textarea
                {...register('finishing_time_cold')}
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600">
                Finisare direct din sous vide (cald)
              </label>
              <textarea
                {...register('finishing_time_hot')}
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Porții estimate</label>
              <input
                type="number"
                {...register('estimatedPortions')}
                placeholder="ex: 14"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Câte porții ies din cantitatea de referință a rețetei — se scalează automat la
                producție, împreună cu ingredientele.
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Valabilitate (zile)</label>
              <input
                type="number"
                {...register('shelfLifeDays')}
                placeholder="ex: 3"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Folosit pentru data de expirare de pe etichetele HACCP.
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-600">Note</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-700">Ingrediente</legend>
          <p className="mb-2 text-xs text-gray-500">
            Bifează ingredientul principal (materia primă de bază) — folosit ca ancoră pentru
            scalarea automată a cantităților la producție, după greutatea reală.
          </p>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap items-start gap-2">
                <label className="flex items-center gap-1 py-2 text-xs text-gray-500">
                  <input type="radio" value={index} {...register('primaryIndex')} />
                  principal
                </label>
                <IngredientNameField
                  control={control}
                  index={index}
                  ingredientOptions={ingredientOptions}
                  error={errors.ingredients?.[index]?.name?.message}
                />
                <div className="w-24">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="cantitate"
                    {...register(`ingredients.${index}.quantity`)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {errors.ingredients?.[index]?.quantity && (
                    <p className="mt-0.5 text-xs text-red-600">
                      {errors.ingredients[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                <div className="w-24">
                  <input
                    placeholder="unitate"
                    {...register(`ingredients.${index}.unit`)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {errors.ingredients?.[index]?.unit && (
                    <p className="mt-0.5 text-xs text-red-600">
                      {errors.ingredients[index]?.unit?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="px-2 py-2 text-sm text-red-600"
                >
                  Șterge
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append(emptyRow)}
            className="mt-3 text-sm font-medium text-blue-600"
          >
            + Adaugă ingredient
          </button>
        </fieldset>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Se salvează...' : 'Salvează'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700"
          >
            Anulează
          </button>
        </div>
      </form>
    </div>
  )
}
