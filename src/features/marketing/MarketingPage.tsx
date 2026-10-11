import { useEffect, useRef, useState } from 'react'
import {
  useBrands,
  useDeleteItem,
  useGenerateMenuTexts,
  useGenerateReviewReply,
  useGenerateWeeklyPlan,
  useItems,
  useLatestWeeklyRun,
  useSaveBrand,
  useUpdateItem,
  type Brand,
  type BrandInput,
  type ItemStatus,
  type MarketingItem,
} from './api'
import { useQueryClient } from '@tanstack/react-query'

type Tab = 'plan' | 'reviews' | 'menu' | 'profile'

const TABS: { key: Tab; label: string }[] = [
  { key: 'plan', label: 'Plan' },
  { key: 'reviews', label: 'Recenzii' },
  { key: 'menu', label: 'Meniu' },
  { key: 'profile', label: 'Profil' },
]

const inputClass = 'w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm'
const primaryButton = 'rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50'

const statusLabel: Record<ItemStatus, string> = {
  draft: 'De revizuit',
  approved: 'Aprobat',
  rejected: 'Respins',
  published: 'Publicat',
}

const statusClass: Record<ItemStatus, string> = {
  draft: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-gray-100 text-gray-600',
  published: 'bg-blue-100 text-blue-800',
}

const channelLabel: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  facebook_instagram: 'Facebook + Instagram',
  in_local: 'În local',
}

function formatDate(date: string | null) {
  if (!date) return null
  return new Date(`${date}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'short' })
}

function ItemCard({ item }: { item: MarketingItem }) {
  const update = useUpdateItem()
  const remove = useDeleteItem()
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(item.body)
  const [copied, setCopied] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setEditing(true) // fără acces la clipboard: textul rămâne selectabil în editor
    }
  }

  const setStatus = (status: ItemStatus) => update.mutate({ id: item.id, patch: { status } })

  return (
    <div className={`rounded-lg border bg-white p-4 ${item.status === 'rejected' ? 'border-gray-200 opacity-60' : 'border-gray-300'}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded px-1.5 py-0.5 font-medium ${statusClass[item.status]}`}>{statusLabel[item.status]}</span>
        {item.channel && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">{channelLabel[item.channel] ?? item.channel}</span>
        )}
        {item.suggested_date && (
          <span className="text-gray-500">
            {formatDate(item.suggested_date)}
            {item.suggested_time && `, ${item.suggested_time}`}
          </span>
        )}
      </div>
      <p className="mt-2 font-medium text-gray-900">{item.title}</p>

      {item.input && item.kind === 'review_reply' && (
        <p className="mt-2 border-l-2 border-gray-200 pl-2 text-sm italic text-gray-500">{item.input}</p>
      )}

      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className={inputClass} />
          <div className="flex gap-2">
            <button
              type="button"
              className={primaryButton}
              disabled={update.isPending}
              onClick={() => update.mutate({ id: item.id, patch: { body } }, { onSuccess: () => setEditing(false) })}
            >
              Salvează
            </button>
            <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => { setBody(item.body); setEditing(false) }}>
              Renunță
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{item.body}</p>
      )}

      {item.image_idea && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">📷 Poză: </span>
          {item.image_idea}
        </p>
      )}
      {item.rationale && item.kind !== 'post' && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{item.kind === 'review_reply' ? '🔎 Pentru tine: ' : '💡 De ce: '}</span>
          {item.rationale}
        </p>
      )}

      {item.status === 'rejected' && item.rejection_reason && (
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">✗ Motiv: </span>
          {item.rejection_reason}
        </p>
      )}

      {rejecting ? (
        <div className="mt-3 space-y-2">
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="De ce? (opțional — agentul învață din asta)"
            className={inputClass}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className={primaryButton}
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { id: item.id, patch: { status: 'rejected', rejection_reason: reason.trim() || null } },
                  { onSuccess: () => setRejecting(false) },
                )
              }
            >
              Respinge
            </button>
            <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => setRejecting(false)}>
              Renunță
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          <button type="button" onClick={() => void copy()} className="text-gray-700 hover:text-gray-900">
            {copied ? 'Copiat ✓' : 'Copiază'}
          </button>
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="text-gray-700 hover:text-gray-900">
              Editează
            </button>
          )}
          {item.status !== 'approved' && item.status !== 'published' && (
            <button type="button" onClick={() => setStatus('approved')} className="text-green-700 hover:text-green-900">
              Aprobă
            </button>
          )}
          {item.status === 'approved' && (
            <button type="button" onClick={() => setStatus('published')} className="text-blue-700 hover:text-blue-900">
              Marchează publicat
            </button>
          )}
          {item.status !== 'rejected' && item.status !== 'published' && (
            <button type="button" onClick={() => setRejecting(true)} className="text-gray-500 hover:text-gray-800">
              Respinge
            </button>
          )}
          {item.status === 'rejected' && (
            <button type="button" onClick={() => remove.mutate(item.id)} className="text-red-600 hover:text-red-800">
              Șterge
            </button>
          )}
        </div>
      )}
    </div>
  )
}

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

      <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-200">
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
        {brand && tab === 'reviews' && <ReviewsTab brand={brand} />}
        {brand && tab === 'menu' && <MenuTab brand={brand} />}
        {brand && tab === 'profile' && <ProfileTab key={brand.id} brand={brand} />}
      </div>
    </div>
  )
}
