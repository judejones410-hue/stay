/* commands get shouted at the dog. each one lands whole inside the box, so you can always read it,
   wobbles, then tips over and falls. he doesn't look. */
(function () {
  const stage = document.getElementById('stage');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = ['sell.', 'panic.', 'fetch the bottom.', 'roll over.', 'come here.', 'speak.', 'rent due.', 'heel.', 'beg.', 'play dead.', 'buy the top.', 'get off the couch.'];
  const tones = ['', 'red', '', 'blue', ''];
  const live = []; // boxes of words still on screen, so new ones don't land on top of them
  let i = 0;

  const overlaps = (a, b) => a.x < b.x + b.w + 6 && b.x < a.x + a.w + 6 && a.y < b.y + b.h + 6 && b.y < a.y + a.h + 6;

  function spot(ew, eh) {
    const W = stage.clientWidth;
    const sr = stage.getBoundingClientRect(), dr = stage.querySelector('.dog').getBoundingClientRect();
    const pad = dr.width * .1; // the svg has a little air around him
    const dog = { x: dr.left - sr.left + pad, y: dr.top - sr.top + pad * .6, w: dr.width - pad * 2, h: dr.height - pad };
    const zones = [
      { x0: 6, x1: dog.x - ew - 8, y0: 20, y1: dog.y + dog.h * .7 - eh },          // left of him
      { x0: dog.x + dog.w + 8, x1: W - ew - 6, y0: 20, y1: dog.y + dog.h * .7 - eh }, // right of him
      { x0: 6, x1: W - ew - 6, y0: 10, y1: dog.y - eh - 8 },                         // above him
    ].filter((z) => z.x1 >= z.x0 && z.y1 >= z.y0);
    const notes = [...stage.querySelectorAll('.note')].map((n) => { const b = n.getBoundingClientRect(); return { x: b.left - sr.left, y: b.top - sr.top, w: b.width, h: b.height }; });
    for (let t = 0; t < 14 && zones.length; t++) {
      const z = zones[Math.floor(Math.random() * zones.length)];
      const r = { x: z.x0 + Math.random() * (z.x1 - z.x0), y: z.y0 + Math.random() * (z.y1 - z.y0), w: ew, h: eh };
      if (![...live, ...notes, dog].some((o) => overlaps(o, r))) return r;
    }
    return null;
  }

  function fire() {
    if (document.hidden || live.length >= 3) return;
    const el = document.createElement('div');
    el.className = 'cmd ' + tones[i % tones.length];
    el.textContent = words[i % words.length];
    el.style.visibility = 'hidden';
    stage.appendChild(el);

    let r = null;
    for (let size = parseFloat(getComputedStyle(el).fontSize); size >= 12 && !r; size -= 2) {
      el.style.fontSize = size + 'px';
      r = spot(el.offsetWidth, el.offsetHeight);
    }
    if (!r) { el.remove(); return; } // no clear spot right now. try the next one.
    i++;
    live.push(r);
    el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.visibility = '';

    const rot = Math.random() * 8 - 4, dir = Math.random() < .5 ? -1 : 1;
    const fall = stage.clientHeight - 30 - r.y - r.h;
    const anim = el.animate([
      { transform: `scale(1.9) rotate(${rot * 3}deg)`, opacity: 0 },
      { transform: `scale(.94) rotate(${rot}deg)`, opacity: 1, offset: .07 },
      { transform: `scale(1) rotate(${rot}deg)`, opacity: 1, offset: .11 },
      { transform: `scale(1) rotate(${rot}deg)`, opacity: 1, offset: .62 },
      { transform: `scale(1) rotate(${rot + dir * 12}deg)`, opacity: 1, offset: .7, easing: 'cubic-bezier(.5,0,1,.6)' },
      { transform: `translateY(${fall}px) rotate(${dir * 84}deg)`, opacity: 1, offset: .9 },
      { transform: `translateY(${fall}px) rotate(${dir * 90}deg)`, opacity: 0 },
    ], { duration: 3600, easing: 'ease-out' });
    setTimeout(() => live.splice(live.indexOf(r), 1), 2300); // its spot frees up once it starts falling
    anim.onfinish = () => el.remove();
  }
  setTimeout(fire, 400);
  setInterval(fire, 1100);
})();
