import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
  Shield,
  Activity,
  ExternalLink,
  TrendingUp,
} from "lucide-react"

import type { Signal } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatPrice,
  indexLabel,
  riskReward,
  tradingViewUrl,
  winPercent,
} from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
        {label}
      </span>
      <span className={cn("font-mono text-sm tabular-nums", className)}>
        {value}
      </span>
    </div>
  )
}

export function SignalCard({ signal }: { signal: Signal }) {
  const isBull = signal.type === "bull"
  const rr = riskReward(signal.avg, signal.takeProfit, signal.stopLoss)
  // Win % uses the live price as entry, falling back to the gap average.
  const entry = signal.price ?? signal.avg
  const winPct = winPercent(entry, signal.takeProfit)

  return (
    <Card className="gap-4 overflow-hidden py-0">
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between gap-2 border-b px-5 py-4",
          isBull ? "bg-success/10" : "bg-destructive/10"
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <a
              href={tradingViewUrl(signal.symbol)}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${signal.symbol} on TradingView (4h)`}
              className="group inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {signal.symbol}
              <ExternalLink className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            {signal.index.map((idx) => (
              <Badge key={idx} variant="outline">
                {indexLabel(idx)}
              </Badge>
            ))}
          </div>
          <span className="text-muted-foreground text-xs">
            {formatDate(signal.date)}
          </span>
        </div>
        <Badge
          variant={isBull ? "success" : "destructive"}
          className="gap-1 px-2.5 py-1 text-xs"
        >
          {isBull ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          {isBull ? "LONG" : "SHORT"}
        </Badge>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        {/* Current price + gain if the trade wins */}
        <div className="flex items-stretch justify-between gap-3 rounded-lg border bg-background/40 p-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
              Current Price
            </span>
            <span className="font-mono text-xl font-semibold tabular-nums">
              {signal.price != null ? formatPrice(signal.price) : "—"}
            </span>
          </div>
          <div className="flex flex-col items-end justify-center gap-0.5 text-right">
            <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
              Profit
            </span>
            <span className="text-success inline-flex items-center gap-1 font-mono text-xl font-semibold tabular-nums">
              <TrendingUp className="size-4" />
              {winPct != null ? formatPercent(winPct) : "—"}
            </span>
          </div>
        </div>

        {/* Targets */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border bg-background/40 p-3">
          <div className="flex items-center gap-2">
            <Target className="text-success size-4 shrink-0" />
            <Stat
              label="Take Profit"
              value={formatPrice(signal.takeProfit)}
              className="text-success"
            />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-destructive size-4 shrink-0" />
            <Stat
              label="Stop Loss"
              value={formatPrice(signal.stopLoss)}
              className="text-destructive"
            />
          </div>
        </div>

        {/* Gap / FVG levels */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Gap Top" value={formatPrice(signal.top)} />
          <Stat label="Gap Avg" value={formatPrice(signal.avg)} />
          <Stat label="Gap Bottom" value={formatPrice(signal.bottom)} />
        </div>

        {/* Risk metrics */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
          <Stat
            label="ATR"
            value={
              <span className="inline-flex items-center gap-1">
                <Activity className="text-muted-foreground size-3" />
                {formatNumber(signal.atr)}
              </span>
            }
          />
          <Stat label="Trailing Stop" value={formatPrice(signal.trailingStop)} />
          <Stat
            label="Risk / Reward"
            value={rr != null ? `${rr.toFixed(2)}R` : "—"}
            className={cn(
              rr != null && rr >= 1.5 && "text-success",
              rr != null && rr < 1 && "text-destructive"
            )}
          />
        </div>

        {/* Meta */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
          <Stat label="Bar Index" value={signal.barIndex} />
          <Stat
            label="TS Reached"
            value={
              <Badge
                variant={signal.tsReached ? "success" : "secondary"}
                className="text-[11px]"
              >
                {signal.tsReached ? "Yes" : "No"}
              </Badge>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
