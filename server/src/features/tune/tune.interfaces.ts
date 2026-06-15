import { FVGOptions, FVGSignal } from "../fvg/fvg.interfaces.js";

export interface SignalOutcome {
    signal: FVGSignal;
    result: 'win' | 'loss' | 'open';
    barsToResolution: number | null;
}

export interface SymbolResult {
    symbol: string;
    wins: number;
    losses: number;
    open: number;
    winPct: number;
    ev: number;
}

export interface TuneResult {
    config: FVGOptions;
    symbols: SymbolResult[];
    totalWins: number;
    totalLosses: number;
    totalOpen: number;
    winPct: number;
    conservativeWinPct: number;
    /** Expected value per resolved signal, in R-multiples (multiples of risk). */
    ev: number;
    /** EV per signal counting open as zero P&L. */
    evAllSignals: number;
}
