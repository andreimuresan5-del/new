// Desenează story-ul cu meniul zilei (1080×1920) pe un <canvas>.
// Textul stă în zona sigură: sus (~260px) și jos (~340px) sunt acoperite de
// interfața Instagram (avatar, bară de răspuns).

export type StoryStyle = 'warm' | 'light' | 'photo'

interface Tones {
  bg: string
  text: string
  muted: string
  accent: string
  onAccent: string
}

// Scheme de culori pentru brand: fiecare are o variantă deschisă și una închisă
// (stilul „închis” și cel „cu poză” folosesc varianta închisă).
export const COLOR_SCHEMES = {
  clasic: {
    label: 'Clasic (negru, alb, roșu)',
    light: { bg: '#ffffff', text: '#141414', muted: '#5c5c5c', accent: '#dc2000', onAccent: '#ffffff' },
    dark: { bg: '#121212', text: '#ffffff', muted: '#bdbdbd', accent: '#dc2000', onAccent: '#ffffff' },
  },
  teracota: {
    label: 'Teracotă (cremă, espresso, cărămiziu)',
    light: { bg: '#f4eee4', text: '#2b211c', muted: '#7a6a5e', accent: '#c8553d', onAccent: '#fff8ef' },
    dark: { bg: '#2b211c', text: '#f4eee4', muted: '#bfae9f', accent: '#e07a5f', onAccent: '#2b211c' },
  },
  // contrastul vine din luminozitate, nu din nuanță (lizibil și pentru daltonism roșu-verde):
  // toate textele au contrast ≥ 5,5:1 față de fundal, majoritatea ≥ 9:1
  salvie: {
    label: 'Salvie (verde, salvie, cărămiziu)',
    light: { bg: '#e6eadc', text: '#14291f', muted: '#3e5146', accent: '#a8321a', onAccent: '#ffffff' },
    dark: { bg: '#173226', text: '#f6f3e8', muted: '#cfdccf', accent: '#ffc4a8', onAccent: '#173226' },
  },
  unt: {
    label: 'Bleumarin & unt',
    light: { bg: '#fbf3dc', text: '#16213e', muted: '#5a627a', accent: '#e2603a', onAccent: '#ffffff' },
    dark: { bg: '#16213e', text: '#fbf3dc', muted: '#aeb6cc', accent: '#f6c453', onAccent: '#16213e' },
  },
} satisfies Record<string, { label: string; light: Tones; dark: Tones }>

export type ColorScheme = keyof typeof COLOR_SCHEMES

export interface StoryContent {
  style: StoryStyle
  scheme: ColorScheme
  // logo-ul „astur.” desenat direct pe canvas, în culorile schemei (în loc de imagine)
  wordmark: boolean
  brandName: string
  place: string | null
  dateLabel: string // ex. „Luni, 13 octombrie”
  hours: string // ex. „12:00 – 16:00”
  headline: string | null
  // grupuri cu etichetă, ex. { label: 'CIORBĂ', items: [...] }; label null = fără etichetă
  sections: { label: string | null; items: string[] }[]
  price: string | null
  // ex. „Livrare prin Glovo · Wolt” — null dacă nu se afișează
  delivery: string | null
  logo: HTMLImageElement | null
  // varianta pentru fundal închis; fără ea, logo-ul principal stă pe un card alb
  logoDark: HTMLImageElement | null
  photo: HTMLImageElement | null
}

export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920
const SAFE_TOP = 270
const SAFE_BOTTOM = STORY_HEIGHT - 340
const SERIF = 'Fraunces, Georgia, serif'
const SANS = 'Inter, system-ui, sans-serif'

const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

// Logo-ul „astur.” (litere mici, punct colorat) + „GASTRO BAR”, desenat ca text.
// y = linia de bază a cuvântului; size = mărimea literelor „astur”.
export function drawWordmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  align: 'center' | 'left',
  ink: string,
  dot: string,
) {
  ctx.font = `600 ${size}px ${SERIF}`
  const word = ctx.measureText('astur').width
  const dotR = size * 0.116
  const total = word + size * 0.18 + dotR
  const left = align === 'center' ? x - total / 2 : x
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  ctx.fillStyle = ink
  ctx.fillText('astur', left, y)
  ctx.fillStyle = dot
  ctx.beginPath()
  ctx.arc(left + word + size * 0.18, y - size * 0.074, dotR, 0, Math.PI * 2)
  ctx.fill()
  const sub = size * 0.18
  ctx.font = `600 ${sub}px ${SANS}`
  ctx.fillStyle = ink
  spaced(ctx, 'GASTRO BAR', left + size * 0.03, y + size * 0.395, sub * 0.5, 'left')
  ctx.textAlign = prev
}

