// Soul Keznit Remake · sonido (efectos sintetizados, música chiptune propia y ambiente de cada acto)
(function (root) {
  'use strict';
  let ctx = null, master, sfxBus, musBus, musFilter, ambBus, revIn, noiseBuf, deathBuf = null, pulse25 = null, pulse12 = null;
  const vol = { music: 0.6, sfx: 0.8 };
  let original = false, origEl = null, cur = null, wantSong = null, wantAmb = null, amb = null, intensity = 0;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ctx.destination);
    // reverberación: sala grande y oscura (el abismo)
    const rev = ctx.createConvolver();
    rev.buffer = impulse(2.6, 2.4);
    const revLp = ctx.createBiquadFilter(); revLp.type = 'lowpass'; revLp.frequency.value = 3200;
    revIn = ctx.createGain(); revIn.gain.value = 1;
    revIn.connect(revLp); revLp.connect(rev); rev.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    const sfxRev = ctx.createGain(); sfxRev.gain.value = 0.16; sfxBus.connect(sfxRev); sfxRev.connect(revIn);
    // la música pasa por un filtro para poder "ahogarla" (muertes, pausas, golpes)
    musFilter = ctx.createBiquadFilter(); musFilter.type = 'lowpass'; musFilter.frequency.value = 20000; musFilter.Q.value = 0.8;
    musBus = ctx.createGain(); musBus.connect(musFilter); musFilter.connect(master);
    ambBus = ctx.createGain(); ambBus.connect(master);
    const ambRev = ctx.createGain(); ambRev.gain.value = 0.3; ambBus.connect(ambRev); ambRev.connect(revIn);
    setVolumes(vol.music, vol.sfx);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    pulse25 = pulseWave(0.25); pulse12 = pulseWave(0.125);
    fetch('assets/death.wav').then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { deathBuf = b; }).catch(() => {});
    if (wantSong) play(wantSong, true);
    if (wantAmb) ambience(wantAmb, true);
  }
  function impulse(sec, decay) {
    const n = Math.round(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay) * (i < 200 ? i / 200 : 1);
    }
    return b;
  }
  // onda de pulso (como las de las consolas de 8 bits)
  function pulseWave(duty) {
    const N = 32, re = new Float32Array(N), im = new Float32Array(N);
    for (let k = 1; k < N; k++) { re[k] = (1 / (k * Math.PI)) * Math.sin(2 * Math.PI * k * duty); im[k] = (1 / (k * Math.PI)) * (1 - Math.cos(2 * Math.PI * k * duty)); }
    return ctx.createPeriodicWave(re, im);
  }
  const setWave = (o, type) => { if (type === 'pulse25') o.setPeriodicWave(pulse25); else if (type === 'pulse12') o.setPeriodicWave(pulse12); else o.type = type; };

  function setVolumes(m, s) {
    vol.music = m; vol.sfx = s;
    if (musBus) musBus.gain.value = m * 0.5;
    if (ambBus) ambBus.gain.value = Math.max(m, s * 0.6) * 0.55;
    if (sfxBus) sfxBus.gain.value = s * 0.6;
    if (origEl) origEl.volume = Math.min(1, m * 0.55);
  }

  // ---------- efectos ----------
  function tone(f, dur, type = 'square', v = 0.2, f2 = null, when = 0, bus = sfxBus) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    setWave(o, type); o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, v = 0.2, freq = 1200, type = 'lowpass', when = 0, bus = sfxBus, f2 = null, q = 1) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  // soplido que crece y se corta (entradas, embestidas)
  function swell(dur, v, f1, f2, when = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.4;
    f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0008, t); g.gain.exponentialRampToValueAtTime(v, t + dur * 0.85); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function boom(v = 0.5, f = 110, dur = 0.9, when = 0) {
    tone(f, dur, 'sine', v, 28, when);
    noise(dur * 0.5, v * 0.5, 300, 'lowpass', when, sfxBus, 40);
  }
  const arp = (notes, step, type, v, when = 0) => notes.forEach((f, i) => tone(f, step * 1.6, type, v, null, when + i * step));
  const chord = (notes, dur, type, v, when = 0) => notes.forEach((f) => { tone(f, dur, type, v, null, when); tone(f * 1.006, dur, type, v * 0.6, null, when); });

  const SFX = {
    jump: () => { tone(330, 0.11, 'pulse25', 0.1, 660); },
    walljump: () => { tone(280, 0.12, 'pulse25', 0.1, 760); noise(0.06, 0.1, 3000, 'highpass'); },
    land: () => { noise(0.07, 0.14, 700); tone(90, 0.06, 'sine', 0.12, 50); },
    bonk: () => tone(160, 0.07, 'square', 0.08, 90),
    death: () => {
      if (deathBuf && ctx) {
        const s = ctx.createBufferSource(), g = ctx.createGain();
        s.buffer = deathBuf; g.gain.value = 0.55; s.connect(g); g.connect(sfxBus); s.start();
      } else { tone(440, 0.5, 'square', 0.14, 55); }
      noise(0.3, 0.16, 900, 'lowpass', 0, sfxBus, 120);
      tone(70, 0.4, 'sine', 0.25, 30);
      duck(0.9, 380);
    },
    respawn: () => { tone(220, 0.18, 'triangle', 0.08, 660); swell(0.22, 0.05, 400, 2400); },
    levelStart: () => { swell(0.5, 0.12, 250, 3200); chord([330, 494, 659], 0.9, 'triangle', 0.05, 0.42); tone(1319, 0.5, 'sine', 0.05, null, 0.46); tone(80, 0.5, 'sine', 0.25, 35, 0.42); },
    start: () => { boom(0.55, 120, 1.2); chord([220, 262, 330, 440], 1.6, 'sawtooth', 0.035); arp([440, 523, 659, 880], 0.07, 'pulse25', 0.07, 0.05); noise(0.8, 0.12, 5000, 'highpass', 0, sfxBus, 800); },
    actSting: () => { boom(0.5, 90, 1.6); chord([110, 131, 165, 220], 2.2, 'sawtooth', 0.03, 0.05); tone(880, 1.4, 'sine', 0.04, 870, 0.3); noise(1.6, 0.06, 900, 'bandpass', 0, sfxBus, 200); },
    bossIntro: () => {
      boom(0.6, 80, 2); tone(55, 2.2, 'sawtooth', 0.1, 41);
      for (let i = 0; i < 4; i++) { tone(620, 0.3, 'sawtooth', 0.05, 470, i * 0.4); tone(470, 0.2, 'sawtooth', 0.04, 620, i * 0.4 + 0.2); }
      noise(2.2, 0.12, 120, 'lowpass', 0.2);
    },
    key: () => arp([660, 880, 1320, 1760], 0.055, 'triangle', 0.14),
    check: () => { arp([523, 784, 1047], 0.07, 'pulse25', 0.08); tone(1568, 0.6, 'sine', 0.05, null, 0.2); },
    door: () => { noise(0.45, 0.14, 300, 'bandpass', 0, sfxBus, 1800); tone(110, 0.4, 'triangle', 0.14, 70); },
    flag: () => { arp([523, 659, 784, 1047, 1319], 0.07, 'pulse25', 0.09); arp([262, 392], 0.14, 'triangle', 0.14); tone(1568, 0.8, 'sine', 0.05, null, 0.35); },
    tramp: () => tone(180, 0.24, 'triangle', 0.18, 980),
    port: () => { tone(1400, 0.22, 'sine', 0.12, 180); tone(200, 0.22, 'sine', 0.1, 1400, 0.12); },
    crack: () => noise(0.08, 0.08, 2500, 'highpass'),
    break: () => noise(0.25, 0.16, 500, 'bandpass', 0, sfxBus, 150),
    toggle: () => { tone(900, 0.04, 'square', 0.06); tone(600, 0.05, 'square', 0.06, null, 0.04); },
    frag: () => { arp([1319, 1568, 2093, 2637, 3136], 0.06, 'sine', 0.12); chord([523, 659, 784], 1.4, 'triangle', 0.03, 0.2); },
    blip: () => tone(190 + Math.random() * 40, 0.035, 'square', 0.035),
    talk: () => tone(300 + Math.random() * 60, 0.04, 'triangle', 0.06),
    move: () => tone(660, 0.04, 'pulse25', 0.06),
    select: () => { tone(880, 0.06, 'pulse25', 0.08); tone(1320, 0.1, 'pulse25', 0.07, null, 0.05); },
    back: () => tone(440, 0.07, 'square', 0.06, 330),
    tele: () => { tone(200, 0.7, 'sawtooth', 0.05, 1200); noise(0.7, 0.05, 400, 'bandpass', 0, sfxBus, 3000); },
    burst: () => { noise(0.25, 0.16, 2000, 'bandpass'); tone(900, 0.2, 'square', 0.05, 200); tone(120, 0.25, 'sine', 0.2, 50); },
    bossHit: () => { noise(0.6, 0.3, 400, 'lowpass', 0, sfxBus, 60); tone(90, 0.6, 'square', 0.16, 40); boom(0.5, 100, 1); arp([784, 659, 523], 0.08, 'square', 0.06, 0.1); duck(0.7, 500); },
    bossDown: () => { noise(1.6, 0.3, 800, 'lowpass', 0, sfxBus, 40); tone(120, 1.5, 'sawtooth', 0.12, 30); boom(0.6, 70, 2); },
    brake: () => {
      // palanca: golpe metálico, carraca y chispazo
      tone(140, 0.12, 'square', 0.14, 70); noise(0.1, 0.2, 3500, 'highpass');
      for (let i = 0; i < 5; i++) noise(0.03, 0.1, 5000, 'bandpass', 0.06 + i * 0.05, sfxBus, null, 4);
      arp([392, 523, 659, 784], 0.06, 'pulse25', 0.1, 0.1);
    },
    charge: () => tone(520, 0.08, 'pulse25', 0.05, 540),
    chargeHi: () => { tone(880, 0.1, 'pulse25', 0.07); tone(1760, 0.08, 'sine', 0.04); },
    ready: () => { arp([659, 988, 1319, 1976], 0.05, 'pulse25', 0.1); tone(2637, 0.7, 'sine', 0.05, null, 0.2); noise(0.3, 0.06, 6000, 'highpass', 0.15); },
    wake: () => { tone(50, 1.2, 'sawtooth', 0.14, 220); noise(1, 0.2, 200, 'lowpass', 0, sfxBus, 1200); SFX.roar(); },
    chains: () => { for (let i = 0; i < 6; i++) noise(0.06, 0.1, 4000, 'highpass', i * 0.09); },
    rumble: () => noise(1.2, 0.2, 120, 'lowpass'),
    roar: () => { noise(1.1, 0.28, 320, 'lowpass', 0, sfxBus, 70); tone(72, 1.0, 'sawtooth', 0.15, 42); tone(146, 0.8, 'square', 0.05, 60, 0.08); tone(110, 0.9, 'sawtooth', 0.06, 55, 0.04); },
    dash: () => { swell(0.25, 0.2, 400, 2600); noise(0.35, 0.18, 1600, 'bandpass', 0.2, sfxBus, 300); tone(320, 0.3, 'sawtooth', 0.08, 80, 0.2); },
    aim: () => { tone(500, 0.5, 'square', 0.05, 1500); tone(1000, 0.5, 'square', 0.03, 3000); },
    slam: () => { noise(0.22, 0.22, 260, 'lowpass'); tone(70, 0.25, 'sine', 0.25, 35); noise(0.08, 0.1, 2500, 'highpass'); },
    shard: () => { noise(0.12, 0.1, 2800, 'highpass'); tone(700, 0.08, 'square', 0.04, 300); tone(100, 0.12, 'sine', 0.12, 45); },
    whistle: () => tone(1900, 0.6, 'sine', 0.035, 700),
    shatter: () => { noise(1.4, 0.34, 3200, 'highpass', 0, sfxBus, 400); noise(1.8, 0.3, 700, 'lowpass', 0, sfxBus, 35); arp([1568, 1175, 880, 659, 440, 330], 0.06, 'square', 0.08); boom(0.6, 80, 1.8); },
    souls: () => arp([523, 659, 784, 1047, 1319, 1568, 2093], 0.11, 'sine', 0.07),
    slamTitle: () => { noise(0.6, 0.3, 500, 'lowpass', 0, sfxBus, 40); tone(55, 0.9, 'square', 0.16, 30); boom(0.5, 90, 1.4); },
    surrender: () => { tone(220, 0.3, 'square', 0.08, 110); },
    alarm: () => { for (let i = 0; i < 2; i++) { tone(740, 0.22, 'sawtooth', 0.05, 740, i * 0.5); tone(554, 0.22, 'sawtooth', 0.05, 554, i * 0.5 + 0.25); } },
    lavaUp: () => { noise(0.5, 0.12, 150, 'lowpass', 0, sfxBus, 60); tone(60, 0.4, 'sine', 0.12, 40); },
  };
  // la música se "ahoga" un momento (filtro que baja y vuelve a abrirse)
  function duck(depth = 0.8, low = 500) {
    if (!ctx || !musFilter) return;
    const t = ctx.currentTime, f = musFilter.frequency;
    f.cancelScheduledValues(t); f.setValueAtTime(f.value, t);
    f.exponentialRampToValueAtTime(low, t + 0.04);
    f.exponentialRampToValueAtTime(20000, t + 0.3 + depth);
  }

  // ---------- música ----------
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const hz = (n) => {
    const m = /^([A-G][#b]?)(\d)$/.exec(n);
    if (!m) return 0;
    return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  };
  const chordNotes = (root, q, oct) => {
    const base = NOTE[root] + (oct + 1) * 12;
    const third = q === 'm' ? 3 : 4;
    return [base, base + third, base + 7].map(m => 440 * Math.pow(2, (m - 69) / 12));
  };

  // Batería: una línea por pieza (x = golpe)
  const KITS = {
    none: {},
    soft: { k: 'x.......x.......' },
    softB: { k: 'x.......x.......', s: '............x...', h: '....x.......x...' },
    a1: { k: 'x.......x.......', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    a1B: { k: 'x.....x.x.......', s: '....x.......x..x', h: 'xxxxxxxxxxxxxxxx' },
    a2: { k: 'x...x...x...x...', s: '....x.......x...', h: '.x.x.x.x.x.x.x.x' },
    a2B: { k: 'x..x..x.x..x..x.', s: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', o: '..x...x...x...x.' },
    a3: { k: 'x.x...xxx.x...x.', s: '....x.......x...', h: 'x.xxx.xxx.xxx.xx' },
    a3B: { k: 'x..xx..xx..xx..x', s: '....x..x....x.xx', o: '..x...x...x...x.', h: 'x...x...x...x...' },
    boss: { k: 'xx..x.x.xx..x...', s: '....x.......x...', h: 'x.xxx.xxx.xxx.xx' },
    bossB: { k: 'x.x.x.x.x.x.x.x.', s: '....x..x....x.xx', h: 'xxxxxxxxxxxxxxxx', o: '..x...x...x...x.' },
    final: { k: 'x.......x.......', h: '..x...x...x...x.' },
    finalB: { k: 'x.......x.......', s: '............x...', h: 'x.x.x.x.x.x.x.x.' },
  };

  // Cada canción: secciones (A, B...) con acordes (uno por compás) y melodía (16 pasos por compás)
  const SONGS = {
    menu: {
      bpm: 76, lead: 'triangle', bass: 'tri', delay: 3, pad: 0.035,
      form: [
        { chords: ['A m', 'F M', 'C M', 'E M'], arp: 'bell', bassMode: 'long', kit: 'none',
          lead: ['E5 - - - - - - - D5 - - - C5 - - -', 'A4 - - - - - - - . . . . . . . .', 'G4 - - - C5 - - - E5 - - - D5 - - -', 'B4 - - - - - - - G#4 - - - - - - -'] },
        { chords: ['D m', 'A m', 'F M', 'E M'], arp: 'bell', bassMode: 'long', kit: 'soft',
          lead: ['A4 - - - - - - - C5 - - - D5 - - -', 'E5 - - - - - - - . . . . . . . .', 'F5 - - - E5 - - - C5 - - - A4 - - -', 'G#4 - - - - - - - B4 - - - - - - -'] },
      ],
    },
    // Acto I · la llegada: frío, eco, vacío
    acto1: {
      bpm: 124, lead: 'pulse25', bass: 'tri', delay: 3, pad: 0.02,
      form: [
        { chords: ['A m', 'F M', 'C M', 'G M', 'A m', 'F M', 'C M', 'G M'], arp: 'fast', bassMode: 'drive', kit: 'a1',
          lead: [
            'E5 - - - D5 - C5 - D5 - E5 - - - A4 -', 'C5 - - - A4 - C5 - D5 - C5 - A4 - - -',
            'G4 - - - C5 - E5 - G5 - - - E5 - D5 -', 'D5 - - - B4 - G4 - B4 - D5 - - - . .',
            'E5 - - - A5 - G5 - E5 - D5 - C5 - - -', 'A4 - C5 - F5 - - - E5 - D5 - C5 - - -',
            'E5 - - - G5 - E5 - C5 - D5 - E5 - - -', 'D5 - - - - - B4 - D5 - - - . . . .',
          ] },
        { chords: ['D m', 'A m', 'E M', 'A m', 'F M', 'G M', 'E M', 'E M'], arp: 'fast', bassMode: 'eighths', kit: 'a1B',
          lead: [
            'D5 - F5 - A5 - - - G5 - F5 - E5 - D5 -', 'C5 - - - E5 - A5 - - - G5 - E5 - C5 -',
            'B4 - - - G#4 - B4 - E5 - - - D5 - B4 -', 'A4 - - - - - - - C5 - E5 - A5 - - -',
            'A5 - - - G5 - F5 - C5 - - - F5 - A5 -', 'B5 - - - A5 - G5 - D5 - - - G5 - B5 -',
            'G#5 - - - - - - - E5 - - - B4 - - -', 'E5 - D5 - C5 - B4 - G#4 - - - . . . .',
          ] },
      ],
    },
    // Acto II · las pruebas: mecánico, como un reloj
    acto2: {
      bpm: 132, lead: 'square', bass: 'tri', delay: 2, pad: 0.018, arpWave: 'pulse12',
      form: [
        { chords: ['D m', 'C M', 'Bb M', 'C M', 'D m', 'C M', 'Bb M', 'A M'], arp: 'fast', bassMode: 'pulse', kit: 'a2',
          lead: [
            'A4 - D5 - F5 - - - E5 - D5 - C5 - D5 -', 'E5 - - - C5 - - - G4 - - - . . . .',
            'F5 - - - D5 - Bb4 - D5 - F5 - G5 - F5 -', 'E5 - - - - - - - C5 - D5 - E5 - - -',
            'D5 - F5 - A5 - - - G5 - F5 - E5 - D5 -', 'C5 - E5 - G5 - - - F5 - E5 - C5 - - -',
            'D5 - - - Bb4 - D5 - F5 - - - E5 - D5 -', 'C#5 - - - - - - - E5 - - - A5 - - -',
          ] },
        { chords: ['Bb M', 'F M', 'G m', 'D m', 'Bb M', 'C M', 'A M', 'A M'], arp: 'fast', bassMode: 'eighths', kit: 'a2B',
          lead: [
            'D5 - F5 - Bb5 - - - A5 - F5 - D5 - - -', 'C5 - - - F5 - - - A5 - G5 - F5 - C5 -',
            'D5 - - - G5 - Bb5 - A5 - G5 - D5 - - -', 'F5 - - - E5 - D5 - A4 - - - D5 - F5 -',
            'Bb5 - - - A5 - F5 - D5 - F5 - Bb5 - - -', 'C6 - - - Bb5 - G5 - E5 - G5 - C6 - - -',
            'C#6 - - - A5 - E5 - C#5 - E5 - A5 - - -', 'A5 - - - - - - - . . . . E5 - C#5 -',
          ] },
      ],
    },
    // Acto III · el procesado: industrial, lava, prisa
    acto3: {
      bpm: 144, lead: 'square', bass: 'saw', delay: 3, pad: 0,
      form: [
        { chords: ['E m', 'F M', 'E m', 'D M', 'E m', 'F M', 'G M', 'F M'], arp: 'fast', bassMode: 'eighths', kit: 'a3',
          lead: [
            'B4 - - - E5 - - - F5 - E5 - D5 - E5 -', 'F5 - - - A5 - - - G5 - F5 - E5 - - -',
            'B4 - - - E5 - G5 - B5 - - - A5 - G5 -', 'F#5 - - - D5 - - - A4 - - - . . . .',
            'E5 - - - B5 - - - A5 - G5 - F5 - E5 -', 'F5 - - - C5 - - - A4 - C5 - F5 - - -',
            'G5 - - - D5 - - - B4 - D5 - G5 - A5 -', 'A5 - - - - - - - G5 - F5 - E5 - - -',
          ] },
        { chords: ['C M', 'D M', 'E m', 'E m', 'C M', 'D M', 'B M', 'B M'], arp: 'fast', bassMode: 'sixteenths', kit: 'a3B',
          lead: [
            'E5 - G5 - C6 - - - B5 - G5 - E5 - G5 -', 'F#5 - A5 - D6 - - - C6 - A5 - F#5 - A5 -',
            'G5 - - - B5 - - - E6 - - - D6 - B5 -', 'E6 - - - D6 - B5 - G5 - E5 - B4 - - -',
            'C6 - B5 - A5 - G5 - E5 - - - G5 - C6 -', 'D6 - C6 - B5 - A5 - F#5 - - - A5 - D6 -',
            'D#6 - - - B5 - - - F#5 - - - D#5 - - -', 'B5 - - - - - - - D#5 - F#5 - B5 - - -',
          ] },
      ],
    },
    // La Trituradora: 150 pulsos por minuto; el jefe ataca a este ritmo
    boss: {
      bpm: 150, lead: 'square', bass: 'saw', delay: 3, pad: 0, layered: true,
      form: [
        { chords: ['E m', 'E m', 'C M', 'D M', 'E m', 'E m', 'C M', 'B M'], arp: 'fast', bassMode: 'sixteenths', kit: 'boss',
          lead: [
            'E5 - E5 - G5 - E5 - B5 - - - A5 - G5 -', 'F#5 - - - E5 - - - D5 - E5 - - - . .',
            'G5 - - - E5 - C5 - E5 - G5 - C6 - - -', 'A5 - - - F#5 - D5 - F#5 - A5 - D6 - - -',
            'E5 - E5 - G5 - E5 - B5 - - - A5 - G5 -', 'B5 - - - A5 - G5 - F#5 - G5 - A5 - - -',
            'C6 - - - B5 - G5 - E5 - G5 - C6 - - -', 'B5 - - - - - - - D#5 - F#5 - B5 - - -',
          ] },
        { chords: ['A m', 'C M', 'E m', 'B M', 'A m', 'C M', 'D M', 'B M'], arp: 'fast', bassMode: 'sixteenths', kit: 'bossB',
          lead: [
            'A5 - A5 - C6 - A5 - E5 - - - A5 - C6 -', 'G5 - - - E5 - G5 - C6 - - - B5 - G5 -',
            'E5 - G5 - B5 - E6 - D6 - B5 - G5 - E5 -', 'F#5 - - - D#5 - F#5 - B5 - - - A5 - F#5 -',
            'A5 - C6 - E6 - - - D6 - C6 - B5 - A5 -', 'G5 - - - C6 - - - E6 - D6 - C6 - G5 -',
            'F#5 - A5 - D6 - - - C6 - A5 - F#5 - D5 -', 'D#5 - - - F#5 - - - A5 - - - B5 - - -',
          ] },
      ],
    },
    final: {
      bpm: 88, lead: 'triangle', bass: 'tri', delay: 3, pad: 0.03,
      form: [
        { chords: ['C M', 'G M', 'A m', 'F M', 'C M', 'G M', 'F M', 'G M'], arp: 'slow', bassMode: 'long', kit: 'final',
          lead: [
            'E5 - - - G5 - - - C6 - - - B5 - G5 -', 'D5 - - - - - - - G5 - - - F5 - D5 -',
            'C5 - - - E5 - - - A5 - - - G5 - E5 -', 'F5 - - - - - - - A4 - C5 - F5 - - -',
            'E5 - - - G5 - - - C6 - - - D6 - E6 -', 'D6 - - - B5 - - - G5 - - - . . . .',
            'A5 - - - F5 - - - C5 - - - D5 - E5 -', 'D5 - - - - - - - . . . . . . . .',
          ] },
        { chords: ['F M', 'G M', 'E m', 'A m', 'F M', 'G M', 'C M', 'C M'], arp: 'slow', bassMode: 'long', kit: 'finalB',
          lead: [
            'A5 - - - C6 - - - F5 - - - A5 - - -', 'B5 - - - D6 - - - G5 - - - B5 - - -',
            'G5 - - - E5 - - - B4 - - - E5 - - -', 'C6 - - - B5 - A5 - E5 - - - . . . .',
            'A5 - - - F5 - - - C6 - - - A5 - - -', 'B5 - - - G5 - - - D6 - - - B5 - - -',
            'C6 - - - G5 - - - E5 - - - G5 - - -', 'C6 - - - - - - - . . . . . . . .',
          ] },
      ],
    },
  };
  // compases seguidos de todas las secciones
  for (const k in SONGS) {
    const s = SONGS[k];
    s.bars = [];
    s.form.forEach((sec, si) => sec.chords.forEach((c, i) => s.bars.push({ sec, si, i, chord: c.split(' '), lead: sec.lead[i % sec.lead.length].split(' ') })));
  }

  // Canal de la canción: cada parte tiene su bus (para eco y reverberación)
  function strip(song) {
    const out = ctx.createGain(); out.gain.value = 1; out.connect(musBus);
    const mk = (g, rev) => { const b = ctx.createGain(); b.gain.value = g; b.connect(out); if (rev) { const r = ctx.createGain(); r.gain.value = rev; b.connect(r); r.connect(revIn); } return b; };
    const st = { out, lead: mk(1, 0.22), arp: mk(1, 0.18), pad: mk(1, 0.6), bass: mk(1, 0), drums: mk(1, 0.07) };
    // eco del solista (corchea con puntillo)
    const dl = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain(), lp = ctx.createBiquadFilter();
    dl.delayTime.value = (60 / song.bpm / 4) * (song.delay || 3); fb.gain.value = 0.32; wet.gain.value = 0.28; lp.type = 'lowpass'; lp.frequency.value = 2600;
    st.lead.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(out);
    if (song.bass === 'saw') { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 3; const b = ctx.createGain(); b.connect(f); f.connect(st.bass); st.bassIn = b; st.bassF = f; }
    else st.bassIn = st.bass;
    return st;
  }
  function voice(freq, t, dur, type, v, bus, o = {}) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    setWave(osc, type); osc.frequency.value = freq;
    const at = o.attack || 0.006;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + at);
    g.gain.setValueAtTime(v, t + Math.max(at + 0.005, dur - (o.release || 0.04)));
    g.gain.linearRampToValueAtTime(0, t + dur);
    if (o.vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * 0.012, t + Math.min(0.4, dur * 0.6));
      l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.02);
    }
    osc.connect(g); g.connect(bus);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  function drum(kind, t, bus, v = 1) {
    if (kind === 'k') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
      g.gain.setValueAtTime(0.6 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.22);
      noiseHit(t, 0.012, 0.12 * v, 'highpass', 4000, bus);
    } else if (kind === 's') {
      noiseHit(t, 0.16, 0.26 * v, 'bandpass', 1800, bus);
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
      g.gain.setValueAtTime(0.18 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.12);
    } else if (kind === 'h') noiseHit(t, 0.03, 0.07 * v, 'highpass', 7500, bus);
    else if (kind === 'o') noiseHit(t, 0.16, 0.06 * v, 'highpass', 6500, bus);
    else if (kind === 'c') noiseHit(t, 1.1, 0.12 * v, 'highpass', 4500, bus);
  }
  function noiseHit(t, d, v, type, f, bus) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f;
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(fl); fl.connect(g); g.connect(bus); s.start(t, Math.random() * 1.5); s.stop(t + d + 0.01);
  }

  function schedule() {
    if (!cur || !ctx) return;
    const s = cur.song, stepDur = 60 / s.bpm / 4, st = cur.st;
    const L = s.layered ? intensity : 3;       // capas extra según la tensión (el jefe)
    while (cur.next < ctx.currentTime + 0.2) {
      const bi = Math.floor(cur.step / 16) % s.bars.length, i = cur.step % 16, t = cur.next;
      const bar = s.bars[bi], sec = bar.sec, [root, q] = bar.chord;
      const ch = chordNotes(root, q, 4);
      // pad (acordes largos)
      if (s.pad && i === 0) chordNotes(root, q, 3).forEach((f) => { voice(f, t, stepDur * 16, 'sawtooth', s.pad, st.pad, { attack: 0.35, release: 0.4 }); voice(f * 1.008, t, stepDur * 16, 'sawtooth', s.pad * 0.7, st.pad, { attack: 0.35, release: 0.4 }); });
      // arpegio
      if (sec.arp === 'fast') voice(ch[[0, 1, 2, 1][i % 4]] * (i >= 8 && bi % 2 ? 2 : 1), t, stepDur * 0.9, s.arpWave || 'square', 0.026, st.arp);
      else if (sec.arp === 'slow' && i % 2 === 0) voice(ch[[0, 1, 2, 1, 2, 1, 0, 1][i / 2]], t, stepDur * 1.8, 'triangle', 0.07, st.arp);
      else if (sec.arp === 'bell' && i % 4 === 0) voice(ch[[0, 2, 1, 2][i / 4]] * 2, t, stepDur * 3.8, 'sine', 0.05, st.arp, { release: 0.5 });
      // bajo
      const b = chordNotes(root, q, 2)[0], bw = s.bass === 'saw' ? 'sawtooth' : 'triangle', bv = s.bass === 'saw' ? 0.16 : 0.22;
      const bm = sec.bassMode;
      if (bm === 'long' && i % 8 === 0) voice(b, t, stepDur * 7.5, 'triangle', 0.2, st.bassIn);
      if (bm === 'drive' && i % 2 === 0) voice(i % 4 === 2 ? b * 2 : b, t, stepDur * 1.7, bw, bv, st.bassIn);
      if (bm === 'pulse' && i % 2 === 0) voice(i % 4 === 0 ? b : b * 2, t, stepDur * 0.9, bw, bv, st.bassIn);
      if (bm === 'eighths' && i % 2 === 0) voice([b, b, b * 2, b, b * 1.5, b, b * 2, b * 1.5][i / 2], t, stepDur * 1.6, bw, bv, st.bassIn);
      if (bm === 'sixteenths') voice(i % 4 === 0 ? b : b * (i % 8 === 6 ? 2 : 1), t, stepDur * 0.85, bw, bv, st.bassIn);
      if (st.bassF && i === 0) { st.bassF.frequency.setValueAtTime(L >= 2 ? 1800 : 900, t); }
      // melodía
      const line = bar.lead, n = line[i];
      if (n && n !== '-' && n !== '.' && (!s.layered || L >= 0)) {
        let len = 1;
        while (line[i + len] === '-') len++;
        const f = hz(n), dur = stepDur * len * 0.95, lv = s.lead === 'triangle' ? 0.09 : 0.045;
        voice(f, t, dur, s.lead, lv, st.lead, { vib: len >= 4 });
        voice(f * 1.005, t, dur, s.lead, lv * 0.45, st.lead);
        if (L >= 1 && s.layered) voice(f / 2, t, dur, 'pulse25', 0.03, st.lead);      // capa: octava baja
        if (L >= 3 && s.layered) voice(f * 2, t, dur, 'pulse12', 0.018, st.arp);     // capa: octava alta
      }
      // batería
      const kit = KITS[sec.kit] || KITS.none;
      if (i === 0 && bar.i === 0 && sec.kit !== 'none' && sec.kit !== 'soft') drum('c', t, st.drums);
      if (s.layered && L >= 2 && i === 0 && bar.i % 2 === 0) drum('c', t, st.drums, 0.7);
      for (const piece in kit) if (kit[piece][i] === 'x') drum(piece, t, st.drums);
      if (s.layered && L >= 3 && bar.i % 4 === 3 && i >= 12) drum('s', t, st.drums, 0.6);   // redoble
      if (i % 4 === 0) cur.beats.push([t, cur.step / 4]);
      cur.step++; cur.next += stepDur;
    }
    while (cur.beats.length > 16) cur.beats.shift();
  }

  function play(name, force) {
    wantSong = name;
    if (original) { playOriginal(); return; }
    if (!ctx) return;
    if (!force && cur && cur.name === name) return;
    stopSynth();
    if (!name || !SONGS[name]) return;
    const song = SONGS[name];
    cur = { name, song, step: 0, next: ctx.currentTime + 0.1, st: strip(song), beats: [] };
    cur.t0 = cur.next;
    cur.timer = setInterval(schedule, 50);
    schedule();
  }
  // apagado suave para que no corte en seco
  function stopSynth() {
    if (!cur) return;
    clearInterval(cur.timer);
    const out = cur.st.out, t = ctx.currentTime;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + 0.35);
    setTimeout(() => out.disconnect(), 800);
    cur = null;
  }
  function playOriginal() {
    stopSynth();
    if (!origEl) { origEl = new Audio('assets/she-knows.mp3'); origEl.loop = true; }
    origEl.volume = Math.min(1, vol.music * 0.55);
    if (origEl.paused) origEl.play().catch(() => {});
  }
  function setOriginal(on) {
    original = on;
    if (on) playOriginal();
    else { if (origEl) origEl.pause(); const s = wantSong; wantSong = null; play(s, true); }
  }
  function pauseAll(p) {
    if (!ctx) return;
    if (p) { ctx.suspend(); if (origEl) origEl.pause(); }
    else { ctx.resume(); if (original && origEl) origEl.play().catch(() => {}); }
  }

  // Pulso de la música: número de pulso (negra) que está sonando ahora, o null si no hay música sintetizada
  function beat() {
    if (!ctx || !cur || original || ctx.state !== 'running') return null;
    const now = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0);
    const spb = 60 / cur.song.bpm;
    if (now < cur.t0) return null;
    const pos = (now - cur.t0) / spb;
    return { n: Math.floor(pos), frac: pos - Math.floor(pos), bpm: cur.song.bpm, bar: Math.floor(pos / 4) };
  }
  function setIntensity(n) { intensity = n; }

  // ---------- ambiente de cada acto ----------
  // void: viento lejano y un zumbido grave · clock: tic-tac y maquinaria · lava: burbujas y rugido · boss: taller en marcha
  function ambience(kind, force) {
    wantAmb = kind;
    if (!ctx) return;
    if (!force && amb && amb.kind === kind) return;
    if (amb) {
      const a = amb, t = ctx.currentTime;
      a.out.gain.cancelScheduledValues(t); a.out.gain.setValueAtTime(a.out.gain.value, t); a.out.gain.linearRampToValueAtTime(0, t + 0.8);
      clearInterval(a.timer); setTimeout(() => { a.nodes.forEach(n => { try { n.stop(); } catch (e) { /* ya parado */ } }); a.out.disconnect(); }, 1000);
      amb = null;
    }
    if (!kind) return;
    const out = ctx.createGain(), t = ctx.currentTime;
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(1, t + 1.5); out.connect(ambBus);
    const a = { kind, out, nodes: [], timer: 0 };
    const bed = (freq, type, v, q = 0.7, lfoF = 0.07, lfoD = 0) => {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = v;
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); a.nodes.push(s);
      if (lfoD) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = lfoF; lg.gain.value = lfoD; l.connect(lg); lg.connect(f.frequency); l.start(t); a.nodes.push(l); }
    };
    const drone = (freq, v, type = 'sine', trem = 0.1) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = v;
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = trem; lg.gain.value = v * 0.6;
      l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(out); o.start(t); l.start(t); a.nodes.push(o, l);
    };
    const hit = (fn) => { a.timer = setInterval(() => { if (ctx.state === 'running') fn(); }, 120); };
    if (kind === 'menu' || kind === 'void') {
      bed(500, 'bandpass', kind === 'menu' ? 0.05 : 0.07, 0.8, 0.06, 300);
      drone(55, 0.035); drone(82.4, 0.015, 'sine', 0.07);
      if (kind === 'void') hit(() => { if (Math.random() < 0.012) tone(1200 + Math.random() * 900, 1.6, 'sine', 0.012, null, 0, out); });
    } else if (kind === 'clock') {
      bed(180, 'lowpass', 0.05, 1, 0.2, 60); drone(73.4, 0.02, 'triangle', 0.5);
      let k = 0;
      hit(() => { if (++k % 4 === 0) { const tock = (k / 4) % 2; noise(0.025, 0.05, tock ? 2400 : 3600, 'bandpass', 0, out, null, 6); } if (Math.random() < 0.01) noise(0.4, 0.03, 900, 'bandpass', 0, out, 300, 3); });
    } else if (kind === 'lava') {
      bed(140, 'lowpass', 0.12, 1, 0.1, 50); bed(900, 'bandpass', 0.015, 2, 0.3, 400); drone(41.2, 0.04, 'sine', 0.13);
      hit(() => { if (Math.random() < 0.09) { const f = 140 + Math.random() * 200; tone(f, 0.12, 'sine', 0.05, f * 2.8, 0, out); } });
    } else if (kind === 'boss') {
      bed(90, 'lowpass', 0.14, 1, 0.25, 40); drone(36.7, 0.05, 'sawtooth', 2.5); drone(55, 0.03, 'sine', 0.2);
      hit(() => { if (Math.random() < 0.03) noise(0.12, 0.05, 4000, 'bandpass', 0, out, 2000, 5); });
    }
    amb = a;
  }

  root.SKA = {
    init, sfx: (n) => { if (ctx && SFX[n]) SFX[n](); }, play, setVolumes, setOriginal, pauseAll, beat, setIntensity, ambience, duck,
    get ready() { return !!ctx; },
  };
})(typeof self !== 'undefined' ? self : this);
