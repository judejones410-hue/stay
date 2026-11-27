/* reads the keeper's public log and fills the page. shape of /log.json is in keeper/README.md */
(function () {
  const S = window.STAY;
  const $ = (id) => document.getElementById(id);
  const fmt = (n, d = 2) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: d });
  const short = (s) => s.slice(0, 6) + '…' + s.slice(-4);

  if (S.keeperWallet) {
    const a = $('wallet-link');
    a.href = 'https://solscan.io/account/' + S.keeperWallet;
    a.target = '_blank'; a.rel = 'noopener';
    a.removeAttribute('aria-disabled');
  }

  function fill(solPoured) {
    // squashed scale: 0 sol = empty, ~500 sol = brim. it's an illustration, not a measurement.
    const pct = solPoured > 0 ? Math.min(1, Math.log10(1 + solPoured) / Math.log10(501)) : 0;
    const top = 196 - pct * 100;
    $('bowl-water').setAttribute('y', top);
    $('bowl-water').setAttribute('height', 196 - top);
    $('bowl-wave').setAttribute('transform', `translate(0 ${top - 196})`);
    $('bowl-cap').textContent = solPoured > 0 ? `${fmt(solPoured, 3)} sol poured in so far. squashed scale.` : 'empty, for now.';
  }

  function render(log) {
    const t = log.totals || {};
    $('t-fees').textContent = fmt(t.feesSol, 4) + ' sol';
    $('t-sol').textContent = fmt(t.solAdded, 4) + ' sol';
    $('t-stay').textContent = fmt(t.stayAdded, 0);
    $('t-lp').textContent = fmt(t.lpBurned, 2);
    const target = t.reserveTarget || 40000000;
    $('bone-line').textContent = `buried bone: ${fmt(t.reserve, 0)} / ${fmt(target, 0)} $STAY (${fmt((t.reserve || 0) / target * 100, 1)}%)`;
    $('keeper-state').textContent = `keeper: ${log.running ? 'running' : 'paused'}. last checked ${new Date(log.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    if (log.dryRun) $('keeper-state').textContent = 'keeper: practising (dry run). nothing real has been poured yet.';
    fill(t.solAdded || 0);
    const adds = (log.adds || []).slice(0, 20);
    if (!adds.length) return;
    $('rows').innerHTML = adds.map((a) => `<tr>
      <td>${new Date(a.time).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
      <td>${fmt(a.sol, 6)}</td><td>${fmt(a.stay, 2)}</td><td>${fmt(a.lp, 4)}</td>
      <td><a href="https://solscan.io/tx/${a.sig}" target="_blank" rel="noopener">${short(a.sig)} ↗</a></td></tr>`).join('');
  }

  async function load() {
    if (!S.keeperUrl) { fill(0); return; }
    try {
      const r = await fetch(S.keeperUrl, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      render(await r.json());
    } catch (e) {
      $('keeper-state').textContent = "keeper: can't reach the log right now. the receipts are still on-chain.";
    }
  }
  $('refresh').addEventListener('click', () => { load(); window.stayToast('checked the bowl.'); });
  load();
  setInterval(load, 120000);
})();
