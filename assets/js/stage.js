/* commands fly in from the edges, stop short of the dog, and fall over. he doesn't look. */
(function () {
  const stage = document.getElementById('stage');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = ['sell.', 'panic.', 'fetch the bottom.', 'roll over.', 'come here.', 'speak.', 'rent due.', 'heel.', 'beg.', 'play dead.', 'buy the top.', 'get off the couch.'];
  const tones = ['', 'red', '', 'blue', ''];
  let i = 0;

  function fire() {
    if (document.hidden) return;
    const el = document.createElement('div');
    el.className = 'cmd ' + tones[i % tones.length];
    el.textContent = words[i % words.length];
    i++;
    stage.appendChild(el);
    const W = stage.clientWidth, H = stage.clientHeight;
    const fromLeft = Math.random() < .5;
    const y = H * (.12 + Math.random() * .5);
    const ew = el.offsetWidth;
    const x0 = fromLeft ? -ew - 20 : W + 20;
    const x1 = fromLeft ? W * .5 - 150 - ew * .4 : W * .5 + 150 - ew * .6;
    const rot = (Math.random() * 10 - 5);
    el.style.left = '0px'; el.style.top = y + 'px';
    const fall = H - 46 - y;
    const anim = el.animate([
      { transform: `translateX(${x0}px) rotate(${rot}deg)`, opacity: 1 },
      { transform: `translateX(${x1}px) rotate(${rot}deg)`, opacity: 1, offset: .38, easing: 'cubic-bezier(.3,1.6,.6,1)' },
      { transform: `translateX(${x1 + (fromLeft ? -8 : 8)}px) rotate(${rot + (fromLeft ? -10 : 10)}deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${x1 + (fromLeft ? -30 : 30)}px, ${fall}px) rotate(${fromLeft ? -84 : 84}deg)`, opacity: 1, offset: .78, easing: 'cubic-bezier(.5,0,1,.6)' },
      { transform: `translate(${x1 + (fromLeft ? -30 : 30)}px, ${fall}px) rotate(${fromLeft ? -90 : 90}deg)`, opacity: 0 },
    ], { duration: 4200, easing: 'ease-out' });
    anim.onfinish = () => el.remove();
  }
  setTimeout(fire, 500);
  setInterval(fire, 1500);
})();
