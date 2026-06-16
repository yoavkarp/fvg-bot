import { useEffect, useMemo, useRef } from "react"
import {
  AlertTriangle,
  LayoutGrid,
  Radar,
  RefreshCw,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { useScan, useSignals, useStatus } from "@/hooks/use-signals"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SignalCard } from "@/components/signal-card"
import { SignalTable } from "@/components/signal-table"

type View = "grid" | "table"

function StatPill({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border px-4 py-2.5">
      <div className={cn("text-muted-foreground", className)}>{icon}</div>
      <div className="flex flex-col leading-tight">
        <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
          {label}
        </span>
        <span className="text-lg font-semibold tabular-nums">{value}</span>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useLocalStorage<View>("fvg:view", "grid")

  const scan = useScan()
  // Server scan status, polled every 5s — the source of truth for "scanning".
  const status = useStatus()
  const scanning = (status.data?.is_scanning ?? false) || scan.isPending

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useSignals()

  // When a scan finishes (status flips true -> false), pull the final list.
  const prevScanning = useRef(scanning)
  useEffect(() => {
    if (prevScanning.current && !scanning) refetch()
    prevScanning.current = scanning
  }, [scanning, refetch])

  async function handleScan() {
    try {
      await scan.mutateAsync()
    } catch {
      // Already scanning (400) — the status poll will reflect it regardless.
    } finally {
      // Reflect the new state immediately instead of waiting up to 5s.
      status.refetch()
    }
  }

  const signals = data ?? []
  const stats = useMemo(() => {
    const longs = signals.filter((s) => s.type === "bull").length
    const shorts = signals.filter((s) => s.type === "bear").length
    return { total: signals.length, longs, shorts }
  }, [signals])

  const sorted = useMemo(
    () =>
      [...signals].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [signals]
  )

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-6 border-b pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 ring-primary/20 flex size-11 items-center justify-center rounded-xl ring-1">
                <Radar className="text-primary size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  FVG Signal Scanner
                </h1>
                <p className="text-muted-foreground text-sm">
                  Fair Value Gap signals across S&amp;P 500 &amp; NASDAQ 100
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
                Refresh
              </Button>
              <Button onClick={handleScan} disabled={scanning || scan.isPending}>
                <Radar className={cn("size-4", scanning && "animate-pulse")} />
                {scanning ? "Scanning…" : "Scan market"}
              </Button>
            </div>
          </div>

          {/* Stats + controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <StatPill
                icon={<Radar className="size-5" />}
                label="Signals"
                value={isLoading ? "—" : stats.total}
              />
              <StatPill
                icon={<TrendingUp className="size-5" />}
                label="Long"
                value={isLoading ? "—" : stats.longs}
                className="text-success"
              />
              <StatPill
                icon={<TrendingDown className="size-5" />}
                label="Short"
                value={isLoading ? "—" : stats.shorts}
                className="text-destructive"
              />
            </div>

            <div className="flex items-center gap-3">
              {dataUpdatedAt > 0 && (
                <span className="text-muted-foreground text-xs">
                  Updated {relativeTime(dataUpdatedAt)}
                </span>
              )}
              <div className="bg-card flex items-center rounded-lg border p-1">
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="size-4" />
                  Cards
                </Button>
                <Button
                  variant={view === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView("table")}
                >
                  <TableIcon className="size-4" />
                  Table
                </Button>
              </div>
            </div>
          </div>

          {scanning && (
            <div className="bg-primary/5 border-primary/20 text-muted-foreground flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm">
              <Radar className="text-primary size-4 animate-pulse" />
              Scanning the market in the background — results refresh
              automatically as they come in.
            </div>
          )}
        </header>

        {/* Body */}
        <main className="py-8">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          ) : sorted.length === 0 ? (
            <EmptyState onScan={handleScan} scanning={scanning} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sorted.map((s) => (
                <SignalCard key={s.symbol} signal={s} />
              ))}
            </div>
          ) : (
            <SignalTable signals={sorted} />
          )}
        </main>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-72 w-full rounded-xl" />
      ))}
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
      <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive size-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Couldn’t load signals</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {message ?? "The server didn’t respond. Is it running on :3001?"}
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  )
}

function EmptyState({
  onScan,
  scanning,
}: {
  onScan: () => void
  scanning: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-center">
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
        <Radar className="text-primary size-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">No signals yet</h2>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Run a market scan to detect Fair Value Gap signals across the S&amp;P
          500 and NASDAQ 100.
        </p>
      </div>
      <Button onClick={onScan} disabled={scanning}>
        <Radar className={cn("size-4", scanning && "animate-pulse")} />
        {scanning ? "Scanning…" : "Scan market"}
      </Button>
      <Badge variant="secondary" className="font-normal">
        A full scan can take a couple of minutes
      </Badge>
    </div>
  )
}
