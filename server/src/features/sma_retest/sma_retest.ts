import { Chart } from "../charts/charts.interfaces.js";
import { config } from "../../config.js";
import sma from "./sma.js";
import { SMARetestOptions, SMARetestSignal } from "./sma_retest.interfaces.js";

/**
 * Detects the most recent SMA retest in a chart.
 *
 * A retest is the price pulling back to the moving average and respecting it:
 *  - long  — trend is above the SMA (prev close > prev SMA), the bar wicks down
 *            into the SMA (low <= SMA) but closes back above it (close > SMA).
 *            The SMA acted as support → bullish continuation.
 *  - short — trend is below the SMA (prev close < prev SMA), the bar wicks up
 *            into the SMA (high >= SMA) but closes back below it (close < SMA).
 *            The SMA acted as resistance → bearish continuation.
 *
 * Returns the latest (most recent) retest signal, or null if none is found.
 */
export function retest(quotes: Chart[], options: SMARetestOptions = {}): SMARetestSignal | null {
    const { period = config.SMA_PERIOD } = options;
    const smaValues = sma(quotes, period);

    let latest: SMARetestSignal | null = null;

    for (let i = 1; i < quotes.length; i++) {
        const smaVal = smaValues[i];
        const prevSma = smaValues[i - 1];
        if (isNaN(smaVal) || isNaN(prevSma)) continue;

        const { h, l, c } = quotes[i];
        const prevClose = quotes[i - 1].c;

        const long = prevClose > prevSma && l <= smaVal && c > smaVal;
        const short = prevClose < prevSma && h >= smaVal && c < smaVal;

        if (long || short) {
            latest = {
                type: long ? 'long' : 'short',
                date: new Date(quotes[i].t),
                barIndex: i,
                price: c,
                sma: smaVal,
                period,
            };
        }
    }

    return latest;
}
