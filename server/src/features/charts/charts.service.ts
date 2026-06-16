import { config } from "../../config.js";
import { Chart } from "./charts.interfaces.js";
import { client } from "./client.js";
import { GetStocksAggregates200Response, GetStocksAggregatesTimespanEnum } from "@polygon.io/client-js";
import { refactorChart } from "./refactor_chart.js";
import { Interval, isRegularMarket, transformIntervalToMinutes } from "./charts.utils.js";

class ChartsService {
    async chart(symbol: string, interval: Interval, periodDays: number = config.CHARTS_PERIOD_DAYS): Promise<Array<Chart>> {

        let final_interval = interval;
        const market_minutes = 6.5 * 60;
        if (market_minutes % transformIntervalToMinutes(interval) > 0) {
            final_interval = '30m';
        }

        const mins_interval = transformIntervalToMinutes(final_interval);

        const from = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const charts: Array<Chart> = [];
        const to = new Date().toISOString().split("T")[0];
        const curr = await client.getStocksAggregates(symbol, mins_interval, GetStocksAggregatesTimespanEnum.Minute, from, to, false);
        charts.push(...(curr.results ?? []));
        let next_url = curr.next_url;

        while (next_url) {
            const res = await fetch(`${next_url}&apiKey=J08ridXqb0b5YZHcYX2VgThd_i3IZuFC`);
            const jsres = await res.json() as GetStocksAggregates200Response;
            charts.push(...(jsres.results ?? []));
            next_url = jsres.next_url;
        }

        if (final_interval !== interval) {
            return refactorChart(charts, '30m', interval);
        }

        return charts.filter(isRegularMarket);
    }
}

export const chartsService = new ChartsService();