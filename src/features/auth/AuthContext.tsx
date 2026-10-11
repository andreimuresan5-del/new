import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import type { StaffRole } from '../../lib/database.types'

interface StaffProfile {
  id: string
  name: string
  role: StaffRole
  location_id: string | null
}

interface AuthContextValue {
  session: Session | null
  profile: StaffProfile | null
  loading: boolean
  signInWithPin: (pin: string) => Promise<{ error: string | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    supabase
      .from('staff_profiles')
      .select('id, name, role, location_id')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [session])

  async function signInWithPin(pin: string): Promise<{ error: string | null }> {
    const { data: email, error: lookupError } = await supabase.rpc(
      'get_login_email_by_pin',
      { pin },
    )
    if (lookupError || !email) {
      return { error: 'PIN necunoscut.' }
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    })
    if (signInError) {
      return { error: 'PIN necunoscut.' }
    }
    return { error: null }
  }

  // Pentru varianta online (owner): PIN-ul de 6 cifre e prea ușor de ghicit pe internet.
  async function signInWithEmail(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return { error: error ? 'Email sau parolă greșite.' : null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signInWithPin, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
