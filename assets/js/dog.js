/* the dog. one pose. he doesn't do other poses.
   dogSVG({ eyes: 'stare' | 'side' | 'lidded', coat, id, x, y, h }) returns an svg string,
   so the same drawing works inline, nested inside scenes, in canvas and in downloads.
   coat swaps his colours for the rest of the pack. x/y/h place him inside a parent svg.
   .dog-tail, .dog-head and .dog-ear-r are groups the scenes can animate. */
(function () {
  const C = {
    ink: '#1b1915',
    coat: '#d9a35f',
    dark: '#7b4a25',
    bib: '#f6ecd6',
    collar: '#c5302a',
    brass: '#d1a33a',
  };
  const COATS = {
    stay: {},
    soot: { coat: '#3a332d', dark: '#1f1a16', bib: '#e9dcc3', collar: '#1d4b8f' },
    snow: { coat: '#f3ecdf', dark: '#b89a74', bib: '#fffaf0', collar: '#4d6a2e' },
    slate: { coat: '#9b958b', dark: '#5c564e', bib: '#ece4d4', collar: '#d1a33a' },
    ginger: { coat: '#cc6d34', dark: '#7a3818', bib: '#f6ecd6', collar: '#1d4b8f' },
  };

  function eyes(kind, K) {
    const L = { x: 168, y: 148 }, R = { x: 236, y: 152 };
    if (kind === 'side') {
      return `<circle cx="${L.x + 7}" cy="${L.y}" r="7" fill="${K.ink}"/><circle cx="${R.x + 7}" cy="${R.y}" r="7" fill="${K.ink}"/>`;
    }
    if (kind === 'lidded') {
      return `<circle cx="${L.x}" cy="${L.y + 2}" r="7" fill="${K.ink}"/><circle cx="${R.x}" cy="${R.y + 2}" r="7" fill="${K.ink}"/>
        <path d="M157 146 L180 146 L180 137 L157 137 Z" fill="${K.coat}"/><path d="M225 150 L248 150 L248 140 L225 140 Z" fill="${K.dark}"/>
        <path d="M157 147 L180 146 M225 151 L248 150" stroke="${K.ink}" stroke-width="4" stroke-linecap="round"/>`;
    }
    return `<circle cx="${L.x}" cy="${L.y}" r="7" fill="${K.ink}"/><circle cx="${R.x}" cy="${R.y}" r="7" fill="${K.ink}"/>`;
  }

  function dogSVG(opts = {}) {
    const id = opts.id || 'd' + Math.random().toString(36).slice(2, 7);
    const K = { ...C, ...(typeof opts.coat === 'string' ? COATS[opts.coat] : opts.coat || {}) };
    const st = (w = 5) => `stroke="${K.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
    const place = opts.h != null
      ? `x="${opts.x || 0}" y="${opts.y || 0}" width="${(opts.h * 400 / 460).toFixed(1)}" height="${opts.h}" overflow="visible"`
      : 'width="400" height="460"';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460" ${place} role="img" aria-label="stay, a dog, sitting. not moving.">
<defs><filter id="w${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></defs>
<g filter="url(#w${id})">
<ellipse cx="200" cy="446" rx="150" ry="10" fill="${K.ink}" opacity=".13"/>
<g class="dog-tail"><path d="M286 428 C 350 432, 376 404, 356 372 C 350 362, 340 366, 344 376 C 354 398, 330 414, 288 410" fill="${K.coat}" ${st()}/></g>
<path d="M150 250 C 120 300, 95 370, 100 430 C 101 442, 115 446, 130 446 L 270 446 C 285 446, 299 442, 300 430 C 305 370, 280 300, 250 250 Z" fill="${K.coat}" ${st()}/>
<path d="M165 258 C 160 300, 170 345, 200 368 C 230 345, 240 300, 235 258 Z" fill="${K.bib}"/>
<path d="M114 384 C 124 352, 152 352, 158 396 M286 384 C 276 352, 248 352, 242 396" fill="none" ${st(4)}/>
<path d="M162 320 C 158 360, 156 400, 158 432 L 190 432 C 191 400, 192 360, 190 330 Z" fill="${K.coat}" ${st()}/>
<path d="M238 320 C 242 360, 244 400, 242 432 L 210 432 C 209 400, 208 360, 210 330 Z" fill="${K.coat}" ${st()}/>
<ellipse cx="171" cy="436" rx="25" ry="12" fill="${K.bib}" ${st()}/><ellipse cx="229" cy="436" rx="25" ry="12" fill="${K.bib}" ${st()}/>
<path d="M164 432 L164 442 M176 432 L176 443 M222 432 L222 443 M234 432 L234 442" ${st(3)}/>
<path d="M148 246 C 174 264, 226 264, 252 246 L 254 264 C 226 284, 174 284, 146 264 Z" fill="${K.collar}" ${st(4.5)}/>
<circle cx="200" cy="280" r="5" fill="none" ${st(3.5)}/>
<path d="M184 286 L 216 286 L 220 302 L 200 316 L 180 302 Z" fill="${K.brass}" ${st(4)}/>
<text x="200" y="302" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="10" fill="${K.ink}">STAY</text>
<g class="dog-head">
<path d="M120 150 C 118 95, 160 78, 200 78 C 240 78, 284 95, 280 150 C 278 210, 245 245, 200 245 C 155 245, 122 210, 120 150 Z" fill="${K.coat}" ${st()}/>
<path d="M214 130 C 222 118, 252 118, 262 134 C 270 150, 262 170, 242 172 C 222 174, 208 150, 214 130 Z" fill="${K.dark}"/>
<path d="M196 80 C 192 66, 186 62, 178 64 M204 80 C 207 64, 214 59, 222 62" fill="none" ${st(4)}/>
<path d="M128 104 C 94 104, 78 160, 90 214 C 95 234, 118 230, 124 212 C 130 182, 140 142, 152 112 Z" fill="${K.dark}" ${st()}/>
<g class="dog-ear-r"><path d="M272 104 C 306 104, 322 160, 310 214 C 305 234, 282 230, 276 212 C 270 182, 260 142, 248 112 Z" fill="${K.dark}" ${st()}/></g>
<ellipse cx="200" cy="200" rx="46" ry="33" fill="${K.bib}" ${st(4)}/>
<path d="M183 180 C 183 171, 217 171, 217 180 C 217 190, 207 196, 200 196 C 193 196, 183 190, 183 180 Z" fill="${K.ink}"/>
<ellipse cx="193" cy="178" rx="5" ry="2.6" fill="#fff" opacity=".7"/>
<path d="M200 196 L200 206 M184 211 Q200 214 216 211" fill="none" ${st(4)}/>
${eyes(opts.eyes, K)}
</g>
</g></svg>`;
  }

  // canvas only gets the club fonts if they're asked for by name first
  window.stayFonts = document.fonts
    ? Promise.all(['44px "Alfa Slab One"', 'bold 30px "Courier Prime"', '50px "Reenie Beanie"'].map((f) => document.fonts.load(f))).catch(() => {})
    : Promise.resolve();

  window.STAY_COLORS = C;
  window.dogSVG = dogSVG;
  window.STAY_COATS = COATS;
  // turns the svg into an <img> so canvas tools can draw it
  window.dogImage = function (opts) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(dogSVG(opts));
    });
  };
})();
