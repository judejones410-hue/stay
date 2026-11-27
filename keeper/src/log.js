// the keeper's public record. the bowl page reads public() through /log.json.
// dry runs never touch the totals or receipts, so the site can't show practice as real.
import fs from 'node:fs';
import path from 'node:path';

export class Log {
  constructor(file, { wallet, dryRun }) {
    this.file = file;
    this.dryRun = dryRun;
    const empty = { wallet, totals: { feesSol: 0, solAdded: 0, stayAdded: 0, lpBurned: 0, reserve: 0, reserveTarget: 0 }, adds: [], refills: [], errors: [] };
    try { this.data = { ...empty, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
    catch { this.data = empty; }
    this.data.wallet = wallet;
  }

  addFees(sol) { if (!this.dryRun) this.data.totals.feesSol += sol; }

  addRefill(rawTokens, sig) {
    if (this.dryRun) return;
    this.data.refills.unshift({ time: new Date().toISOString(), raw: rawTokens.toString(), sig });
    this.data.refills = this.data.refills.slice(0, 200);
  }

  addPour({ sol, stay, lp, sig }) {
    if (this.dryRun) { this.data.lastPlan = { time: new Date().toISOString(), sol, stay, lp }; return; }
    const t = this.data.totals;
    t.solAdded += sol; t.stayAdded += stay; t.lpBurned += lp;
    this.data.adds.unshift({ time: new Date().toISOString(), sol, stay, lp, sig });
    this.data.adds = this.data.adds.slice(0, 500);
  }

  setReserve(reserve, target) { if (!this.dryRun) Object.assign(this.data.totals, { reserve, reserveTarget: target }); }

  error(msg) {
    this.data.errors.unshift({ time: new Date().toISOString(), msg: msg.slice(0, 300) });
    this.data.errors = this.data.errors.slice(0, 20);
  }

  save() {
    this.data.updated = new Date().toISOString();
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  public() {
    const { wallet, totals, adds, updated } = this.data;
    return { wallet, running: true, dryRun: this.dryRun, updated: updated || new Date().toISOString(), totals, adds: adds.slice(0, 50) };
  }
}
