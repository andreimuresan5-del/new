import { useEffect, useRef, useState } from 'react'
import { useChatImageUrls, useChatMessages, useClearChat, useSendChat, type Brand } from './api'
import { primaryButton } from './ItemCard'

// Exemple pentru o conversație nouă
const SUGGESTIONS = [
  'Cum fac un reel bun cu terasa sau cu un preparat?',
  'Ce ar trebui să postăm iarna, când terasa e închisă?',
  'Cum calculez prețul unui pachet de eveniment ca să nu pierdem bani?',
  'Cum ne batem pe livrare cu pizzeriile din Dumbrăvița?',
]

// Butoane rapide, mereu deasupra câmpului de scris
const QUICK = [
  { label: '💡 Idee de postare pentru azi', text: 'Dă-mi o idee de postare pentru azi, cu textul gata scris.' },
  { label: '🍲 Meniul de mâine', text: 'Vreau să salvez meniul zilei de mâine. Ți-l scriu: ' },
  { label: '⭐ Răspuns la o recenzie', text: 'Ajută-mă să răspund la recenzia asta: ' },
  { label: '🎉 Cerere de eveniment', text: 'Am primit o cerere de eveniment: ' },
  { label: '🤔 E bună oferta asta?', text: 'E bună oferta asta? ' },
]

export function ChatTab({ brand }: { brand: Brand }) {
  const { data: messages, isLoading } = useChatMessages(brand.id)
  const send = useSendChat()
  const clear = useClearChat()
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pending, setPending] = useState<{ text: string; image: string | null } | null>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const imagePaths = (messages ?? []).map((m) => m.image_path).filter((p): p is string => !!p)
  const { data: imageUrls } = useChatImageUrls(imagePaths)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length, pending])

  function pickImage(file: File | undefined) {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(message: string) {
    const m = message.trim()
    if ((!m && !image) || send.isPending) return
    const img = image
    setPending({ text: m, image: preview })
    setText('')
    setImage(null)
    setPreview(null)
    try {
      await send.mutateAsync({ brandId: brand.id, message: m, image: img })
    } finally {
      setPending(null)
    }
  }

  function quick(q: (typeof QUICK)[number]) {
    // întrebările complete pleacă direct; cele care așteaptă detalii doar se completează în câmp
    if (q.text.endsWith(': ') || q.text.endsWith('? ')) {
      setText(q.text)
      input.current?.focus()
    } else void submit(q.text)
  }

  const empty = !isLoading && (messages?.length ?? 0) === 0 && !pending

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Întreabă orice sau trimite o poză. Poate pune direct în aplicație postări, oferte, cereri și meniul zilei (ca ciorne).
        </p>
        {(messages?.length ?? 0) > 0 && (
          <button
            type="button"
            className="whitespace-nowrap pl-2 text-sm text-gray-500 hover:text-gray-800"
            onClick={() => {
              if (window.confirm('Ștergi conversația și începi una nouă?')) clear.mutate(brand.id)
            }}
          >
            Conversație nouă
          </button>
        )}
      </div>

      {empty && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Exemple:</p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void submit(s)}
              className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {messages?.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className="max-w-[85%] space-y-2">
              {m.image_path && (
                imageUrls?.[m.image_path]
                  ? <img src={imageUrls[m.image_path]} alt="Poză trimisă" className="ml-auto max-h-64 rounded-2xl object-cover" />
                  : <div className="ml-auto h-32 w-32 rounded-2xl bg-gray-200" />
              )}
              {m.content && (
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  {m.content}
                </div>
              )}
              {m.actions?.map((a, i) => (
                <div key={i} className="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-900">
                  ✓ {a.summary}
                </div>
              ))}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-end">
            <div className="max-w-[85%] space-y-2">
              {pending.image && <img src={pending.image} alt="" className="ml-auto max-h-64 rounded-2xl object-cover opacity-70" />}
              {pending.text && <div className="whitespace-pre-wrap rounded-2xl bg-gray-900 px-3 py-2 text-sm text-white">{pending.text}</div>}
            </div>
          </div>
        )}
        {send.isPending && <p className="text-sm text-gray-500">Se gândește...</p>}
        {send.error && <p className="text-sm text-red-700">{(send.error as Error).message}</p>}
        <div ref={bottom} />
      </div>

      <div className="sticky bottom-0 space-y-2 bg-gray-50 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK.map((q) => (
            <button
              key={q.label}
              type="button"
              disabled={send.isPending}
              onClick={() => quick(q)}
              className="whitespace-nowrap rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
        {preview && (
          <div className="flex items-center gap-2">
            <img src={preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <button type="button" className="text-sm text-gray-500" onClick={() => { setImage(null); setPreview(null) }}>
              Scoate poza
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void submit(text)
          }}
          className="flex items-end gap-2"
        >
          <button
            type="button"
            aria-label="Atașează o poză"
            onClick={() => fileInput.current?.click()}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-lg leading-none"
          >
            📷
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = '' }} />
          <textarea
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void submit(text)
              }
            }}
            rows={2}
            placeholder={image ? 'Ce vrei să știi despre poză? (opțional)' : 'Scrie întrebarea...'}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
          <button type="submit" className={primaryButton} disabled={send.isPending || (!text.trim() && !image)}>
            Trimite
          </button>
        </form>
      </div>
    </div>
  )
}
