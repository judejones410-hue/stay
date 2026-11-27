/* commands fly in from the edges, stop short of the dog, and fall over. he doesn't look.
   each command comes from whichever side has room for it, so nothing gets cut in half. */
(function () {
  const stage = document.getElementById('stage');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = ['sell.', 'panic.', 'fetch the bottom.', 'roll over.', 'come here.', 'speak.', 'rent due.', 'heel.', 'beg.', 'play dead.', 'buy the top.', 'get off the couch.'];
  const tones = ['', 'red', '', 'blue', ''];
  let i = 0, side = 0;

  function fire() {
    if (document.hidden) return;
    const el = document.createElement('div');
    el.className = 'cmd ' + tones[i % tones.length];
    el.textContent = words[i % words.length];
    i++;
    el.style.visibility = 'hidden';
    stage.appendChild(el);

    const W = stage.clientWidth, H = stage.clientHeight;
    const sr = stage.getBoundingClientRect(), dr = stage.querySelector('.dog').getBoundingClientRect();
    const gap = dr.width * .1; // the svg has a little air around him
    const roomL = dr.left - sr.left + gap - 6;
    const roomR = W - (dr.right - sr.left - gap) - 6;

    // shrink the label until it fits on at least one side
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.offsetWidth > Math.max(roomL, roomR) && size > 11) { size -= 1; el.style.fontSize = size + 'px'; }
    const ew = el.offsetWidth;
    let fromLeft = side++ % 2 === 0;
    if (fromLeft && ew > roomL) fromLeft = false;
    if (!fromLeft && ew > roomR) fromLeft = true;

    const y = H * (.12 + Math.random() * .45);
    const x0 = fromLeft ? -ew - 20 : W + 20;
    const x1 = fromLeft ? Math.max(4, roomL - ew) : W - roomR;
    const rot = (Math.random() * 8 - 4);
    const fall = H - 40 - y;
    const out = fromLeft ? -1 : 1;
    el.style.left = '0px'; el.style.top = y + 'px'; el.style.visibility = '';
    const anim = el.animate([
      { transform: `translateX(${x0}px) rotate(${rot}deg)` },
      { transform: `translateX(${x1}px) rotate(${rot}deg)`, offset: .38, easing: 'cubic-bezier(.3,1.6,.6,1)' },
      { transform: `translateX(${x1 + out * 6}px) rotate(${rot + out * 10}deg)`, offset: .5 },
      { transform: `translate(${x1 + out * 24}px, ${fall}px) rotate(${out * 84}deg)`, offset: .78, easing: 'cubic-bezier(.5,0,1,.6)' },
      { transform: `translate(${x1 + out * 24}px, ${fall}px) rotate(${out * 90}deg)`, opacity: 0 },
    ], { duration: 4200, easing: 'ease-out' });
    anim.onfinish = () => el.remove();
  }
  setTimeout(fire, 500);
  setInterval(fire, 1500);
})();
