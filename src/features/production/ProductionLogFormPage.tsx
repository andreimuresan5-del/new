import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProductionCenter } from '../locations/api'
import { useRecipeIngredients, useRecipeVersion } from '../recipes/api'
import { useActiveRecipes, useCreateProductionLog } from './api'

const checkpointSchema = z.object({
  checkpoint_name: z.string(),
  temp_c: z.string().optional(),
  timestamp: z.string(),
})

const formSchema = z.object({
  recipeId: z.string().min(1, 'Alege o rețetă'),
  locationId: z.string().min(1, 'Alege o locație'),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  batchSize: z.string().optional(),
  actualTempC: z.string().optional(),
  actualTimeMin: z.string().optional(),
  portionsProduced: z.string().optional(),
  checkpoints: z.array(checkpointSchema),
})

type FormValues = z.infer<typeof formSchema>
const resolver = zodResolver(formSchema)

function nowLocal() {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function roundQty(n: number) {
  return Math.round(n * 10) / 10
}

export function ProductionLogFormPage() {
  const navigate = useNavigate()
  const { data: recipes } = useActiveRecipes()
  const { data: productionCenter } = useProductionCenter()
  const createLog = useCreateProductionLog()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      recipeId: '',
      locationId: '',
      startedAt: nowLocal(),
      finishedAt: '',
      checkpoints: [{ checkpoint_name: '', temp_c: '', timestamp: nowLocal() }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'checkpoints' })

  useEffect(() => {
    if (productionCenter) setValue('locationId', productionCenter.id)
  }, [productionCenter, setValue])

  const selectedRecipeId = useWatch({ control, name: 'recipeId' })
  const batchSize = useWatch({ control, name: 'batchSize' })
  const selectedRecipe = recipes?.find((r) => r.id === selectedRecipeId)
  const { data: recipeIngredients } = useRecipeIngredients(selectedRecipe?.current_version_id)
  const { data: recipeVersion } = useRecipeVersion(selectedRecipe?.current_version_id)
  const primaryIngredient = recipeIngredients?.find((ri) => ri.is_primary)

  const defaultAppliedForRecipeRef = useRef<string | null>(null)

  useEffect(() => {
    if (!recipeIngredients || recipeIngredients.length === 0) return
    // recipeIngredients sosește async — dacă utilizatorul a apucat deja să tasteze o
    // valoare înainte să se încarce, nu i-o mai suprascriem. Valoarea implicită se
    // aplică o singură dată per rețetă selectată.
    if (defaultAppliedForRecipeRef.current === selectedRecipeId) return
    setValue('batchSize', primaryIngredient ? String(primaryIngredient.quantity) : '1')
    defaultAppliedForRecipeRef.current = selectedRecipeId
  }, [selectedRecipeId, recipeIngredients, primaryIngredient, setValue])

  // Pentru rețete cu ingredient principal (materie primă cântărită, ex. carne):
  // scalare după greutatea reală. Pentru restul (ex. Glazură BBQ, fără o singură
  // materie primă de bază): "batch size" e direct un multiplicator (2 = batch dublu).
  const scale =
    batchSize && Number(batchSize) > 0
      ? primaryIngredient
        ? Number(batchSize) / primaryIngredient.quantity
        : Number(batchSize)
      : 1

  async function onSubmit(values: FormValues) {
    const recipe = recipes?.find((r) => r.id === values.recipeId)
    if (!recipe) return
    await createLog.mutateAsync({
      recipeVersionId: recipe.current_version_id,
      locationId: values.locationId,
      startedAt: values.startedAt ? new Date(values.startedAt).toISOString() : '',
      finishedAt: values.finishedAt ? new Date(values.finishedAt).toISOString() : '',
      batchSize: values.batchSize ? Number(values.batchSize) : null,
      actualTempC: values.actualTempC ? Number(values.actualTempC) : null,
      actualTimeMin: values.actualTimeMin ? Number(values.actualTimeMin) : null,
      portionsProduced: values.portionsProduced ? Number(values.portionsProduced) : null,
      checkpoints: values.checkpoints.map((c) => ({
        checkpoint_name: c.checkpoint_name,
        temp_c: c.temp_c ? Number(c.temp_c) : null,
        timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : '',
      })),
    })
    navigate('/production')
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="text-xl font-semibold text-gray-900">Log producție</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rețetă</label>
            <select
              {...register('recipeId')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">alege</option>
              {recipes?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.recipeId && <p className="mt-1 text-sm text-red-600">{errors.recipeId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Locație</label>
            <p className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
              {productionCenter?.name ?? 'Centru de producție'}
            </p>
            <input type="hidden" {...register('locationId')} />
            {errors.locationId && (
              <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Pornit</label>
            <input
              type="datetime-local"
              {...register('startedAt')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Finalizat</label>
            <input
              type="datetime-local"
              {...register('finishedAt')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">
              {primaryIngredient
                ? `Greutate reală — ${primaryIngredient.ingredients?.name ?? 'materie primă'} (${primaryIngredient.unit})`
                : recipeIngredients && recipeIngredients.length > 0
                  ? 'Multiplicator batch'
                  : 'Batch size'}
            </label>
            <input
              type="number"
              step="0.01"
              {...register('batchSize')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {primaryIngredient && (
              <p className="mt-1 text-xs text-gray-500">
                Rețeta e calculată pentru {primaryIngredient.quantity} {primaryIngredient.unit} —
                cantitățile de mai jos se scalează automat.
              </p>
            )}
            {!primaryIngredient && recipeIngredients && recipeIngredients.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                1 = rețeta de bază, 2 = batch dublu etc. — cantitățile se scalează automat.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600">Temp. reală (°C)</label>
            <input
              type="number"
              step="0.1"
              {...register('actualTempC')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Timp real (min)</label>
            <input
              type="number"
              {...register('actualTimeMin')}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Porții produse</label>
            <input
              type="number"
              {...register('portionsProduced')}
              placeholder="se poate completa și mai târziu"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {recipeVersion && (recipeVersion.sous_vide_temp_c != null || recipeVersion.sous_vide_time_min != null) && (
          <fieldset className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <legend className="px-1 text-sm font-medium text-blue-800">Parametri gătire</legend>
            <div className="flex gap-6 text-sm text-blue-900">
              <span>
                <span className="text-blue-600">Temperatură: </span>
                {recipeVersion.sous_vide_temp_c != null ? `${recipeVersion.sous_vide_temp_c} °C` : '—'}
              </span>
              <span>
                <span className="text-blue-600">Timp: </span>
                {recipeVersion.sous_vide_time_min != null ? `${recipeVersion.sous_vide_time_min} min` : '—'}
              </span>
            </div>
          </fieldset>
        )}

        {recipeIngredients && recipeIngredients.length > 0 && (
          <fieldset className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <legend className="px-1 text-sm font-medium text-amber-800">
              {scale !== 1 ? `Ingrediente scalate (${scale.toFixed(2)}×)` : 'Ingrediente'}
            </legend>
            <ul className="mt-1 space-y-1 text-sm text-amber-900">
              {recipeIngredients.map((ri) => (
                <li key={ri.id} className="flex justify-between">
                  <span>{ri.ingredients?.name ?? 'ingredient'}</span>
                  <span>
                    {roundQty(ri.quantity * scale)} {ri.unit}
                  </span>
                </li>
              ))}
            </ul>
            {recipeVersion?.estimated_portions != null && (
              <p className="mt-3 border-t border-amber-200 pt-2 text-sm font-medium text-amber-900">
                Porții estimate: {Math.round(recipeVersion.estimated_portions * scale)}
              </p>
            )}
          </fieldset>
        )}

        <fieldset className="rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-700">Checkpoint-uri HACCP</legend>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-wrap items-start gap-2">
                <input
                  placeholder="nume checkpoint (ex: temp. finală)"
                  {...register(`checkpoints.${index}.checkpoint_name`)}
                  className="flex-1 min-w-[160px] rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="temp °C"
                  {...register(`checkpoints.${index}.temp_c`)}
                  className="w-28 rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  type="datetime-local"
                  {...register(`checkpoints.${index}.timestamp`)}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
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
            onClick={() => append({ checkpoint_name: '', temp_c: '', timestamp: nowLocal() })}
            className="mt-3 text-sm font-medium text-blue-600"
          >
            + Adaugă checkpoint
          </button>
        </fieldset>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || createLog.isPending}
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {isSubmitting || createLog.isPending ? 'Se salvează...' : 'Salvează'}
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
