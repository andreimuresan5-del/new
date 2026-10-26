import { useState } from 'react'
import { readDraft, useDraft } from './useDraft'
import {
  useDeletePackage,
  useGenerateLeadMessage,
  useGeneratePackages,
  useLeads,
  usePackages,
  useSaveLead,
  useSavePackage,
  type Brand,
  type EventLead,
  type EventLeadInput,
  type EventPackage,
  type LeadStatus,
} from './api'
import { inputClass, primaryButton } from './ItemCard'

const STATUS: { key: LeadStatus; label: string; className: string }[] = [
  { key: 'new', label: 'Cerere nouă', className: 'bg-amber-100 text-amber-800' },
  { key: 'offer_sent', label: 'Ofertă trimisă', className: 'bg-blue-100 text-blue-800' },
  { key: 'negotiating', label: 'Negociere', className: 'bg-purple-100 text-purple-800' },
  { key: 'confirmed', label: 'Confirmat', className: 'bg-green-100 text-green-800' },
  { key: 'lost', label: 'Pierdut', className: 'bg-gray-100 text-gray-600' },
]
const statusInfo = (s: LeadStatus) => STATUS.find((x) => x.key === s)!
const OPEN: LeadStatus[] = ['new', 'offer_sent', 'negotiating']

const today = () => new Date().toISOString().slice(0, 10)
const emptyToNull = (v: string) => (v.trim() === '' ? null : v.trim())
const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v))

function formatDay(date: string | null) {
  if (!date) return null
  return new Date(`${date}T12:00:00`).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="font-medium text-gray-700 hover:text-gray-900"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
    >
      {copied ? 'Copiat ✓' : 'Copiază'}
    </button>
  )
}

const leadFormKey = (brandId: string, leadId?: string) => `lead-form:${brandId}:${leadId ?? 'new'}`

