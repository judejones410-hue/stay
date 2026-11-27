/* the noticeboard. every panel is drawn here as svg, so there are no image files to manage.
   memes sit still. gifs loop (with a pause). clips wait for play.
   any element with data-wall gets panels: data-limit="8", data-kind="meme|gif|clip", data-feature (first one big). */
(function () {
  const C = window.STAY_COLORS;
  const INK = C.ink, PAPER = '#efe5cc', CARD = '#f7f0dd', RED = '#c5302a', BLUE = '#1d4b8f', BRASS = '#d1a33a', LAWN = '#4d6a2e', WOOD = '#8a5a2b';
  const F = { slab: "'Alfa Slab One', Georgia, serif", type: "'Courier Prime', 'Courier New', monospace", pen: "'Reenie Beanie', cursive" };
  let n = 0;
  const dog = (o) => window.dogSVG({ id: 'w' + (n++), ...o });
  const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-family="${F[o.font || 'type']}" font-size="${o.size || 18}" font-weight="${o.font === 'type' || !o.font ? 700 : 400}" fill="${o.fill || INK}"${o.halo ? ` stroke="${o.halo}" stroke-width="7" paint-order="stroke" stroke-linejoin="round"` : ''}${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>${t}</text>`;
  const ground = (y, c = INK) => `<path d="M-10 ${y} Q 100 ${y - 2} 200 ${y} T 410 ${y}" stroke="${c}" stroke-width="3" fill="none"/>`;
  const bone = (x, y, r = 0, c = '#e9d6b0') => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-12 -3 h24 a5 5 0 1 1 3 6 a5 5 0 1 1 -3 6 h-24 a5 5 0 1 1 -3 -6 a5 5 0 1 1 3 -6 z" transform="translate(0 -3)" fill="${c}" stroke="${INK}" stroke-width="2"/></g>`;

  const scenes = {
    fetch: {
      kind: 'clip', bg: PAPER, cap: 'someone threw the bottom again. he didn\'t fetch it. $STAY',
      svg: () => `${T(200, 54, 'fetch.', { font: 'slab', size: 44 })}
        ${ground(352)}
        ${dog({ x: 205, y: 152, h: 205 })}
        <g class="a-fetch"><rect x="-46" y="-48" width="92" height="20" fill="${CARD}" stroke="${INK}" stroke-width="2"/>${T(0, -34, 'THE BOTTOM', { size: 11 })}
          <g class="a-roll"><circle r="15" fill="${BRASS}" stroke="${INK}" stroke-width="4"/><path d="M-11 -5 Q0 1 11 -5 M-11 5 Q0 -1 11 5" stroke="${INK}" stroke-width="2" fill="none"/></g></g>
        ${T(104, 126, 'didn\'t fetch.', { font: 'pen', size: 40, fill: RED, rot: -6 })}`,
    },
    squirrel: {
      kind: 'meme', bg: LAWN, cap: 'a new coin ran through the park. every dog went after it.',
      svg: () => `${T(200, 54, 'squirrel.', { font: 'slab', size: 44, fill: PAPER })}
        ${ground(360, PAPER)}
        ${dog({ x: 24, y: 165, h: 200 })}
        ${[0, 1, 2, 3, 4, 5].map((i) => `<g transform="translate(${215 + i * 30} ${338 - (i % 2) * 14})" fill="${PAPER}" opacity="${.9 - i * .1}"><ellipse rx="6" ry="7"/><circle cx="-7" cy="-9" r="3"/><circle cx="0" cy="-12" r="3"/><circle cx="7" cy="-9" r="3"/></g>`).join('')}
        <g fill="${CARD}" opacity=".75"><circle cx="352" cy="300" r="22"/><circle cx="380" cy="284" r="26"/><circle cx="372" cy="318" r="18"/><circle cx="398" cy="306" r="20"/></g>
        <path d="M372 210 C 410 170, 420 240, 400 262 C 390 240, 360 250, 372 210 Z" fill="${WOOD}" stroke="${INK}" stroke-width="3"/>
        <rect x="298" y="150" width="92" height="30" fill="${RED}" stroke="${INK}" stroke-width="3" transform="rotate(-6 344 165)"/>${T(344, 171, 'NEW COIN →', { size: 14, fill: '#fff4e6', rot: -6 })}
        ${T(290, 240, 'they all went', { font: 'pen', size: 28, fill: PAPER })}${T(290, 264, 'that way.', { font: 'pen', size: 28, fill: PAPER })}
        ${T(200, 390, 'every dog chased it. one didn\'t.', { size: 16, fill: PAPER })}`,
    },
    goodboy: {
      kind: 'gif', bg: BLUE, cap: 'good boy. even on a red week.',
      svg: () => `${ground(374, PAPER)}
        ${dog({ x: 120, y: 150, h: 230 })}
        <g class="a-pat"><rect x="198" y="-20" width="32" height="160" fill="${RED}" stroke="${INK}" stroke-width="4"/>
          <path d="M190 132 h48 c8 0 10 14 8 26 c-2 16 -14 26 -32 26 c-18 0 -30 -10 -32 -26 c-2 -12 0 -26 8 -26 z" fill="#efc9a1" stroke="${INK}" stroke-width="4"/>
          <path d="M202 160 v18 M214 162 v18 M226 160 v18" stroke="${INK}" stroke-width="2.5"/></g>
        ${T(72, 110, 'good', { font: 'pen', size: 56, fill: PAPER, rot: -8 })}${T(78, 150, 'boy.', { font: 'pen', size: 56, fill: PAPER, rot: -8 })}
        ${T(330, 300, 'pat', { font: 'pen', size: 30, fill: BRASS })}${T(338, 326, 'pat.', { font: 'pen', size: 30, fill: BRASS })}`,
    },
    curriculum: {
      kind: 'meme', bg: PAPER, cap: 'obedience school, term one. five modules. he picked a major.',
      svg: () => `${T(200, 46, 'term one.', { font: 'slab', size: 36 })}
        <rect x="22" y="70" width="236" height="236" fill="#23302a" stroke="${WOOD}" stroke-width="10"/>
        ${['roll over', 'fetch', 'beg', 'play dead'].map((t, i) => `${T(46, 116 + i * 42, t, { font: 'pen', size: 32, fill: '#ece6d6', anchor: 'start' })}<path d="M42 ${108 + i * 42} l${t.length * 11 + 12} ${(i % 2 ? -4 : 4)}" stroke="#ece6d6" stroke-width="3"/>`).join('')}
        ${T(46, 284, 'stay.', { font: 'pen', size: 40, fill: '#fff', anchor: 'start' })}
        <ellipse cx="78" cy="272" rx="50" ry="24" fill="none" stroke="${RED}" stroke-width="4" transform="rotate(-6 78 272)"/>
        ${ground(370)}
        ${dog({ x: 250, y: 196, h: 178 })}
        ${T(200, 394, 'he picked a major.', { size: 17 })}`,
    },
    doorbell: {
      kind: 'clip', bg: INK, cap: 'a listing rumour rang the doorbell. not one bark. $STAY',
      svg: () => `<rect x="28" y="64" width="140" height="300" fill="${WOOD}" stroke="${PAPER}" stroke-width="4"/>
        <rect x="46" y="86" width="104" height="110" fill="none" stroke="${PAPER}" stroke-width="2" opacity=".5"/><rect x="46" y="214" width="104" height="130" fill="none" stroke="${PAPER}" stroke-width="2" opacity=".5"/>
        <circle cx="150" cy="216" r="7" fill="${BRASS}" stroke="${INK}" stroke-width="2"/>
        <g class="a-bell"><path d="M196 98 c0 -14 22 -14 22 0 c10 4 12 18 12 28 l6 8 h-58 l6 -8 c0 -10 2 -24 12 -28 z" fill="${BRASS}" stroke="${PAPER}" stroke-width="3"/><circle cx="207" cy="140" r="5" fill="${BRASS}" stroke="${PAPER}" stroke-width="2"/></g>
        <g class="a-pop">${T(300, 76, 'DING DONG', { font: 'slab', size: 26, fill: PAPER })}
          <rect x="236" y="92" width="134" height="34" fill="${RED}" stroke="${PAPER}" stroke-width="2"/>${T(303, 115, 'NEW LISTING??', { size: 15, fill: '#fff4e6' })}</g>
        ${ground(370, PAPER)}
        ${dog({ x: 205, y: 188, h: 188 })}
        ${T(306, 176, 'no bark.', { font: 'pen', size: 34, fill: BRASS, rot: -4 })}`,
    },
    tail: {
      kind: 'gif', bg: BRASS, cap: 'chart did a 3x. the tail moved. that\'s all you get.',
      svg: () => `${T(200, 40, 'most excitement shown', { size: 18 })}${T(200, 62, 'this cycle:', { size: 18 })}
        ${ground(374)}
        ${dog({ x: 88, y: 118, h: 262 })}
        <path d="M352 140 C 378 190, 370 250, 336 300" stroke="${RED}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M326 288 l10 14 l12 -14" stroke="${RED}" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${T(350, 128, 'this.', { font: 'pen', size: 40, fill: RED })}`,
    },
    treats: {
      kind: 'meme', bg: PAPER, cap: 'every creator fee goes in the bowl. he\'s fine with that.',
      svg: () => `${T(200, 44, 'where the treats go.', { font: 'slab', size: 26 })}
        <g transform="rotate(-38 180 140)"><rect x="132" y="86" width="96" height="116" rx="10" fill="#dfe8ea" stroke="${INK}" stroke-width="4"/><rect x="126" y="74" width="108" height="18" fill="${BRASS}" stroke="${INK}" stroke-width="4"/>
          <rect x="144" y="124" width="72" height="34" fill="${CARD}" stroke="${INK}" stroke-width="2"/>${T(180, 138, 'creator', { size: 12 })}${T(180, 152, 'fees', { size: 12 })}
          ${bone(162, 186, 20)}${bone(196, 180, -15)}</g>
        ${bone(262, 196, 30)}${bone(280, 236, -20)}${bone(300, 276, 50)}
        <path d="M220 316 L 370 316 L 352 366 L 238 366 Z" fill="${BLUE}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M216 316 h158" stroke="${RED}" stroke-width="9"/>
        ${T(295, 350, 'the pool', { size: 15, fill: PAPER })}
        ${ground(370)}
        ${dog({ x: 18, y: 222, h: 150 })}
        ${T(200, 394, 'in the bowl. not in him.', { size: 17 })}`,
    },
    fireworks: {
      kind: 'clip', bg: '#16192b', cap: 'fireworks night on the chart. every other dog went under the bed.',
      svg: () => {
        const burst = (x, y, c, t, d) => `<g class="a-burst" style="animation-delay:${d}s" transform-origin="${x} ${y}">${Array.from({ length: 12 }, (_, i) => {
          const a = i / 12 * Math.PI * 2; return `<path d="M${x + Math.cos(a) * 18} ${y + Math.sin(a) * 18} L${x + Math.cos(a) * 46} ${y + Math.sin(a) * 46}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
        }).join('')}${T(x, y + 7, t, { font: 'slab', size: 18, fill: PAPER })}</g>`;
        return `${burst(96, 96, RED, '−40%', 0)}${burst(300, 80, BRASS, 'ATH', .7)}${burst(200, 150, '#7fb0ff', '10x?', 1.4)}
        <rect x="8" y="296" width="164" height="30" fill="${CARD}" stroke="${INK}" stroke-width="3"/><rect x="8" y="280" width="40" height="20" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <rect x="12" y="326" width="8" height="40" fill="${WOOD}"/><rect x="160" y="326" width="8" height="40" fill="${WOOD}"/>
        ${[['#3a332d', 40], ['#f3ecdf', 84], ['#cc6d34', 128]].map(([c, x]) => `<path d="M${x} 362 C ${x - 4} 348, ${x + 10} 342, ${x + 14} 350" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M${x} 362 C ${x - 4} 348, ${x + 10} 342, ${x + 14} 350" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
        ${T(90, 266, 'every other dog:', { font: 'pen', size: 26, fill: PAPER })}
        ${ground(368, PAPER)}
        ${dog({ x: 212, y: 196, h: 178 })}`;
      },
    },
    rain: {
      kind: 'gif', bg: BLUE, cap: 'it\'s been raining candles all week. still sitting.',
      svg: () => {
        let drops = '';
        for (let i = 0; i < 26; i++) {
          const x = (i * 61) % 390 + 6, y = (i * 137) % 400;
          drops += `<g transform="translate(${x} ${y})"><path d="M3 -6 v26" stroke="${PAPER}" stroke-width="1.5" opacity=".7"/><rect x="0" y="0" width="7" height="14" fill="${RED}" stroke="${INK}" stroke-width="1"/></g>`;
        }
        return `<g class="a-rain"><g>${drops}</g><g transform="translate(0 -400)">${drops}</g></g>
          ${T(200, 54, 'red week.', { font: 'slab', size: 42, fill: PAPER })}
          <ellipse cx="236" cy="376" rx="150" ry="12" fill="#3f6fb4"/>
          ${dog({ x: 140, y: 152, h: 228 })}
          ${T(76, 200, 'still', { font: 'pen', size: 42, fill: PAPER, rot: -6, halo: BLUE })}${T(80, 236, 'sitting.', { font: 'pen', size: 42, fill: PAPER, rot: -6, halo: BLUE })}`;
      },
    },
    walkies: {
      kind: 'meme', bg: RED, cap: 'everyone\'s heading for the exit. he knows where that lead goes.',
      svg: () => `<path d="M0 30 h214 v58 h-170 l-20 18 v-18 h-24 z" fill="${CARD}" stroke="${INK}" stroke-width="3"/>${T(112, 72, 'walkies??', { font: 'slab', size: 32 })}
        <path d="M326 84 v14 q0 14 12 14" stroke="${INK}" stroke-width="5" fill="none"/><circle cx="326" cy="82" r="6" fill="${BRASS}" stroke="${INK}" stroke-width="3"/>
        <path d="M338 112 C 356 160, 300 190, 332 236 C 352 264, 330 286, 318 300" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M338 112 C 356 160, 300 190, 332 236 C 352 264, 330 286, 318 300" stroke="${BLUE}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <rect x="290" y="296" width="62" height="28" fill="${BRASS}" stroke="${INK}" stroke-width="3"/>${T(321, 316, 'EXIT', { size: 15 })}
        <rect x="26" y="190" width="74" height="44" fill="${CARD}" stroke="${INK}" stroke-width="3"/><path d="M100 220 l18 8 l-18 -2" fill="${CARD}" stroke="${INK}" stroke-width="3"/>${T(63, 221, 'no.', { font: 'slab', size: 28 })}
        ${ground(372, CARD)}
        ${dog({ x: 108, y: 172, h: 204 })}
        ${T(200, 394, 'he knows where that lead goes.', { size: 15, fill: '#fff4e6' })}`,
    },
    vet: {
      kind: 'meme', bg: PAPER, cap: 'the vet checked his pulse during the dump. flat. like the chart.',
      svg: () => `<rect x="24" y="66" width="206" height="282" fill="${WOOD}" stroke="${INK}" stroke-width="4"/><rect x="38" y="92" width="178" height="242" fill="${CARD}" stroke="${INK}" stroke-width="2"/>
        <rect x="96" y="56" width="62" height="24" fill="${BRASS}" stroke="${INK}" stroke-width="3"/>
        ${T(48, 120, 'PATIENT: stay.', { size: 14, anchor: 'start' })}
        ${T(48, 154, 'HEART RATE:', { size: 14, anchor: 'start' })}<path d="M48 172 h150" stroke="${RED}" stroke-width="3"/>
        ${T(48, 204, 'CHART:', { size: 14, anchor: 'start' })}<path d="M48 222 h150" stroke="${RED}" stroke-width="3"/>
        ${T(48, 256, 'DIAGNOSIS:', { size: 14, anchor: 'start' })}
        ${T(127, 298, 'very good boy.', { font: 'pen', size: 32, fill: RED, rot: -4 })}
        ${T(316, 54, 'the vet.', { font: 'slab', size: 32 })}
        ${ground(374)}
        ${dog({ x: 238, y: 192, h: 182 })}
        ${T(200, 395, 'pulse flat. chart flat. fine.', { size: 15 })}`,
    },
    rollcall: {
      kind: 'gif', bg: LAWN, cap: 'roll call, 18:00 utc. you\'ll never sit alone.',
      svg: () => {
        const pack = [['soot', 6], ['snow', 80], ['stay', 150], ['slate', 228], ['ginger', 302]];
        return `${T(200, 46, '18:00 utc.', { font: 'slab', size: 34, fill: PAPER })}${T(200, 76, 'roll call.', { font: 'pen', size: 30, fill: BRASS })}
          ${ground(372, PAPER)}
          ${pack.map(([coat, x], i) => {
            const h = coat === 'stay' ? 116 : 100, w = h * 400 / 460, cx = x + w / 2, y = 372 - h * 446 / 460;
            return `${dog({ x, y, h, coat })}<g class="a-bub" style="animation-delay:${i * .45}s" transform-origin="${cx} ${y + 8}"><rect x="${cx - 34}" y="${y - 40}" width="68" height="30" fill="${CARD}" stroke="${INK}" stroke-width="2.5"/><path d="M${cx - 6} ${y - 10} l6 10 l6 -10" fill="${CARD}" stroke="${INK}" stroke-width="2.5"/>${T(cx, y - 19, 'stay.', { font: 'slab', size: 16 })}</g>`;
          }).join('')}
          ${T(200, 396, 'you\'ll never sit alone.', { font: 'pen', size: 30, fill: PAPER })}`;
      },
    },
  };
  const order = ['fetch', 'squirrel', 'goodboy', 'curriculum', 'doorbell', 'tail', 'treats', 'fireworks', 'rain', 'walkies', 'vet', 'rollcall'];

  function sceneSVG(key, attrs = '') {
    const s = scenes[key];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" ${attrs} role="img" aria-label="${s.cap.replace(/"/g, '')}"><rect width="400" height="400" fill="${s.bg}"/>${s.svg()}</svg>`;
  }

  function panel(key, big) {
    const s = scenes[key];
    const ctl = s.kind === 'clip' ? '<button type="button" class="pctl play">▶ play</button>'
      : s.kind === 'gif' ? '<button type="button" class="pctl">pause</button>' : '';
    return `<figure class="pin p-${key}${big ? ' big' : ''}${s.kind === 'gif' ? ' running' : ''}" data-kind="${s.kind}" id="w-${key}">
      <div class="frame">${sceneSVG(key)}</div>
      <figcaption><span><span class="kind">${s.kind}</span>${s.cap}</span>${ctl}</figcaption></figure>`;
  }

  document.querySelectorAll('[data-wall]').forEach((el) => {
    const limit = Number(el.dataset.limit || order.length);
    let keys = order;
    if (el.dataset.kind) keys = keys.filter((k) => scenes[k].kind === el.dataset.kind);
    el.innerHTML = keys.slice(0, limit).map((k, i) => panel(k, el.hasAttribute('data-feature') && i === 0)).join('');
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.pctl'); if (!b) return;
    const fig = b.closest('.pin');
    const on = fig.classList.toggle('running');
    b.textContent = fig.dataset.kind === 'clip' ? (on ? '■ stop' : '▶ play') : (on ? 'pause' : '▶ play');
  });

  window.staySceneSVG = sceneSVG;
  window.STAY_SCENES = order;
})();
