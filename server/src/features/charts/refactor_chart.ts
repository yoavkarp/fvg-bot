import { Chart } from "./charts.interfaces.js"
import { Interval, isRegularMarket, transformIntervalToMinutes } from "./charts.utils.js";

export function refactorChart(input: Chart[], from: Interval, to: Interval) {
    const res: Chart[] = [];

    const from_mins = transformIntervalToMinutes(from);
    const to_mins = transformIntervalToMinutes(to);

    const market_minutes_day = 6.5 * 60;
    const original_bars_per_day = market_minutes_day / from_mins;

    console.log({ market_minutes_day, original_bars_per_day })

    const input_market_hours = input.filter(isRegularMarket).reduce<Chart[][]>((prev, cur) => {
        if (!prev.length || prev.at(-1)?.length === original_bars_per_day) {
            prev.push([cur]);
        } else {
            prev.at(-1)?.push(cur);
        }
        return prev;
    }, [] as Chart[][]);

    const bars_per_to_bar = to_mins / from_mins;
    if (!Number.isInteger(bars_per_to_bar)) {
        throw new Error("to interval must be multiple of from interval");
    }

    const result = input_market_hours.map((val) => {
        const cur: Chart[] = [];
        for (let i = 0; i < val.length; i += bars_per_to_bar) {
            const curbars = val.slice(i, i + bars_per_to_bar);
            cur.push({
                o: curbars.at(0)?.o!,
                c: curbars.at(-1)?.c!,
                h: Math.max(...curbars.map((f) => f.h)),
                l: Math.min(...curbars.map((f) => f.l)),
                t: curbars.at(0)?.t || 0,
            })
        }
        return cur;
    }).flat()

    console.log(result);

    return result;
}