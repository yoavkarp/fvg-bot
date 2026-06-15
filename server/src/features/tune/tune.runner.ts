import { writeFileSync } from "fs";
import path from "path";
import { cwd } from "process";
import { FVGOptions } from "../fvg/fvg.interfaces.js";
import { tune } from "./tune.service.js";

type Grid = {
    filterWidth: number[];
    atrPeriod: number[];
    tpMult: number[];
    slMult: number[];
    tsMult: number[];
    tsReset: Array<'Every Signals' | 'Inverse Signals'>;
};

const GRID: Grid = {
    filterWidth: [0, 0.1, 0.5],
    atrPeriod: [7, 14, 21],
    tpMult: [1.5, 2, 3],
    slMult: [0.5, 1, 1.5],
    tsMult: [0],
    tsReset: ['Inverse Signals'],
};

function cartesian(grid: Grid): FVGOptions[] {
    const configs: FVGOptions[] = [];
    for (const filterWidth of grid.filterWidth)
        for (const atrPeriod of grid.atrPeriod)
            for (const tpMult of grid.tpMult)
                for (const slMult of grid.slMult)
                    for (const tsMult of grid.tsMult)
                        for (const tsReset of grid.tsReset)
                            configs.push({ filterWidth, atrPeriod, tpMult, slMult, tsMult, tsReset });
    return configs;
}

function pct(x: number): string {
    if (isNaN(x)) return '   n/a';
    return `${(x * 100).toFixed(1).padStart(5)}%`;
}

function ev(x: number): string {
    if (isNaN(x)) return '   n/a';
    return `${(x >= 0 ? '+' : '')}${x.toFixed(2)}R`.padStart(6);
}

function pad(s: string | number, n: number): string {
    return String(s).padStart(n);
}

async function main() {
    const configs = cartesian(GRID);
    console.log(`Tuning ${configs.length} configs across all S&P 500 + NASDAQ 100 symbols...`);

    const results = await tune({
        configs,
        periodDays: 365*5,
        onChartFetched: (symbol, i, total) => {
            if (i % 25 === 0 || i === total) {
                console.log(`  fetched ${i}/${total} charts (last: ${symbol})`);
            }
        },
    });

    console.log("\n=== Results (ranked by EV) ===\n");
    console.log(
        `${pad('Rank', 4)}  ${pad('EV', 6)}  ${pad('EV(all)', 7)}  ${pad('winPct', 6)}  ${pad('wins', 5)}  ${pad('loss', 5)}  ${pad('open', 5)}  ${pad('fw', 4)}  ${pad('atr', 3)}  ${pad('tp', 4)}  ${pad('sl', 4)}`
    );
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const c = r.config;
        console.log(
            `${pad(i + 1, 4)}  ${ev(r.ev)}  ${ev(r.evAllSignals)}  ${pct(r.winPct)}  ${pad(r.totalWins, 5)}  ${pad(r.totalLosses, 5)}  ${pad(r.totalOpen, 5)}  ${pad(c.filterWidth ?? 0, 4)}  ${pad(c.atrPeriod ?? 14, 3)}  ${pad(c.tpMult ?? 2, 4)}  ${pad(c.slMult ?? 1, 4)}`
        );
    }

    const outPath = path.join(cwd(), 'tune_results.json');
    writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\nFull results written to ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
