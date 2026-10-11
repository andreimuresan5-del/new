import { useEffect, useRef, useState } from 'react'
import { useChatMessages, useClearChat, useSendChat, type Brand } from './api'
import { primaryButton } from './ItemCard'

const SUGGESTIONS = [
  'Cum fac un reel bun cu terasa sau cu un preparat?',
  'Ce ar trebui să postăm iarna, când terasa e închisă?',
  'Cum calculez prețul unui pachet de eveniment ca să nu pierdem bani?',
  'Cum răspund unui client nervos pe Facebook?',
  'Cum ne batem pe livrare cu pizzeriile din Dumbrăvița?',
]

export function ChatTab({ brand }: { brand: Brand }) {
  const { data: messages, isLoading } = useChatMessages(brand.id)
  const send = useSendChat()
  const clear = useClearChat()
  const [text, setText] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length, pending])

  async function submit(message: string) {
    const m = message.trim()
    if (!m || send.isPending) return
    setText('')
    setPending(m)
    try {
      await send.mutateAsync({ brandId: brand.id, message: m })
    } finally {
      setPending(null)
    }
  }

  const empty = !isLoading && (messages?.length ?? 0) === 0 && !pending

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Întreabă orice despre marketing. Știe tot ce e în profilul {brand.name}.</p>
        {(messages?.length ?? 0) > 0 && (
          <button
            type="button"
            className="whitespace-nowrap text-sm text-gray-500 hover:text-gray-800"
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
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {pending && !messages?.some((m) => m.role === 'user' && m.content === pending) && (
          <div className="flex justify-end">
            <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-gray-900 px-3 py-2 text-sm text-white">{pending}</div>
          </div>
        )}
        {send.isPending && <p className="text-sm text-gray-500">Se gândește...</p>}
        {send.error && <p className="text-sm text-red-700">{(send.error as Error).message}</p>}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit(text)
        }}
        className="sticky bottom-0 flex gap-2 bg-gray-50 py-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void submit(text)
            }
          }}
          rows={2}
          placeholder="Scrie întrebarea..."
          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <button type="submit" className={primaryButton} disabled={send.isPending || !text.trim()}>
          Trimite
        </button>
      </form>
    </div>
  )
}
