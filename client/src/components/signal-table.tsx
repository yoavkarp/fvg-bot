import { useMemo } from "react"
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react"

import type { Signal } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatPrice,
  indexLabel,
  tradingViewUrl,
  winPercent,
} from "@/lib/format"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortKey =
  | "symbol"
  | "index"
  | "type"
  | "date"
  | "price"
  | "win"
  | "top"
  | "avg"
  | "bottom"
  | "atr"
  | "takeProfit"
  | "stopLoss"

type SortDir = "asc" | "desc"
type Sort = { key: SortKey; dir: SortDir } | null

// Comparable value per column. Nulls collapse to -Infinity so they sort last
// when descending (the common case for "best first").
const accessors: Record<SortKey, (s: Signal) => number | string> = {
  symbol: (s) => s.symbol,
  index: (s) => s.index.join(","),
  type: (s) => s.type,
  date: (s) => new Date(s.date).getTime(),
  price: (s) => s.price ?? -Infinity,
  win: (s) => winPercent(s.price ?? s.avg, s.takeProfit) ?? -Infinity,
  top: (s) => s.top,
  avg: (s) => s.avg,
  bottom: (s) => s.bottom,
  atr: (s) => s.atr,
  takeProfit: (s) => s.takeProfit,
  stopLoss: (s) => s.stopLoss,
}

const columns: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "symbol", label: "Symbol" },
  { key: "index", label: "Index" },
  { key: "type", label: "Side" },
  { key: "date", label: "Date" },
  { key: "price", label: "Price", align: "right" },
  { key: "win", label: "Profit", align: "right" },
  { key: "top", label: "Top", align: "right" },
  { key: "avg", label: "Avg", align: "right" },
  { key: "bottom", label: "Bottom", align: "right" },
  { key: "atr", label: "ATR", align: "right" },
  { key: "takeProfit", label: "TP", align: "right" },
  { key: "stopLoss", label: "SL", align: "right" },
]

// Text columns read better A→Z on first click; numbers best-first (desc).
const stringKeys: SortKey[] = ["symbol", "index", "type"]

function SortHeader({
  col,
  sort,
  onSort,
}: {
  col: (typeof columns)[number]
  sort: Sort
  onSort: (key: SortKey) => void
}) {
  const active = sort?.key === col.key
  return (
    <TableHead className={col.align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(col.key)}
        className={cn(
          "hover:text-foreground inline-flex cursor-pointer select-none items-center gap-1 transition-colors",
          active && "text-foreground font-semibold"
        )}
      >
        {col.label}
        {active ? (
          sort?.dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

export function SignalTable({ signals }: { signals: Signal[] }) {
  const [sort, setSort] = useLocalStorage<Sort>("fvg:tableSort", null)

  function onSort(key: SortKey) {
    setSort((prev) =>
      prev && prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: stringKeys.includes(key) ? "asc" : "desc" }
    )
  }

  const sorted = useMemo(() => {
    if (!sort) return signals
    const acc = accessors[sort.key]
    if (!acc) return signals // stale/removed column from localStorage
    return [...signals].sort((a, b) => {
      const av = acc(a)
      const bv = acc(b)
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sort.dir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number)
    })
  }, [signals, sort])

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <SortHeader
                key={col.key}
                col={col}
                sort={sort}
                onSort={onSort}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s) => {
            const isBull = s.type === "bull"
            const winPct = winPercent(s.price ?? s.avg, s.takeProfit)
            return (
              <TableRow key={s.symbol}>
                <TableCell className="font-semibold">
                  <a
                    href={tradingViewUrl(s.symbol)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${s.symbol} on TradingView (4h)`}
                    className="group inline-flex items-center gap-1.5 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {s.symbol}
                    <ExternalLink className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {s.index.map((i) => (
                      <Badge key={i} variant="outline">
                        {indexLabel(i)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isBull ? "success" : "destructive"}
                    className="gap-1"
                  >
                    {isBull ? (
                      <ArrowUpRight className="size-3" />
                    ) : (
                      <ArrowDownRight className="size-3" />
                    )}
                    {isBull ? "LONG" : "SHORT"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(s.date)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold tabular-nums">
                  {s.price != null ? formatPrice(s.price) : "—"}
                </TableCell>
                <TableCell className="text-success text-right font-mono tabular-nums">
                  {winPct != null ? formatPercent(winPct) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(s.top)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(s.avg)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(s.bottom)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatNumber(s.atr)}
                </TableCell>
                <TableCell className="text-success text-right font-mono tabular-nums">
                  {formatPrice(s.takeProfit)}
                </TableCell>
                <TableCell className="text-destructive text-right font-mono tabular-nums">
                  {formatPrice(s.stopLoss)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
