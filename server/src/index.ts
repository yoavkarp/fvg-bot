import { server } from "./features/server/server.js";

async function main() {
    server();

    // scan({
    //     onSignal: (ticker, signal) => {
    //         db.write({ ...ticker, ...signal });
    //         console.log(`[${ticker.symbol}] ${signal.type === 'bear' ? 'SHORT' : 'LONG'} @ ${signal.date} ATR:${signal.atr}`)
    //     },
    //     onNoSignalFound: (ticker) => {
    //         db.remove(ticker);
    //     }
    // })
}

main();