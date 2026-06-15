
export interface FVGSignal {
    type: 'bull' | 'bear';
    date: Date;
    barIndex: number;
    top: number;
    bottom: number;
    avg: number;
    atr: number;
    trailingStop: number;
    tsReached: boolean;
    takeProfit: number;
    stopLoss: number;
}

export interface FVGOptions {
    filterWidth?: number;
    atrPeriod?: number;
    tsReset?: 'Every Signals' | 'Inverse Signals';
    tsMult?: number;
    tpMult?: number;
    slMult?: number;
}