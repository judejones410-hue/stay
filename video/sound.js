/* the soundtrack, synthesised so there's nothing to license: a little ukulele-ish strum,
   a thud for every command, a record scratch, silence, one soft woof, then the tune comes back.
   window.makeSound({ music, woof }) resolves to a base64 wav. */
(function () {
  const RATE = 44100;
  const N = { C3: 130.81, F2: 87.31, G2: 98, A2: 110, C4: 261.63, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D4: 293.66 };
  const CHORDS = [ // one per bar, a bar is 2 seconds at 120 bpm
    { bass: N.C3 / 2, notes: [N.G4 / 2, N.C4, N.E4, N.C5] }, // C
    { bass: N.F2, notes: [N.A4 / 2, N.C4, N.F4, N.A4] },      // F
    { bass: N.A2, notes: [N.A4 / 2, N.C4, N.E4, N.A4] },      // Am
    { bass: N.G2, notes: [N.G4 / 2, N.B4 / 2, N.D4, N.G4] },  // G
  ];

  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

  window.makeSound = async function ({ music = true, woof = true } = {}) {
    const cues = window.STAY_CUES;
    const ctx = new OfflineAudioContext(2, Math.ceil(cues.dur * RATE), RATE);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10; comp.ratio.value = 4;
    const master = ctx.createGain(); master.gain.value = .5; // headroom, so nothing clips
    comp.connect(master); master.connect(ctx.destination);
    const sfx = ctx.createGain(); sfx.gain.value = .9; sfx.connect(comp);
    const bus = ctx.createGain(); bus.connect(comp);

    const noise = ctx.createBuffer(1, RATE * 2, RATE);
    noise.getChannelData(0).forEach((_, i, d) => { d[i] = rnd(); });
    const noiseAt = (t, dur, dest) => { const s = ctx.createBufferSource(); s.buffer = noise; s.connect(dest); s.start(t, Math.random() * .5, dur); return s; };
    const env = (g, t, peak, attack, decay) => {
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + attack + decay);
    };

    function pluck(t, f, peak, pan) {
      const g = ctx.createGain(), p = ctx.createStereoPanner(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(900, t + .3);
      p.pan.value = pan; g.connect(lp); lp.connect(p); p.connect(bus);
      [['triangle', 1, 1], ['sine', 2, .35], ['square', 1, .06]].forEach(([type, m, v]) => {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f * m; og.gain.value = v;
        o.connect(og); og.connect(g); o.start(t); o.stop(t + .7);
      });
      env(g, t, peak, .004, .42);
    }
    function bass(t, f) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f;
      o.connect(g); g.connect(bus); env(g, t, .55, .01, .45); o.start(t); o.stop(t + .6);
    }
    function hat(t, peak) {
      const hp = ctx.createBiquadFilter(), g = ctx.createGain(); hp.type = 'highpass'; hp.frequency.value = 7000;
      hp.connect(g); g.connect(bus); env(g, t, peak, .002, .04); noiseAt(t, .06, hp);
    }
    function play(from, to, level, busy) {
      for (let bar = 0; from + bar * 2 < to; bar++) {
        const b0 = from + bar * 2, ch = CHORDS[bar % 4];
        [[0, 1], [.5, 1], [.75, -1], [1.25, -1], [1.5, 1], [1.75, -1]].forEach(([off, dir]) => {
          const t = b0 + off; if (t >= to) return;
          const notes = dir > 0 ? ch.notes : [...ch.notes].reverse();
          notes.forEach((f, k) => pluck(t + k * .013, f, (dir > 0 ? .17 : .11) * level, (k - 1.5) * .25));
        });
        [0, 1].forEach((off) => { if (b0 + off < to) bass(b0 + off, ch.bass); });
        for (let h = 0; h < (busy(b0) ? 16 : 8); h++) {
          const t = b0 + h * (busy(b0) ? .125 : .25); if (t < to) hat(t, (h % 2 ? .05 : .09) * level);
        }
      }
    }

    function thud(t, peak = .9) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + .2);
      o.connect(g); g.connect(sfx); env(g, t, peak, .004, .3); o.start(t); o.stop(t + .4);
      const lp = ctx.createBiquadFilter(), ng = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 1600;
      lp.connect(ng); ng.connect(sfx); env(ng, t, peak * .45, .002, .05); noiseAt(t, .08, lp);
    }
    function scratch(t) {
      const bp = ctx.createBiquadFilter(), g = ctx.createGain(); bp.type = 'bandpass'; bp.Q.value = 6;
      bp.frequency.setValueAtTime(2600, t); bp.frequency.exponentialRampToValueAtTime(320, t + .13);
      bp.frequency.exponentialRampToValueAtTime(1700, t + .24); bp.frequency.exponentialRampToValueAtTime(200, t + .36);
      bp.connect(g); g.connect(sfx); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(2.4, t + .02); g.gain.setValueAtTime(2.4, t + .3); g.gain.linearRampToValueAtTime(0, t + .38);
      noiseAt(t, .4, bp);
    }
    function whoosh(t, dur) {
      const bp = ctx.createBiquadFilter(), g = ctx.createGain(); bp.type = 'bandpass'; bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(180, t + dur);
      bp.connect(g); g.connect(sfx); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur);
      noiseAt(t, dur, bp);
    }
    function bark(t) {
      // a soft, low "woof": a falling buzz through two mouth-shaped filters
      const src = ctx.createGain(), lp = ctx.createBiquadFilter(), out = ctx.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = .8;
      src.connect(lp);
      [[480, 2.2, 1], [1150, 3.5, .55], [260, 1.5, .7]].forEach(([f, q, v]) => {
        const bp = ctx.createBiquadFilter(), bg = ctx.createGain(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(f * 1.12, t); bp.frequency.linearRampToValueAtTime(f * .9, t + .22); bp.Q.value = q; bg.gain.value = v;
        lp.connect(bp); bp.connect(bg); bg.connect(out);
      });
      [0, 7].forEach((det) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = det;
        o.frequency.setValueAtTime(200, t); o.frequency.linearRampToValueAtTime(285, t + .045); o.frequency.exponentialRampToValueAtTime(140, t + .26);
        o.connect(src); o.start(t); o.stop(t + .4);
      });
      const breath = ctx.createGain(); breath.gain.value = .35; breath.connect(src); noiseAt(t, .3, breath);
      out.connect(sfx);
      out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.42, t + .018); out.gain.setValueAtTime(.42, t + .07); out.gain.exponentialRampToValueAtTime(.0001, t + .3);
    }

    if (music) {
      bus.gain.setValueAtTime(.9, 0);
      play(0, cues.fall + .02, 1, (b0) => b0 >= 4);
      bus.gain.setValueAtTime(.9, cues.fall); bus.gain.linearRampToValueAtTime(0, cues.fall + .05);
      bus.gain.setValueAtTime(0, cues.end + .1); bus.gain.linearRampToValueAtTime(.75, cues.end + .2);
      bus.gain.setValueAtTime(.75, cues.dur - 1); bus.gain.linearRampToValueAtTime(0, cues.dur - .05);
      play(cues.end + .15, cues.dur, .85, () => false);
    }
    cues.slams.forEach((t) => thud(t));
    scratch(cues.fall);
    whoosh(cues.fall + .1, .9);
    thud(cues.fall + .95, .35); // the pile lands somewhere off screen
    thud(8.7, 1); // he stays.
    if (woof) bark(cues.woof);
    thud(cues.end + .05, .8);

    const buf = await ctx.startRendering();
    return toWavBase64(buf);
  };

  function toWavBase64(buf) {
    const ch = [buf.getChannelData(0), buf.getChannelData(1)], len = buf.length;
    const data = new DataView(new ArrayBuffer(44 + len * 4));
    const str = (o, s) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF'); data.setUint32(4, 36 + len * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
    data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 2, true);
    data.setUint32(24, RATE, true); data.setUint32(28, RATE * 4, true); data.setUint16(32, 4, true); data.setUint16(34, 16, true);
    str(36, 'data'); data.setUint32(40, len * 4, true);
    for (let i = 0; i < len; i++) for (let c = 0; c < 2; c++) data.setInt16(44 + i * 4 + c * 2, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
    const bytes = new Uint8Array(data.buffer);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 32768) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768));
    return btoa(bin);
  }
})();
