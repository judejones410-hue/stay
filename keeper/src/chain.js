// everything that touches solana lives here. uses pump.fun's own sdks.
import { ComputeBudgetProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, getMint, createBurnInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { OnlinePumpAmmSdk, PumpAmmSdk, canonicalPumpPoolPda, lpMintAta } from '@pump-fun/pump-swap-sdk';
import { OnlinePumpSdk } from '@pump-fun/pump-sdk';

const PRIORITY_MICROLAMPORTS = Number(process.env.PRIORITY_MICROLAMPORTS || 50_000);
const MIN_CLAIM_LAMPORTS = 1_000_000n; // 0.001 sol: below this a claim costs more than it's worth

export class Chain {
  constructor({ connection, keeper, mint, creator, slippage, dryRun }) {
    Object.assign(this, { connection, keeper, mint, creator, slippage, dryRun });
    this.amm = new PumpAmmSdk();
    this.onlineAmm = new OnlinePumpAmmSdk(connection);
    this.onlinePump = new OnlinePumpSdk(connection);
    this.poolKey = canonicalPumpPoolPda(mint);
    this.decimals = 6;
    this.lpDecimals = 9;
    this.ready = this.init();
  }

  async init() {
    const info = await this.connection.getAccountInfo(this.mint);
    if (!info) throw new Error('mint not found: ' + this.mint.toBase58());
    this.tokenProgram = info.owner; // pump.fun coins can be spl-token or token-2022
    this.decimals = (await getMint(this.connection, this.mint, 'confirmed', this.tokenProgram)).decimals;
    if (!this.keeper.publicKey.equals(this.creator)) {
      console.warn('CREATOR is not the keeper wallet. claiming needs the creator to sign, so claims will fail unless fees are routed to the keeper.');
    }
  }

  ui(raw) { return Number(raw) / 10 ** this.decimals; }
  uiLp(raw) { return Number(raw) / 10 ** this.lpDecimals; }

  async send(ixs, label) {
    if (this.dryRun) { console.log(`  [dry run] would send ${label} (${ixs.length} instructions)`); return 'dry-run'; }
    const tx = new Transaction().add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_MICROLAMPORTS }), ...ixs);
    return sendAndConfirmTransaction(this.connection, tx, [this.keeper], { commitment: 'confirmed' });
  }

  async solBalance() {
    return BigInt(await this.connection.getBalance(this.keeper.publicKey, 'confirmed'));
  }

  async tokenBalance() {
    await this.ready;
    const ata = getAssociatedTokenAddressSync(this.mint, this.keeper.publicKey, false, this.tokenProgram);
    try { return BigInt((await this.connection.getTokenAccountBalance(ata, 'confirmed')).value.amount); }
    catch { return 0n; }
  }

  async supply() {
    return BigInt((await this.connection.getTokenSupply(this.mint, 'confirmed')).value.amount);
  }

  // 1. claim creator fees from the bonding curve vault and the pumpswap vault
  async claimCreatorFees() {
    const bal = BigInt((await this.onlinePump.getCreatorVaultBalanceBothPrograms(this.creator)).toString());
    if (bal < MIN_CLAIM_LAMPORTS) return 0n;
    const ixs = await this.onlinePump.collectCoinCreatorFeeInstructions(this.creator, this.keeper.publicKey);
    await this.send(ixs, 'claim');
    return bal;
  }

  // buy $STAY with `lamports` of sol on the canonical pumpswap pool. returns raw tokens received.
  async buy(lamports) {
    await this.ready;
    if (lamports <= 0n) return { tokens: 0n, sig: null };
    const state = await this.onlineAmm.swapSolanaState(this.poolKey, this.keeper.publicKey);
    const before = await this.tokenBalance();
    const ixs = await this.amm.buyQuoteInput(state, new BN(lamports.toString()), this.slippage);
    const sig = await this.send(ixs, 'buy');
    if (this.dryRun) {
      // constant-product estimate, fees ignored. good enough for a plan.
      const b = BigInt(state.poolBaseAmount.toString()), q = BigInt(state.poolQuoteAmount.toString());
      return { tokens: (b * lamports) / (q + lamports), sig };
    }
    return { tokens: (await this.tokenBalance()) - before, sig };
  }

  // 4 + 5. deposit tokens + sol into the pool and burn the exact lp minted, in one transaction.
  // if the deposit fails, the burn fails with it. there's never a moment where the lp sits unburned.
  async addAndBurn(tokens, lamports) {
    await this.ready;
    const st = await this.onlineAmm.liquiditySolanaState(this.poolKey, this.keeper.publicKey);
    let r = this.amm.depositBaseInput(st, new BN(tokens.toString()), this.slippage);
    let base = tokens, quote = BigInt(r.quote.toString());
    if (BigInt(r.maxQuote.toString()) > lamports) {
      // not enough sol for all the tokens: size the add by sol instead and keep the extra tokens for next time
      const usable = (lamports * 1000n) / BigInt(Math.round(1000 * (1 + this.slippage / 100)));
      r = this.amm.depositQuoteInput(st, new BN(usable.toString()), this.slippage);
      base = BigInt(r.base.toString()); quote = usable;
    }
    const lp = BigInt(r.lpToken.toString());
    if (lp === 0n) throw new Error('deposit would mint 0 lp');

    const lpMint = st.pool.lpMint;
    this.lpDecimals = (await getMint(this.connection, lpMint, 'confirmed', TOKEN_2022_PROGRAM_ID).catch(() => ({ decimals: this.lpDecimals }))).decimals;
    const deposit = await this.amm.depositInstructionsInternal(st, r.lpToken, r.maxBase, r.maxQuote);
    const burn = createBurnInstruction(lpMintAta(lpMint, this.keeper.publicKey), lpMint, this.keeper.publicKey, lp, [], TOKEN_2022_PROGRAM_ID);
    const sig = await this.send([...deposit, burn], 'deposit + burn lp');
    return { sol: quote, tokens: base, lp, sig };
  }
}
