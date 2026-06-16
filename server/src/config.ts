import { config as dotenvConfig } from "dotenv";
import { transformEnvToNumber } from "./utils/env.utils.js";

dotenvConfig({ quiet: true });

type Config = {
    FVG_FILTER_WIDTH: number;
    FVG_ATR_PERIOD: number;
    FVG_RESET_TS: 'Inverse Signals' | 'Every Signals';
    FVG_MULTIPLIER_TS: number;
    FVG_MULTIPLIER_TP: number;
    FVG_MULTIPLIER_SL: number;
    FVG_SIGNAL_DAYS_DIFF: number;
    // Polygon.io
    POLYGON_IO_API_KEY?: string;
    // Charts
    CHARTS_PERIOD_DAYS: number;
}

export const config: Config = {
    // FVG
    FVG_FILTER_WIDTH: transformEnvToNumber(process.env.FVG_FILTER_WIDTH) ?? 0,
    FVG_ATR_PERIOD: transformEnvToNumber(process.env.FVG_ATR_PERIOD) ?? 14,
    FVG_RESET_TS: ['Inverse Signals', 'Every Signals'].includes(process.env.FVG_RESET_TS ?? '') ? process.env.FVG_RESET_TS : 'Inverse Signals' as any,
    FVG_MULTIPLIER_TS: transformEnvToNumber(process.env.FVG_MULTIPLIER_TS) ?? 0,
    FVG_MULTIPLIER_TP: transformEnvToNumber(process.env.FVG_MULTIPLIER_TP) ?? 2,
    FVG_MULTIPLIER_SL: transformEnvToNumber(process.env.FVG_MULTIPLIER_SL) ?? 1,
    FVG_SIGNAL_DAYS_DIFF: transformEnvToNumber(process.env.FVG_SIGNAL_DAYS_DIFF) ?? 5,
    // Polygon.io
    POLYGON_IO_API_KEY: process.env.POLYGON_IO_API_KEY,
    // Charts
    CHARTS_PERIOD_DAYS: transformEnvToNumber(process.env.CHARTS_PERIOD_DAYS) ?? 17
}