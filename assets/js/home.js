/* home page: the pack and the room illustrations */
(function () {
  const C = window.STAY_COLORS;
  const INK = C.ink, CARD = '#f7f0dd', RED = '#c5302a', BLUE = '#1d4b8f', BRASS = '#d1a33a', PAPER = '#efe5cc';
  let n = 0;
  const dog = (o) => window.dogSVG({ id: 'h' + (n++), ...o });
  const T = (x, y, t, size = 16, font = 'Courier Prime', fill = INK, extra = '') =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="'${font}'" font-size="${size}" font-weight="${font === 'Courier Prime' ? 700 : 400}" fill="${fill}" ${extra}>${t}</text>`;

  /* the pack: nine dogs on one line. tap one and it wags. */
  const pack = document.getElementById('pack-svg');
  if (pack) {
    const line = [['snow', 'stare'], ['soot', 'side'], ['ginger', 'lidded'], ['slate', 'stare'], ['stay', 'stare'], ['slate', 'side'], ['ginger', 'stare'], ['soot', 'lidded'], ['snow', 'side']];
    pack.innerHTML = `<path d="M0 292 Q 300 289 600 292 T 1200 292" stroke="${INK}" stroke-width="4" fill="none"/>` +
      line.map(([coat, eyes], i) => {
        const h = i === 4 ? 270 : 232, x = 6 + i * 122 - (i === 4 ? 12 : 0);
        return dog({ coat, eyes, x, y: 292 - h * 446 / 460, h });
      }).join('');
    // on a phone, zoom in on the middle five so they're not ants
    const fit = () => pack.setAttribute('viewBox', matchMedia('(max-width: 640px)').matches ? '240 0 724 300' : '0 0 1200 300');
    fit(); addEventListener('resize', fit);
    pack.querySelectorAll(':scope > svg').forEach((s, i) => s.addEventListener('click', () => {
      s.classList.add('wag'); setTimeout(() => s.classList.remove('wag'), 1400);
      window.stayToast(i === 4 ? 'stay.' : 'stay. (said back)');
    }));
  }

  /* room illustrations, 300 × 200 */
  const art = {
    wall: () => ['fetch', 'rollcall', 'rain'].map((k, i) => `<g transform="rotate(${[-4, 2, -2][i]} ${55 + i * 96} 100)">
        <rect x="${8 + i * 96}" y="${44 + (i % 2) * 8}" width="94" height="94" fill="${CARD}" stroke="${INK}" stroke-width="2"/>
        ${window.staySceneSVG(k, `x="${12 + i * 96}" y="${48 + (i % 2) * 8}" width="86" height="86"`)}
        <circle cx="${55 + i * 96}" cy="${44 + (i % 2) * 8}" r="6" fill="${[RED, BLUE, BRASS][i]}" stroke="${INK}" stroke-width="2"/></g>`).join(''),
    bowl: () => `${dog({ x: 14, y: 20, h: 176 })}
        <path d="M168 136 L 292 136 L 278 188 L 182 188 Z" fill="${BLUE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M164 136 h132" stroke="${RED}" stroke-width="9"/>
        ${T(230, 172, 'the pool', 13, 'Courier Prime', PAPER)}${T(232, 90, 'fees go in.', 30, 'Reenie Beanie', RED)}`,
    kennel: () => `${dog({ x: 40, y: 12, h: 184 })}
        <g transform="translate(232 84)">
        <rect x="-26" y="34" width="18" height="62" fill="${RED}" stroke="${INK}" stroke-width="3" transform="rotate(14)"/><rect x="8" y="34" width="18" height="62" fill="${RED}" stroke="${INK}" stroke-width="3" transform="rotate(-14)"/>
        <path d="${Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2, r = i % 2 ? 44 : 38; return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join(' ')} Z" fill="${RED}" stroke="${INK}" stroke-width="3"/>
        <circle r="26" fill="${CARD}" stroke="${INK}" stroke-width="3"/>${T(0, 6, 'GOOD', 15, 'Alfa Slab One')}</g>`,
    yard: () => `${dog({ x: 144, y: 24, h: 172 })}
        <g transform="rotate(-6 70 70)"><rect x="12" y="52" width="118" height="34" fill="${RED}" stroke="${INK}" stroke-width="3"/>${T(71, 77, 'RENT DUE.', 18, 'Alfa Slab One', '#fff4e6')}</g>
        <g transform="rotate(5 70 140)"><rect x="24" y="124" width="92" height="32" fill="${CARD}" stroke="${INK}" stroke-width="3"/>${T(70, 148, 'MONDAY.', 17, 'Alfa Slab One')}</g>`,
    papers: () => `<rect x="20" y="22" width="260" height="166" fill="${CARD}" stroke="${INK}" stroke-width="4"/><rect x="28" y="30" width="244" height="150" fill="none" stroke="${INK}" stroke-width="1.5"/>
        <rect x="28" y="30" width="244" height="28" fill="${INK}"/>${T(150, 50, 'the stay kennel club', 15, 'Alfa Slab One', PAPER)}
        ${dog({ x: 34, y: 64, h: 112 })}
        ${[86, 112, 138].map((y) => `<path d="M140 ${y} h110" stroke="${INK}" stroke-width="2"/>`).join('')}
        ${T(196, 82, 'good boy', 16, 'Courier Prime')}${T(196, 164, 'good boy. — the trainer', 18, 'Reenie Beanie', RED)}`,
    manual: () => `<rect x="94" y="10" width="128" height="182" fill="${RED}" stroke="${INK}" stroke-width="4"/><rect x="94" y="10" width="16" height="182" fill="#9e2520" stroke="${INK}" stroke-width="4"/>
        ${T(166, 74, 'STAY.', 32, 'Alfa Slab One', PAPER)}${T(166, 100, 'the training', 12, 'Courier Prime', PAPER)}${T(166, 116, 'manual', 12, 'Courier Prime', PAPER)}
        <path d="M150 140 h32 l4 14 l-20 12 l-20 -12 z" fill="${BRASS}" stroke="${INK}" stroke-width="3"/>
        ${T(250, 60, '8 chapters.', 24, 'Reenie Beanie', INK, 'transform="rotate(8 250 60)"')}`,
    adopt: () => `${dog({ x: 64, y: 4, h: 176 })}
        <path d="M44 112 L 66 96 L 236 96 L 258 112 Z" fill="#b68751" stroke="${INK}" stroke-width="3"/>
        <rect x="44" y="112" width="214" height="82" fill="#c99a5e" stroke="${INK}" stroke-width="4"/>
        ${T(151, 150, 'ADOPT ME', 22, 'Alfa Slab One')}${T(151, 178, 'one command. house trained.', 18, 'Reenie Beanie', RED)}`,
    x: () => `<rect x="94" y="6" width="112" height="190" rx="14" fill="${INK}"/><rect x="102" y="24" width="96" height="156" fill="${CARD}"/>
        ${[['stay.', 44], ['stay.', 84], ['stay.', 124], ['stay.', 164]].map(([t, y], i) => `<rect x="${i % 2 ? 130 : 108}" y="${y - 20}" width="62" height="26" fill="${i % 2 ? BRASS : PAPER}" stroke="${INK}" stroke-width="2"/>${T(i % 2 ? 161 : 139, y - 2, t, 14, 'Alfa Slab One')}`).join('')}
        ${T(252, 70, '18:00', 26, 'Reenie Beanie', RED)}${T(252, 96, 'utc.', 26, 'Reenie Beanie', RED)}`,
    github: () => `<rect x="14" y="20" width="168" height="164" fill="${INK}"/>
        ${['claim()', 'buy()', 'pour()', 'burn(lp)', '// never sell()'].map((t, i) => `<text x="28" y="${54 + i * 28}" font-family="'Courier Prime'" font-weight="700" font-size="16" fill="${i === 4 ? BRASS : PAPER}">${t}</text>`).join('')}
        ${dog({ x: 178, y: 50, h: 146, eyes: 'side' })}`,
  };
  document.querySelectorAll('[data-room-art]').forEach((el) => {
    el.innerHTML = `<svg viewBox="0 0 300 200" aria-hidden="true">${art[el.dataset.roomArt]()}</svg>`;
  });
})();
