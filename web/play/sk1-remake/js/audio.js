// Soul Keznit Remake · sonido (efectos sintetizados + música chiptune propia)
(function (root) {
  'use strict';
  let ctx = null, master, sfxBus, musBus, noiseBuf, deathBuf = null;
  const vol = { music: 0.6, sfx: 0.8 };
  let original = false, origEl = null, cur = null, wantSong = null;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp); comp.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.connect(master);
    setVolumes(vol.music, vol.sfx);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    fetch('assets/death.wav').then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b)).then(b => { deathBuf = b; }).catch(() => {});
    if (wantSong) play(wantSong, true);
  }

  function setVolumes(m, s) {
    vol.music = m; vol.sfx = s;
    if (musBus) musBus.gain.value = m * 0.5;
    if (sfxBus) sfxBus.gain.value = s * 0.6;
    if (origEl) origEl.volume = Math.min(1, m * 0.55);
  }

  // ---------- efectos ----------
  function tone(f, dur, type = 'square', v = 0.2, f2 = null, when = 0, bus = sfxBus) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, v = 0.2, freq = 1200, type = 'lowpass', when = 0, bus = sfxBus, f2 = null) {
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t);
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  const arp = (notes, step, type, v, when = 0) => notes.forEach((f, i) => tone(f, step * 1.6, type, v, null, when + i * step));

  const SFX = {
    jump: () => tone(330, 0.11, 'square', 0.09, 640),
    walljump: () => { tone(280, 0.12, 'square', 0.09, 720); noise(0.05, 0.08, 3000, 'highpass'); },
    land: () => noise(0.06, 0.12, 700),
    bonk: () => tone(160, 0.07, 'square', 0.08, 90),
    death: () => {
      if (deathBuf && ctx) {
        const s = ctx.createBufferSource(), g = ctx.createGain();
        s.buffer = deathBuf; g.gain.value = 0.55; s.connect(g); g.connect(sfxBus); s.start();
      } else { tone(440, 0.5, 'square', 0.14, 55); }
      noise(0.3, 0.16, 900, 'lowpass', 0, sfxBus, 120);
    },
    key: () => arp([660, 880, 1320, 1760], 0.055, 'triangle', 0.14),
    door: () => { noise(0.45, 0.14, 300, 'bandpass', 0, sfxBus, 1800); tone(110, 0.4, 'triangle', 0.14, 70); },
    flag: () => { arp([523, 659, 784, 1047, 1319], 0.07, 'square', 0.08); arp([262, 392], 0.14, 'triangle', 0.14); },
    tramp: () => tone(180, 0.24, 'triangle', 0.18, 980),
    port: () => { tone(1400, 0.22, 'sine', 0.12, 180); tone(200, 0.22, 'sine', 0.1, 1400, 0.12); },
    crack: () => noise(0.08, 0.08, 2500, 'highpass'),
    break: () => noise(0.25, 0.16, 500, 'bandpass', 0, sfxBus, 150),
    toggle: () => { tone(900, 0.04, 'square', 0.06); tone(600, 0.05, 'square', 0.06, null, 0.04); },
    frag: () => arp([1319, 1568, 2093, 2637, 3136], 0.06, 'sine', 0.12),
    blip: () => tone(190 + Math.random() * 40, 0.035, 'square', 0.035),
    talk: () => tone(300 + Math.random() * 60, 0.04, 'triangle', 0.06),
    move: () => tone(660, 0.04, 'square', 0.05),
    select: () => { tone(880, 0.06, 'square', 0.07); tone(1320, 0.08, 'square', 0.06, null, 0.05); },
    back: () => tone(440, 0.07, 'square', 0.06, 330),
    tele: () => tone(200, 0.7, 'sawtooth', 0.05, 1200),
    burst: () => { noise(0.25, 0.14, 2000, 'bandpass'); tone(900, 0.2, 'square', 0.05, 200); },
    bossHit: () => { noise(0.6, 0.28, 400, 'lowpass', 0, sfxBus, 60); tone(90, 0.6, 'square', 0.16, 40); arp([784, 659, 523], 0.08, 'square', 0.06, 0.1); },
    bossDown: () => { noise(1.6, 0.3, 800, 'lowpass', 0, sfxBus, 40); tone(120, 1.5, 'sawtooth', 0.12, 30); },
    brake: () => arp([392, 523, 659], 0.06, 'triangle', 0.12),
    chains: () => { for (let i = 0; i < 6; i++) noise(0.06, 0.1, 4000, 'highpass', i * 0.09); },
    rumble: () => noise(1.2, 0.18, 120, 'lowpass'),
    surrender: () => { tone(220, 0.3, 'square', 0.08, 110); },
  };

  // ---------- música ----------
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const hz = (n) => {
    const m = /^([A-G][#b]?)(\d)$/.exec(n);
    if (!m) return 0;
    return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  };
  // acordes: raíz + tipo (m/M)
  const chordNotes = (root, q, oct) => {
    const base = NOTE[root] + (oct + 1) * 12;
    const third = q === 'm' ? 3 : 4;
    return [base, base + third, base + 7].map(m => 440 * Math.pow(2, (m - 69) / 12));
  };

  // Cada canción: bpm, acordes (uno por compás), melodía (16 pasos por compás), estilos
  const SONGS = {
    menu: {
      bpm: 84, chords: ['A m', 'F M', 'C M', 'E M'], arp: 'slow', bass: 'long', drums: 'none',
      lead: [
        'E5 - - - - - - - D5 - - - C5 - - -', 'A4 - - - - - - - . . . . . . . .',
        'G4 - - - C5 - - - E5 - - - D5 - - -', 'B4 - - - - - - - G#4 - - - - - - -',
      ],
    },
    acto1: {
      bpm: 128, chords: ['A m', 'F M', 'C M', 'G M', 'A m', 'F M', 'C M', 'G M'], arp: 'fast', bass: 'drive', drums: 'basic',
      lead: [
        'E5 - - - D5 - C5 - D5 - E5 - - - A4 -', 'C5 - - - A4 - C5 - D5 - C5 - A4 - - -',
        'G4 - - - C5 - E5 - G5 - - - E5 - D5 -', 'D5 - - - B4 - G4 - B4 - D5 - - - . .',
        'E5 - - - A5 - G5 - E5 - D5 - C5 - - -', 'A4 - C5 - F5 - - - E5 - D5 - C5 - - -',
        'E5 - - - G5 - E5 - C5 - D5 - E5 - - -', 'D5 - - - - - B4 - D5 - - - . . . .',
      ],
    },
    acto2: {
      bpm: 136, chords: ['D m', 'C M', 'Bb M', 'C M', 'D m', 'C M', 'Bb M', 'A M'], arp: 'fast', bass: 'drive', drums: 'basic',
      lead: [
        'A4 - D5 - F5 - - - E5 - D5 - C5 - D5 -', 'E5 - - - C5 - - - G4 - - - . . . .',
        'F5 - - - D5 - Bb4 - D5 - F5 - G5 - F5 -', 'E5 - - - - - - - C5 - D5 - E5 - - -',
        'D5 - F5 - A5 - - - G5 - F5 - E5 - D5 -', 'C5 - E5 - G5 - - - F5 - E5 - C5 - - -',
        'D5 - - - Bb4 - D5 - F5 - - - E5 - D5 -', 'C#5 - - - - - - - E5 - - - A5 - - -',
      ],
    },
    acto3: {
      bpm: 146, chords: ['E m', 'F M', 'E m', 'D M', 'E m', 'F M', 'G M', 'F M'], arp: 'fast', bass: 'eighths', drums: 'busy',
      lead: [
        'B4 - - - E5 - - - F5 - E5 - D5 - E5 -', 'F5 - - - A5 - - - G5 - F5 - E5 - - -',
        'B4 - - - E5 - G5 - B5 - - - A5 - G5 -', 'F#5 - - - D5 - - - A4 - - - . . . .',
        'E5 - - - B5 - - - A5 - G5 - F5 - E5 -', 'F5 - - - C5 - - - A4 - C5 - F5 - - -',
        'G5 - - - D5 - - - B4 - D5 - G5 - A5 -', 'A5 - - - - - - - G5 - F5 - E5 - - -',
      ],
    },
    boss: {
      bpm: 168, chords: ['E m', 'E m', 'C M', 'D M', 'E m', 'E m', 'C M', 'B M'], arp: 'fast', bass: 'sixteenths', drums: 'boss',
      lead: [
        'E5 - E5 - G5 - E5 - B5 - - - A5 - G5 -', 'F#5 - - - E5 - - - D5 - E5 - - - . .',
        'G5 - - - E5 - C5 - E5 - G5 - C6 - - -', 'A5 - - - F#5 - D5 - F#5 - A5 - D6 - - -',
        'E5 - E5 - G5 - E5 - B5 - - - A5 - G5 -', 'B5 - - - A5 - G5 - F#5 - G5 - A5 - - -',
        'C6 - - - B5 - G5 - E5 - G5 - C6 - - -', 'B5 - - - - - - - D#5 - F#5 - B5 - - -',
      ],
    },
    final: {
      bpm: 88, chords: ['C M', 'G M', 'A m', 'F M', 'C M', 'G M', 'F M', 'G M'], arp: 'slow', bass: 'long', drums: 'soft',
      lead: [
        'E5 - - - G5 - - - C6 - - - B5 - G5 -', 'D5 - - - - - - - G5 - - - F5 - D5 -',
        'C5 - - - E5 - - - A5 - - - G5 - E5 -', 'F5 - - - - - - - A4 - C5 - F5 - - -',
        'E5 - - - G5 - - - C6 - - - D6 - E6 -', 'D6 - - - B5 - - - G5 - - - . . . .',
        'A5 - - - F5 - - - C5 - - - D5 - E5 -', 'D5 - - - - - - - . . . . . . . .',
      ],
    },
  };

  function voice(freq, t, dur, type, v, duty) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.006);
    g.gain.setValueAtTime(v, t + Math.max(0.01, dur - 0.04));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(musBus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function drum(kind, t) {
    if (kind === 'k') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      o.connect(g); g.connect(musBus); o.start(t); o.stop(t + 0.16);
    } else {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = kind === 's' ? 1500 : 7000;
      const g = ctx.createGain(), d = kind === 's' ? 0.12 : 0.03;
      g.gain.setValueAtTime(kind === 's' ? 0.22 : 0.07, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      s.connect(f); f.connect(g); g.connect(musBus); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.01);
    }
  }
  const DRUMS = {
    none: '................',
    soft: 'k.......k.......',
    basic: 'k.h.s.h.k.h.s.hh',
    busy: 'k.hhs.hkk.hhs.hh',
    boss: 'kkhsk.hskkhsk.ss',
  };

  function schedule() {
    if (!cur || !ctx) return;
    const s = cur.song, stepDur = 60 / s.bpm / 4;
    while (cur.next < ctx.currentTime + 0.15) {
      const bar = Math.floor(cur.step / 16) % s.chords.length, i = cur.step % 16, t = cur.next;
      const [root, q] = s.chords[bar].split(' ');
      const ch = chordNotes(root, q, 4);
      // arpegio
      if (s.arp === 'fast') voice(ch[[0, 1, 2, 1][i % 4]] * (i >= 8 && bar % 2 ? 2 : 1), t, stepDur * 0.9, 'square', 0.028);
      else if (i % 2 === 0) voice(ch[[0, 1, 2, 1, 2, 1, 0, 1][i / 2]], t, stepDur * 1.8, 'triangle', 0.07);
      // bajo
      const b = chordNotes(root, q, 2)[0];
      if (s.bass === 'long' && i % 8 === 0) voice(b, t, stepDur * 7.5, 'triangle', 0.2);
      if (s.bass === 'drive' && i % 2 === 0) voice(i % 4 === 2 ? b * 2 : b, t, stepDur * 1.7, 'triangle', 0.22);
      if (s.bass === 'eighths' && i % 2 === 0) voice([b, b, b * 2, b, b * 1.5, b, b * 2, b * 1.5][i / 2], t, stepDur * 1.6, 'triangle', 0.22);
      if (s.bass === 'sixteenths') voice(i % 4 === 0 ? b : b * (i % 8 === 6 ? 2 : 1), t, stepDur * 0.85, 'triangle', 0.2);
      // melodía
      const line = s.lead[bar % s.lead.length].split(' ');
      const n = line[i];
      if (n && n !== '-' && n !== '.') {
        let len = 1;
        while (line[i + len] === '-') len++;
        voice(hz(n), t, stepDur * len * 0.95, 'square', 0.045);
        voice(hz(n) * 1.005, t, stepDur * len * 0.95, 'square', 0.02);
      }
      // batería
      const dk = DRUMS[s.drums][i];
      if (dk !== '.') drum(dk, t);
      cur.step++; cur.next += stepDur;
    }
  }

  function play(name, force) {
    wantSong = name;
    if (original) { playOriginal(); return; }
    if (!ctx) return;
    if (!force && cur && cur.name === name) return;
    stopSynth();
    if (!name || !SONGS[name]) return;
    cur = { name, song: SONGS[name], step: 0, next: ctx.currentTime + 0.08 };
    cur.timer = setInterval(schedule, 40);
    schedule();
  }
  function stopSynth() { if (cur) { clearInterval(cur.timer); cur = null; } }
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

  root.SKA = { init, sfx: (n) => { if (ctx && SFX[n]) SFX[n](); }, play, setVolumes, setOriginal, pauseAll, get ready() { return !!ctx; } };
})(typeof self !== 'undefined' ? self : this);
