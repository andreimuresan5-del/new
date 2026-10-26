import { useCallback, useEffect, useRef, useState } from 'react'

// Ciornele din formulare se păstrează în telefon (localStorage), ca să nu se piardă
// textul la schimbarea tabului sau când telefonul reîncarcă pagina după ce ai ieșit din browser.
// Expiră după câteva zile, ca să nu acopere date mai noi din aplicație.
const PREFIX = 'astur-draft:'
const MAX_AGE_MS = 3 * 24 * 3600_000

export function readDraft<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return undefined
    const { v, t } = JSON.parse(raw) as { v: T; t: number }
    if (Date.now() - t > MAX_AGE_MS) {
      localStorage.removeItem(PREFIX + key)
      return undefined
    }
    return v
  } catch {
    return undefined
  }
}

export function writeDraft(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ v: value, t: Date.now() }))
  } catch {
    // stocare indisponibilă (mod privat) — formularul merge oricum, doar fără ciornă
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignorăm
  }
}

/**
 * Ca useState, dar valoarea se salvează ca ciornă sub `key`.
 * Când valoarea revine la cea inițială (ex. câmpul golit după trimitere), ciorna dispare.
 * `restored` spune dacă valoarea a venit dintr-o ciornă nesalvată.
 */
export function useDraft<T>(key: string, initial: T) {
  const initialJson = useRef(JSON.stringify(initial))
  const [restored] = useState(() => readDraft<T>(key) !== undefined)
  const [value, setValue] = useState<T>(() => readDraft<T>(key) ?? initial)

  useEffect(() => {
    if (JSON.stringify(value) === initialJson.current) clearDraft(key)
    else writeDraft(key, value)
  }, [key, value])

  // după salvare: noua valoare de bază devine cea curentă, fără ciornă
  const commit = useCallback((base?: T) => {
    if (base !== undefined) initialJson.current = JSON.stringify(base)
    clearDraft(key)
  }, [key])

  return [value, setValue, { restored, commit }] as const
}
