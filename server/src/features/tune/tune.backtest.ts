import { Chart } from "../charts/charts.interfaces.js";
import { fvg } from "../fvg/fvg.js";
import { FVGOptions } from "../fvg/fvg.interfaces.js";
import { SignalOutcome } from "./tune.interfaces.js";

export function backtest(chart: Chart[], options: FVGOptions = {}): SignalOutcome[] {
    const signals = fvg(chart, options);

    return signals.map((signal) => {
        for (let i = signal.barIndex + 1; i < chart.length; i++) {
            const { h, l } = chart[i];

            if (signal.type === 'bull') {
                const tpHit = h >= signal.takeProfit;
                const slHit = l <= signal.stopLoss;
                if (tpHit) return { signal, result: 'win', barsToResolution: i - signal.barIndex };
                if (slHit) return { signal, result: 'loss', barsToResolution: i - signal.barIndex };
            } else {
                const tpHit = l <= signal.takeProfit;
                const slHit = h >= signal.stopLoss;
                if (tpHit) return { signal, result: 'win', barsToResolution: i - signal.barIndex };
                if (slHit) return { signal, result: 'loss', barsToResolution: i - signal.barIndex };
            }
        }

        return { signal, result: 'open', barsToResolution: null };
    });
}