export async function loadStoryFonts() {
  await Promise.all([
    document.fonts.load(`600 80px ${SERIF}`),
    document.fonts.load(`500 60px ${SERIF}`),
    document.fonts.load(`600 40px ${SANS}`),
    document.fonts.load(`italic 400 60px ${SERIF}`),
    document.fonts.load(`500 40px ${SANS}`),
    document.fonts.load(`700 40px ${SANS}`),
  ])
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: 'center' | 'left') {
  // literă cu literă, pentru etichete cu spațiere largă
  const width = [...text].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, -spacing)
  let cx = align === 'center' ? x - width / 2 : x
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
  ctx.textAlign = prev
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.max(STORY_WIDTH / img.naturalWidth, STORY_HEIGHT / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  ctx.drawImage(img, (STORY_WIDTH - w) / 2, (STORY_HEIGHT - h) / 2, w, h)
}

interface Block {
  height: number
  draw: (y: number) => void
}

export function renderStory(canvas: HTMLCanvasElement, c: StoryContent) {
  canvas.width = STORY_WIDTH
  canvas.height = STORY_HEIGHT
  const ctx = canvas.getContext('2d')!
  const scheme = COLOR_SCHEMES[c.scheme] ?? COLOR_SCHEMES.clasic
  const p = c.style === 'light' ? scheme.light : scheme.dark
  const usePhoto = c.style === 'photo' && c.photo
  const align: 'center' | 'left' = usePhoto ? 'left' : 'center'
  const margin = 110
  const x = align === 'center' ? STORY_WIDTH / 2 : margin
  const maxWidth = STORY_WIDTH - margin * 2
  // cu poză, textul e mai compact și stă jos, ca mâncarea să rămână vedeta
  const baseK = usePhoto ? 0.78 : 1
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'

  // fundal
  ctx.fillStyle = usePhoto ? '#000000' : p.bg
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT)
  if (usePhoto) {
    drawCover(ctx, c.photo!)
    const g = ctx.createLinearGradient(0, STORY_HEIGHT * 0.4, 0, STORY_HEIGHT)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.3, 'rgba(0,0,0,0.68)')
    g.addColorStop(1, 'rgba(0,0,0,0.9)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT)
    const top = ctx.createLinearGradient(0, 0, 0, 420)
    top.addColorStop(0, 'rgba(0,0,0,0.45)')
    top.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = top
    ctx.fillRect(0, 0, STORY_WIDTH, 420)
  } else {
    // pe fundal închis, un halou discret în culoarea de accent
    if (c.style === 'warm') {
      const glow = ctx.createRadialGradient(STORY_WIDTH / 2, STORY_HEIGHT * 0.42, 50, STORY_WIDTH / 2, STORY_HEIGHT * 0.42, 1100)
      // același ton la ambele capete (doar alfa diferit), altfel gradientul trece prin gri
      glow.addColorStop(0, rgba(p.accent, 0.14))
      glow.addColorStop(1, rgba(p.accent, 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT)
    }
    ctx.strokeStyle = p.accent
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 3
    ctx.strokeRect(48, 48, STORY_WIDTH - 96, STORY_HEIGHT - 96)
    ctx.globalAlpha = 1
  }

  // blocurile de conținut, construite la o scară dată (k) ca să le putem micșora dacă nu încap
  const build = (k: number) => {
    const px = (n: number) => Math.round(n * k)
    const blocks: Block[] = []
    const gap = (h: number) => blocks.push({ height: px(h), draw: () => {} })

    ctx.font = `700 34px ${SANS}`
    blocks.push({
      height: 40,
      draw: (y) => {
        ctx.font = `700 34px ${SANS}`
        ctx.fillStyle = p.accent
        spaced(ctx, 'MENIUL ZILEI', x, y + 34, 10, align)
      },
    })
    gap(26)
    ctx.font = `600 ${px(84)}px ${SERIF}`
    const dateLines = wrap(ctx, c.dateLabel, maxWidth)
    blocks.push({
      height: dateLines.length * px(96),
      draw: (y) => {
        ctx.font = `600 ${px(84)}px ${SERIF}`
        ctx.fillStyle = p.text
        dateLines.forEach((l, i) => ctx.fillText(l, x, y + px(80) + i * px(96)))
      },
    })

    if (c.headline?.trim()) {
      gap(34)
      ctx.font = `italic 400 ${px(56)}px ${SERIF}`
      const lines = wrap(ctx, c.headline.trim(), maxWidth)
      blocks.push({
        height: lines.length * px(70),
        draw: (y) => {
          ctx.font = `italic 400 ${px(56)}px ${SERIF}`
          ctx.fillStyle = usePhoto ? p.text : p.muted
          lines.forEach((l, i) => ctx.fillText(l, x, y + px(56) + i * px(70)))
        },
      })
    }

    gap(60)
    blocks.push({
      height: 4,
      draw: (y) => {
        ctx.fillStyle = p.accent
        const w = 120
        ctx.fillRect(align === 'center' ? x - w / 2 : x, y, w, 4)
      },
    })
    gap(56)

    const count = c.sections.reduce((n, s) => n + s.items.length, 0)
    const itemFont = px(count > 4 ? 50 : 58)
    const itemLine = itemFont * 1.22
    const labelFont = px(32)
    c.sections.forEach((section, si) => {
      if (section.label) {
        blocks.push({
          height: labelFont + px(16),
          draw: (y) => {
            ctx.font = `700 ${labelFont}px ${SANS}`
            ctx.fillStyle = p.accent
            spaced(ctx, section.label!, x, y + labelFont, px(6), align)
          },
        })
      }
      section.items.forEach((item, idx) => {
        ctx.font = `500 ${itemFont}px ${SERIF}`
        const lines = wrap(ctx, item, maxWidth)
        blocks.push({
          height: lines.length * itemLine,
          draw: (y) => {
            ctx.font = `500 ${itemFont}px ${SERIF}`
            ctx.fillStyle = p.text
            lines.forEach((l, i) => ctx.fillText(l, x, y + itemFont + i * itemLine))
          },
        })
        if (idx < section.items.length - 1) gap(14)
      })
      if (si < c.sections.length - 1) gap(44)
    })

    if (c.price?.trim()) {
      gap(64)
      const label = c.price.trim()
      ctx.font = `700 ${px(52)}px ${SANS}`
      const w = ctx.measureText(label).width + px(90)
      blocks.push({
        height: px(100),
        draw: (y) => {
          const left = align === 'center' ? x - w / 2 : x
          ctx.fillStyle = p.accent
          ctx.beginPath()
          ctx.roundRect(left, y, w, px(100), px(50))
          ctx.fill()
          ctx.font = `700 ${px(52)}px ${SANS}`
          ctx.fillStyle = p.onAccent
          ctx.textAlign = 'center'
          ctx.fillText(label, left + w / 2, y + px(68))
          ctx.textAlign = align
        },
      })
    }

    gap(54)
    blocks.push({
      height: px(50),
      draw: (y) => {
        ctx.font = `500 ${px(40)}px ${SANS}`
        ctx.fillStyle = p.muted
        ctx.fillText(`${c.hours} · luni–vineri`, x, y + px(40))
      },
    })

    if (c.delivery) {
      gap(30)
      const label = c.delivery
      ctx.font = `700 ${px(38)}px ${SANS}`
      const w = ctx.measureText(label).width + px(70)
      const h = px(78)
      blocks.push({
        height: h,
        draw: (y) => {
          const left = align === 'center' ? x - w / 2 : x
          ctx.strokeStyle = p.accent
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.roundRect(left, y, w, h, h / 2)
          ctx.stroke()
          ctx.font = `700 ${px(38)}px ${SANS}`
          ctx.fillStyle = p.text
          ctx.textAlign = 'center'
          ctx.fillText(label, left + w / 2, y + h / 2 + px(13))
          ctx.textAlign = align
        },
      })
    }

    return blocks
  }

  const footerHeight = c.logo || c.wordmark ? 240 : 190
  const area = SAFE_BOTTOM - footerHeight - SAFE_TOP
  // meniu lung: micșorăm textul până încape deasupra semnăturii
  let blocks = build(baseK)
  let total = blocks.reduce((h, b) => h + b.height, 0)
  for (let k = baseK * 0.94; total > area && k > 0.5; k *= 0.94) {
    blocks = build(k)
    total = blocks.reduce((h, b) => h + b.height, 0)
  }
  // pe poză textul stă jos, peste gradient; altfel centrat
  let y = usePhoto ? Math.max(SAFE_TOP, SAFE_BOTTOM - footerHeight - total - 30) : SAFE_TOP + Math.max(0, (area - total) / 2)
  if (usePhoto) {
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 24
  }
  for (const b of blocks) {
    b.draw(y)
    y += b.height
  }
  ctx.shadowBlur = 0

  // semnătura: logo sau numele brandului
  const footerY = SAFE_BOTTOM - footerHeight + (c.logo || c.wordmark ? 50 : 20)
  const darkBg = c.style !== 'light'
  const logo = darkBg && c.logoDark ? c.logoDark : c.logo
  if (c.wordmark) {
    drawWordmark(ctx, x, footerY + 110, 140, align, p.text, p.accent)
  } else if (logo) {
    const maxW = 400
    const maxH = 160
    const s = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight)
    const w = logo.naturalWidth * s
    const h = logo.naturalHeight * s
    const left = align === 'center' ? x - w / 2 : x
    // fără variantă pentru fundal închis, logo-ul principal stă pe un card alb
    if (darkBg && !c.logoDark) {
      const pad = 26
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(left - pad, footerY - pad, w + pad * 2, h + pad * 2, 28)
      ctx.fill()
    }
    ctx.drawImage(logo, left, footerY, w, h)
  } else {
    ctx.font = `600 54px ${SERIF}`
    ctx.fillStyle = p.text
    spaced(ctx, c.brandName.toUpperCase(), x, footerY + 54, 14, align)
    if (c.place) {
      ctx.font = `500 32px ${SANS}`
      ctx.fillStyle = p.muted
      ctx.fillText(c.place, x, footerY + 104)
    }
  }
}
