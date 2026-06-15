import { FVGOptions, FVGSignal } from "./fvg.interfaces.js";
import atr from "./atr.js";
import { Chart } from "../charts/charts.interfaces.js";
import { config } from "../../config.js";

const transformToNumber = (item?: string): number | undefined => {
    if (!item) return undefined;
    const res = Number(item);
    if (isNaN(res)) return undefined;
    return res;
}

export function fvg(rawQuotes: Chart[], options: FVGOptions = {}): FVGSignal[] {

    const {
        filterWidth = config.FVG_FILTER_WIDTH,
        atrPeriod = config.FVG_ATR_PERIOD,
        tsReset = config.FVG_RESET_TS,
        tsMult = config.FVG_MULTIPLIER_TS,
        tpMult = config.FVG_MULTIPLIER_TP,
        slMult = config.FVG_MULTIPLIER_SL,
    } = options;

    const quotes = rawQuotes;
    const atrValues = atr(rawQuotes, atrPeriod);
    const signals: FVGSignal[] = [];

    let os = 0; // 0 = bear, 1 = bull
    let prevOs = 0;
    let ts = NaN;
    let tsReached = false;

    for (let i = 3; i < quotes.length; i++) {
        const atrVal = atrValues[i] ?? 0;
        const close = quotes[i].c;
        const high1 = quotes[i - 1].h;
        const low1 = quotes[i - 1].l;
        const close2 = quotes[i - 2].c;
        const high3 = quotes[i - 3].h;
        const low3 = quotes[i - 3].l;

        const bull = low3 > high1 && close2 < low3 && close > low3 && low3 - high1 > atrVal * filterWidth;
        const bear = low1 > high3 && close2 > high3 && close < high3 && low1 - high3 > atrVal * filterWidth;

        prevOs = os;
        if (bull) os = 1;
        if (bear) os = 0;

        // Mirror Pine Script: ts_reset = tsReset == 'Every Signals' ? bull or bear : os != os[1]
        const tsResetTrigger = tsReset === 'Every Signals' ? (bull || bear) : (os !== prevOs);

        if (tsResetTrigger || isNaN(ts)) {
            ts = os === 1 ? close - atrVal * tsMult : close + atrVal * tsMult;
            tsReached = false;
        } else {
            if (os === 1) {
                ts = close - ts > atrVal * tsMult ? close - atrVal * tsMult : ts;
                if (close < ts) tsReached = true;
            } else {
                ts = ts - close > atrVal * tsMult ? close + atrVal * tsMult : ts;
                if (close > ts) tsReached = true;
            }
        }

        if (bull) {
            const avg = (low3 + high1) / 2;
            signals.push({
                type: 'bull',
                date: new Date(quotes[i].t),
                barIndex: i,
                bottom: high1,
                top: low3,
                avg,
                atr: atrVal,
                trailingStop: ts,
                tsReached,
                takeProfit: avg + atrVal * tpMult,
                stopLoss: avg - atrVal * slMult,
            });
        }

        if (bear) {
            const avg = (low1 + high3) / 2;
            signals.push({
                type: 'bear',
                date: new Date(quotes[i].t),
                barIndex: i,
                bottom: high3,
                top: low1,
                avg,
                atr: atrVal,
                trailingStop: ts,
                tsReached,
                takeProfit: avg - atrVal * tpMult,
                stopLoss: avg + atrVal * slMult,
            });
        }
    }

    return signals;
}