import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import type { Signal } from "@/lib/api"
import { formatDate, formatNumber, formatPrice, riskReward } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function SignalTable({ signals }: { signals: Signal[] }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Index</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Top</TableHead>
            <TableHead className="text-right">Avg</TableHead>
            <TableHead className="text-right">Bottom</TableHead>
            <TableHead className="text-right">ATR</TableHead>
            <TableHead className="text-right">Trailing</TableHead>
            <TableHead className="text-right">TP</TableHead>
            <TableHead className="text-right">SL</TableHead>
            <TableHead className="text-right">R/R</TableHead>
            <TableHead className="text-right">Bar</TableHead>
            <TableHead>TS Hit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((s) => {
            const isBull = s.type === "bull"
            const rr = riskReward(s.avg, s.takeProfit, s.stopLoss)
            return (
              <TableRow key={s.symbol}>
                <TableCell className="font-semibold">{s.symbol}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {s.index.map((i) => (
                      <Badge key={i} variant="outline" className="uppercase">
                        {i}
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
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(s.trailingStop)}
                </TableCell>
                <TableCell className="text-success text-right font-mono tabular-nums">
                  {formatPrice(s.takeProfit)}
                </TableCell>
                <TableCell className="text-destructive text-right font-mono tabular-nums">
                  {formatPrice(s.stopLoss)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {rr != null ? `${rr.toFixed(2)}R` : "—"}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {s.barIndex}
                </TableCell>
                <TableCell>
                  <Badge variant={s.tsReached ? "success" : "secondary"}>
                    {s.tsReached ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
