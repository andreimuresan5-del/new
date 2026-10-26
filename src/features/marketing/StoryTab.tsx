import { useEffect, useMemo, useRef, useState } from 'react'
import { useDailyMenus, useSaveDailyMenu, useStoryHeadlines, useUploadLogo, type Brand } from './api'
import { inputClass, primaryButton } from './ItemCard'
import { COLOR_SCHEMES, loadStoryFonts, renderStory, type ColorScheme, type StoryStyle } from './storyRenderer'
import { clearDraft, readDraft, writeDraft } from './useDraft'

const HOURS = '12:00 – 16:00'
const STYLES: { key: StoryStyle; label: string }[] = [
  { key: 'warm', label: 'Negru' },
  { key: 'light', label: 'Alb' },
  { key: 'photo', label: 'Cu poză' },
]

// Meniul zilei Astur: o ciorbă, o supă cremă și 3 feluri principale la alegere.
// În DB se salvează ca text pe linii „Ciorbă: …”, ușor de citit și pentru agent.
interface MenuFields {
  ciorba: string
  supa: string
  mains: [string, string, string]
}
const EMPTY: MenuFields = { ciorba: '', supa: '', mains: ['', '', ''] }
const PREFIX = { ciorba: 'Ciorbă: ', supa: 'Supă cremă: ', main: 'Fel principal: ' }

function serialize(m: MenuFields): string {
  return [
    m.ciorba.trim() && PREFIX.ciorba + m.ciorba.trim(),
    m.supa.trim() && PREFIX.supa + m.supa.trim(),
    ...m.mains.map((x) => x.trim() && PREFIX.main + x.trim()),
  ].filter(Boolean).join('\n')
}

