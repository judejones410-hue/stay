/* shared bits: header, footer, roll call clock, copy buttons, links from config */
(function () {
  const S = window.STAY;
  const page = document.body.dataset.page || '';
  const pages = [
    ['home', 'index.html', '01'],
    ['the bowl', 'bowl.html', '02'],
    ['kennel club', 'kennel.html', '03'],
    ['the yard', 'yard.html', '04'],
    ['manual', 'manual.html', '05'],
    ['adopt', 'adopt.html', '06'],
  ];

  const head = document.querySelector('[data-header]');
  if (head) {
    head.className = 'top';
    head.innerHTML = `
      <div class="wrap bar">
        <a class="logo" href="index.html" aria-label="stay. home">stay<i>.</i></a>
        <div class="right">
          <a class="rollchip" href="kennel.html#roll-call"><span>roll call in </span><b data-roll-short>--</b></a>
          <a class="tag ticker" href="adopt.html">${S.ticker}</a>
        </div>
      </div>
      <nav class="wrap" aria-label="pages"><ul class="nav">${pages.map(([n, h, k]) =>
        `<li><a href="${h}"${h.startsWith(page) && page ? ' aria-current="page"' : ''}><small>${k}</small>${n}</a></li>`).join('')}
      </ul></nav>`;
  }

  const foot = document.querySelector('[data-footer]');
  if (foot) {
    foot.className = 'foot';
    foot.innerHTML = `
      <div class="wrap">
        <div class="cols">
          <div>
            <div class="logo">stay<i style="color:var(--brass);font-style:normal">.</i></div>
            <p class="muted" style="color:#b9ad94;max-width:36ch;margin-top:12px">a dog with one command. the market keeps shouting. he keeps sitting.</p>
          </div>
          <div><h4>the school</h4><ul>${pages.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul></div>
          <div><h4>off the lead</h4><ul>
            <li><a ${link(S.ca && 'https://pump.fun/coin/' + S.ca)}>pump.fun</a></li>
            <li><a ${link(S.ca && 'https://dexscreener.com/solana/' + S.ca)}>dexscreener</a></li>
            <li><a ${link(S.x)}>x / twitter</a></li>
            <li><a ${link(S.github)}>github (the keeper's code)</a></li>
          </ul></div>
        </div>
        <div class="fine"><span>stay. is a meme about a dog. it isn't financial advice and it isn't a promise. you can lose everything you put in.</span><span>no dogs were asked to move in the making of this site.</span></div>
      </div>`;
  }

  function link(url) {
    return url ? `href="${url}" target="_blank" rel="noopener"` : `href="adopt.html" title="at launch"`;
  }

  /* any element with data-link="pump|dex|x|github" gets its href from config, or goes quiet */
  const urls = {
    pump: S.ca && 'https://pump.fun/coin/' + S.ca,
    dex: S.ca && 'https://dexscreener.com/solana/' + S.ca,
    x: S.x,
    github: S.github,
    site: S.site,
  };
  document.querySelectorAll('[data-link]').forEach((a) => {
    const u = urls[a.dataset.link];
    if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; }
    else {
      a.setAttribute('aria-disabled', 'true');
      a.removeAttribute('href');
      const l = a.querySelector('[data-label]');
      if (l) l.textContent += ' · at launch';
    }
  });

  document.querySelectorAll('[data-ca]').forEach((el) => {
    el.textContent = S.ca || 'not out yet. this is the only place it will be posted.';
  });

  /* toast */
  let toastEl;
  window.stayToast = function (msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('on'), 1800);
  };
  window.stayCopy = async function (text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (_) {}
      t.remove();
    }
    window.stayToast(msg || 'copied. stay.');
  };
  document.querySelectorAll('[data-copy-ca]').forEach((b) => b.addEventListener('click', () => {
    if (!S.ca) return window.stayToast('no address yet. sit tight.');
    window.stayCopy(S.ca, 'address copied. good.');
  }));

  /* x intent */
  window.stayTweet = function (text) {
    window.open('https://x.com/intent/post?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };
  document.querySelectorAll('[data-say]').forEach((b) => b.addEventListener('click', () => window.stayTweet(b.dataset.say)));

  /* roll call clock */
  function nextRoll(now) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), S.rollCallUTC, 0, 0));
    const end = new Date(d.getTime() + S.rollCallMinutes * 60000);
    if (now >= d && now < end) return { live: true, start: d, end };
    if (now >= end) d.setUTCDate(d.getUTCDate() + 1);
    return { live: false, start: d, end: new Date(d.getTime() + S.rollCallMinutes * 60000) };
  }
  window.stayNextRoll = nextRoll;
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const now = new Date();
    const r = nextRoll(now);
    const ms = r.live ? r.end - now : r.start - now;
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    document.querySelectorAll('[data-roll-short]').forEach((el) => { el.textContent = r.live ? 'now. sit.' : `${h}h ${pad(m)}m`; });
    document.querySelectorAll('[data-roll-clock]').forEach((el) => {
      el.innerHTML = r.live ? `now<span>.</span>` : `${pad(h)}<span>:</span>${pad(m)}<span>:</span>${pad(s)}`;
    });
    document.querySelectorAll('[data-roll-local]').forEach((el) => {
      const opt = { hour: '2-digit', minute: '2-digit' };
      el.textContent = `${r.start.toLocaleTimeString([], opt)}–${r.end.toLocaleTimeString([], opt)} where you are`;
    });
  }
  tick(); setInterval(tick, 1000);

  /* calendar file, built on the spot */
  document.querySelectorAll('[data-ics]').forEach((b) => b.addEventListener('click', () => {
    const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const r = nextRoll(new Date());
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//stay//roll call//EN', 'BEGIN:VEVENT',
      'UID:roll-call@stay', 'DTSTAMP:' + z(new Date()), 'DTSTART:' + z(r.start), 'DTEND:' + z(r.end),
      'RRULE:FREQ=DAILY', 'SUMMARY:roll call. stay.', 'DESCRIPTION:post "stay." on x. ten minutes. then carry on.',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'stay-roll-call.ics';
    a.click();
  }));

  /* inline dogs */
  document.querySelectorAll('[data-dog]').forEach((el) => {
    el.innerHTML = window.dogSVG({ eyes: el.dataset.dog || 'stare' });
  });
})();
