import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGenerateReport, useItems, useLatestRun, useLeads, type Brand, type MarketingItem } from './api'
import { ItemCard, primaryButton } from './ItemCard'

const hasResults = (i: MarketingItem) =>
  i.result_reach != null || i.result_engagement != null || i.result_orders != null || !!i.result_note

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 text-center">
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

export function ResultsTab({ brand }: { brand: Brand }) {
  const { data: items } = useItems(brand.id, ['post', 'promo'])
  const { data: reports } = useItems(brand.id, ['report'])
  const { data: leads } = useLeads(brand.id)
  const { data: run } = useLatestRun(brand.id, 'monthly_report')
  const generate = useGenerateReport()
  const queryClient = useQueryClient()
  const running = run?.status === 'running' || generate.isPending

  // când raportul e gata, îl afișăm
  const prevStatus = useRef(run?.status)
  useEffect(() => {
    if (prevStatus.current === 'running' && run?.status !== 'running') {
      queryClient.invalidateQueries({ queryKey: ['marketing_items', brand.id] })
    }
    prevStatus.current = run?.status
  }, [run?.status, brand.id, queryClient])

  const since = Date.now() - 30 * 24 * 3600_000
  const published = (items ?? []).filter((i) => i.status === 'published' && new Date(i.published_at ?? i.created_at).getTime() >= since)
  const withResults = published.filter(hasResults)
  const missing = (items ?? []).filter((i) => i.status === 'published' && !hasResults(i))
  const engagement = withResults.filter((i) => i.result_engagement != null)
  const avgEngagement = engagement.length
    ? Math.round(engagement.reduce((s, i) => s + (i.result_engagement ?? 0), 0) / engagement.length)
    : null
  const orders = withResults.reduce((s, i) => s + (i.result_orders ?? 0), 0)
  const confirmedEvents = (leads ?? []).filter((l) => l.status === 'confirmed' && new Date(l.created_at).getTime() >= since).length

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-medium text-gray-900">Ultimele 30 de zile</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat value={published.length} label="publicate" />
          <Stat value={avgEngagement ?? '—'} label="interacțiuni / postare" />
          <Stat value={orders} label="comenzi / rezervări aduse" />
          <Stat value={confirmedEvents} label="evenimente confirmate" />
        </div>
        {published.length > 0 && withResults.length < published.length && (
          <p className="text-xs text-gray-500">Rezultate trecute la {withResults.length} din {published.length} publicate — cifrele sunt doar pentru acestea.</p>
        )}
      </section>

      {missing.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-medium text-gray-900">Lipsesc rezultatele ({missing.length})</h2>
          <p className="text-sm text-gray-500">
            Din Facebook/Instagram (Insights) sau din ce ați observat în local. Chiar și estimativ — fără ele, agentul nu știe ce aduce clienți.
          </p>
          {missing.slice(0, 5).map((i) => <ItemCard key={i.id} item={i} />)}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium text-gray-900">Rapoarte lunare</h2>
          <button type="button" className={primaryButton} disabled={running} onClick={() => generate.mutate(brand.id)}>
            {running ? 'Se scrie raportul... (1-2 min)' : 'Raport pentru luna asta'}
          </button>
        </div>
        <p className="text-sm text-gray-500">Raportul lunii trecute vine automat pe 1 ale lunii.</p>
        {run?.status === 'error' && <p className="text-sm text-red-700">Ultimul raport a eșuat: {run.error}</p>}
        {generate.error && <p className="text-sm text-red-700">{(generate.error as Error).message}</p>}
        {reports?.length === 0 && !running && <p className="text-sm text-gray-500">Încă niciun raport.</p>}
        {reports?.map((r) => (
          <article key={r.id} className="rounded-lg border border-gray-300 bg-white p-4">
            <p className="font-medium text-gray-900">{r.title}</p>
            <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('ro-RO')}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{r.body}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
