import { useEffect, useRef, useState } from 'react'
import {
  useBrands,
  useGenerateMenuTexts,
  useGenerateReviewReply,
  useGenerateWeeklyPlan,
  useItems,
  useLatestWeeklyRun,
  useSaveBrand,
  type Brand,
  type BrandInput,
} from './api'
import { EventsTab } from './EventsTab'
import { ItemCard, inputClass, primaryButton } from './ItemCard'
import { ResultsTab } from './ResultsTab'
import { useQueryClient } from '@tanstack/react-query'

type Tab = 'plan' | 'events' | 'reviews' | 'menu' | 'results' | 'profile'

const TABS: { key: Tab; label: string }[] = [
  { key: 'plan', label: 'Plan' },
  { key: 'events', label: 'Evenimente' },
  { key: 'reviews', label: 'Recenzii' },
  { key: 'menu', label: 'Meniu' },
  { key: 'results', label: 'Rezultate' },
  { key: 'profile', label: 'Profil' },
]

function PlanTab({ brand }: { brand: Brand }) {
  const { data: items } = useItems(brand.id, ['post', 'promo'])
  const { data: run } = useLatestWeeklyRun(brand.id)
  const generate = useGenerateWeeklyPlan()
  const queryClient = useQueryClient()
  const running = run?.status === 'running' || generate.isPending

  // când rularea se termină, reîncărcăm materialele
  const prevStatus = useRef(run?.status)
  useEffect(() => {
    if (prevStatus.current === 'running' && run?.status !== 'running') {
      queryClient.invalidateQueries({ queryKey: ['marketing_items', brand.id] })
    }
    prevStatus.current = run?.status
  }, [run?.status, brand.id, queryClient])

  const latestBatch = items?.find((i) => i.batch_id)?.batch_id
  const current = (items ?? []).filter((i) => i.batch_id === latestBatch)
  const posts = current.filter((i) => i.kind === 'post').sort((a, b) =>
    `${a.suggested_date}${a.suggested_time}`.localeCompare(`${b.suggested_date}${b.suggested_time}`))
  const promos = current.filter((i) => i.kind === 'promo')
  const summary = posts[0]?.rationale

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">Planul nou vine automat lunea dimineața. Îl poți cere și acum.</p>
        <button type="button" className={primaryButton} disabled={running} onClick={() => generate.mutate(brand.id)}>
          {running ? 'Se pregătește... (1-2 min)' : 'Generează plan acum'}
        </button>
      </div>
      {run?.status === 'error' && <p className="text-sm text-red-700">Ultima generare a eșuat: {run.error}</p>}
      {generate.error && <p className="text-sm text-red-700">{(generate.error as Error).message}</p>}

      {!latestBatch && !running && <p className="text-sm text-gray-500">Încă niciun plan. Completează întâi Profilul, apoi apasă „Generează plan acum”.</p>}

      {summary && <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700">{summary}</p>}

      {promos.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-medium text-gray-900">Oferte propuse</h2>
          {promos.map((i) => <ItemCard key={i.id} item={i} />)}
        </section>
      )}
      {posts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-medium text-gray-900">Postări</h2>
          {posts.map((i) => <ItemCard key={i.id} item={i} />)}
        </section>
      )}
    </div>
  )
}

function ReviewsTab({ brand }: { brand: Brand }) {
  const { data: items } = useItems(brand.id, ['review_reply'])
  const generate = useGenerateReviewReply()
  const [review, setReview] = useState('')
  const [platform, setPlatform] = useState('Google')
  const [rating, setRating] = useState('')
  const [author, setAuthor] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await generate.mutateAsync({
      brandId: brand.id,
      review,
      platform,
      rating: rating ? Number(rating) : null,
      author: author.trim() || null,
    })
    setReview('')
    setRating('')
    setAuthor('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
        <p className="text-sm text-gray-600">Lipește recenzia (de pe Google, Wolt, Glovo, Facebook) și primești răspunsul gata de copiat.</p>
        <textarea required placeholder="Textul recenziei" value={review} onChange={(e) => setReview(e.target.value)} rows={4} className={inputClass} />
        <div className="grid grid-cols-3 gap-2">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClass}>
            {['Google', 'Wolt', 'Glovo', 'Facebook', 'Tripadvisor', 'Altă platformă'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass}>
            <option value="">Stele</option>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
          </select>
          <input placeholder="Nume (opțional)" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        </div>
        {generate.error && <p className="text-sm text-red-700">{(generate.error as Error).message}</p>}
        <button type="submit" className={primaryButton} disabled={generate.isPending}>
          {generate.isPending ? 'Se scrie răspunsul...' : 'Scrie răspunsul'}
        </button>
      </form>
      {items?.map((i) => <ItemCard key={i.id} item={i} />)}
    </div>
  )
}

