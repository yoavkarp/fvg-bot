import { Chart } from "../charts/charts.interfaces.js";
import { chartsService } from "../charts/charts.service.js";
import { FVGOptions } from "../fvg/fvg.interfaces.js";
import { symbolsService } from "../symbols/symbols.service.js";
import { backtest } from "./tune.backtest.js";
import { SymbolResult, TuneResult } from "./tune.interfaces.js";

interface TuneOptions {
    configs: FVGOptions[];
    periodDays?: number;
    concurrent?: number;
    onChartFetched?: (symbol: string, index: number, total: number) => void;
}

export async function tune(options: TuneOptions): Promise<TuneResult[]> {
    const { configs, periodDays = 365, concurrent = 10, onChartFetched } = options;

    const tickers = await symbolsService.getAll();
    const charts = new Map<string, Chart[]>();

    let fetched = 0;
    for (let i = 0; i < tickers.length; i += concurrent) {
        const batch = tickers.slice(i, i + concurrent);
        await Promise.all(batch.map(async (t) => {
            try {
                const chart = await chartsService.chart(t.symbol, '4h', periodDays);
                if (chart.length > 0) {
                    charts.set(t.symbol, chart);
                }
            } catch (err) {
                console.warn(`[${t.symbol}] chart fetch failed:`, (err as Error).message);
            }
            fetched++;
            onChartFetched?.(t.symbol, fetched, tickers.length);
        }));
    }

    const results: TuneResult[] = configs.map((config) => {
        const tpMult = config.tpMult ?? 2;
        const slMult = config.slMult ?? 1;
        // R-multiple of a winning trade. Loss = -1R by definition.
        const winR = slMult > 0 ? tpMult / slMult : NaN;

        const symbolResults: SymbolResult[] = [];

        for (const [symbol, chart] of charts) {
            const outcomes = backtest(chart, config);
            const wins = outcomes.filter(o => o.result === 'win').length;
            const losses = outcomes.filter(o => o.result === 'loss').length;
            const open = outcomes.filter(o => o.result === 'open').length;
            const resolved = wins + losses;
            symbolResults.push({
                symbol,
                wins,
                losses,
                open,
                winPct: resolved > 0 ? wins / resolved : NaN,
                ev: resolved > 0 ? (wins * winR - losses) / resolved : NaN,
            });
        }

        const totalWins = symbolResults.reduce((s, r) => s + r.wins, 0);
        const totalLosses = symbolResults.reduce((s, r) => s + r.losses, 0);
        const totalOpen = symbolResults.reduce((s, r) => s + r.open, 0);
        const resolved = totalWins + totalLosses;
        const totalSignals = resolved + totalOpen;

        return {
            config,
            symbols: symbolResults,
            totalWins,
            totalLosses,
            totalOpen,
            winPct: resolved > 0 ? totalWins / resolved : NaN,
            conservativeWinPct: totalSignals > 0 ? totalWins / totalSignals : NaN,
            ev: resolved > 0 ? (totalWins * winR - totalLosses) / resolved : NaN,
            evAllSignals: totalSignals > 0 ? (totalWins * winR - totalLosses) / totalSignals : NaN,
        };
    });

    return results.sort((a, b) => b.ev - a.ev);
}
