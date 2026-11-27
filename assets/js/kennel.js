/* kennel page: pfp downloads, the papers generator, reply lines */
(function () {
  const C = window.STAY_COLORS;
  const PAPER = '#f7f0dd', INK = C.ink;
  const fontsReady = window.stayFonts;

  function save(canvas, name) {
    canvas.toBlob((b) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }

  /* ---- pfps: the head and collar, cropped square, on four club colours ---- */
  const coats = [
    ['red ribbon', '#c5302a', 'stare'], ['blue ribbon', '#1d4b8f', 'stare'],
    ['brass', '#d1a33a', 'lidded'], ['lawn', '#4d6a2e', 'side'],
  ];
  async function pfp(bg, eyes, size) {
    const img = await window.dogImage({ eyes, id: 'p' + eyes });
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    x.fillStyle = bg; x.fillRect(0, 0, size, size);
    // crop: head + collar sit roughly in the svg box 70..330 x 55..320
    const sx = 66, sy = 50, sw = 268, sh = 268;
    x.drawImage(img, sx, sy, sw, sh, size * .06, size * .1, size * .88, size * .88);
    return c;
  }
  const grid = document.getElementById('pfps');
  if (grid) {
    grid.style.gridTemplateColumns = '';
    grid.classList.add('pfp-grid');
    coats.forEach(async ([name, bg, eyes]) => {
      const card = document.createElement('div');
      card.className = 'icard';
      card.style.minHeight = '0';
      card.innerHTML = `<span class="tab">${name}</span>`;
      const c = await pfp(bg, eyes, 600);
      c.style.width = '100%'; c.style.border = '2px solid ' + INK;
      card.appendChild(c);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tag paper'; b.textContent = 'download ' + name;
      b.addEventListener('click', async () => save(await pfp(bg, eyes, 1000), `stay-pfp-${name.replace(' ', '-')}.png`));
      card.appendChild(b);
      grid.appendChild(card);
    });
  }

  /* ---- papers ---- */
  const cv = document.getElementById('papers-canvas');
  if (cv) {
    const ctx = cv.getContext('2d');
    const f = {
      name: document.getElementById('p-name'),
      num: document.getElementById('p-num'),
      breed: document.getElementById('p-breed'),
      date: document.getElementById('p-date'),
    };
    f.num.value = String(Math.floor(1000 + Math.random() * 8999));
    f.date.value = new Date().toISOString().slice(0, 10);
    let rank = 'good boy';
    document.querySelectorAll('#p-rank button').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('#p-rank button').forEach((o) => o.setAttribute('aria-pressed', o === b));
      rank = b.textContent; draw();
    }));
    let dog;

    function rosette(x, y, r, col, label) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = col;
      [[-.35, 1], [.35, 1]].forEach(([a]) => {
        ctx.save(); ctx.rotate(a);
        ctx.fillRect(-r * .28, r * .4, r * .56, r * 1.5);
        ctx.beginPath(); ctx.moveTo(-r * .28, r * 1.9); ctx.lineTo(0, r * 1.65); ctx.lineTo(r * .28, r * 1.9); ctx.fillStyle = PAPER; ctx.fill();
        ctx.restore(); ctx.fillStyle = col;
      });
      ctx.beginPath();
      for (let i = 0; i < 48; i++) {
        const a = i / 48 * Math.PI * 2, rr = i % 2 ? r : r * .86;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${r * .34}px "Alfa Slab One"`;
      ctx.fillText(label, 0, 2);
      ctx.restore();
    }

    function line(label, value, x, y, w) {
      ctx.font = 'bold 15px "Courier Prime"'; ctx.fillStyle = '#4a443a';
      ctx.fillText(label.toUpperCase(), x, y);
      ctx.font = 'bold 30px "Courier Prime"'; ctx.fillStyle = INK;
      ctx.fillText(value, x, y + 38, w);
      ctx.fillRect(x, y + 50, w, 2);
    }

    function draw() {
      const W = 1200, H = 750;
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
      // ruled lines
      ctx.fillStyle = 'rgba(29,75,143,.10)';
      for (let y = 40; y < H; y += 32) ctx.fillRect(0, y, W, 1);
      // double border
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeRect(22, 22, W - 44, H - 44);
      ctx.lineWidth = 2; ctx.strokeRect(36, 36, W - 72, H - 72);
      // header band
      ctx.fillStyle = INK; ctx.fillRect(36, 36, W - 72, 92);
      ctx.fillStyle = PAPER; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '52px "Alfa Slab One"'; ctx.fillText('the stay kennel club', 68, 100);
      ctx.font = 'bold 16px "Courier Prime"'; ctx.textAlign = 'right';
      ctx.fillText('CERTIFICATE OF REGISTRATION', W - 68, 78);
      ctx.fillStyle = C.brass; ctx.fillText('ONE COMMAND · NO LEADS', W - 68, 102);
      // dog
      if (dog) {
        ctx.fillStyle = 'rgba(197,48,42,.08)'; ctx.fillRect(64, 160, 360, 470);
        ctx.drawImage(dog, 74, 176, 340, 391);
      }
      ctx.textAlign = 'left';
      ctx.font = 'bold 14px "Courier Prime"'; ctx.fillStyle = '#4a443a';
      ctx.fillText('FIG. — THE REGISTERED ANIMAL (PROBABLY)', 70, 612);
      // fields
      const x = 470, w = 640;
      line('registered name', (f.name.value || 'good boy').toLowerCase(), x, 190, w);
      line('registration no.', '#' + (f.num.value || '0001').replace(/\D/g, ''), x, 290, 290);
      line('class', rank, x + 330, 290, 310);
      line('breed', (f.breed.value || 'unknown').toLowerCase(), x, 390, w);
      const d = f.date.value ? new Date(f.date.value + 'T12:00:00') : new Date();
      line('date registered', d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase(), x, 490, 290);
      line('commands known', '1 (stay.)', x + 330, 490, 310);
      // signature
      ctx.font = '50px "Reenie Beanie"'; ctx.fillStyle = C.collar;
      ctx.save(); ctx.translate(x + 10, 650); ctx.rotate(-.04); ctx.fillText('good boy. — the trainer', 0, 0); ctx.restore();
      ctx.fillStyle = INK; ctx.fillRect(x, 664, 380, 2);
      ctx.font = 'bold 13px "Courier Prime"'; ctx.fillStyle = '#4a443a';
      ctx.fillText('SIGNED, ILLEGIBLY. NOBODY CHECKS THESE.', x, 688);
      // rosette
      const rcol = { 'puppy': C.brass, 'good boy': C.collar, 'very good boy': '#1d4b8f', 'best in show': '#4d6a2e' }[rank];
      rosette(1040, 600, 62, rcol, rank === 'best in show' ? 'BEST' : rank === 'puppy' ? 'PUP' : 'GOOD');
    }

    Object.values(f).forEach((el) => el.addEventListener('input', draw));
    fontsReady.then(async () => { dog = await window.dogImage({ eyes: 'stare', id: 'cert' }); draw(); });
    draw();
    document.getElementById('p-dl').addEventListener('click', () => {
      save(cv, `stay-papers-${(f.name.value || 'good-boy').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`);
      document.getElementById('p-status').textContent = 'papers saved. now post them.';
    });
    document.getElementById('p-post').addEventListener('click', () =>
      window.stayTweet(`registered with the stay kennel club. ${(f.name.value || 'good boy').toLowerCase()}, #${f.num.value}, class: ${rank}.\n\nstay.`));
  }

  /* ---- reply lines ---- */
  document.querySelectorAll('#lines button').forEach((b) => b.addEventListener('click', () => {
    window.stayCopy(b.textContent, `copied: ${b.textContent}`);
    document.querySelectorAll('#lines button').forEach((o) => o.classList.toggle('copied', o === b));
  }));
})();
