declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly FVG_FILTER_WIDTH?: string;
        readonly FVG_ATR_PERIOD?: string;
        readonly FVG_RESET_TS?: string;
        readonly FVG_MULTIPLIER_TS?: string;
        readonly FVG_MULTIPLIER_TP?: string;
        readonly FVG_MULTIPLIER_SL?: string;
        readonly FVG_SIGNAL_DAYS_DIFF?: string;
        readonly POLYGON_IO_API_KEY?: string;
        readonly CHARTS_PERIOD_DAYS?: string;
    }
}