function parse(text: string | undefined): MenuFields {
  const m: MenuFields = { ciorba: '', supa: '', mains: ['', '', ''] }
  const mains: string[] = []
  for (const line of (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith(PREFIX.ciorba)) m.ciorba = line.slice(PREFIX.ciorba.length)
    else if (line.startsWith(PREFIX.supa)) m.supa = line.slice(PREFIX.supa.length)
    else mains.push(line.startsWith(PREFIX.main) ? line.slice(PREFIX.main.length) : line)
  }
  mains.slice(0, 3).forEach((x, i) => (m.mains[i] = x))
  return m
}

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
  const [menu, setMenu] = useState<MenuFields>(EMPTY)
  const [price, setPrice] = useState('')
  const [headline, setHeadline] = useState('')
  const [style, setStyle] = useState<StoryStyle>('warm')
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [delivery, setDelivery] = useState(true)
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [logoDark, setLogoDark] = useState<HTMLImageElement | null>(null)
  const [fontsReady, setFontsReady] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  // la schimbarea zilei, încarcă ciorna nesalvată pentru ziua aceea sau, dacă nu e, meniul salvat
  const saved = menus?.find((m) => m.menu_date === date)
  const draftKey = `story:${brand.id}:${date}`
  const loadedKey = `${draftKey}:${saved?.id ?? ''}`
  const [loaded, setLoaded] = useState<string | null>(null)
  useEffect(() => {
    const draft = readDraft<{ menu: MenuFields; price: string; headline: string }>(draftKey)
    setMenu(draft?.menu ?? parse(saved?.items))
    setPrice(draft?.price ?? saved?.price ?? '')
    setHeadline(draft?.headline ?? saved?.headline ?? '')
    setLoaded(loadedKey)
    headlines.reset()
    setCaption(null)
  }, [date, saved?.id])

  // ce scrie Bianca rămâne în telefon până se salvează, chiar dacă schimbă tabul sau aplicația
  useEffect(() => {
    if (loaded !== loadedKey) return
    const same = serialize(menu) === serialize(parse(saved?.items)) &&
      price === (saved?.price ?? '') && headline === (saved?.headline ?? '')
    if (same) clearDraft(draftKey)
    else writeDraft(draftKey, { menu, price, headline })
  }, [menu, price, headline, loaded])

  useEffect(() => {
    void loadStoryFonts().finally(() => setFontsReady(true))
  }, [])

  useEffect(() => {
    if (!brand.logo_url) return setLogo(null)
    loadImage(brand.logo_url, true).then(setLogo, () => setLogo(null))
  }, [brand.logo_url])

  useEffect(() => {
    if (!brand.logo_dark_url) return setLogoDark(null)
    loadImage(brand.logo_dark_url, true).then(setLogoDark, () => setLogoDark(null))
  }, [brand.logo_dark_url])

  const itemsText = serialize(menu)
  const mains = menu.mains.map((x) => x.trim()).filter(Boolean)
  const hasMenu = !!(menu.ciorba.trim() || menu.supa.trim() || mains.length)
  const sections = hasMenu
    ? [
        menu.ciorba.trim() && { label: 'CIORBĂ', items: [menu.ciorba.trim()] },
        menu.supa.trim() && { label: 'SUPĂ CREMĂ', items: [menu.supa.trim()] },
        mains.length > 0 && { label: mains.length > 1 ? 'FEL PRINCIPAL · LA ALEGERE' : 'FEL PRINCIPAL', items: mains },
      ].filter((x): x is { label: string; items: string[] } => !!x)
    : [
        { label: 'CIORBĂ', items: ['Ciorba zilei'] },
        { label: 'SUPĂ CREMĂ', items: ['Supa cremă a zilei'] },
        { label: 'FEL PRINCIPAL · LA ALEGERE', items: ['Primul fel', 'Al doilea fel', 'Al treilea fel'] },
      ]
  const place = brand.address?.split(/[(,]/)[0].trim() || null

  useEffect(() => {
    if (!canvas.current || !fontsReady) return
    renderStory(canvas.current, {
      style,
      scheme: (brand.color_scheme in COLOR_SCHEMES ? brand.color_scheme : 'clasic') as ColorScheme,
      // logo-ul Astur inclus în aplicație se desenează ca text, în culorile schemei
      wordmark: !!brand.logo_url?.startsWith('/brand/astur-logo'),
      brandName: brand.name,
      place,
      dateLabel: dateLabel(date),
      hours: HOURS,
      headline: headline || null,
      sections,
      price: price || null,
      delivery: delivery ? 'Livrare prin Glovo · Wolt' : null,
      logo,
      logoDark,
      photo,
    })
  })

  async function pickPhoto(file: File | undefined) {
    if (!file) return
    setPhoto(await loadImage(URL.createObjectURL(file), false))
    setStyle('photo')
  }

  const persist = () =>
    saveMenu.mutateAsync({ brandId: brand.id, menu_date: date, items: itemsText, price: price.trim() || null, headline: headline.trim() || null })
      .then((r) => { clearDraft(draftKey); return r })

  async function share() {
    setShareError(null)
    if (!hasMenu) return setShareError('Scrie întâi felurile din meniu.')
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
        <input value={menu.ciorba} onChange={(e) => setMenu({ ...menu, ciorba: e.target.value })} placeholder="Ciorba (ex. Ciorbă de perișoare)" className={inputClass} />
        <input value={menu.supa} onChange={(e) => setMenu({ ...menu, supa: e.target.value })} placeholder="Supa cremă (ex. Supă cremă de dovleac)" className={inputClass} />
        {menu.mains.map((m, i) => (
          <input
            key={i}
            value={m}
            onChange={(e) => {
              const next = [...menu.mains] as MenuFields['mains']
              next[i] = e.target.value
              setMenu({ ...menu, mains: next })
            }}
            placeholder={`Fel principal ${i + 1}`}
            className={inputClass}
          />
        ))}
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preț meniu (ex. 39 lei) — opțional" className={inputClass} />
        <div className="flex gap-2">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Titlu (opțional)" className={inputClass} />
          <button
            type="button"
            className="whitespace-nowrap rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 disabled:opacity-50"
            disabled={headlines.isPending || !hasMenu}
            onClick={() =>
              void headlines
                .mutateAsync({ brandId: brand.id, menu_date: date, items: itemsText, price: price.trim() || null })
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
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
        Arată „Livrare prin Glovo · Wolt”
      </label>
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
