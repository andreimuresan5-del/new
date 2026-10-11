import { useEffect, useMemo, useRef, useState } from 'react'
import { useDailyMenus, useSaveDailyMenu, useStoryHeadlines, useUploadLogo, type Brand } from './api'
import { inputClass, primaryButton } from './ItemCard'
import { loadStoryFonts, renderStory, type StoryStyle } from './storyRenderer'

const HOURS = '12:00 – 16:00'
const STYLES: { key: StoryStyle; label: string }[] = [
  { key: 'warm', label: 'Cald (închis)' },
  { key: 'light', label: 'Luminos' },
  { key: 'photo', label: 'Cu poză' },
]

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// zilele lucrătoare din săptămâna curentă (sâmbătă/duminică → săptămâna viitoare)
function workweek(): string[] {
  const d = new Date()
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() + (day === 0 ? 1 : day === 6 ? 2 : 1 - day))
  return Array.from({ length: 5 }, (_, i) => {
    const x = new Date(monday)
    x.setDate(monday.getDate() + i)
    return iso(x)
  })
}

function dateLabel(date: string) {
  const s = new Date(`${date}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function loadImage(src: string, crossOrigin: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = 'anonymous' // logo-ul vine din Storage; fără asta canvas-ul nu se mai poate exporta
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function StoryTab({ brand }: { brand: Brand }) {
  const days = useMemo(workweek, [])
  const todayIso = iso(new Date())
  const { data: menus } = useDailyMenus(brand.id, days[0], days[4])
  const saveMenu = useSaveDailyMenu()
  const headlines = useStoryHeadlines()
  const uploadLogo = useUploadLogo()

  const [date, setDate] = useState(days.includes(todayIso) ? todayIso : days[0])
  const [items, setItems] = useState('')
  const [price, setPrice] = useState('')
  const [headline, setHeadline] = useState('')
  const [style, setStyle] = useState<StoryStyle>('warm')
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  // la schimbarea zilei, încarcă meniul salvat (dacă există)
  const saved = menus?.find((m) => m.menu_date === date)
  useEffect(() => {
    setItems(saved?.items ?? '')
    setPrice(saved?.price ?? '')
    setHeadline(saved?.headline ?? '')
    headlines.reset()
    setCaption(null)
  }, [date, saved?.id])

  useEffect(() => {
    void loadStoryFonts().finally(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    if (!brand.logo_url) return setLogo(null)
    loadImage(brand.logo_url, true).then(setLogo, () => setLogo(null))
  }, [brand.logo_url])

  const itemList = items.split('\n').map((l) => l.trim()).filter(Boolean)
  const place = brand.address?.split(/[(,]/)[0].trim() || null

  useEffect(() => {
    if (!canvas.current || !fontsReady) return
    renderStory(canvas.current, {
      style,
      brandName: brand.name,
      place,
      dateLabel: dateLabel(date),
      hours: HOURS,
      headline: headline || null,
      items: itemList.length ? itemList : ['Supa zilei', 'Felul principal', 'Desert'],
      price: price || null,
      logo,
      photo,
    })
  })

  async function pickPhoto(file: File | undefined) {
    if (!file) return
    setPhoto(await loadImage(URL.createObjectURL(file), false))
    setStyle('photo')
  }

  const persist = () =>
    saveMenu.mutateAsync({ brandId: brand.id, menu_date: date, items: itemList.join('\n'), price: price.trim() || null, headline: headline.trim() || null })

  async function share() {
    setShareError(null)
    if (!itemList.length) return setShareError('Scrie întâi felurile din meniu.')
    await persist()
    const blob = await new Promise<Blob | null>((r) => canvas.current!.toBlob(r, 'image/png'))
    if (!blob) return setShareError('Nu am putut genera imaginea.')
    const file = new File([blob], `meniul-zilei-${date}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
      } catch {
        // anulat de utilizator
      }
      return
    }
    // pe calculator: descarcă imaginea
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = file.name
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto">
        {days.map((d) => {
          const has = menus?.some((m) => m.menu_date === d)
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDate(d)}
              className={`flex-1 whitespace-nowrap rounded-md border px-2 py-1.5 text-xs font-medium ${
                d === date ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              {new Date(`${d}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric' })}
              {has && ' ✓'}
            </button>
          )
        })}
      </div>

      <div className="space-y-2 rounded-lg border border-gray-300 bg-white p-4">
        <textarea
          value={items}
          onChange={(e) => setItems(e.target.value)}
          rows={4}
          placeholder={'Un fel pe linie, ex.:\nCiorbă de perișoare\nPulpe de pui sous vide cu piure\nPapanași'}
          className={inputClass}
        />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preț (ex. 39 lei) — opțional" className={inputClass} />
        <div className="flex gap-2">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Titlu (opțional)" className={inputClass} />
          <button
            type="button"
            className="whitespace-nowrap rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 disabled:opacity-50"
            disabled={headlines.isPending || !itemList.length}
            onClick={() =>
              void headlines
                .mutateAsync({ brandId: brand.id, menu_date: date, items: itemList.join('\n'), price: price.trim() || null })
                .then((r) => setCaption(r.caption))
            }
          >
            {headlines.isPending ? '...' : '✨ Propune'}
          </button>
        </div>
        {headlines.data && (
          <div className="flex flex-wrap gap-2">
            {headlines.data.headlines.map((h) => (
              <button key={h} type="button" onClick={() => setHeadline(h)} className="rounded-full border border-gray-300 px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-50">
                {h}
              </button>
            ))}
          </div>
        )}
        {headlines.error && <p className="text-sm text-red-700">{(headlines.error as Error).message}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStyle(s.key)}
            className={`rounded-md border px-3 py-1.5 text-sm ${style === s.key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
          >
            {s.label}
          </button>
        ))}
        <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700">
          📷 {photo ? 'Altă poză' : 'Adaugă poză'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => void pickPhoto(e.target.files?.[0])} />
        </label>
      </div>
      {style === 'photo' && !photo && <p className="text-sm text-gray-500">Adaugă o poză cu felul zilei — apare pe fundal.</p>}

      <canvas ref={canvas} className="mx-auto block w-full max-w-xs rounded-xl border border-gray-200 shadow-sm" />

      <div className="space-y-2">
        <button type="button" className={`${primaryButton} w-full py-2.5`} disabled={saveMenu.isPending} onClick={() => void share()}>
          Distribuie story-ul
        </button>
        <p className="text-center text-xs text-gray-500">Pe telefon se deschide meniul de distribuire → Instagram → Story. Meniul zilei se salvează automat.</p>
        {shareError && <p className="text-sm text-red-700">{shareError}</p>}
        {caption && (
          <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
            <span className="font-medium">Text pentru postare (opțional): </span>
            {caption}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
        {brand.logo_url ? (
          <span className="text-gray-600">Logo-ul apare jos pe story. </span>
        ) : (
          <span className="text-gray-600">Fără logo, jos apare numele „{brand.name}”. </span>
        )}
        <label className="cursor-pointer font-medium text-gray-900 underline">
          {uploadLogo.isPending ? 'Se încarcă...' : brand.logo_url ? 'Schimbă logo-ul' : 'Încarcă logo (PNG transparent)'}
          <input
            type="file"
            accept="image/png,image/svg+xml,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) uploadLogo.mutate({ brandId: brand.id, file: f })
            }}
          />
        </label>
        {uploadLogo.error && <p className="text-red-700">{(uploadLogo.error as Error).message}</p>}
      </div>
    </div>
  )
}
