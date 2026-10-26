import { useState } from 'react'
import { useDeleteItem, useUpdateItem, type ItemStatus, type MarketingItem, type ResultFields } from './api'
import { useDraft } from './useDraft'

export const inputClass = 'w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm'
export const primaryButton = 'rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50'

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

export function formatDate(date: string | null) {
  if (!date) return null
  return new Date(`${date}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'short' })
}

const toNumber = (v: string) => (v.trim() === '' ? null : Math.max(0, Math.round(Number(v))))

// Ce a adus o postare / ofertă publicată — agentul folosește asta ca să facă mai mult din ce merge.
function ResultsEditor({ item }: { item: MarketingItem }) {
  const update = useUpdateItem()
  const hasResults = item.result_reach != null || item.result_engagement != null || item.result_orders != null || !!item.result_note
  const initial = {
    reach: item.result_reach?.toString() ?? '',
    engagement: item.result_engagement?.toString() ?? '',
    orders: item.result_orders?.toString() ?? '',
    note: item.result_note ?? '',
  }
  const [form, setForm, draft] = useDraft(`item:${item.id}:results`, initial)
  const [open, setOpen] = useState(draft.restored)

  if (!open) {
    return (
      <div className="mt-3 rounded-md bg-blue-50 p-2 text-sm text-blue-900">
        {hasResults ? (
          <span>
            📊 {item.result_reach ?? '–'} vizualizări · {item.result_engagement ?? '–'} interacțiuni · {item.result_orders ?? '–'} comenzi/rezervări
            {item.result_note && <span className="block text-blue-800">{item.result_note}</span>}
          </span>
        ) : (
          <span>📊 Cum a mers? Trece rezultatele după 2-3 zile, ca agentul să învețe ce aduce clienți.</span>
        )}
        <button type="button" onClick={() => setOpen(true)} className="ml-2 font-medium underline">
          {hasResults ? 'Modifică' : 'Adaugă rezultate'}
        </button>
      </div>
    )
  }

  const save = () => {
    const patch: ResultFields = {
      result_reach: toNumber(form.reach),
      result_engagement: toNumber(form.engagement),
      result_orders: toNumber(form.orders),
      result_note: form.note.trim() || null,
    }
    update.mutate({ id: item.id, patch }, { onSuccess: () => { draft.commit(form); setOpen(false) } })
  }
  const field = (key: 'reach' | 'engagement' | 'orders', label: string) => (
    <label className="block text-xs text-gray-600">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={`mt-1 ${inputClass}`}
      />
    </label>
  )

  return (
    <div className="mt-3 space-y-2 rounded-md bg-blue-50 p-3">
      <div className="grid grid-cols-3 gap-2">
        {field('reach', 'Vizualizări')}
        {field('engagement', 'Interacțiuni')}
        {field('orders', 'Comenzi / rezervări')}
      </div>
      <input
        value={form.note}
        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
        placeholder="Observații (ex. 3 mesaje pentru rezervare, comentarii despre preț)"
        className={inputClass}
      />
      <div className="flex gap-2">
        <button type="button" className={primaryButton} disabled={update.isPending} onClick={save}>
          Salvează
        </button>
        <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => { setForm(initial); setOpen(false) }}>
          Renunță
        </button>
      </div>
    </div>
  )
}

export function ItemCard({ item }: { item: MarketingItem }) {
  const update = useUpdateItem()
  const remove = useDeleteItem()
  const [body, setBody, bodyDraft] = useDraft(`item:${item.id}:body`, item.body)
  const [editing, setEditing] = useState(bodyDraft.restored)
  const [copied, setCopied] = useState(false)
  const [reason, setReason, reasonDraft] = useDraft(`item:${item.id}:reason`, '')
  const [rejecting, setRejecting] = useState(reasonDraft.restored)

  async function copy() {
    try {
      await navigator.clipboard.writeText(item.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setEditing(true) // fără acces la clipboard: textul rămâne selectabil în editor
    }
  }

  const setStatus = (status: ItemStatus) =>
    update.mutate({ id: item.id, patch: status === 'published' ? { status, published_at: new Date().toISOString() } : { status } })

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
              onClick={() => update.mutate({ id: item.id, patch: { body } }, { onSuccess: () => { bodyDraft.commit(body); setEditing(false) } })}
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

      {item.status === 'published' && (item.kind === 'post' || item.kind === 'promo') && <ResultsEditor item={item} />}

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
                  { onSuccess: () => { reasonDraft.commit(); setRejecting(false) } },
                )
              }
            >
              Respinge
            </button>
            <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => { setReason(''); setRejecting(false) }}>
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

