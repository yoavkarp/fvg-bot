import express from 'express';
import { db } from '../db/db.service.js';
import { Ticker } from '../symbols/symbols.interfaces.js';
import { FVGSignal } from '../fvg/fvg.interfaces.js';
import { scan } from '../../functions/scan.js';
import { quotesService } from '../quotes/quotes.service.js';
import cors from 'cors';

export function server() {

    let is_scanning = false;
    const server = express();
    const apiRoute = express.Router();

    server.use(cors({
        origin: '*', // or '*' for dev only
    }));

    apiRoute.get('/list', async (_, res) => {
        const dbval = db.read();
        const signals = Object.values(dbval) as Array<FVGSignal & Ticker>;

        // Enrich each signal with its current price from Polygon (one batched
        // snapshot request for all symbols). Falls back to null per-symbol.
        const prices = await quotesService.getCurrentPrices(signals.map((s) => s.symbol));
        console.log(prices);
        const retval = signals.map((signal) => ({
            ...signal,
            price: prices[signal.symbol] ?? null,
        }));

        res.json(retval);
    });

    apiRoute.get('/status', (_, res) => {
        res.json({ is_scanning })
    })

    apiRoute.get('/scan', (_, res) => {
        if (is_scanning) {
            return res.status(400).json({ success: false, message: 'already-scanning' })
        }
        is_scanning = true;

        scan({
            onSignal: (ticker, signal) => {
                db.write({ ...ticker, ...signal });
                console.log(`[${ticker.symbol}] ${signal.type === 'bear' ? 'SHORT' : 'LONG'} @ ${signal.date} ATR:${signal.atr}`)
            },
            onNoSignalFound: (ticker) => {
                db.remove(ticker);
            }
        }).finally(() => {
            is_scanning = false;
        })

        res.json({ success: true })
    })

    server.use('/', apiRoute);

    server.listen(3001, () => {
        console.log("Server started");
    })
}