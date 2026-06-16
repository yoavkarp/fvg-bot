export interface SMARetestSignal {
    type: 'long' | 'short';
    date: Date;
    barIndex: number;
    price: number; // close at the retest bar
    sma: number;   // SMA value at the retest bar
    period: number;
}

export interface SMARetestOptions {
    period?: number;
}
