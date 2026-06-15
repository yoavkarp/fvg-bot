import express from 'express';
import { db } from '../db/db.service.js';
import { Ticker } from '../symbols/symbols.interfaces.js';
import { FVGSignal } from '../fvg/fvg.interfaces.js';
import { scan } from '../../functions/scan.js';
import cors from 'cors';

export function server() {

    let is_scanning = false;
    const server = express();
    const apiRoute = express.Router();

    server.use(cors({
        origin: '*', // or '*' for dev only
    }));

    apiRoute.get('/list', (_, res) => {
        const dbval = db.read();
        const retval = Object.keys(dbval).reduce<Array<FVGSignal & Ticker>>((prev, cur) => {
            const curVal = dbval[cur];
            prev.push(curVal);
            return prev;
        }, []);
        res.json(retval);
    });

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