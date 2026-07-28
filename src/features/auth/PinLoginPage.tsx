import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const PIN_LENGTH = 6

export function PinLoginPage() {
  const { session, signInWithPin } = useAuth()
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function submit(nextPin: string) {
    setSubmitting(true)
    setError(null)
    const { error } = await signInWithPin(nextPin)
    setSubmitting(false)
    if (error) {
      setError(error)
      setPin('')
    }
  }

  function press(digit: string) {
    if (submitting || pin.length >= PIN_LENGTH) return
    const next = pin + digit
    setPin(next)
    setError(null)
    if (next.length === PIN_LENGTH) void submit(next)
  }

  function backspace() {
    setPin((p) => p.slice(0, -1))
    setError(null)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Control Producție</h1>
        <p className="mt-1 text-gray-500">Introdu codul PIN</p>
      </div>

      <div className="flex gap-3" aria-live="polite">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < pin.length ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {submitting && <p className="text-sm text-gray-500">Se verifică...</p>}

      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            disabled={submitting}
            className="h-16 w-16 rounded-full bg-white text-xl font-medium text-gray-900 shadow active:bg-gray-100 disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={backspace}
          disabled={submitting}
          className="h-16 w-16 rounded-full text-sm font-medium text-gray-500 active:bg-gray-100 disabled:opacity-50"
        >
          Șterge
        </button>
        <button
          type="button"
          onClick={() => press('0')}
          disabled={submitting}
          className="h-16 w-16 rounded-full bg-white text-xl font-medium text-gray-900 shadow active:bg-gray-100 disabled:opacity-50"
        >
          0
        </button>
      </div>
    </div>
  )
}
