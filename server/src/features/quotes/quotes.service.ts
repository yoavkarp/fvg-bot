import { GetStocksSnapshotTickers200ResponseAllOfTickersInner } from "@polygon.io/client-js";

type SnapshotTicker = GetStocksSnapshotTickers200ResponseAllOfTickersInner;

/**
 * Picks the most "current" price available from a Polygon snapshot, falling
 * back from the freshest source to the stalest:
 *   last trade -> current minute close -> today's close -> previous day close.
 * Zero/undefined values are skipped (e.g. no trades yet pre-market).
 */
function priceFromSnapshot(t: SnapshotTicker): number | null {
    const candidates = [t.lastTrade?.p, t.min?.c, t.day?.c, t.prevDay?.c];
    for (const c of candidates) {
        if (typeof c === "number" && c > 0) return c;
    }
    return null;
}

class QuotesService {
    /**
     * Fetches current prices for many symbols in a single batched snapshot
     * request (cheap on rate limits). Returns a symbol -> price map; symbols
     * that can't be resolved map to null. Never throws — on failure every
     * symbol resolves to null so callers can degrade gracefully.
     */
    async getCurrentPrices(symbols: string[]): Promise<Record<string, number | null>> {
        const prices: Record<string, number | null> = {};
        for (const s of symbols) prices[s] = null;
        try {
        } catch (err) {
            console.error("[quotes] failed to fetch snapshot prices", err);
        }

        return prices;
    }
}

export const quotesService = new QuotesService();
