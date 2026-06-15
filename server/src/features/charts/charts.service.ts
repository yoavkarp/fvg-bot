import { config } from "../../config.js";
import { Chart } from "./charts.interfaces.js";
import { isRegularMarket, m30toh4 } from "./charts.utils.js";
import { client } from "./client.js";
import { GetStocksAggregates200Response, GetStocksAggregatesTimespanEnum } from "@polygon.io/client-js";

class ChartsService {
    async get4hChart(symbol: string, periodDays: number = config.CHARTS_PERIOD_DAYS): Promise<Array<Chart>> {

        const from = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const charts: Array<Chart> = [];
        const to = new Date().toISOString().split("T")[0];
        const curr = await client.getStocksAggregates(symbol, 30, GetStocksAggregatesTimespanEnum.Minute, from, to, false);
        charts.push(...(curr.results ?? []));
        let next_url = curr.next_url;

        while (next_url) {
            const res = await fetch(`${next_url}&apiKey=J08ridXqb0b5YZHcYX2VgThd_i3IZuFC`);
            const jsres = await res.json() as GetStocksAggregates200Response;
            charts.push(...(jsres.results ?? []));
            next_url = jsres.next_url;
        }

        return m30toh4(charts.filter(isRegularMarket)) ?? [];
    }
}

export const chartsService = new ChartsService();