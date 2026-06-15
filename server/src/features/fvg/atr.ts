import { Chart } from "../charts/charts.interfaces.js";

export default function atr(quotes: Chart[], period: number): number[] {
    const n = quotes.length;
    const tr = new Array<number>(n).fill(0);
    const atr = new Array<number>(n).fill(0);

    for (let i = 0; i < n; i++) {
        const high = quotes[i].h ?? 0;
        const low = quotes[i].l ?? 0;
        if (i === 0) {
            tr[i] = high - low;
        } else {
            const prevClose = quotes[i - 1].c ?? 0;
            tr[i] = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        }
    }

    // Seed with SMA of first `period` true ranges, then apply Wilder's smoothing
    if (n >= period) {
        atr[period - 1] = tr.slice(0, period).reduce((s, v) => s + v, 0) / period;
        for (let i = period; i < n; i++) {
            atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
        }
    }

    return atr;
}
