/* the yard: a canvas meme maker. one dog, lots of things shouted at him. */
(function () {
  const C = window.STAY_COLORS;
  const cv = document.getElementById('yard');
  const ctx = cv.getContext('2d');
  const W = 1080, H = 1080;
  const $ = (id) => document.getElementById(id);

  const picks = {
    'red candles': { cmds: 'SELL.\nPANIC.\nCUT IT.', top: 'chart is bleeding. everyone has a plan.', bot: 'he has one too.', bg: 'red alert', props: 'candles', stamp: 'stayed.', eyes: 'stare' },
    'rent due': { cmds: 'RENT DUE.\nPAY UP.\nHELLO??', top: 'landlord knocked three times.', bot: 'stay.', bg: 'paper', props: 'none', stamp: 'none', eyes: 'side' },
    'the ex': { cmds: 'u up?\nmiss u\nwe should talk', top: '2am.', bot: 'stay.', bg: 'night', props: 'none', stamp: 'good boy', eyes: 'lidded' },
    'kol call': { cmds: 'COME HERE.\nNEW COIN.\n100X.\nLAST CHANCE.', top: 'a kol said come here.', bot: 'he did not come here.', bg: 'ribbon', props: 'none', stamp: 'stayed.', eyes: 'stare' },
    'monday': { cmds: 'GET UP.\nALARM.\nMEETING.', top: 'monday shouted.', bot: 'stay.', bg: 'paper', props: 'rain', stamp: 'none', eyes: 'lidded' },
    'the bottom': { cmds: 'THIS IS THE\nBOTTOM.\nFETCH!', top: 'someone threw "the bottom".', bot: "he didn't fetch it.", bg: 'lawn', props: 'none', stamp: 'A+', eyes: 'stare' },
    'blank': { cmds: '', top: '', bot: 'stay.', bg: 'paper', props: 'none', stamp: 'none', eyes: 'stare' },
  };
  const bgs = {
    paper: { fill: '#efe5cc', ink: C.ink, lines: 'rgba(29,75,143,.10)' },
    'red alert': { fill: '#c5302a', ink: '#fff4e6', lines: 'rgba(0,0,0,.08)' },
    ribbon: { fill: '#1d4b8f', ink: '#f5efe0', lines: 'rgba(255,255,255,.06)' },
    night: { fill: '#1b1915', ink: '#efe5cc', lines: 'rgba(255,255,255,.04)' },
    lawn: { fill: '#4d6a2e', ink: '#f5efe0', lines: 'rgba(0,0,0,.08)' },
  };
  const eyesList = ['stare', 'side', 'lidded'];
  const propsList = ['none', 'candles', 'rain'];
  const stamps = ['none', 'stayed.', 'good boy', 'A+'];
  const state = { ...picks['red candles'] };
  const dogs = {};

  function choiceRow(id, items, key, label) {
    const row = $(id);
    row.innerHTML = items.map((v) => `<button type="button" data-v="${v}">${label ? label(v) : v}</button>`).join('');
    row.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (key === 'pick') applyPick(b.dataset.v); else { state[key] = b.dataset.v; sync(); }
    });
  }
  choiceRow('y-picks', Object.keys(picks), 'pick');
  choiceRow('y-bg', Object.keys(bgs), 'bg');
  choiceRow('y-eyes', eyesList, 'eyes', (v) => ({ stare: 'blank stare', side: 'side eye', lidded: 'half asleep' }[v]));
  choiceRow('y-props', propsList, 'props', (v) => ({ none: 'clear', candles: 'red candles', rain: 'rain' }[v]));
  choiceRow('y-stamp', stamps, 'stamp');

  function applyPick(name) {
    Object.assign(state, picks[name]); state.pick = name;
    $('y-cmds').value = state.cmds; $('y-top').value = state.top; $('y-bot').value = state.bot;
    sync();
  }
  function sync() {
    [['y-bg', 'bg'], ['y-eyes', 'eyes'], ['y-props', 'props'], ['y-stamp', 'stamp'], ['y-picks', 'pick']].forEach(([id, k]) =>
      $(id).querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === state[k])));
    draw();
  }
  ['y-cmds', 'y-top', 'y-bot'].forEach((id) => $(id).addEventListener('input', () => {
    state.cmds = $('y-cmds').value; state.top = $('y-top').value; state.bot = $('y-bot').value; state.pick = ''; sync();
  }));

  // seeded random so the layout doesn't jump while you type
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }

  function wrapText(text, maxW) {
    const words = text.split(' '); const lines = []; let cur = '';
    words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    return lines;
  }

  function draw() {
    const bg = bgs[state.bg];
    ctx.fillStyle = bg.fill; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = bg.lines; for (let y = 30; y < H; y += 36) ctx.fillRect(0, y, W, 2);

    const r = rng(17);
    if (state.props === 'candles') {
      for (let i = 0; i < 9; i++) {
        const x = 60 + i * 118 + r() * 30, y = 200 + r() * 330, h = 70 + r() * 150;
        ctx.fillStyle = state.bg === 'red alert' ? '#1b1915' : '#c5302a';
        ctx.fillRect(x + 18, y - 26, 4, h + 52); ctx.fillRect(x, y, 40, h);
      }
    }
    if (state.props === 'rain') {
      ctx.strokeStyle = state.bg === 'paper' ? 'rgba(29,75,143,.55)' : 'rgba(255,255,255,.5)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = 0; i < 90; i++) { const x = r() * W, y = 140 + r() * 760; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 34); ctx.stroke(); }
    }

    // ground + dog
    ctx.fillStyle = bg.ink; ctx.fillRect(0, 930, W, 6);
    const dog = dogs[state.eyes];
    if (dog) ctx.drawImage(dog, 330, 440, 420, 483);

    // commands, scattered around him, never on him
    const cmds = (state.cmds || '').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6);
    const slots = [[70, 300], [700, 270], [40, 520], [760, 500], [90, 740], [740, 720]];
    ctx.textBaseline = 'middle';
    cmds.forEach((t, i) => {
      const [x, y] = slots[i]; const rot = (r() - .5) * .22;
      ctx.font = '44px "Alfa Slab One"';
      const w = Math.min(ctx.measureText(t.toUpperCase()).width + 36, 300);
      ctx.save(); ctx.translate(x + (i % 2 ? 300 - w : 0), y); ctx.rotate(rot);
      ctx.fillStyle = C.ink; ctx.fillRect(8, 8, w, 74);
      ctx.fillStyle = i % 3 === 1 ? '#c5302a' : '#f7f0dd'; ctx.fillRect(0, 0, w, 74);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(0, 0, w, 74);
      ctx.fillStyle = i % 3 === 1 ? '#fff4e6' : C.ink;
      ctx.fillText(t.toUpperCase(), 18, 40, w - 36);
      ctx.restore();
    });

    // top line
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'; ctx.fillStyle = bg.ink;
    if (state.top) {
      ctx.font = 'bold 46px "Courier Prime"';
      wrapText(state.top.toLowerCase(), W - 140).slice(0, 2).forEach((l, i) => ctx.fillText(l, W / 2, 110 + i * 56));
    }
    // bottom line
    if (state.bot) {
      ctx.font = '84px "Alfa Slab One"';
      ctx.fillText(state.bot.toLowerCase(), W / 2, 1030, W - 100);
    }
    // stamp
    if (state.stamp !== 'none') {
      ctx.save(); ctx.translate(880, 900); ctx.rotate(-.18);
      ctx.font = '50px "Alfa Slab One"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const label = state.stamp.toUpperCase(); const w = ctx.measureText(label).width + 44;
      const col = state.bg === 'red alert' ? '#f7f0dd' : '#c5302a';
      ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.strokeRect(-w / 2, -42, w, 84);
      ctx.fillStyle = col; ctx.fillText(label, 0, 4);
      ctx.restore();
    }
    // tiny credit
    ctx.textAlign = 'left'; ctx.font = 'bold 20px "Courier Prime"'; ctx.fillStyle = bg.ink; ctx.globalAlpha = .7;
    ctx.fillText('$STAY', 28, 1060); ctx.globalAlpha = 1;
  }

  (window.stayFonts).then(async () => {
    for (const e of eyesList) dogs[e] = await window.dogImage({ eyes: e, id: 'y' + e });
    draw();
  });
  applyPick('red candles');

  $('y-dl').addEventListener('click', () => cv.toBlob((b) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'stay.png'; a.click();
    window.stayToast('saved. now post it.');
  }, 'image/png'));
  $('y-post').addEventListener('click', () => window.stayTweet(`${(state.top || '').toLowerCase()}\n\n${(state.bot || 'stay.').toLowerCase()} $STAY #staying`.trim()));
  $('y-rand').addEventListener('click', () => {
    const names = Object.keys(picks).filter((n) => n !== 'blank' && n !== state.pick);
    applyPick(names[Math.floor(Math.random() * names.length)]);
  });
})();
