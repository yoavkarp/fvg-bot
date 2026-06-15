import { useEffect, useState } from "react"

/**
 * useState backed by localStorage. Reads the stored value on first render and
 * writes back whenever it changes, so the choice survives reloads.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored != null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (private mode / quota) — ignore
    }
  }, [key, value])

  return [value, setValue] as const
}
