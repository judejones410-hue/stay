// the keeper. every INTERVAL_SEC it runs one batch:
//   claim creator fees → top up the bone if low → buy a slice → pour into the pool → burn the lp.
// it never sells $STAY. everything it does lands in data/log.json, which the bowl page reads.
import 'dotenv/config';
import http from 'node:http';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { Chain } from './chain.js';
import { Log } from './log.js';

const env = (k, d) => (process.env[k] ?? '') === '' ? d : process.env[k];
const cfg = {
  rpc: env('RPC_URL', 'https://api.mainnet-beta.solana.com'),
  secret: env('KEEPER_SECRET'),
  mint: env('MINT'),
  creator: env('CREATOR'),
  dryRun: env('DRY_RUN', 'true') !== 'false',
  intervalSec: Number(env('INTERVAL_SEC', 300)),
  minBatchSol: Number(env('MIN_BATCH_SOL', 0.05)),
  solKeep: Number(env('SOL_KEEP', 0.05)),
  buyShare: Number(env('BUY_SHARE', 0.5)),
  reservePct: Number(env('RESERVE_PCT', 4)),
  refillShare: Number(env('REFILL_SHARE', 0.25)),
  slippage: Number(env('SLIPPAGE', 1)),
  port: Number(env('PORT', 8787)),
  logFile: env('LOG_FILE', 'data/log.json'),
};

if (!cfg.secret || !cfg.mint) {
  console.error('set KEEPER_SECRET and MINT in .env (see .env.example).');
  process.exit(1);
}

const keeper = Keypair.fromSecretKey(bs58.decode(cfg.secret));
const chain = new Chain({
  connection: new Connection(cfg.rpc, 'confirmed'),
  keeper,
  mint: new PublicKey(cfg.mint),
  creator: new PublicKey(cfg.creator || keeper.publicKey),
  slippage: cfg.slippage,
  dryRun: cfg.dryRun,
});
const log = new Log(cfg.logFile, { wallet: keeper.publicKey.toBase58(), dryRun: cfg.dryRun });

const sol = (lamports) => Number(lamports) / LAMPORTS_PER_SOL;
const lamports = (s) => BigInt(Math.floor(s * LAMPORTS_PER_SOL));
let running = false;

async function batch() {
  if (running) return;
  running = true;
  const say = (...a) => console.log(new Date().toISOString(), ...a);
  try {
    // 1. claim
    const claimed = await chain.claimCreatorFees();
    if (claimed > 0n) { say(`claimed ${sol(claimed)} sol`); log.addFees(sol(claimed)); }

    // what we can spend this batch
    const balance = await chain.solBalance();
    let spend = balance - lamports(cfg.solKeep);
    if (spend < lamports(cfg.minBatchSol)) { say(`nothing to pour (${sol(balance)} sol in wallet)`); return; }

    // 2. the buried bone. everything the keeper holds between batches is the reserve.
    const supply = await chain.supply();
    const target = (supply * BigInt(Math.round(cfg.reservePct * 100))) / 10000n;
    let reserve = await chain.tokenBalance();
    if (reserve < target) {
      const refill = (spend * BigInt(Math.round(cfg.refillShare * 1000))) / 1000n;
      const got = await chain.buy(refill);
      reserve += got.tokens;
      spend -= refill;
      say(`bone top-up: ${sol(refill)} sol → ${got.tokens} raw $STAY`);
      log.addRefill(got.tokens, got.sig);
    }

    // 3. buy the slice that gets paired
    const before = await chain.tokenBalance();
    const buySol = (spend * BigInt(Math.round(cfg.buyShare * 1000))) / 1000n;
    const bought = await chain.buy(buySol);
    const pairTokens = cfg.dryRun ? bought.tokens : (await chain.tokenBalance()) - before;
    const pairSol = spend - buySol;
    say(`bought ${pairTokens} raw $STAY with ${sol(buySol)} sol`);

    // 4 + 5. pour both in, burn every lp token the keeper holds (they all came from its own adds)
    const add = await chain.addAndBurn(pairTokens, pairSol);
    say(`poured ${sol(add.sol)} sol + ${add.tokens} raw $STAY, burned ${add.lp} lp · ${add.sig}`);
    log.addPour({ sol: sol(add.sol), stay: chain.ui(add.tokens), lp: chain.uiLp(add.lp), sig: add.sig });
    log.setReserve(chain.ui(await chain.tokenBalance().catch(() => reserve)), chain.ui(target));
  } catch (e) {
    console.error('batch failed:', e?.message || e);
    log.error(String(e?.message || e));
  } finally {
    log.save();
    running = false;
  }
}

// public, read-only log for the bowl page
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  if (req.url.startsWith('/log.json')) {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(log.public()));
  }
  res.statusCode = 404; res.end('stay.');
}).listen(cfg.port, () => console.log(`log on :${cfg.port}/log.json`));

console.log(`keeper ${keeper.publicKey.toBase58()} · mint ${cfg.mint} · ${cfg.dryRun ? 'DRY RUN (sends nothing)' : 'LIVE'}`);
await batch();
if (process.argv.includes('--once')) process.exit(0);
setInterval(batch, cfg.intervalSec * 1000);
