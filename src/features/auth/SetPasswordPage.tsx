import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from './AuthContext'

// Pagina la care duce linkul din emailul de invitație / resetare parolă.
// supabase-js preia sesiunea din URL automat; aici doar setăm parola.
export function SetPasswordPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 10) return setError('Parola trebuie să aibă cel puțin 10 caractere.')
    if (password !== confirm) return setError('Parolele nu coincid.')
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (error) return setError(error.message)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <h1 className="text-2xl font-semibold text-gray-900">Setează parola</h1>
      {loading && <p className="text-gray-500">Se încarcă...</p>}
      {!loading && !session && (
        <p className="max-w-xs text-center text-gray-600">Linkul a expirat sau a fost deja folosit. Cere unul nou.</p>
      )}
      {session && (
        <form onSubmit={(e) => void submit(e)} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Parolă nouă (min. 10 caractere)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repetă parola"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded-md bg-gray-900 py-2 font-medium text-white disabled:opacity-50">
            {submitting ? 'Se salvează...' : 'Salvează parola'}
          </button>
        </form>
      )}
    </div>
  )
}
