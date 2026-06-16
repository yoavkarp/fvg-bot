import { Chart } from "./charts.interfaces.js";

export const toNyTimes = (c: Chart) => {
    const nyDate = new Date(c.t);
    const nyTimeString = nyDate.toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
    });
    return nyTimeString;
}

export const isRegularMarket = (c: Chart) => {
    const nyTimeString = toNyTimes(c);
    const [hour, minute] = nyTimeString.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const result =
        totalMinutes >= 9 * 60 + 30 &&
        totalMinutes < 16 * 60;

    return result;
}

export const isPostMarket = (c: Chart) => {
    const nyTimeString = toNyTimes(c);
    const [hour, minute] = nyTimeString.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const result =
        totalMinutes >= 16 * 60 &&
        totalMinutes < 20 * 60;
    return result;
}

export const isPreMarket = (c: Chart) => {
    const nyTimeString = toNyTimes(c);
    const [hour, minute] = nyTimeString.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const result =
        totalMinutes >= 4 * 60 &&
        totalMinutes < 9 * 60 + 30;
    return result;
}

export const INTERVALS = ['30m', '4h', '1h', '1d'] as const;
export type Interval = typeof INTERVALS[number];

export const INTERVALS_POSTFIX = ['m', 'h', 's', 'd', 'wk'] as const;
export type IntervalPostfix = typeof INTERVALS_POSTFIX[number];

export const transformIntervalToMinutesMap: Record<IntervalPostfix, number> = {
    'm': 1,
    'h': 60,
    's': 1 / 60,
    'd': 60 * 24,
    'wk': 7 * 60 * 24
}

export const transformIntervalToMinutes = (interval: Interval) => {
    const match = interval.match(/^(\d+)(m|h|s|d|wk)$/);

    if (!match) {
        throw new Error(`Invalid interval: ${interval}`);
    }

    const [, amount, unit] = match;

    return Number(amount) * transformIntervalToMinutesMap[unit as IntervalPostfix];
}
