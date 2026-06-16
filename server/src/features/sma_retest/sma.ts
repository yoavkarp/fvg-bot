import { Chart } from "../charts/charts.interfaces.js";

/**
 * Simple moving average of close prices. `sma[i]` is the mean of the `period`
 * closes ending at bar `i`; entries before enough bars exist are NaN.
 */
export default function sma(quotes: Chart[], period: number): number[] {
    const n = quotes.length;
    const out = new Array<number>(n).fill(NaN);
    if (period <= 0) return out;

    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += quotes[i].c;
        if (i >= period) sum -= quotes[i - period].c;
        if (i >= period - 1) out[i] = sum / period;
    }

    return out;
}
