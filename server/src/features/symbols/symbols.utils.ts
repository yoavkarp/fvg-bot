import { TICKER_RE } from "./symbols.constants.js";

export function parseTickersFromWikitext(content: string): string[] {
    const tickers = new Set<string>();

    for (const row of content.split(/\n\|-/)) {
        let found = false;
        for (const lineMatch of row.matchAll(/\n\|([^|!\n][^\n]*)/g)) {
            // A single line may contain multiple cells separated by ||
            for (const rawCell of lineMatch[1].split('||')) {
                const cell = rawCell.trim();

                if (TICKER_RE.test(cell)) {
                    tickers.add(cell);
                    found = true;
                    break;
                }

                // [[TICKER|DisplayName]] or [[TICKER]]
                const link = cell.match(/^\[\[(?:[A-Za-z]+:)?([A-Z]{1,5}(?:\.[A-Z]{1,2})?)[|\]]/);
                if (link) {
                    tickers.add(link[1]);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }

    return [...tickers].sort();
}
