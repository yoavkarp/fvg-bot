import { Chart } from "./charts.interfaces.js";

export function m30toh4(chart: Chart[]): Chart[] {

    const c: Chart[] = [];

    for (let i = 0; i < chart.length; i += 13) {
        const first4 = chart.slice(i, i + 8);
        const last4 = chart.slice(i + 8, i + 13);

        if (!first4 || !last4) {
            return [];
        }

        const first: Chart = {
            o: first4.at(0)?.o!,
            c: first4.at(-1)?.c!,
            h: Math.max(...first4.map((f) => f.h)),
            l: Math.min(...first4.map((f) => f.l)),
            t: first4.at(0)?.t || 0,
        }

        const last: Chart = {
            o: last4.at(0)?.o!,
            c: last4.at(-1)?.c!,
            h: Math.max(...last4.map((f) => f.h)),
            l: Math.min(...last4.map((f) => f.l)),
            t: last4.at(0)?.t || 0,
        }

        c.push(first, last);
    }

    return c;
}

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
