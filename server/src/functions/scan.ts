import { config } from "../config.js";
import { chartsService } from "../features/charts/charts.service.js";
import { FVGSignal } from "../features/fvg/fvg.interfaces.js";
import { fvg } from "../features/fvg/fvg.js";
import { Ticker } from "../features/symbols/symbols.interfaces.js";
import { symbolsService } from "../features/symbols/symbols.service.js";

interface ScanOptions {
    onSignal?: (ticker: Ticker, signal: FVGSignal) => void;
    onNoSignalFound?: (ticker: Ticker) => void;
    concurrent?: boolean
}

export async function scan(options: ScanOptions = {}) {

    const { concurrent = 10 } = options;
    const tickers = await symbolsService.getAll();

    const signals: FVGSignal[] = [];

    const batch_tickers = tickers.reduce<Ticker[][]>((prev, cur) => {
        if (prev.at(-1)?.length === concurrent) {
            prev.push([cur]);
        } else {
            prev.at(-1)?.push(cur);
        }
        return prev;
    }, [[]]);

    for (const b of batch_tickers) {
        const res = await Promise.all(b.map((t) => chartsService.chart(t.symbol, '4h').then((c) => {
            const signals = fvg(c);
            const last_signal = signals.at(-1);
            if (!last_signal) {
                options.onNoSignalFound?.(t);
                return null;
            }

            if (last_signal.date.getTime() < Date.now() - config.FVG_SIGNAL_DAYS_DIFF * 24 * 60 * 60 * 1000) {
                options.onNoSignalFound?.(t);
                return null;
            }

            options?.onSignal?.(t, last_signal);
            return last_signal;
        })));

        signals.push(...res.filter(Boolean) as any);
    }

    return signals;
}