function LeadForm({ brandId, packages, lead, onDone }: { brandId: string; packages: EventPackage[]; lead?: EventLead; onDone: () => void }) {
  const save = useSaveLead()
  const [f, setF, draft] = useDraft(leadFormKey(brandId, lead?.id), {
    name: lead?.name ?? '',
    contact_person: lead?.contact_person ?? '',
    phone: lead?.phone ?? '',
    email: lead?.email ?? '',
    source: lead?.source ?? 'telefon',
    event_type: lead?.event_type ?? '',
    event_date: lead?.event_date ?? '',
    guests: lead?.guests?.toString() ?? '',
    budget: lead?.budget ?? '',
    package_id: lead?.package_id ?? '',
    notes: lead?.notes ?? '',
  })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const input: Partial<EventLeadInput> = {
      name: f.name.trim(),
      contact_person: emptyToNull(f.contact_person),
      phone: emptyToNull(f.phone),
      email: emptyToNull(f.email),
      source: emptyToNull(f.source),
      event_type: emptyToNull(f.event_type),
      event_date: emptyToNull(f.event_date),
      guests: numOrNull(f.guests),
      budget: emptyToNull(f.budget),
      package_id: emptyToNull(f.package_id),
      notes: emptyToNull(f.notes),
    }
    if (!lead) input.next_followup_date = today()
    await save.mutateAsync({ id: lead?.id, brandId, input })
    draft.commit()
    onDone()
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
      <input required placeholder="Firma sau persoana *" value={f.name} onChange={set('name')} className={inputClass} />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Persoană de contact" value={f.contact_person} onChange={set('contact_person')} className={inputClass} />
        <select value={f.source} onChange={set('source')} className={inputClass}>
          {['telefon', 'facebook', 'instagram', 'email', 'recomandare', 'prospectare', 'în local'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="Telefon" value={f.phone} onChange={set('phone')} className={inputClass} />
        <input placeholder="Email" type="email" value={f.email} onChange={set('email')} className={inputClass} />
        <input placeholder="Tip eveniment (ex. Crăciun firmă)" value={f.event_type} onChange={set('event_type')} className={inputClass} />
        <input type="date" value={f.event_date} onChange={set('event_date')} className={inputClass} />
        <input placeholder="Nr. invitați" type="number" min={1} value={f.guests} onChange={set('guests')} className={inputClass} />
        <input placeholder="Buget (opțional)" value={f.budget} onChange={set('budget')} className={inputClass} />
      </div>
      <select value={f.package_id} onChange={set('package_id')} className={inputClass}>
        <option value="">Pachet: nealeas (agentul propune)</option>
        {packages.filter((p) => p.active).map((p) => (
          <option key={p.id} value={p.id}>{p.name}{p.price_per_person != null ? ` — ${p.price_per_person} lei/pers.` : ''}</option>
        ))}
      </select>
      <textarea placeholder="Note (ce își dorește, restricții, alergii...)" value={f.notes} onChange={set('notes')} rows={2} className={inputClass} />
      {save.error && <p className="text-sm text-red-700">{(save.error as Error).message}</p>}
      <div className="flex gap-2">
        <button type="submit" className={primaryButton} disabled={save.isPending}>Salvează</button>
        <button type="button" onClick={() => { draft.commit(); onDone() }} className="px-3 py-1.5 text-sm text-gray-600">Renunță</button>
      </div>
    </form>
  )
}

function LeadCard({ brandId, lead, packages }: { brandId: string; lead: EventLead; packages: EventPackage[] }) {
  const save = useSaveLead()
  const generate = useGenerateLeadMessage()
  const [editing, setEditing] = useState(() => readDraft(leadFormKey(brandId, lead.id)) !== undefined)
  const [channel, setChannel] = useState<'email' | 'whatsapp'>(lead.email ? 'email' : 'whatsapp')
  const [note, setNote] = useState<string | null>(null)
  const [message, setMessage, messageDraft] = useDraft(`lead:${lead.id}:message`, lead.last_message ?? '')
  const [editingMessage, setEditingMessage] = useState(messageDraft.restored)
  const [lostReason, setLostReason, lostDraft] = useDraft(`lead:${lead.id}:lost`, '')
  const [losing, setLosing] = useState(lostDraft.restored)
  const pkg = packages.find((p) => p.id === lead.package_id)
  const info = statusInfo(lead.status)
  const due = OPEN.includes(lead.status) && lead.next_followup_date && lead.next_followup_date <= today()

  if (editing) return <LeadForm brandId={brandId} packages={packages} lead={lead} onDone={() => setEditing(false)} />

  async function write(purpose: 'offer' | 'followup' | 'prospecting') {
    const res = await generate.mutateAsync({ brandId, leadId: lead.id, purpose, channel })
    setNote(res.internal_note || null)
  }

  const setStatus = (status: LeadStatus, extra: Partial<EventLeadInput> = {}) =>
    save.mutate({ id: lead.id, brandId, input: { status, ...extra } })

  return (
    <div className={`rounded-lg border bg-white p-4 ${due ? 'border-amber-400' : 'border-gray-300'} ${lead.status === 'lost' ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded px-1.5 py-0.5 font-medium ${info.className}`}>{info.label}</span>
        {lead.event_date && <span className="text-gray-600">📅 {formatDay(lead.event_date)}</span>}
        {lead.guests && <span className="text-gray-600">👥 {lead.guests}</span>}
        {due && <span className="font-medium text-amber-700">⏰ De recontactat azi</span>}
      </div>
      <p className="mt-2 font-medium text-gray-900">{lead.name}{lead.event_type && <span className="font-normal text-gray-600"> · {lead.event_type}</span>}</p>
      <p className="text-sm text-gray-600">
        {[lead.contact_person, lead.phone, lead.email].filter(Boolean).join(' · ')}
        {pkg && <span className="block">Pachet: {pkg.name}{pkg.price_per_person != null && ` (${pkg.price_per_person} lei/pers.)`}</span>}
        {lead.budget && <span className="block">Buget: {lead.budget}</span>}
        {lead.notes && <span className="block italic">{lead.notes}</span>}
        {lead.lost_reason && <span className="block">✗ Pierdut: {lead.lost_reason}</span>}
      </p>

      {OPEN.includes(lead.status) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <select value={channel} onChange={(e) => setChannel(e.target.value as 'email' | 'whatsapp')} className="rounded-md border border-gray-300 px-2 py-1">
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <button type="button" className={primaryButton} disabled={generate.isPending} onClick={() => void write(lead.status === 'new' ? 'offer' : 'followup')}>
            {generate.isPending ? 'Se scrie...' : lead.status === 'new' ? 'Scrie oferta' : 'Scrie follow-up'}
          </button>
          {lead.status === 'new' && lead.source === 'prospectare' && (
            <button type="button" className="font-medium text-gray-700" disabled={generate.isPending} onClick={() => void write('prospecting')}>
              Mesaj de prospectare
            </button>
          )}
        </div>
      )}
      {generate.error && <p className="mt-2 text-sm text-red-700">{(generate.error as Error).message}</p>}

      {lead.last_message && (
        <div className="mt-3 rounded-md bg-gray-50 p-3">
          {editingMessage ? (
            <>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={10} className={inputClass} />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className={primaryButton}
                  onClick={() => save.mutate({ id: lead.id, brandId, input: { last_message: message } }, { onSuccess: () => { messageDraft.commit(message); setEditingMessage(false) } })}
                >
                  Salvează
                </button>
                <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => { setMessage(lead.last_message ?? ''); setEditingMessage(false) }}>
                  Renunță
                </button>
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-gray-800">{lead.last_message}</p>
          )}
          {note && <p className="mt-2 text-sm text-gray-600"><span className="font-medium">🔎 Verifică: </span>{note}</p>}
          {!editingMessage && (
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <CopyButton text={lead.last_message} />
              <button type="button" className="font-medium text-gray-700" onClick={() => { setMessage(lead.last_message ?? ''); setEditingMessage(true) }}>Editează</button>
              {lead.status === 'new' && (
                <button type="button" className="font-medium text-blue-700" onClick={() => setStatus('offer_sent')}>Am trimis oferta</button>
              )}
            </div>
          )}
          {lead.next_followup_date && OPEN.includes(lead.status) && (
            <p className="mt-2 text-xs text-gray-500">Revenim pe {formatDay(lead.next_followup_date)} dacă nu răspunde.</p>
          )}
        </div>
      )}

      {losing ? (
        <div className="mt-3 space-y-2">
          <input autoFocus value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="De ce l-am pierdut? (preț, dată ocupată, a ales altceva...)" className={inputClass} />
          <div className="flex gap-2">
            <button type="button" className={primaryButton} onClick={() => { lostDraft.commit(); setStatus('lost', { lost_reason: lostReason.trim() || null }) }}>Marchează pierdut</button>
            <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => { setLostReason(''); setLosing(false) }}>Renunță</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
          {lead.status !== 'negotiating' && OPEN.includes(lead.status) && (
            <button type="button" className="text-purple-700" onClick={() => setStatus('negotiating')}>Negociem</button>
          )}
          {lead.status !== 'confirmed' && (
            <button type="button" className="text-green-700" onClick={() => setStatus('confirmed')}>Confirmat 🎉</button>
          )}
          {lead.status !== 'lost' && (
            <button type="button" className="text-gray-500" onClick={() => setLosing(true)}>Pierdut</button>
          )}
          <button type="button" className="text-gray-700" onClick={() => setEditing(true)}>Editează</button>
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg }: { pkg: EventPackage }) {
  const save = useSavePackage()
  const remove = useDeletePackage()
  const initial = {
    name: pkg.name,
    description: pkg.description,
    price: pkg.price_per_person?.toString() ?? '',
    min: pkg.min_guests?.toString() ?? '',
    max: pkg.max_guests?.toString() ?? '',
  }
  const [f, setF, draft] = useDraft(`package:${pkg.id}`, initial)
  const [editing, setEditing] = useState(draft.restored)

  if (editing) {
    return (
      <div className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputClass} />
        <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={6} className={inputClass} />
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="Lei/pers." type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} className={inputClass} />
          <input placeholder="Min pers." type="number" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} className={inputClass} />
          <input placeholder="Max pers." type="number" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={primaryButton}
            onClick={() =>
              save.mutate(
                { id: pkg.id, input: { name: f.name.trim(), description: f.description.trim(), price_per_person: numOrNull(f.price), min_guests: numOrNull(f.min), max_guests: numOrNull(f.max) } },
                { onSuccess: () => { draft.commit(f); setEditing(false) } },
              )
            }
          >
            Salvează
          </button>
          <button type="button" className="px-3 py-1.5 text-sm text-gray-600" onClick={() => { setF(initial); setEditing(false) }}>Renunță</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-gray-300 bg-white p-4 ${pkg.active ? '' : 'opacity-50'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-gray-900">{pkg.name}</p>
        <p className="whitespace-nowrap text-sm font-medium text-gray-900">{pkg.price_per_person != null ? `${pkg.price_per_person} lei/pers.` : 'preț de stabilit'}</p>
      </div>
      <p className="text-xs text-gray-500">
        {[pkg.season, pkg.min_guests || pkg.max_guests ? `${pkg.min_guests ?? '?'}–${pkg.max_guests ?? '?'} pers.` : null].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{pkg.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 text-sm font-medium">
        <button type="button" className="text-gray-700" onClick={() => setEditing(true)}>Editează</button>
        <button type="button" className="text-gray-700" onClick={() => save.mutate({ id: pkg.id, input: { active: !pkg.active } })}>
          {pkg.active ? 'Dezactivează' : 'Activează'}
        </button>
        {!pkg.active && <button type="button" className="text-red-600" onClick={() => remove.mutate(pkg.id)}>Șterge</button>}
      </div>
    </div>
  )
}

export function EventsTab({ brand }: { brand: Brand }) {
  const { data: leads } = useLeads(brand.id)
  const { data: packages } = usePackages(brand.id)
  const generatePackages = useGeneratePackages()
  const [adding, setAdding] = useState(() => readDraft(leadFormKey(brand.id)) !== undefined)
  const [request, setRequest] = useDraft(`packages-request:${brand.id}`, '')
  const [packagesNote, setPackagesNote] = useState<string | null>(null)
  const [showClosed, setShowClosed] = useState(false)

  const all = leads ?? []
  const open = all.filter((l) => OPEN.includes(l.status))
    .sort((a, b) => (a.next_followup_date ?? '9999').localeCompare(b.next_followup_date ?? '9999'))
  const closed = all.filter((l) => !OPEN.includes(l.status))
  const confirmed = all.filter((l) => l.status === 'confirmed')
  const decided = all.filter((l) => l.status === 'confirmed' || l.status === 'lost').length

  return (
    <div className="space-y-6">
      {!brand.event_info && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Completează în Profil câmpul „Evenimente” (capacitate interior/terasă, ce oferiți) — agentul are nevoie de el pentru pachete și oferte corecte.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-gray-200 bg-white p-2">
          <p className="text-xl font-semibold text-gray-900">{open.length}</p>
          <p className="text-xs text-gray-500">în lucru</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-2">
          <p className="text-xl font-semibold text-gray-900">{confirmed.length}</p>
          <p className="text-xs text-gray-500">confirmate</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-2">
          <p className="text-xl font-semibold text-gray-900">{decided ? `${Math.round((confirmed.length / decided) * 100)}%` : '—'}</p>
          <p className="text-xs text-gray-500">rată de câștig</p>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Cereri de eveniment</h2>
          {!adding && <button type="button" className="text-sm font-medium text-gray-700" onClick={() => setAdding(true)}>+ Cerere nouă</button>}
        </div>
        {adding && <LeadForm brandId={brand.id} packages={packages ?? []} onDone={() => setAdding(false)} />}
        {open.length === 0 && !adding && (
          <p className="text-sm text-gray-500">
            Nicio cerere în lucru. Adaugă orice cerere primită (telefon, Facebook) — sau firme pe care vrei să le contactezi tu (sursa „prospectare”).
          </p>
        )}
        {open.map((l) => <LeadCard key={l.id} brandId={brand.id} lead={l} packages={packages ?? []} />)}
        {closed.length > 0 && (
          <button type="button" className="text-sm text-gray-500" onClick={() => setShowClosed(!showClosed)}>
            {showClosed ? 'Ascunde' : 'Arată'} confirmate și pierdute ({closed.length})
          </button>
        )}
        {showClosed && closed.map((l) => <LeadCard key={l.id} brandId={brand.id} lead={l} packages={packages ?? []} />)}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-gray-900">Pachete</h2>
        <div className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={2}
            placeholder="Opțional: ce fel de pachete (ex. „3 pachete de Crăciun pentru firme, 15-35 pers., unul sub 150 lei/pers.”)"
            className={inputClass}
          />
          <button
            type="button"
            className={primaryButton}
            disabled={generatePackages.isPending}
            onClick={() =>
              void generatePackages.mutateAsync({ brandId: brand.id, request }).then((r) => {
                setPackagesNote(r.note || null)
                setRequest('')
              })
            }
          >
            {generatePackages.isPending ? 'Se gândește la pachete...' : 'Propune pachete'}
          </button>
          {generatePackages.error && <p className="text-sm text-red-700">{(generatePackages.error as Error).message}</p>}
          {packagesNote && <p className="text-sm text-gray-600"><span className="font-medium">🔎 De verificat: </span>{packagesNote}</p>}
        </div>
        {packages?.map((p) => <PackageCard key={p.id} pkg={p} />)}
      </section>
    </div>
  )
}
