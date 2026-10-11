import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useCompetitors,
  useLatestScanRuns,
  useSaveCompetitor,
  useSaveWatchArea,
  useScanNow,
  useWatchAreas,
  type Competitor,
  type CompetitorInput,
  type ScanRun,
  type WatchArea,
  type WatchAreaInput,
} from './api'

const inputClass = 'w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm'
const emptyToNull = (v: string) => (v.trim() === '' ? null : v.trim())

function RunStatus({ run, lastScannedAt }: { run: ScanRun | undefined; lastScannedAt: string | null }) {
  if (run?.status === 'running') return <span className="text-amber-700">Scanare în curs...</span>
  if (run?.status === 'error') return <span className="text-red-700" title={run.error ?? ''}>Eroare la ultima scanare</span>
  if (!lastScannedAt) return <span className="text-gray-500">Încă nescanat</span>
  return (
    <span className="text-gray-500">
      Scanat {new Date(lastScannedAt).toLocaleString('ro-RO')}
      {run?.findings_count != null && ` · ${run.findings_count} noutăți`}
    </span>
  )
}

function CompetitorForm({ competitor, onDone }: { competitor?: Competitor; onDone: () => void }) {
  const save = useSaveCompetitor()
  const [form, setForm] = useState({
    name: competitor?.name ?? '',
    city: competitor?.city ?? '',
    website_url: competitor?.website_url ?? '',
    google_maps_url: competitor?.google_maps_url ?? '',
    delivery_urls: competitor?.delivery_urls.join('\n') ?? '',
    facebook_url: competitor?.facebook_url ?? '',
    instagram_url: competitor?.instagram_url ?? '',
    notes: competitor?.notes ?? '',
  })
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const input: CompetitorInput = {
      name: form.name.trim(),
      city: emptyToNull(form.city),
      website_url: emptyToNull(form.website_url),
      google_maps_url: emptyToNull(form.google_maps_url),
      delivery_urls: form.delivery_urls.split('\n').map((u) => u.trim()).filter(Boolean),
      facebook_url: emptyToNull(form.facebook_url),
      instagram_url: emptyToNull(form.instagram_url),
      notes: emptyToNull(form.notes),
      active: competitor?.active ?? true,
    }
    await save.mutateAsync({ id: competitor?.id, input })
    onDone()
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
      <input required placeholder="Nume *" value={form.name} onChange={set('name')} className={inputClass} />
      <input placeholder="Oraș" value={form.city} onChange={set('city')} className={inputClass} />
      <input placeholder="Site" value={form.website_url} onChange={set('website_url')} className={inputClass} />
      <input placeholder="Link Google Maps" value={form.google_maps_url} onChange={set('google_maps_url')} className={inputClass} />
      <textarea
        placeholder="Linkuri Glovo / Wolt / Tazz / Bolt Food (unul pe linie)"
        value={form.delivery_urls}
        onChange={set('delivery_urls')}
        rows={2}
        className={inputClass}
      />
      <input placeholder="Facebook" value={form.facebook_url} onChange={set('facebook_url')} className={inputClass} />
      <input placeholder="Instagram" value={form.instagram_url} onChange={set('instagram_url')} className={inputClass} />
      <textarea
        placeholder="Note pentru Iscoada (ex. ce produse să compare cu ale noastre)"
        value={form.notes}
        onChange={set('notes')}
        rows={2}
        className={inputClass}
      />
      {save.error && <p className="text-sm text-red-700">{(save.error as Error).message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
          Salvează
        </button>
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-gray-600">
          Renunță
        </button>
      </div>
    </form>
  )
}

function WatchAreaForm({ area, onDone }: { area?: WatchArea; onDone: () => void }) {
  const save = useSaveWatchArea()
  const [name, setName] = useState(area?.name ?? '')
  const [searchQuery, setSearchQuery] = useState(area?.search_query ?? '')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const input: WatchAreaInput = { name: name.trim(), search_query: searchQuery.trim(), active: area?.active ?? true }
    await save.mutateAsync({ id: area?.id, input })
    onDone()
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
      <input required placeholder="Nume zonă * (ex. Cluj — Mărăști)" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <textarea
        required
        placeholder="Ce să caute Iscoada * (ex. restaurante, fast-food și dark kitchen-uri noi în Cluj-Napoca, zona Mărăști)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        rows={2}
        className={inputClass}
      />
      {save.error && <p className="text-sm text-red-700">{(save.error as Error).message}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
          Salvează
        </button>
        <button type="button" onClick={onDone} className="px-3 py-1.5 text-sm text-gray-600">
          Renunță
        </button>
      </div>
    </form>
  )
}

export function CompetitorSettingsPage() {
  const { data: competitors } = useCompetitors()
  const { data: areas } = useWatchAreas()
  const { data: runs } = useLatestScanRuns()
  const saveCompetitor = useSaveCompetitor()
  const saveArea = useSaveWatchArea()
  const scanNow = useScanNow()
  // 'new' = formular de adăugare, id = editare, null = închis
  const [editingCompetitor, setEditingCompetitor] = useState<string | null>(null)
  const [editingArea, setEditingArea] = useState<string | null>(null)

  const lastRun = (key: 'competitor_id' | 'watch_area_id', id: string) => runs?.find((r) => r[key] === id)

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <Link to="/concurenta" className="text-sm text-gray-500 hover:text-gray-900">← Iscoada</Link>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">Concurenți și zone urmărite</h1>
      <p className="mt-1 text-sm text-gray-500">
        Iscoada verifică automat fiecare țintă activă o dată la 2 zile. „Scanează acum” pornește o scanare imediată
        (durează câteva minute).
      </p>
      {scanNow.error && <p className="mt-2 text-sm text-red-700">{(scanNow.error as Error).message}</p>}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Concurenți</h2>
          {editingCompetitor === null && (
            <button type="button" onClick={() => setEditingCompetitor('new')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
              + Adaugă
            </button>
          )}
        </div>
        <div className="mt-3 space-y-3">
          {editingCompetitor === 'new' && <CompetitorForm onDone={() => setEditingCompetitor(null)} />}
          {competitors?.map((c) =>
            editingCompetitor === c.id ? (
              <CompetitorForm key={c.id} competitor={c} onDone={() => setEditingCompetitor(null)} />
            ) : (
              <div key={c.id} className={`rounded-lg border border-gray-200 bg-white p-4 ${c.active ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{c.name}{c.city && <span className="font-normal text-gray-500"> · {c.city}</span>}</p>
                    <p className="mt-0.5 text-xs"><RunStatus run={lastRun('competitor_id', c.id)} lastScannedAt={c.last_scanned_at} /></p>
                  </div>
                  <label className="flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={c.active}
                      onChange={(e) => {
                        const { id, last_scanned_at: _, ...input } = c
                        saveCompetitor.mutate({ id, input: { ...input, active: e.target.checked } })
                      }}
                    />
                    Activ
                  </label>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <button type="button" onClick={() => setEditingCompetitor(c.id)} className="font-medium text-gray-600 hover:text-gray-900">
                    Editează
                  </button>
                  <button
                    type="button"
                    onClick={() => scanNow.mutate({ competitor_id: c.id })}
                    disabled={scanNow.isPending || lastRun('competitor_id', c.id)?.status === 'running'}
                    className="font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    Scanează acum
                  </button>
                </div>
              </div>
            ),
          )}
          {competitors?.length === 0 && editingCompetitor !== 'new' && (
            <p className="text-sm text-gray-500">Niciun concurent adăugat încă.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Zone urmărite (deschideri noi)</h2>
          {editingArea === null && (
            <button type="button" onClick={() => setEditingArea('new')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
              + Adaugă
            </button>
          )}
        </div>
        <div className="mt-3 space-y-3">
          {editingArea === 'new' && <WatchAreaForm onDone={() => setEditingArea(null)} />}
          {areas?.map((a) =>
            editingArea === a.id ? (
              <WatchAreaForm key={a.id} area={a} onDone={() => setEditingArea(null)} />
            ) : (
              <div key={a.id} className={`rounded-lg border border-gray-200 bg-white p-4 ${a.active ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="mt-0.5 text-sm text-gray-600">{a.search_query}</p>
                    <p className="mt-0.5 text-xs"><RunStatus run={lastRun('watch_area_id', a.id)} lastScannedAt={a.last_scanned_at} /></p>
                  </div>
                  <label className="flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={a.active}
                      onChange={(e) =>
                        saveArea.mutate({ id: a.id, input: { name: a.name, search_query: a.search_query, active: e.target.checked } })
                      }
                    />
                    Activ
                  </label>
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <button type="button" onClick={() => setEditingArea(a.id)} className="font-medium text-gray-600 hover:text-gray-900">
                    Editează
                  </button>
                  <button
                    type="button"
                    onClick={() => scanNow.mutate({ watch_area_id: a.id })}
                    disabled={scanNow.isPending || lastRun('watch_area_id', a.id)?.status === 'running'}
                    className="font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    Scanează acum
                  </button>
                </div>
              </div>
            ),
          )}
          {areas?.length === 0 && editingArea !== 'new' && (
            <p className="text-sm text-gray-500">Nicio zonă urmărită încă.</p>
          )}
        </div>
      </section>
    </div>
  )
}
