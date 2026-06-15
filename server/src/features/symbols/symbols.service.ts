import { TICKER_RE } from "./symbols.constants.js";
import { WikiApiResponse } from "./symbols.interfaces.js";
import { parseTickersFromWikitext } from "./symbols.utils.js";

class SymbolsService {
    async getNasdaq100Symbols(): Promise<string[]> {
        const params = new URLSearchParams({
            action: 'query',
            prop: 'revisions',
            rvprop: 'content',
            rvslots: 'main',
            titles: 'Nasdaq-100',
            format: 'json',
            formatversion: '2',
        });

        const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
        if (!response.ok) throw new Error(`Wikipedia API error (NASDAQ 100): ${response.status}`);

        const json = (await response.json()) as WikiApiResponse;
        const content = json.query.pages[0].revisions[0].slots.main.content;
        return parseTickersFromWikitext(content);
    }

    async getSP500Symbols(): Promise<string[]> {
        const response = await fetch(
            'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv'
        );
        if (!response.ok) throw new Error(`S&P 500 fetch error: ${response.status}`);
        const text = await response.text();
        return text
            .split('\n')
            .slice(1)
            .map(line => line.split(',')[0].replace(/"/g, '').trim())
            .filter(s => TICKER_RE.test(s))
            .sort();
    }

    async getAll(): Promise<{ symbol: string, index: Array<'nasdaq' | 'sp500'> }[]> {
        const sp500symbols = await this.getSP500Symbols();
        const nasdaqsymbols = await this.getNasdaq100Symbols();

        const all = [...sp500symbols, ...nasdaqsymbols.filter((s) => !sp500symbols.includes(s))];
        return all.map((s) => {
            const index: Array<'nasdaq' | 'sp500'> = [];
            if (sp500symbols.includes(s)) {
                index.push('sp500');
            }
            if (nasdaqsymbols.includes(s)) {
                index.push('nasdaq')
            }
            return {
                symbol: s,
                index
            }
        })
    }
}

export const symbolsService = new SymbolsService();