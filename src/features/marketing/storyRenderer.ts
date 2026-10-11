// Desenează story-ul cu meniul zilei (1080×1920) pe un <canvas>.
// Textul stă în zona sigură: sus (~260px) și jos (~340px) sunt acoperite de
// interfața Instagram (avatar, bară de răspuns).

export type StoryStyle = 'warm' | 'light' | 'photo'

export interface StoryContent {
  style: StoryStyle
  brandName: string
  place: string | null
  dateLabel: string // ex. „Luni, 13 octombrie”
  hours: string // ex. „12:00 – 16:00”
  headline: string | null
  items: string[]
  price: string | null
  logo: HTMLImageElement | null
  photo: HTMLImageElement | null
}

export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920
const SAFE_TOP = 270
const SAFE_BOTTOM = STORY_HEIGHT - 340
const SERIF = 'Fraunces, Georgia, serif'
const SANS = 'Inter, system-ui, sans-serif'

const PALETTES = {
  warm: { bg: '#1c1714', text: '#f4ead9', muted: '#bfae98', accent: '#d97845', onAccent: '#1c1714' },
  light: { bg: '#f4ead9', text: '#1c1714', muted: '#6b5d50', accent: '#c4612f', onAccent: '#fff8ee' },
  photo: { bg: '#000000', text: '#ffffff', muted: '#e9dfd2', accent: '#e08350', onAccent: '#1c1714' },
}

export async function loadStoryFonts() {
  await Promise.all([
    document.fonts.load(`600 80px ${SERIF}`),
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
  const p = PALETTES[c.style]
  const usePhoto = c.style === 'photo' && c.photo
  const align: 'center' | 'left' = usePhoto ? 'left' : 'center'
  const margin = 110
  const x = align === 'center' ? STORY_WIDTH / 2 : margin
  const maxWidth = STORY_WIDTH - margin * 2
  // cu poză, textul e mai compact și stă jos, ca mâncarea să rămână vedeta
  const k = usePhoto ? 0.78 : 1
  const px = (n: number) => Math.round(n * k)
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'

  // fundal
  ctx.fillStyle = p.bg
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
    // ramă fină + halou cald, ca să nu fie un fundal plat
    const glow = ctx.createRadialGradient(STORY_WIDTH / 2, STORY_HEIGHT * 0.42, 50, STORY_WIDTH / 2, STORY_HEIGHT * 0.42, 1100)
    // același ton la ambele capete (doar alfa diferit), altfel gradientul trece prin gri
    const [r, g2, b] = c.style === 'warm' ? [217, 120, 69] : [255, 255, 255]
    glow.addColorStop(0, `rgba(${r},${g2},${b},${c.style === 'warm' ? 0.16 : 0.55})`)
    glow.addColorStop(1, `rgba(${r},${g2},${b},0)`)
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT)
    ctx.strokeStyle = p.accent
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 3
    ctx.strokeRect(48, 48, STORY_WIDTH - 96, STORY_HEIGHT - 96)
    ctx.globalAlpha = 1
  }

  // blocurile de conținut, măsurate întâi ca să le centrăm vertical
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

  const itemFont = px(c.items.length > 4 ? 50 : 58)
  const itemLine = itemFont * 1.22
  c.items.forEach((item, idx) => {
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
    if (idx < c.items.length - 1) gap(30)
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
    height: 50,
    draw: (y) => {
      ctx.font = `500 ${px(40)}px ${SANS}`
      ctx.fillStyle = p.muted
      ctx.fillText(`${c.hours} · luni–vineri`, x, y + px(40))
    },
  })

  const total = blocks.reduce((h, b) => h + b.height, 0)
  const footerHeight = 150
  const area = SAFE_BOTTOM - footerHeight - SAFE_TOP
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
  const footerY = SAFE_BOTTOM - footerHeight + 20
  if (c.logo) {
    const maxW = 260
    const maxH = 120
    const s = Math.min(maxW / c.logo.naturalWidth, maxH / c.logo.naturalHeight)
    const w = c.logo.naturalWidth * s
    const h = c.logo.naturalHeight * s
    ctx.drawImage(c.logo, align === 'center' ? x - w / 2 : x, footerY, w, h)
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