function MenuTab({ brand }: { brand: Brand }) {
  const { data: items } = useItems(brand.id, ['menu_text'])
  const generate = useGenerateMenuTexts()
  const [products, setProducts] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await generate.mutateAsync({ brandId: brand.id, products })
    setProducts('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
        <p className="text-sm text-gray-600">Un produs pe linie, cu ingredientele principale. Primești nume și descriere pentru Wolt/Glovo/site.</p>
        <textarea
          required
          placeholder={'Burger Astur — vită 180g, cheddar, bacon, sos casei\nAripioare BBQ — 8 buc, glazură BBQ'}
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          rows={5}
          className={inputClass}
        />
        {generate.error && <p className="text-sm text-red-700">{(generate.error as Error).message}</p>}
        <button type="submit" className={primaryButton} disabled={generate.isPending}>
          {generate.isPending ? 'Se scriu textele...' : 'Scrie textele'}
        </button>
      </form>
      {items?.map((i) => <ItemCard key={i.id} item={i} />)}
    </div>
  )
}

const PROFILE_FIELDS: { key: keyof BrandInput; label: string; placeholder: string; rows: number }[] = [
  { key: 'description', label: 'Ce fel de local e', placeholder: 'Gastrobar în centru, bucătărie..., atmosferă..., capacitate...', rows: 3 },
  { key: 'audience', label: 'Cine sunt clienții', placeholder: 'Corporatiști la prânz, grupuri de prieteni seara, turiști...', rows: 2 },
  { key: 'tone', label: 'Cum vorbim', placeholder: 'Prietenos și relaxat, cu umor, fără să fim vulgari...', rows: 2 },
  { key: 'differentiators', label: 'Ce ne diferențiază', placeholder: 'Producție proprie sous vide, ingrediente..., evenimente...', rows: 2 },
  { key: 'competition', label: 'Cu cine concurăm', placeholder: 'Pe livrare: pizzerii, meniul zilei... În local: ...', rows: 2 },
  { key: 'event_info', label: 'Evenimente', placeholder: 'Capacitate interior / terasă, ce oferiți (meniu fix, băuturi, DJ, decor), avans, program...', rows: 3 },
  { key: 'address', label: 'Adresă', placeholder: 'Str. ..., Timișoara', rows: 1 },
  { key: 'opening_hours', label: 'Program', placeholder: 'L-J 11-23, V-S 11-02, D 12-22', rows: 1 },
  { key: 'website_url', label: 'Site', placeholder: 'https://...', rows: 1 },
  { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...', rows: 1 },
  { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...', rows: 1 },
  { key: 'menu_text', label: 'Meniul cu prețuri', placeholder: 'Lipește meniul: produs — preț, pe categorii', rows: 10 },
  { key: 'extra_notes', label: 'Alte note pentru agent', placeholder: 'Meciuri difuzate, evenimente recurente, ce să evite...', rows: 3 },
]

function ProfileTab({ brand }: { brand: Brand }) {
  const save = useSaveBrand()
  const [form, setForm] = useState<BrandInput>(() => {
    const { id: _id, name: _name, ...rest } = brand
    return rest
  })
  const [saved, setSaved] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v]),
    ) as BrandInput
    await save.mutateAsync({ id: brand.id, input: cleaned })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-3">
      <p className="text-sm text-gray-500">Tot ce scrii aici e contextul agentului. Cu cât e mai concret, cu atât materialele sunt mai bune.</p>
      {PROFILE_FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="text-sm font-medium text-gray-700">{f.label}</span>
          <textarea
            value={(form[f.key] as string | null) ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            rows={f.rows}
            className={`mt-1 ${inputClass}`}
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.weekly_plan_enabled}
          onChange={(e) => setForm((prev) => ({ ...prev, weekly_plan_enabled: e.target.checked }))}
        />
        Plan automat în fiecare luni
      </label>
      {save.error && <p className="text-sm text-red-700">{(save.error as Error).message}</p>}
      <button type="submit" className={primaryButton} disabled={save.isPending}>
        {saved ? 'Salvat ✓' : 'Salvează profilul'}
      </button>
    </form>
  )
}

export function MarketingPage() {
  const { data: brands, isLoading } = useBrands()
  const [brandId, setBrandId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('plan')
  const brand = brands?.find((b) => b.id === brandId) ?? brands?.[0]

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-gray-900">Marketing</h1>
        {brands && brands.length > 1 && (
          <select value={brand?.id} onChange={(e) => setBrandId(e.target.value)} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        {brands?.length === 1 && <span className="text-sm font-medium text-gray-600">{brand?.name}</span>}
      </div>

      <nav className="mt-4 flex flex-wrap gap-x-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 py-2 text-sm font-medium ${tab === t.key ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {isLoading && <p className="text-sm text-gray-500">Se încarcă...</p>}
        {!isLoading && !brand && <p className="text-sm text-gray-500">Niciun brand configurat.</p>}
        {brand && tab === 'plan' && <PlanTab brand={brand} />}
        {brand && tab === 'events' && <EventsTab brand={brand} />}
        {brand && tab === 'reviews' && <ReviewsTab brand={brand} />}
        {brand && tab === 'results' && <ResultsTab brand={brand} />}
        {brand && tab === 'menu' && <MenuTab brand={brand} />}
        {brand && tab === 'profile' && <ProfileTab key={brand.id} brand={brand} />}
      </div>
    </div>
  )
}
