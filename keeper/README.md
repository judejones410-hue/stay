# the keeper.

**fills the bowl. never eats from it.**

A small node script that runs on a timer and, every batch:

```
claim creator fees ──► top up the bone (if < 4%) ──► buy a slice ──► deposit + burn lp
```

It uses pump.fun's own SDKs (`@pump-fun/pump-sdk`, `@pump-fun/pump-swap-sdk`). It **never sells $STAY**.

---

## 01 — what you need

- node 20+
- a **dedicated wallet** for the keeper. It must be the coin's creator wallet, or the wallet the creator fees are routed to, because claiming needs the creator's signature. Keep only working sol in it.
- a paid rpc (helius / triton / quicknode). The public one rate-limits.
- somewhere to run it 24/7 **with https** (railway, render, fly, a vps behind caddy). The site is https, so it can't read an http log.

## 02 — set up

```bash
cd keeper
npm install
cp .env.example .env    # then fill it in
```

| setting | default | what it does |
|---|---|---|
| `KEEPER_SECRET` | — | keeper wallet secret key, base58 |
| `MINT` | — | the $STAY mint |
| `CREATOR` | keeper wallet | who the creator fees belong to |
| `DRY_RUN` | `true` | plans every step, sends nothing |
| `INTERVAL_SEC` | `300` | seconds between batches |
| `MIN_BATCH_SOL` | `0.05` | skip batches smaller than this |
| `SOL_KEEP` | `0.05` | sol always left for network fees |
| `BUY_SHARE` | `0.5` | share of the batch that buys $STAY before pairing |
| `RESERVE_PCT` | `4` | the buried bone, % of supply |
| `REFILL_SHARE` | `0.25` | share of a batch that tops up the bone when it's low |
| `SLIPPAGE` | `1` | max slippage, percent |
| `PORT` | `8787` | serves `/log.json` for the bowl page |

## 03 — the drill (do it in this order)

1. **dry run.** `DRY_RUN=true npm run once`. It reads the pool, works out the claim, buy and deposit, prints what it *would* send, and sends nothing.
2. **small live run.** Put ~0.2 sol in the keeper, set `DRY_RUN=false`, `npm run once`. Check each transaction on solscan: one buy, one deposit + burn.
3. **leave it running.** `npm start`. Point `keeperUrl` in `assets/js/config.js` at `https://<host>/log.json`.

## 04 — guarantees, and what isn't one

- **lp is burned in the same transaction as the deposit.** The deposit asks pumpswap for an exact lp amount, and the burn destroys exactly that. If either fails, both fail.
- **it never sells.** There is no sell call anywhere in `src/`.
- **dry runs never show up as real.** They don't touch the totals or receipts in the public log.
- **not a guarantee:** that fees exist (no trades, no fees), that the host stays up, or anything about price. A deeper pool can mean less slippage. It's not a floor.

## 05 — `/log.json`

```json
{
  "wallet": "…",
  "running": true,
  "dryRun": false,
  "updated": "2026-11-27T18:00:00.000Z",
  "totals": { "feesSol": 0, "solAdded": 0, "stayAdded": 0, "lpBurned": 0, "reserve": 0, "reserveTarget": 0 },
  "adds": [{ "time": "…", "sol": 0.08, "stay": 81234.5, "lp": 2.66, "sig": "…" }]
}
```

---

*stay. sit. good keeper.*
