// Shapes mirror the server: each list item is `FVGSignal & Ticker`
// (see server/src/features/fvg/fvg.interfaces.ts and symbols.interfaces.ts).

export type SignalType = "bull" | "bear"
export type IndexName = "nasdaq" | "sp500"

export interface Signal {
  // Ticker
  symbol: string
  index: IndexName[]
  // FVGSignal
  type: SignalType
  date: string // serialized Date (ISO string over the wire)
  barIndex: number
  top: number
  bottom: number
  avg: number
  atr: number
  trailingStop: number
  tsReached: boolean
  takeProfit: number
  stopLoss: number
}

export interface ScanResponse {
  success: boolean
  message?: string
}

// Behind nginx the API is mounted at /api; in dev, vite proxies /api -> :3001.
// Override with VITE_API_URL if the server lives elsewhere.
const API_BASE = import.meta.env.VITE_API_URL ?? "/api"

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function getSignals(): Promise<Signal[]> {
  return request<Signal[]>("/list")
}

export function startScan(): Promise<ScanResponse> {
  return request<ScanResponse>("/scan")
}
