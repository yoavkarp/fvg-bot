export function formatPercent(fraction: number, digits = 1): string {
  if (fraction == null || Number.isNaN(fraction)) return "—"
  return `${(fraction * 100).toFixed(digits)}%`
}

/**
 * Percentage the trade gains if it reaches take-profit, measured against the
 * take-profit price (per spec: tp=1, entry=0.5 → 50%). `entry` is the live
 * price you'd enter at now. Returns a fraction (0.5 = 50%) or null.
 */
export function winPercent(
  entry: number | null | undefined,
  takeProfit: number
): number | null {
  if (entry == null || !Number.isFinite(entry) || !takeProfit) return null
  return Math.abs(takeProfit - entry) / takeProfit
}

/** TradingView chart for a symbol on the 4-hour (240m) interval. */
export function tradingViewUrl(symbol: string): string {
  return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(
    symbol
  )}&interval=240`
}

export function formatPrice(value: number): string {
  if (value == null || Number.isNaN(value)) return "—"
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatNumber(value: number, digits = 4): string {
  if (value == null || Number.isNaN(value)) return "—"
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })
}

/** en-GB style, 2-digit year, 24h — e.g. "12.06.26 20:30". */
export function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const pad = (n: number) => String(n).padStart(2, "0")
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = pad(d.getFullYear() % 100)
  return `${day}.${month}.${year} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const INDEX_LABELS: Record<string, string> = {
  nasdaq: "NAS",
  sp500: "S&P",
}

export function indexLabel(idx: string): string {
  return INDEX_LABELS[idx] ?? idx.toUpperCase()
}

export function relativeTime(value: string | number | Date): string {
  const d = new Date(value)
  const diffMs = Date.now() - d.getTime()
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return "just now"
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  return `${day}d ago`
}

/**
 * Risk/reward ratio for the signal: distance to take-profit over distance to
 * stop-loss, measured from the gap average (entry reference).
 */
export function riskReward(
  avg: number,
  takeProfit: number,
  stopLoss: number
): number | null {
  const reward = Math.abs(takeProfit - avg)
  const risk = Math.abs(avg - stopLoss)
  if (!risk) return null
  return reward / risk
}
