# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A Node.js trading signal bot that detects **Fair Value Gap (FVG) Instantaneous Mitigation** signals on US equities (S&P 500 + NASDAQ 100). It is a TypeScript port of the `fvg.pine` LuxAlgo Pine Script indicator for TradingView.

The bot scans all S&P 500 and NASDAQ 100 symbols, fetches 4-hour OHLC chart data from Polygon.io, runs the FVG algorithm, and persists signals to a flat JSON file (`db.json`). An Express HTTP server exposes the current signals and allows triggering a fresh scan.

## Running

```bash
npm start          # runs tsx src/index.ts — starts the server and kicks off an initial scan
npm run tune       # runs the backtest + config sweep, writes tune_results.json
```

No build step — `tsx` executes TypeScript directly. There are no tests.

## Environment

Copy `.env.example` to `.env`. The only required key is `POLYGON_IO_API_KEY`. All other values have defaults in `src/config.ts`.

## Architecture

**Entry point** (`src/index.ts`): starts the Express server, then runs an initial scan with callbacks that write hits to `db.json` and remove misses.

**`src/functions/scan.ts`**: orchestrates a full market scan. Fetches all symbols, batches them in groups of 10 (default), fetches 4h charts concurrently per batch, runs FVG on each, and fires `onSignal` / `onNoSignalFound` callbacks.

**`src/features/fvg/fvg.ts`**: pure function implementing the FVG algorithm. Mirrors the Pine Script logic exactly — uses a 3-bar lookback to detect price imbalance gaps, computes ATR-based trailing stop, take-profit, and stop-loss levels. `fvg.pine` is the reference implementation.

**`src/features/charts/`**:
- `client.ts` — Polygon.io REST client (requires `POLYGON_IO_API_KEY`)
- `charts.service.ts` — fetches 30-minute bars from Polygon.io, handles pagination, filters to regular market hours (09:30–16:00 ET), and resamples to 4h via `m30toh4`
- `charts.utils.ts` — `m30toh4` aggregates 30m bars into 4h candles (8 bars → first candle, 5 bars → second candle per 13-bar trading day); also contains market-hours filters

**`src/features/symbols/symbols.service.ts`**: fetches live S&P 500 tickers from a GitHub CSV and NASDAQ 100 tickers from Wikipedia's API. No static list — always live at runtime.

**`src/features/db/db.service.ts`**: trivial JSON file store (`db.json` in CWD). No locking — reads and writes synchronously per operation.

**`src/features/server/server.ts`**: Express server on port 3000. Two routes:
- `GET /api/list` — returns current signals from `db.json`
- `GET /api/scan` — triggers a background scan (rejects with 400 if already running)

**`src/features/tune/`**: backtest + config sweep used to find FVG parameter sets with the best historical edge. Not part of the live scan path.
- `tune.backtest.ts` — pure `backtest(chart, options)`. Runs `fvg()` and walks forward bar-by-bar after each signal: TP hit first → `win`, SL hit first → `loss`, neither within remaining bars → `open`. On same-bar TP+SL ambiguity, TP wins (optimistic — known bias, inflates EV).
- `tune.service.ts` — fetches each symbol's chart **once** (default 365 days, runner overrides to 5y), then replays every config in memory. Aggregates per-symbol and total `winPct`, `ev` (avg R-multiple per resolved signal, where loss = −1R and win = `tpMult/slMult`R), and `evAllSignals` (open counted as 0R). Results sort by `ev`.
- `tune.runner.ts` — CLI entry. Builds a cartesian grid (default 81 configs: `filterWidth × atrPeriod × tpMult × slMult`), runs the sweep, prints a ranked table, writes `tune_results.json`.

**`src/config.ts`**: single source of all env-derived config with typed defaults. Import `config` from here — never read `process.env` directly elsewhere.

## Key implementation details

- Chart data is fetched as 30-minute bars then resampled: a US trading day has 13 × 30m bars (09:30–16:00), split 8+5 to produce two 4h candles.
- The FVG condition uses a 3-bar window: bull = `low[3] > high[1]` (gap above), bear = `low[1] > high[3]` (gap below), confirmed on the current close crossing back through the gap.
- Signals older than `FVG_SIGNAL_DAYS_DIFF` days (default 5) are treated as no-signal and removed from `db.json`.
- `charts.service.ts` line 18 contains a hardcoded API key in the pagination fetch URL — this is a bug; pagination should use `config.POLYGON_IO_API_KEY` instead.
- `chartsService.get4hChart(symbol, periodDays?)` accepts an optional history window; defaults to `config.CHARTS_PERIOD_DAYS`. The tune runner uses ~5 years.
- Tune EV results should be read skeptically: backtest has same-bar TP+SL bias, survivorship bias (`symbolsService.getAll` returns *today's* index members only), no slippage/fees, and grid-sweep overfitting. Real-system EV is typically +0.1R to +0.5R; anything ≥+1R likely reflects one of those biases. See `docs/TUNE_PLAN.ts` for the original design notes.
