// Soul Keznit Remake · juego (dibujo, menús, escenas, controles)
(function () {
  'use strict';
  const { T } = SKE;
  const TL = SKE.TILES;
  const LV = SKL.LEVELS, ST = SKL.STORY;
  const VW = 960, VH = 540;
  const COL = {
    white: '#ffffff', red: '#ff3434', green: '#8fff33', orange: '#ffaa33', orange2: '#ff9633',
    purple: '#b533ff', grey: '#8e8e93', dim: '#2a2a2e',
  };
  const PX = (s) => `${s}px SKPixel, "Courier New", monospace`;
  const SERIF = (s) => `italic ${s}px "EB Garamond", Georgia, "Times New Roman", serif`;

  // ---------- textos de la interfaz ----------
  const UI = {
    es: {
      cont: 'CONTINUAR', newg: 'NUEVA PARTIDA', levels: 'NIVELES', memories: 'RECUERDOS', options: 'OPCIONES', credits: 'CRÉDITOS',
      back: 'VOLVER', music: 'MÚSICA', sfx: 'EFECTOS', track: 'BANDA SONORA', trackNew: 'NUEVA', trackOrig: 'ORIGINAL',
      shake: 'SACUDIDA', crt: 'EFECTO RETRO', lang: 'IDIOMA', on: 'SÍ', off: 'NO', resume: 'CONTINUAR', restart: 'REINICIAR NIVEL',
      quit: 'SALIR AL MENÚ', paused: 'PAUSA', deaths: 'MUERTES', time: 'TIEMPO', frags: 'FRAGMENTOS', press: 'PULSA ESPACIO',
      choose: 'elige idioma · choose language', sure: '¿EMPEZAR DE CERO?', sure2: 'Se borrará tu progreso.', yes: 'SÍ', no: 'NO',
      voice: 'RECEPCIÓN DEL ABISMO', soldier: 'ALMA Nº 4.816.301', menuHint: '↑↓ ELEGIR · ENTER ACEPTAR · ESC VOLVER',
      optHint: '←→ CAMBIAR · ESC VOLVER', skip: 'ESC · SALTAR', next: 'ESPACIO', thanks: 'Gracias por no rendirte.',
      locked: 'BLOQUEADO', best: 'MEJOR', memEmpty: 'Recuerdo perdido. Búscalo en el nivel', memTitle: 'RECUERDOS DE KEZNIT',
      memGot: 'RECUERDO', boss: 'JEFE', fullscreen: 'PANTALLA COMPLETA', controls: 'CONTROLES', exit: 'VOLVER A LA WEB', rotate: 'GIRA EL MÓVIL PARA VERLO MÁS GRANDE',
      help: ['←→ · A D   MOVERSE', 'W · ↑ · ESPACIO   SALTAR (mantén = más alto)', 'PÉGATE A UNA PARED + SALTAR   SALTO DE PARED', '↓ · S   BAJAR DE PLATAFORMAS FINAS', 'R   REINICIAR NIVEL · ESC   PAUSA'],
      remake: 'REMAKE', end: 'FIN', stats: 'TU PARTIDA',
    },
    en: {
      cont: 'CONTINUE', newg: 'NEW GAME', levels: 'LEVELS', memories: 'MEMORIES', options: 'OPTIONS', credits: 'CREDITS',
      back: 'BACK', music: 'MUSIC', sfx: 'SOUND FX', track: 'SOUNDTRACK', trackNew: 'NEW', trackOrig: 'ORIGINAL',
      shake: 'SCREEN SHAKE', crt: 'RETRO EFFECT', lang: 'LANGUAGE', on: 'ON', off: 'OFF', resume: 'RESUME', restart: 'RESTART LEVEL',
      quit: 'QUIT TO MENU', paused: 'PAUSED', deaths: 'DEATHS', time: 'TIME', frags: 'FRAGMENTS', press: 'PRESS SPACE',
      choose: 'elige idioma · choose language', sure: 'START OVER?', sure2: 'Your progress will be erased.', yes: 'YES', no: 'NO',
      voice: 'ABYSS RECEPTION', soldier: 'SOUL NO. 4,816,301', menuHint: '↑↓ SELECT · ENTER ACCEPT · ESC BACK',
      optHint: '←→ CHANGE · ESC BACK', skip: 'ESC · SKIP', next: 'SPACE', thanks: 'Thank you for not giving up.',
      locked: 'LOCKED', best: 'BEST', memEmpty: 'Lost memory. Find it in level', memTitle: "KEZNIT'S MEMORIES",
      memGot: 'MEMORY', boss: 'BOSS', fullscreen: 'FULLSCREEN', controls: 'CONTROLS', exit: 'BACK TO SITE', rotate: 'TURN YOUR PHONE FOR A BIGGER VIEW',
      help: ['←→ · A D   MOVE', 'W · ↑ · SPACE   JUMP (hold = higher)', 'HUG A WALL + JUMP   WALL JUMP', '↓ · S   DROP THROUGH THIN PLATFORMS', 'R   RESTART LEVEL · ESC   PAUSE'],
      remake: 'REMAKE', end: 'THE END', stats: 'YOUR RUN',
    },
  };
  const tr = (o) => o[save.lang || 'es'];
  const ui = (k) => UI[save.lang || 'es'][k];

  // ---------- guardado ----------
  const SAVE_KEY = 'soulkeznit-remake-v1';
  const blank = () => ({
    lang: null, unlocked: 0, cur: 0, started: false, frags: [], deaths: 0, time: 0, best: {}, beaten: false,
    opts: { music: 0.6, sfx: 0.8, orig: false, shake: true, crt: true },
  });
  let save = blank();
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) save = Object.assign(blank(), s, { opts: Object.assign(blank().opts, s.opts) }); } catch (e) { /* sin guardado */ }
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* sin guardado */ } };

  // ?from=/pagina/ : de dónde se vino (para el botón de volver a la web en el móvil)
  const FROM = (() => { const f = new URLSearchParams(location.search).get('from'); return f && /^\/[\w\-\/#]*$/.test(f) ? f : null; })();

  // ---------- lienzo ----------
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  let scale = 1, dpr = 1, offX = 0, offY = 0;
  const COARSE = matchMedia('(pointer: coarse)').matches;
  let usingTouch = COARSE;
  let portrait = false, playing = false;
  function resize() {
    // en móviles se limita la resolución para que vaya fluido
    dpr = Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 2);
    portrait = usingTouch && playing && innerHeight > innerWidth * 1.1;
    scale = portrait ? innerWidth / VW : Math.min(innerWidth / VW, innerHeight / VH);
    const w = Math.round(VW * scale), h = Math.round(VH * scale);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    offX = (innerWidth - w) / 2; offY = portrait ? Math.round(Math.max(10, (innerHeight - h) * 0.18)) : (innerHeight - h) / 2;
    document.body.classList.toggle('portrait', portrait);
    cv.style.left = offX + 'px'; cv.style.top = offY + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  }
  addEventListener('resize', resize);
  resize();
  addEventListener('orientationchange', () => setTimeout(resize, 120));

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // viñeta y líneas retro
  const vignette = mk(VW, VH);
  { const g = vignette.getContext('2d'); const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.72); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  const scan = mk(VW, VH);
  { const g = scan.getContext('2d'); g.fillStyle = 'rgba(0,0,0,.09)'; for (let y = 0; y < VH; y += 3) g.fillRect(0, y, VW, 1); }

  // ---------- entrada ----------
  const held = new Set(), pressed = new Set();
  const KEYMAP = {
    ArrowLeft: ['left'], KeyA: ['left'], ArrowRight: ['right'], KeyD: ['right'],
    ArrowUp: ['up', 'jump'], KeyW: ['up', 'jump'], ArrowDown: ['down'], KeyS: ['down'],
    Space: ['jump', 'confirm'], KeyZ: ['jump', 'confirm'], KeyK: ['jump'], Enter: ['confirm'],
    Escape: ['back', 'pause'], Backspace: ['back'], KeyX: ['back'], KeyP: ['pause'], KeyR: ['restart'], KeyQ: ['quit'],
  };
  addEventListener('keydown', (e) => {
    const acts = KEYMAP[e.code];
    if (!acts) return;
    e.preventDefault();
    SKA.init();
    if (e.repeat) return;
    for (const a of acts) { held.add(a); pressed.add(a); }
    if (usingTouch) setTouch(false);
  });
  addEventListener('keyup', (e) => { const acts = KEYMAP[e.code]; if (acts) for (const a of acts) held.delete(a); });
  addEventListener('blur', () => { held.clear(); if (scene === play && !play.paused && play.w) openPause(); });

  // Mando
  let padPrev = {};
  function pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const p = pads && [...pads].find(Boolean);
    if (!p) return;
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0, b = (i) => p.buttons[i] && p.buttons[i].pressed;
    const st = {
      left: ax < -0.4 || b(14), right: ax > 0.4 || b(15), up: ay < -0.5 || b(12), down: ay > 0.5 || b(13),
      jump: b(0) || b(1), confirm: b(0), back: b(1), pause: b(9), restart: b(3),
    };
    for (const k in st) {
      if (st[k] && !padPrev[k]) { pressed.add(k); SKA.init(); }
      if (st[k]) held.add(k + '#pad'); else held.delete(k + '#pad');
    }
    padPrev = st;
  }
  const isHeld = (a) => held.has(a) || held.has(a + '#pad') || touchHeld.has(a);

  // Táctil y ratón
  const touchHeld = new Set();
  const toLogical = (e) => ({ x: (e.clientX - offX) / scale, y: (e.clientY - offY) / scale });
  let mouse = { x: -1, y: -1, click: false };
  addEventListener('pointerdown', (e) => {
    if (e.target.closest && e.target.closest('#pad, #padTop')) return;
    SKA.init();
    const pt = toLogical(e);
    if (e.pointerType === 'touch' && !usingTouch) setTouch(true);
    mouse = { x: pt.x, y: pt.y, click: true, down: true };
    if (tapAdvances()) pressed.add('confirm');
  });
  const endTouch = () => { mouse.down = false; mouse.drag = null; };
  cv.addEventListener('pointerup', endTouch);
  addEventListener('pointerup', () => { mouse.down = false; mouse.drag = null; });
  cv.addEventListener('pointercancel', endTouch);
  cv.addEventListener('pointermove', (e) => { const pt = toLogical(e); mouse.x = pt.x; mouse.y = pt.y; mouse.moved = true; });
  cv.addEventListener('wheel', (e) => { mouse.wheel = (mouse.wheel || 0) + Math.sign(e.deltaY); if (scene === optionsScene) e.preventDefault(); }, { passive: false });

  // Escenas sin menú en las que un toque (o clic) sirve para avanzar
  function tapAdvances() {
    if (scene === play) return !!play.cut && !play.paused;
    return scene === storyScene || scene === cardScene || scene === finaleScene || scene === statsScene;
  }

  // ---------- controles táctiles ----------
  // Botones de verdad (HTML) por encima del juego: se puede deslizar el dedo de uno a otro.
  const ico = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const pad = document.createElement('div');
  pad.id = 'pad'; pad.hidden = true;
  pad.innerHTML = `<div class="pd-move"><button data-k="left" aria-label="Izquierda">${ico('M15 5 7 12l8 7z')}</button><button data-k="right" aria-label="Derecha">${ico('M9 5l8 7-8 7z')}</button></div>
    <button class="pd-down" data-k="down" aria-label="Bajar">${ico('M5 9h14l-7 8z')}</button>
    <button class="pd-jump" data-k="jump" aria-label="Saltar">${ico('M12 5l8 11H4z')}</button>`;
  const topBtn = document.createElement('button');
  topBtn.id = 'padTop'; topBtn.hidden = true; topBtn.setAttribute('aria-label', 'Pausa');
  const rotHint = document.createElement('p');
  rotHint.id = 'rotHint'; rotHint.hidden = true;
  document.body.append(pad, topBtn, rotHint);
  document.body.classList.toggle('touch', usingTouch);
  const padPtr = new Map();
  const keyAt = (x, y) => { const el = document.elementFromPoint(x, y); const b = el && el.closest && el.closest('#pad [data-k]'); return b ? b.dataset.k : null; };
  function setKey(id, k) {
    const old = padPtr.get(id) || null;
    if (old === k) return;
    if (k) padPtr.set(id, k); else padPtr.delete(id);
    if (old && ![...padPtr.values()].includes(old)) touchHeld.delete(old);
    if (k && !touchHeld.has(k)) { touchHeld.add(k); pressed.add(k); if (k === 'jump' && navigator.vibrate) navigator.vibrate(8); }
    pad.querySelectorAll('[data-k]').forEach(b => b.classList.toggle('on', touchHeld.has(b.dataset.k)));
  }
  pad.addEventListener('pointerdown', (e) => { e.preventDefault(); SKA.init(); if (!usingTouch) setTouch(true); setKey(e.pointerId, keyAt(e.clientX, e.clientY)); });
  pad.addEventListener('pointermove', (e) => { if (padPtr.has(e.pointerId)) setKey(e.pointerId, keyAt(e.clientX, e.clientY)); });
  for (const ev of ['pointerup', 'pointercancel']) pad.addEventListener(ev, (e) => setKey(e.pointerId, null));
  pad.addEventListener('contextmenu', (e) => e.preventDefault());
  topBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); SKA.init();
    pressed.add(scene === play && !play.paused && !play.cut ? 'pause' : 'back');
  });
  function setTouch(on) {
    usingTouch = on;
    document.body.classList.toggle('touch', on);
    if (!on) { touchHeld.clear(); padPtr.clear(); }
    resize();
  }
  // Se decide cada fotograma qué se ve
  let padShown = null, topShown = null, rotShown = null;
  function updateTouchUi() {
    const inPlay = scene === play && play.w && !play.paused && !play.cut && !play.surrender && !play.w.done;
    const showPad = usingTouch && !!inPlay;
    const nowPlaying = scene === play;
    if (nowPlaying !== playing) { playing = nowPlaying; resize(); }
    if (showPad !== padShown) { pad.hidden = !showPad; padShown = showPad; if (!showPad) { touchHeld.clear(); padPtr.clear(); } }
    const showTop = usingTouch && scene !== boot && scene !== titleScene && !(scene === finaleScene && !finaleScene.o.skippable);
    if (showTop !== topShown) { topBtn.hidden = !showTop; topShown = showTop; }
    if (showTop) { const p = scene === play && !play.paused && !play.cut; const label = p ? '❚❚' : '✕'; if (topBtn.textContent !== label) topBtn.textContent = label; }
    const showRot = usingTouch && portrait && !!inPlay;
    if (showRot !== rotShown) { rotHint.hidden = !showRot; rotShown = showRot; rotHint.textContent = ui('rotate'); }
  }

  // ---------- partículas y efectos ----------
  let parts = [];
  function burst(x, y, n, color, sp = 3, size = 4, grav = 0.12, life = 40) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = Math.random() * sp + sp * 0.2;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.3, s: size * (0.5 + Math.random() * 0.8), c: color, g: grav, l: life * (0.6 + Math.random() * 0.6), m: 0, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4 });
    }
    if (parts.length > 900) parts.splice(0, parts.length - 900);
  }
  function updParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i];
      q.x += q.vx; q.y += q.vy; q.vy += q.g; q.vx *= 0.985; q.rot += q.vr; q.m++;
      if (q.m > q.l) parts.splice(i, 1);
    }
  }
  function drawParts(cx, cy) {
    for (const q of parts) {
      const a = 1 - q.m / q.l;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = q.c;
      ctx.save(); ctx.translate(q.x - cx, q.y - cy); ctx.rotate(q.rot);
      ctx.fillRect(-q.s / 2, -q.s / 2, q.s, q.s);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  let shake = 0, flash = 0, flashCol = '#fff';
  const addShake = (v) => { if (save.opts.shake) shake = Math.max(shake, v); };

  // polvo de fondo
  const ash = Array.from({ length: 40 }, () => ({ x: Math.random() * VW, y: Math.random() * VH, v: 0.15 + Math.random() * 0.35, s: 1 + Math.random() * 2, a: 0.05 + Math.random() * 0.15, ph: Math.random() * 6 }));
  function drawBackdrop(cx, cy, tint, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
    if (tint) {
      const gr = ctx.createRadialGradient(VW / 2, VH * 1.1, 40, VW / 2, VH * 1.1, VW * 0.8);
      gr.addColorStop(0, tint); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH);
    }
    // cuadrícula de puntos (paralaje)
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    const ox = -((cx * 0.4) % 30), oy = -((cy * 0.4) % 30);
    for (let y = oy; y < VH; y += 30) for (let x = ox; x < VW; x += 30) ctx.fillRect(x, y, 2, 2);
    for (const a of ash) {
      a.y -= a.v; a.x += Math.sin(t * 0.01 + a.ph) * 0.2;
      if (a.y < -5) { a.y = VH + 5; a.x = Math.random() * VW; }
      ctx.fillStyle = `rgba(255,255,255,${a.a})`;
      ctx.fillRect(a.x, a.y, a.s, a.s);
    }
  }

  // ---------- utilidades de dibujo ----------
  function text(s, x, y, size, color = '#fff', align = 'center', font = 'px', alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.font = font === 'px' ? PX(size) : font === 'serif' ? SERIF(size) : font;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
    ctx.globalAlpha = 1;
  }
  function wrap(s, maxW, size, font = 'px') {
    ctx.font = font === 'px' ? PX(size) : SERIF(size);
    const words = s.split(' '), lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function star(x, y, r, rot, arms = 8, width = 0.2, color = COL.red) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = color;
    const w = Math.max(3, r * width);
    for (let i = 0; i < arms / 2; i++) { ctx.rotate(Math.PI / (arms / 2)); ctx.fillRect(-r, -w / 2, r * 2, w); }
    ctx.restore();
  }
  const fmtTime = (f) => { const s = Math.floor(f / 60); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  let lowFx = false;
  function glow(color, blur) { if (lowFx) return; ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function noGlow() { ctx.shadowBlur = 0; }

  // ---------- capas estáticas del nivel ----------
  function buildLayers(w) {
    const solid = mk(w.pw, w.ph), red = mk(w.pw, w.ph);
    const gs = solid.getContext('2d'), gr = red.getContext('2d');
    gs.fillStyle = '#fff'; gr.fillStyle = COL.red;
    for (let r = 0; r < w.H; r++) for (let c = 0; c < w.W; c++) {
      const t = w.grid[r * w.W + c], X = c * T, Y = r * T;
      // el marco exterior del mapa es invisible (el borde de la pantalla hace de pared)
      if (t === TL.SOLID) { if (!(r === 0 || c === 0 || c === w.W - 1 || r === w.H - 1)) gs.fillRect(X, Y, T, T); }
      else if (t === TL.RED) gr.fillRect(X, Y, T, T);
      else if (t >= TL.SPK_U && t <= TL.SPK_R) {
        gr.beginPath();
        for (let k = 0; k < 2; k++) {
          const o = k * 15;
          if (t === TL.SPK_U) { gr.moveTo(X + o + 1, Y + T); gr.lineTo(X + o + 7.5, Y + 9); gr.lineTo(X + o + 14, Y + T); }
          if (t === TL.SPK_D) { gr.moveTo(X + o + 1, Y); gr.lineTo(X + o + 7.5, Y + T - 9); gr.lineTo(X + o + 14, Y); }
          if (t === TL.SPK_L) { gr.moveTo(X + T, Y + o + 1); gr.lineTo(X + 9, Y + o + 7.5); gr.lineTo(X + T, Y + o + 14); }
          if (t === TL.SPK_R) { gr.moveTo(X, Y + o + 1); gr.lineTo(X + T - 9, Y + o + 7.5); gr.lineTo(X, Y + o + 14); }
        }
        gr.fill();
      }
    }
    // resplandor
    const solidG = mk(w.pw, w.ph), redG = mk(w.pw, w.ph);
    { const g = solidG.getContext('2d'); g.shadowColor = 'rgba(255,255,255,.35)'; g.shadowBlur = 14; g.drawImage(solid, 0, 0); }
    { const g = redG.getContext('2d'); g.shadowColor = 'rgba(255,52,52,.9)'; g.shadowBlur = 18; g.drawImage(red, 0, 0); g.drawImage(red, 0, 0); }
    return { solid: solidG, red: redG, redFlat: red };
  }

  // ======================================================
  // ESCENAS
  // ======================================================
  let scene = null;
  function go(s, arg) { scene = s; if (s.enter) s.enter(arg); }

  // ---------- menú genérico ----------
  function runMenu(m, items) {
    let sel = m.sel || 0;
    const n = items.length;
    if (m._items) items.forEach((it, i) => { if (!it.box && m._items[i]) { it.box = m._items[i].box; it.bar = m._items[i].bar; } });
    if (pressed.has('up')) { do sel = (sel - 1 + n) % n; while (items[sel].disabled); SKA.sfx('move'); }
    if (pressed.has('down')) { do sel = (sel + 1) % n; while (items[sel].disabled); SKA.sfx('move'); }
    // barras de volumen: pinchar, arrastrar o rueda
    const inBox = (b) => b && mouse.x > b.x && mouse.x < b.x + b.w && mouse.y > b.y && mouse.y < b.y + b.h;
    items.forEach((it, i) => {
      if (!it.set || !it.bar) return;
      if (mouse.click && inBox(it.bar)) { mouse.drag = it.id; mouse.click = false; }
      if (mouse.down && mouse.drag === it.id) { sel = i; it.set((mouse.x - it.bar.x - 6) / (it.bar.w - 12)); }
      if (mouse.wheel && inBox(it.box)) { sel = i; (mouse.wheel < 0 ? it.right : it.left)(); SKA.sfx('move'); }
    });
    mouse.wheel = 0;
    // ratón
    if (mouse.moved || mouse.click) {
      items.forEach((it, i) => { if (it.box && !it.disabled && mouse.x > it.box.x && mouse.x < it.box.x + it.box.w && mouse.y > it.box.y && mouse.y < it.box.y + it.box.h) { if (sel !== i && mouse.moved) SKA.sfx('move'); sel = i; if (mouse.click) { m.sel = sel; items[i].act && items[i].act(); SKA.sfx('select'); mouse.click = false; } } });
      mouse.moved = false;
    }
    m.sel = sel;
    const it = items[sel];
    if (it.left && (pressed.has('left'))) { it.left(); SKA.sfx('move'); }
    if (it.right && (pressed.has('right'))) { it.right(); SKA.sfx('move'); }
    if (pressed.has('confirm') && it.act) { SKA.sfx('select'); it.act(); }
  }
  // Etiqueta + barra de volumen que se puede arrastrar con el ratón
  function drawBar(it, x, y, gap, size, on) {
    ctx.font = PX(size);
    const lw = ctx.measureText(it.label).width, bw = 200, bh = 16, tw = lw + 24 + bw;
    const x0 = x - tw / 2, bx = x0 + lw + 24;
    it.box = { x: x0 - 20, y: y - gap / 2 + 4, w: tw + 40, h: gap - 8 };
    it.bar = { x: bx - 6, y: y - gap / 2 + 4, w: bw + 12, h: gap - 8 };
    if (on) {
      ctx.fillStyle = '#fff'; ctx.fillRect(x0 - 16, y - size / 2 - 6, tw + 32, size + 12);
      const bob = Math.sin(clock * 0.15) * 3;
      ctx.fillStyle = COL.red; ctx.fillRect(x0 - 34 + bob, y - 5, 10, 10);
    }
    text(it.label, x0, y + 1, size, on ? '#000' : 'rgba(255,255,255,.75)', 'left');
    ctx.fillStyle = on ? '#000' : 'rgba(255,255,255,.2)'; ctx.fillRect(bx, y - bh / 2, bw, bh);
    ctx.fillStyle = on ? COL.red : 'rgba(255,255,255,.75)'; ctx.fillRect(bx + 2, y - bh / 2 + 2, (bw - 4) * it.level, bh - 4);
    ctx.fillStyle = on ? '#000' : '#fff'; ctx.fillRect(bx + 2 + (bw - 4) * it.level - 3, y - bh / 2 - 4, 6, bh + 8);
  }
  function drawMenu(m, items, x, y0, gap = 42, size = 26) {
    items.forEach((it, i) => {
      const y = y0 + i * gap, on = i === m.sel;
      if (it.level !== undefined) { drawBar(it, x, y, gap, size, on); return; }
      const label = it.label + (it.value !== undefined ? '   ' + it.value : '');
      ctx.font = PX(size);
      const w = ctx.measureText(label).width;
      it.box = { x: x - w / 2 - 20, y: y - gap / 2 + 4, w: w + 40, h: gap - 8 };
      if (on) {
        ctx.fillStyle = '#fff'; ctx.fillRect(x - w / 2 - 16, y - size / 2 - 6, w + 32, size + 12);
        text(label, x, y + 1, size, '#000');
        const bob = Math.sin(clock * 0.15) * 3;
        ctx.fillStyle = COL.red; ctx.fillRect(x - w / 2 - 34 + bob, y - 5, 10, 10);
      } else text(label, x, y + 1, size, it.disabled ? '#444' : 'rgba(255,255,255,.75)');
    });
  }

  // ---------- idioma ----------
  const langScene = {
    enter(next) { this.sel = save.lang === 'en' ? 1 : 0; this.next = next || 'title'; this.t = 0; },
    update() {
      this.t++;
      if (pressed.has('left') || pressed.has('up')) { this.sel = 0; SKA.sfx('move'); }
      if (pressed.has('right') || pressed.has('down')) { this.sel = 1; SKA.sfx('move'); }
      if (mouse.moved || mouse.click) {
        if (mouse.y > 220 && mouse.y < 320) { const s = mouse.x < VW / 2 ? 0 : 1; if (s !== this.sel) SKA.sfx('move'); this.sel = s; if (mouse.click) pressed.add('confirm'); }
        mouse.moved = mouse.click = false;
      }
      if (pressed.has('confirm')) {
        save.lang = this.sel ? 'en' : 'es'; persist(); SKA.sfx('select');
        if (this.next === 'options') go(optionsScene); else go(titleScene);
      }
    },
    draw() {
      drawBackdrop(0, 0, null, clock);
      const a = Math.min(1, this.t / 40);
      text('SOUL KEZNIT', VW / 2, 110, 34, `rgba(255,255,255,${0.35 * a})`);
      text('ESPAÑOL', VW * 0.3, 270, 56, this.sel === 0 ? COL.red : '#8a8580', 'center', 'px', a);
      text('ENGLISH', VW * 0.7, 270, 56, this.sel === 1 ? COL.red : '#8a8580', 'center', 'px', a);
      const x = this.sel === 0 ? VW * 0.3 : VW * 0.7;
      ctx.fillStyle = COL.red; ctx.globalAlpha = a; ctx.fillRect(x - 70, 310, 140, 4); ctx.globalAlpha = 1;
      text(UI.es.choose, VW / 2, 420, 22, 'rgba(255,255,255,.45)', 'center', 'serif');
    },
  };

  // ---------- título / menú principal ----------
  const demo = { x: 200, y: 0, vy: 0, t: 0 };
  const titleScene = {
    enter() { this.t = 0; this.sel = 0; this.confirm = false; SKA.play('menu'); },
    items() {
      const has = save.started;
      return [
        { label: ui('cont'), act: () => startLevel(save.cur, true), disabled: !has },
        { label: ui('newg'), act: () => { if (has) { this.confirm = true; this.csel = 1; } else newGame(); } },
        { label: ui('levels'), act: () => go(levelsScene), disabled: !has },
        { label: ui('memories'), act: () => go(memScene) },
        { label: ui('options'), act: () => go(optionsScene) },
        { label: ui('credits'), act: () => go(creditsScene) },
      ].concat(FROM ? [{ label: ui('exit'), act: () => { location.href = FROM; } }] : []);
    },
    update() {
      this.t++;
      if (this.confirm) {
        if (pressed.has('left') || pressed.has('right') || pressed.has('up') || pressed.has('down')) { this.csel ^= 1; SKA.sfx('move'); }
        if (pressed.has('back')) { this.confirm = false; SKA.sfx('back'); }
        if (mouse.click && mouse.y > 290 && mouse.y < 370) { this.csel = mouse.x < VW / 2 ? 0 : 1; pressed.add('confirm'); mouse.click = false; }
        else if (mouse.click) { this.confirm = false; mouse.click = false; SKA.sfx('back'); }
        if (pressed.has('confirm')) { SKA.sfx('select'); if (this.csel === 0) { const l = save.lang, o = save.opts; save = blank(); save.lang = l; save.opts = o; persist(); newGame(); } this.confirm = false; }
        return;
      }
      const items = this.items();
      if (this.sel === 0 && items[0].disabled) this.sel = 1;
      runMenu(this, items);
      this._items = items;
      if (pressed.has('back')) { go(langScene, 'title'); SKA.sfx('back'); }
    },
    draw() {
      drawBackdrop(this.t * 0.5, 0, 'rgba(255,52,52,.07)', clock);
      // cuadrado saltando sobre una línea (como en el original)
      demo.t++;
      demo.vy += 0.5; demo.y += demo.vy;
      if (demo.y > 0) { demo.y = 0; demo.vy = -9 - Math.random() * 3; }
      demo.x += 1.6; if (demo.x > VW + 40) demo.x = -40;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 488, VW, 4);
      glow('rgba(255,255,255,.6)', 16);
      const sq = Math.min(1.3, 1 + Math.abs(demo.vy) * 0.02);
      ctx.fillRect(demo.x - 12 / sq, 488 - 24 * sq + demo.y, 24 / sq, 24 * sq);
      noGlow();
      for (let i = 0; i < 6; i++) { const sx = ((i * 173 + this.t * 1.6) % (VW + 200)) - 100; ctx.fillStyle = COL.red; ctx.beginPath(); ctx.moveTo(sx, 488); ctx.lineTo(sx + 9, 470); ctx.lineTo(sx + 18, 488); ctx.fill(); }
      // título con glitch
      const gl = (Math.random() < 0.04) ? (Math.random() - 0.5) * 10 : 0;
      text('SOUL KEZNIT', VW / 2 + 4 + gl, 118 + 3, 84, 'rgba(255,52,52,.8)');
      text('SOUL KEZNIT', VW / 2 - gl * 0.5, 118, 84, '#fff');
      ctx.fillStyle = COL.red; ctx.fillRect(VW / 2 - 250, 170, 500, 4);
      text(ui('remake'), VW / 2, 196, 22, 'rgba(255,255,255,.7)');
      if (this._items) { const many = this._items.length > 6; drawMenu(this, this._items, VW / 2, many ? 246 : 262, many ? 34 : 38, many ? 20 : 22); }
      text('R3K1 · TheKittyBoyfriend', 20, VH - 18, 13, 'rgba(255,255,255,.35)', 'left');
      text(ui('menuHint'), VW - 20, VH - 18, 13, 'rgba(255,255,255,.35)', 'right');
      if (this.confirm) {
        ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(0, 0, VW, VH);
        text(ui('sure'), VW / 2, 210, 40, '#fff');
        text(ui('sure2'), VW / 2, 256, 22, 'rgba(255,255,255,.6)', 'center', 'serif');
        text(ui('yes'), VW / 2 - 90, 330, 34, this.csel === 0 ? COL.red : '#888');
        text(ui('no'), VW / 2 + 90, 330, 34, this.csel === 1 ? COL.red : '#888');
      }
    },
  };

  function newGame() {
    save.started = true; save.cur = 0; persist();
    go(storyScene, { pages: ST.intro, then: () => startLevel(0, true) });
  }

  // ---------- opciones ----------
  const optionsScene = {
    enter(from) { this.sel = 0; this.from = from || 'title'; },
    items() {
      const o = save.opts;
      const vol = (k) => (d) => { o[k] = Math.max(0, Math.min(1, Math.round((o[k] + d) * 10) / 10)); SKA.setVolumes(o.music, o.sfx); persist(); };
      const setVol = (k, f) => (v) => {
        v = Math.max(0, Math.min(1, Math.round(v * 20) / 20));
        if (v === o[k]) return;
        o[k] = v; SKA.setVolumes(o.music, o.sfx); persist(); if (f) f();
      };
      const tog = (k, f) => () => { o[k] = !o[k]; if (f) f(); persist(); };
      return [
        { id: 'music', label: ui('music'), level: o.music, set: setVol('music'), left: () => vol('music')(-0.1), right: () => vol('music')(0.1) },
        { id: 'sfx', label: ui('sfx'), level: o.sfx, set: setVol('sfx', () => SKA.sfx('jump')), left: () => { vol('sfx')(-0.1); SKA.sfx('jump'); }, right: () => { vol('sfx')(0.1); SKA.sfx('jump'); } },
        { label: ui('track'), value: o.orig ? ui('trackOrig') : ui('trackNew'), left: tog('orig', () => SKA.setOriginal(o.orig)), right: tog('orig', () => SKA.setOriginal(o.orig)), act: tog('orig', () => SKA.setOriginal(o.orig)) },
        { label: ui('shake'), value: o.shake ? ui('on') : ui('off'), left: tog('shake'), right: tog('shake'), act: tog('shake') },
        { label: ui('crt'), value: o.crt ? ui('on') : ui('off'), left: tog('crt'), right: tog('crt'), act: tog('crt') },
        { label: ui('lang'), value: save.lang === 'en' ? 'ENGLISH' : 'ESPAÑOL', act: () => go(langScene, 'options'), left: () => { save.lang = save.lang === 'en' ? 'es' : 'en'; persist(); }, right: () => { save.lang = save.lang === 'en' ? 'es' : 'en'; persist(); } },
        { label: ui('fullscreen'), act: toggleFullscreen },
        { label: ui('back'), act: () => this.leave() },
      ];
    },
    leave() { SKA.sfx('back'); if (this.from === 'pause') { scene = play; play.paused = true; play.pauseSel = 0; } else go(titleScene); },
    update() {
      const items = this.items();
      runMenu(this, items);
      this._items = items;
      if (pressed.has('back')) this.leave();
    },
    draw() {
      drawBackdrop(0, 0, null, clock);
      text(ui('options'), VW / 2, 70, 44, '#fff');
      if (this._items) drawMenu(this, this._items, VW / 2, 150, 44, 22);
      text(ui('optHint'), VW / 2, VH - 24, 13, 'rgba(255,255,255,.35)');
    },
  };
  function goFullscreen() {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement || matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches) return;
    try { const r = (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el); if (r && r.catch) r.catch(() => {}); } catch (e) { /* no se puede */ }
  }
  function toggleFullscreen() {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  }

  // ---------- selección de niveles ----------
  const levelsScene = {
    enter() { this.sel = Math.min(save.cur, save.unlocked); this.sel = LV[this.sel].bossPart ? LV.findIndex(l => l.bossPart === 0) : this.sel; },
    list() { return LV.map((l, i) => ({ l, i })).filter(o => !o.l.bossPart); },
    update() {
      const list = this.list();
      let k = list.findIndex(o => o.i === this.sel); if (k < 0) k = 0;
      const col = (o) => o.l.act === 3 ? 0 : LV.filter(x => x.act === o.l.act && !x.bossPart).indexOf(o.l);
      const move = (dAct, dCol) => {
        const cur = list[k];
        if (dAct) {
          const act = Math.max(0, Math.min(3, cur.l.act + dAct));
          const row = list.filter(o => o.l.act === act);
          const c = Math.min(col(cur), row.length - 1);
          if (row[c]) { this.sel = row[c].i; SKA.sfx('move'); }
        } else {
          const nk = Math.max(0, Math.min(list.length - 1, k + dCol));
          this.sel = list[nk].i; SKA.sfx('move');
        }
      };
      if (pressed.has('left')) move(0, -1);
      if (pressed.has('right')) move(0, 1);
      if (pressed.has('up')) move(-1, 0);
      if (pressed.has('down')) move(1, 0);
      if (mouse.moved || mouse.click) {
        for (const o of list) if (o.box && mouse.x > o.box.x && mouse.x < o.box.x + o.box.w && mouse.y > o.box.y && mouse.y < o.box.y + o.box.h) {
          if (this.sel !== o.i) SKA.sfx('move'); this.sel = o.i; if (mouse.click) pressed.add('confirm');
        }
        mouse.moved = mouse.click = false;
      }
      this._list = list;
      if (pressed.has('confirm')) {
        if (this.sel <= save.unlocked) { SKA.sfx('select'); startLevel(this.sel, true); } else SKA.sfx('back');
      }
      if (pressed.has('back')) { go(titleScene); SKA.sfx('back'); }
    },
    draw() {
      drawBackdrop(0, 0, null, clock);
      text(ui('levels'), VW / 2, 56, 40, '#fff');
      const list = this._list || this.list();
      for (let a = 0; a < 4; a++) {
        const y = 128 + a * 88;
        text(tr(ST.acts[a]), 70, y - 30, 14, a === 3 ? COL.red : 'rgba(255,255,255,.5)', 'left');
        const row = list.filter(o => o.l.act === a);
        row.forEach((o, j) => {
          const x = 70 + j * 170, w = a === 3 ? 330 : 150, h = 42;
          o.box = { x, y: y - 16, w, h };
          const locked = o.i > save.unlocked, on = o.i === this.sel;
          ctx.fillStyle = on ? '#fff' : (locked ? '#111' : '#1a1a1d');
          ctx.fillRect(x, y - 16, w, h);
          const fg = on ? '#000' : (locked ? '#444' : '#fff');
          text(o.l.id, x + 12, y + 5, 18, fg, 'left');
          const hasFrag = o.l.map.some(r => r.includes('M'));
          if (hasFrag) {
            const got = save.frags[o.i];
            ctx.save(); ctx.translate(x + w - 18, y + 5); ctx.rotate(Math.PI / 4);
            ctx.strokeStyle = on ? '#000' : '#fff'; ctx.lineWidth = 2; ctx.globalAlpha = got ? 1 : 0.35;
            if (got) { ctx.fillStyle = on ? '#000' : '#fff'; ctx.fillRect(-5, -5, 10, 10); } else ctx.strokeRect(-5, -5, 10, 10);
            ctx.restore(); ctx.globalAlpha = 1;
          }
          if (a === 3) text(tr(ST.boss.name), x + 70, y + 5, 16, on ? COL.red : (locked ? '#444' : COL.red), 'left');
          if (locked) text('✕', x + w / 2 + (a === 3 ? 90 : 10), y + 5, 14, '#444');
        });
      }
      const L0 = LV[this.sel];
      const locked = this.sel > save.unlocked;
      text(locked ? ui('locked') : `${L0.id}  ·  ${tr(L0.name)}`, VW / 2, 480, 24, locked ? '#666' : '#fff');
      const b = save.best[L0.id];
      if (b && !locked) text(`${ui('best')}  ${fmtTime(b)}`, VW / 2, 510, 14, 'rgba(255,255,255,.5)');
    },
  };

  // ---------- botón VOLVER con ratón (recuerdos y créditos) ----------
  const backBtn = { box: null };
  function backClicked() {
    const b = backBtn.box;
    if (!b || !mouse.click) return false;
    const hit = mouse.x > b.x && mouse.x < b.x + b.w && mouse.y > b.y && mouse.y < b.y + b.h;
    if (hit) mouse.click = false;
    return hit;
  }
  function drawBackBtn() {
    const label = ui('back'), size = 16, y = VH - 26;
    ctx.font = PX(size);
    const w = ctx.measureText(label).width;
    const b = backBtn.box = { x: VW / 2 - w / 2 - 18, y: y - 16, w: w + 36, h: 32 };
    const over = mouse.x > b.x && mouse.x < b.x + b.w && mouse.y > b.y && mouse.y < b.y + b.h;
    if (over) { ctx.fillStyle = '#fff'; ctx.fillRect(b.x, b.y, b.w, b.h); }
    else { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1); }
    text(label, VW / 2, y + 1, size, over ? '#000' : 'rgba(255,255,255,.75)');
  }

  // ---------- recuerdos ----------
  const memScene = {
    enter() { this.sel = 0; },
    update() {
      if (pressed.has('back') || pressed.has('confirm') || backClicked()) { go(titleScene); SKA.sfx('back'); return; }
      if (pressed.has('up')) this.sel = Math.max(0, this.sel - 1);
      if (pressed.has('down')) this.sel = Math.min(12, this.sel + 1);
    },
    draw() {
      drawBackdrop(0, 0, null, clock);
      const n = save.frags.filter(Boolean).length;
      text(ui('memTitle'), VW / 2, 44, 30, '#fff');
      text(`${n} / 13`, VW / 2, 78, 16, 'rgba(255,255,255,.5)');
      for (let i = 0; i < 13; i++) {
        const y = 112 + i * 31, got = save.frags[i];
        ctx.save(); ctx.translate(58, y); ctx.rotate(Math.PI / 4); ctx.globalAlpha = got ? 1 : 0.3;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        if (got) { ctx.fillStyle = '#fff'; ctx.fillRect(-5, -5, 10, 10); } else ctx.strokeRect(-5, -5, 10, 10);
        ctx.restore(); ctx.globalAlpha = 1;
        if (got) text(tr(ST.memories[i]), 84, y, 19, 'rgba(255,255,255,.9)', 'left', 'serif');
        else text(`${ui('memEmpty')} ${LV[i].id}`, 84, y, 17, 'rgba(255,255,255,.25)', 'left', 'serif');
      }
      drawBackBtn();
    },
  };

  // ---------- créditos ----------
  const creditsScene = {
    enter() { this.t = 0; },
    update() { this.t++; if (pressed.has('back') || pressed.has('confirm') || backClicked()) { go(titleScene); SKA.sfx('back'); } },
    draw() {
      drawBackdrop(0, this.t, null, clock);
      const lines = save.lang === 'en' ? [
        ['SOUL KEZNIT · REMAKE', 34, '#fff'], ['', 10], ['A game by', 16, '#888'], ['R3K1 · TheKittyBoyfriend', 28, COL.red], ['', 14],
        ['Based on the original Soul Keznit (Scratch)', 16, '#aaa'], ['Story, levels, characters and design: R3K1', 16, '#aaa'], ['', 14],
        ['Music', 16, '#888'], ['New chiptune soundtrack made for the remake', 16, '#aaa'], ['Optional original music: "She Knows" (8 Bit Remix), 8 Bit Universe · by J. Cole', 14, '#aaa'], ['', 14],
        ['Font: Pixelify Sans', 14, '#888'], ['', 20], [ui('thanks'), 24, '#fff', 'serif'],
      ] : [
        ['SOUL KEZNIT · REMAKE', 34, '#fff'], ['', 10], ['Un juego de', 16, '#888'], ['R3K1 · TheKittyBoyfriend', 28, COL.red], ['', 14],
        ['Basado en el Soul Keznit original (Scratch)', 16, '#aaa'], ['Historia, niveles, personajes y diseño: R3K1', 16, '#aaa'], ['', 14],
        ['Música', 16, '#888'], ['Banda sonora chiptune nueva, hecha para el remake', 16, '#aaa'], ['Música original opcional: "She Knows" (8 Bit Remix), 8 Bit Universe · de J. Cole', 14, '#aaa'], ['', 14],
        ['Tipografía: Pixelify Sans', 14, '#888'], ['', 20], [ui('thanks'), 24, '#fff', 'serif'],
      ];
      let y = 70;
      for (const [s, size, c, f] of lines) { if (s) text(s, VW / 2, y, size, c, 'center', f === 'serif' ? 'serif' : 'px'); y += size + 16; }
      drawBackBtn();
    },
  };

  // ---------- historia (páginas) ----------
  const storyScene = {
    enter(o) { this.pages = o.pages; this.then = o.then; this.i = 0; this.t = 0; this.chars = 0; SKA.play(o.music || 'menu'); this.o = o; },
    update() {
      this.t++;
      const pg = this.pages[this.i];
      const s = tr(pg);
      if (this.chars < s.length) {
        this.chars += pg.t === 'v' ? 0.7 : 0.9;
        if (pg.t === 'v' && Math.floor(this.chars) % 2 === 0 && this.chars < s.length) SKA.sfx('blip');
      }
      if (pg.t === 'chains' && this.t === 1) { SKA.sfx('chains'); }
      if (pg.t === 'chains' && this.t === 70) { SKA.sfx('rumble'); addShake(10); }
      if (pressed.has('back') && this.o.skippable !== false) { this.then(); return; }
      const auto = pg.t === 'chains' && this.t > 190;
      if (pressed.has('confirm') || pressed.has('jump') || auto) {
        if (this.chars < s.length && !auto) this.chars = s.length;
        else {
          this.i++; this.t = 0; this.chars = 0;
          if (this.i >= this.pages.length) { this.then(); return; }
          SKA.sfx('move');
          if (this.pages[this.i].t === 'title') SKA.play('final');
        }
      }
    },
    draw() {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
      const pg = this.pages[this.i];
      const s = tr(pg).slice(0, Math.floor(this.chars));
      const fade = Math.min(1, this.t / 30);
      if (pg.t === 'n') {
        const lines = wrap(s, 760, 38, 'serif');
        lines.forEach((l, k) => text(l, VW / 2, VH / 2 - (lines.length - 1) * 24 + k * 48, 38, '#fff', 'center', 'serif', fade));
      } else if (pg.t === 'sq') {
        const a = Math.min(1, this.t / 50);
        glow('rgba(255,255,255,.9)', 30 * a);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        const sz = 24 + Math.sin(this.t * 0.08) * 1.5;
        ctx.fillRect(VW / 2 - sz / 2, 200 - sz / 2, sz, sz);
        noGlow();
        // ojitos
        if (a > 0.8 && (this.t % 160) > 6) { ctx.fillStyle = '#000'; ctx.fillRect(VW / 2 - 6, 196, 3, 5); ctx.fillRect(VW / 2 + 3, 196, 3, 5); }
        text(s, VW / 2, 330, 36, '#fff', 'center', 'serif');
      } else if (pg.t === 'v' || pg.t === 'orig') {
        if (pg.t === 'v') text(ui('voice'), VW / 2, VH / 2 - 60, 14, COL.red);
        const lines = wrap(s, 800, pg.t === 'orig' ? 54 : 30);
        const sz = pg.t === 'orig' ? 54 : 30;
        lines.forEach((l, k) => text(l, VW / 2, VH / 2 - (pg.t === 'orig' ? 50 : 0) - (lines.length - 1) * sz * 0.6 + k * sz * 1.2, sz, '#fff'));
        if (pg.t === 'orig') {
          ctx.fillStyle = COL.red; ctx.fillRect(VW / 2 - 300, VH / 2 + 50, 600, 6);
          // el cuadrado rodando, como en el final original
          const x = VW / 2 - 300 + ((this.t * 3) % 640), ang = this.t * 0.08;
          ctx.save(); ctx.translate(x, VH / 2 + 30); ctx.rotate(ang); ctx.fillStyle = '#fff'; ctx.fillRect(-11, -11, 22, 22); ctx.restore();
        }
      } else if (pg.t === 'chains') {
        const t = this.t;
        const drop = Math.min(1, t / 60), pull = Math.max(0, (t - 80) / 90);
        const sy = VH / 2 + pull * pull * 400;
        ctx.fillStyle = '#fff';
        glow('rgba(255,255,255,.8)', 20);
        ctx.fillRect(VW / 2 - 12, sy - 12, 24, 24);
        noGlow();
        ctx.strokeStyle = COL.red; ctx.lineWidth = 4;
        for (const side of [-1, 1]) {
          const x0 = VW / 2 + side * 220, x1 = VW / 2 + side * 12;
          const yEnd = -40 + (sy + 40) * drop;
          ctx.beginPath();
          for (let k = 0; k <= 12; k++) {
            const q = k / 12;
            const x = x0 + (x1 - x0) * q, y = -40 + (yEnd + 40) * q + Math.sin(q * Math.PI) * 30;
            ctx.save(); ctx.translate(x, y); ctx.rotate(q * 2 + side); ctx.strokeRect(-6, -4, 12, 8); ctx.restore();
          }
        }
      } else if (pg.t === 'title') {
        text(s.replace('SOUL KEZNIT 2', ''), VW / 2, 190, 26, 'rgba(255,255,255,.7)', 'center', 'serif');
        if (this.chars >= tr(pg).length - 13) {
          text('SOUL KEZNIT', VW / 2, 270, 70, '#fff', 'center', 'px', fade);
          text('2', VW / 2, 350, 90, COL.red, 'center', 'px', fade);
        }
      }
      if (pg.t !== 'chains') {
        const blink = (Math.floor(clock / 30) % 2) ? 0.5 : 0.25;
        text(ui('next') + ' ›', VW - 30, VH - 26, 14, `rgba(255,255,255,${blink})`, 'right');
        if (this.o.skippable !== false) text(ui('skip'), 30, VH - 26, 12, 'rgba(255,255,255,.25)', 'left');
      }
    },
  };

  // ---------- tarjeta de acto / jefe ----------
  const cardScene = {
    enter(o) { this.o = o; this.t = 0; if (o.sound) SKA.sfx(o.sound); },
    update() {
      this.t++;
      if ((this.t > this.o.dur) || (this.t > 30 && (pressed.has('confirm') || pressed.has('jump')))) this.o.then();
    },
    draw() {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
      const a = Math.min(1, this.t / 25, (this.o.dur - this.t) / 25);
      if (this.o.kind === 'phase') {
        // entre fases: la Trituradora ruge y la pantalla tiembla
        const t = this.t, sh = Math.max(0, 1 - t / 60) * 14;
        const ox = (Math.random() - 0.5) * sh, oy = (Math.random() - 0.5) * sh;
        drawBackdrop(0, 0, `rgba(255,52,52,${0.2 + (t % 10 < 5 && t < 40 ? 0.2 : 0)})`, clock);
        const R = 150 + Math.sin(t * 0.3) * 6;
        star(VW / 2 + ox, VH / 2 + oy - 20, R * 1.3, -t * 0.03, 16, 0.06, `rgba(150,20,20,${0.5 * a})`);
        glow(COL.red, 40); star(VW / 2 + ox, VH / 2 + oy - 20, R, t * 0.08, 8, 0.2, `rgba(255,52,52,${0.35 * a})`); noGlow();
        const bar = Math.min(90, t * 5);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, bar); ctx.fillRect(0, VH - bar, VW, bar);
        const pop = 1 + Math.max(0, 1 - t / 14) * 0.6;
        text(`${tr(ST.phase)} ${['I', 'II', 'III'][this.o.part]}`, VW / 2 + ox, VH / 2 - 40 + oy, 84 * pop, '#fff', 'center', 'px', a);
        text(this.o.name.toUpperCase(), VW / 2, VH / 2 + 34, 30, COL.red, 'center', 'px', a);
        // barra: la fase anterior ya está vacía
        for (let k = 0; k < 3; k++) {
          ctx.globalAlpha = a; ctx.fillStyle = k < this.o.part ? 'rgba(255,255,255,.12)' : COL.red;
          ctx.fillRect(VW / 2 - 150 + k * 102, VH / 2 + 70, 96, 8); ctx.globalAlpha = 1;
        }
        if (t < 3) { flash = 0.6; flashCol = COL.red; }
      } else if (this.o.kind === 'boss') {
        // barras de cine como en Soul Keznit 2
        const bar = Math.min(90, this.t * 4);
        drawBackdrop(0, 0, 'rgba(255,52,52,.25)', clock);
        star(VW / 2, VH / 2 - 10, 120, clock * 0.05, 8, 0.12, `rgba(255,52,52,${0.25 * a})`);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, bar); ctx.fillRect(0, VH - bar, VW, bar);
        text(tr(ST.boss.name), VW / 2, VH / 2 - 16, 72, COL.red, 'center', 'px', a);
        text(tr(ST.boss.epi), VW / 2, VH / 2 + 44, 28, '#ddd', 'center', 'serif', a);
      } else {
        const roman = ['I', 'II', 'III'][this.o.act];
        text(roman, VW / 2, VH / 2 - 50, 110, `rgba(255,255,255,${0.12 * a})`);
        text(tr(ST.acts[this.o.act]), VW / 2, VH / 2 + 20, 40, '#fff', 'center', 'px', a);
        ctx.fillStyle = COL.red; ctx.globalAlpha = a; ctx.fillRect(VW / 2 - 60, VH / 2 + 56, 120, 4); ctx.globalAlpha = 1;
      }
    },
  };

  // ======================================================
  // JUEGO
  // ======================================================
  const play = {};
  function startLevel(i, fromMenu) {
    const L = LV[i];
    const prev = play.li;
    const showCard = fromMenu || prev === undefined || LV[prev].act !== L.act;
    const begin = () => { go(play, { i, fresh: true }); };
    if (L.bossPart === 0 && (fromMenu || prev !== i)) {
      go(cardScene, { kind: 'boss', dur: 190, sound: 'tele', then: begin });
      SKA.play('boss');
    } else if (L.bossPart > 0 && prev !== i) {
      go(cardScene, { kind: 'phase', part: L.bossPart, name: tr(L.name), dur: 150, sound: 'roar', then: begin });
    } else if (showCard && L.act < 3 && !L.bossPart) {
      go(cardScene, { kind: 'act', act: L.act, dur: 130, then: begin });
      SKA.play(L.music);
    } else begin();
  }

  Object.assign(play, {
    enter(o) {
      this.li = o.i;
      this.L = LV[o.i];
      save.cur = o.i; persist();
      this.levelDeaths = 0; this.levelTime = 0; this.surrenderShown = 0;
      this.check = null; this.barShow = undefined; this.barVal = undefined; this.rageMsg = null;
      this.load(true);
      SKA.play(this.L.music);
      this.voiceQ = this.L.voice ? this.L.voice.slice() : [];
      this.voice = null;
      this.cut = null;
      if (this.L.cut === 'soldier' && o.fresh) this.cut = { kind: 'soldier', i: 0, chars: 0, t: 0, phase: 'talk', npcY: 0, chainY: -60 };
      this.hint = this.L.bossPart !== undefined ? { s: tr(ST.boss.hints[this.L.bossPart]), t: 0 } : null;
      if (this.L.bossPart === 2) { SKA.sfx('rumble'); addShake(12); }
      this.nameT = 0;
    },
    load(first) {
      const gotFrag = !!save.frags[this.li];
      this.w = SKE.create(this.L, { gotFrag, check: this.check });
      this.layers = buildLayers(this.w);
      this.cam = this.camTarget();
      if (first) { this.cam = this.camTarget(); }
      this.spawnT = 0;
      this.dead = 0;
      this.wipe = { mode: 'open', t: 0, dur: 26 };
      this.squash = { x: 1, y: 1 };
      this.trail = [];
      this.tramps = {};
      this.souls = [];
      this.paused = false;
      this.surrender = null;
      this.memory = this.memory && this.memory.t < 400 ? this.memory : null;
      parts = [];
      const w = this.w;
      for (let i = 0; i < 16; i++) burst(w.p.x + 11, w.p.y + 11, 1, '#fff', 0.6, 3, 0, 30);
    },
    camTarget() {
      const w = this.w, p = w.p;
      let x = p.x + p.w / 2 - VW / 2, y = p.y + p.h / 2 - VH / 2;
      if (w.boss && w.boss.kind === 'chase') x += 120;
      x = Math.max(0, Math.min(w.pw - VW, x)); y = Math.max(0, Math.min(w.ph - VH, y));
      return { x, y };
    },
    update() {
      const w = this.w;
      if (this.paused) return this.updatePause();
      if (this.surrender) return this.updateSurrender();
      if (this.cut && pressed.has('back')) { this.cut = null; SKA.sfx('back'); return; }
      if (pressed.has('pause')) { openPause(); return; }
      if (this.wipe) { this.wipe.t++; if (this.wipe.t >= this.wipe.dur) { const then = this.wipe.then; this.wipe = null; if (then) { then(); return; } } }
      if (this.hitstop > 0) { this.hitstop--; return; }
      this.nameT++;
      // escena del soldado
      if (this.cut) { this.updateCut(); stepFx(this); return; }
      // voz
      this.updateVoice();
      if (this.hint) this.hint.t++;
      if (this.rageMsg) this.rageMsg.t++;

      if (w.p.dead) {
        this.dead++;
        if (this.dead === 24) {
          this.load(false);
          if (this.levelDeaths > 0 && (this.levelDeaths === 12 || this.levelDeaths % 30 === 0) && this.surrenderShown < this.levelDeaths) {
            this.surrenderShown = this.levelDeaths;
            this.surrender = { sel: 1, t: 0, phase: 'ask' };
            SKA.sfx('surrender');
          }
        }
        stepFx(this); return;
      }
      if (w.done) { stepFx(this); return; }
      if (pressed.has('restart')) { this.check = null; this.load(false); return; }

      const input = {
        left: isHeld('left'), right: isHeld('right'), down: isHeld('down'),
        jump: isHeld('jump'), jumpPressed: pressed.has('jump'),
      };
      const evs = SKE.step(w, input);
      this.levelTime++; save.time++;
      if (save.time % 300 === 0) persist();
      for (const e of evs) this.onEvent(e);
      // cola de almas (decorado)
      if (this.L.queue && clock % 70 === 0) this.souls.push({ x: 600, y: 120 - 20, a: 0 });
      for (const s of this.souls) { s.x += 2; s.a = Math.min(0.35, s.a + 0.02); if (s.x > 890) s.a -= 0.05; }
      this.souls = this.souls.filter(s => s.a > 0 && s.x < 910);
      // estela
      const p = w.p;
      if (Math.abs(p.vx) > 3 || Math.abs(p.vy) > 6) this.trail.push({ x: p.x, y: p.y, a: 0.22 });
      for (const t of this.trail) t.a -= 0.03;
      this.trail = this.trail.filter(t => t.a > 0).slice(-8);
      if (p.sliding && clock % 4 === 0) burst(p.x + (p.wall > 0 ? p.w : 0), p.y + p.h, 1, '#fff', 0.6, 3, 0.05, 18);
      // cámara
      const tg = this.camTarget();
      this.cam.x += (tg.x - this.cam.x) * 0.12; this.cam.y += (tg.y - this.cam.y) * 0.12;
      // squash
      this.squash.x += (1 - this.squash.x) * 0.2; this.squash.y += (1 - this.squash.y) * 0.2;
      stepFx(this);
    },
    onEvent(e) {
      const w = this.w;
      switch (e.e) {
        case 'jump': SKA.sfx('jump'); this.squash = { x: 0.72, y: 1.3 }; burst(e.x, e.y, 5, '#fff', 1.2, 3, 0.05, 20); break;
        case 'walljump': SKA.sfx('walljump'); this.squash = { x: 1.25, y: 0.8 }; burst(e.x, e.y, 6, '#fff', 1.6, 3, 0.05, 20); break;
        case 'land': if (e.v > 8) { SKA.sfx('land'); this.squash = { x: 1.35, y: 0.7 }; burst(e.x, e.y, Math.min(10, e.v / 3), '#fff', 1, 3, 0.02, 20); } break;
        case 'bonk': SKA.sfx('bonk'); break;
        case 'toggle': SKA.sfx('toggle'); this.toggleFlash = 10; break;
        case 'tramp': SKA.sfx('tramp'); this.tramps[e.c + ',' + e.r] = 12; burst(e.c * T + 15, e.r * T + 24, 10, COL.orange, 2.5, 4, 0.1, 25); this.squash = { x: 0.6, y: 1.45 }; break;
        case 'key': SKA.sfx('key'); burst(e.x, e.y, 24, COL.orange, 3, 4); flash = 0.25; flashCol = COL.orange; setTimeout(() => SKA.sfx('door'), 250); addShake(4); break;
        case 'frag': {
          SKA.sfx('frag'); burst(e.x, e.y, 36, '#fff', 3.5, 4, 0.02, 60); flash = 0.35; flashCol = '#fff';
          save.frags[this.li] = true; persist();
          this.memory = { s: tr(ST.memories[this.li]), t: 0 };
          break;
        }
        case 'port': SKA.sfx('port'); burst(e.from.x, e.from.y, 20, COL.purple, 3, 4, 0); burst(e.to.x, e.to.y, 20, COL.purple, 3, 4, 0); flash = 0.2; flashCol = COL.purple; break;
        case 'crack': SKA.sfx('crack'); break;
        case 'break': SKA.sfx('break'); burst(e.c * T + 15, e.r * T + 15, 10, '#fff', 1.5, 5, 0.25, 40); break;
        case 'check': this.check = { i: e.i, key: e.key }; SKA.sfx('key'); burst(e.x, e.y, 20, '#fff', 2.5, 4, 0.02, 40); flash = 0.12; flashCol = '#fff'; break;
        case 'flag': this.complete(e); break;
        case 'death': this.die(e); break;
        case 'tele': SKA.sfx('tele'); break;
        case 'shard': SKA.sfx('shard'); burst(e.x, e.y, 10, COL.red, 2.5, 4, 0.15, 30); addShake(3); break;
        case 'aim': SKA.sfx('aim'); break;
        case 'dash': SKA.sfx('dash'); addShake(8); flash = 0.12; flashCol = COL.red; break;
        case 'slam': SKA.sfx('slam'); addShake(10); burst(e.x, e.y, 16, '#fff', 3, 4, 0.1, 30); break;
        case 'burst': SKA.sfx('burst'); addShake(4); break;
        case 'bossHit': SKA.sfx('bossHit'); setTimeout(() => SKA.sfx('roar'), 350); addShake(18); flash = 0.55; flashCol = COL.orange; burst(e.x, e.y, 50, COL.red, 6, 6, 0.1, 50); this.hitstop = 10; this.rageMsg = { t: 0, hits: e.hits }; break;
        case 'brakeOn': SKA.sfx('brake'); break;
        case 'bossDown': this.complete({ x: w.boss.x, y: w.boss.y, boss: true }); break;
      }
    },
    die(e) {
      SKA.sfx('death'); addShake(9); flash = 0.35; flashCol = COL.red; this.hitstop = 5;
      burst(e.x, e.y, 14, '#fff', 4, 6, 0.2, 55);
      burst(e.x, e.y, 10, COL.red, 3, 5, 0.2, 45);
      this.levelDeaths++; save.deaths++; persist();
    },
    complete(e) {
      const w = this.w;
      if (e.boss) { SKA.sfx('bossDown'); addShake(20); flash = 0.8; flashCol = '#fff'; for (let i = 0; i < 5; i++) burst(e.x, e.y, 30, i % 2 ? COL.red : '#fff', 6, 7, 0.1, 80); }
      else if (this.L.bossPart !== undefined) { SKA.sfx('roar'); addShake(16); flash = 0.4; flashCol = COL.red; burst(e.x, e.y, 40, COL.red, 4, 5, 0.05, 50); }
      else { SKA.sfx('flag'); burst(e.x, e.y, 34, COL.green, 3.5, 4, 0.05, 50); flash = 0.2; flashCol = COL.green; }
      const id = this.L.id;
      if (!save.best[id] || this.levelTime < save.best[id]) save.best[id] = this.levelTime;
      const next = this.li + 1;
      if (next < LV.length) { save.unlocked = Math.max(save.unlocked, next); save.cur = next; }
      persist();
      const px = w.p.x + w.p.w / 2 - this.cam.x, py = w.p.y + w.p.h / 2 - this.cam.y;
      this.wipe = {
        mode: 'close', t: -(e.boss ? 100 : 30), dur: 34, x: px, y: py, then: () => {
          if (next >= LV.length) { finishGame(); return; }
          startLevel(next, false);
        },
      };
    },
    updateVoice() {
      if (!this.voice && this.voiceQ.length && this.nameT > 50) this.voice = { s: tr(this.voiceQ.shift()), t: 0, c: 0 };
      if (this.voice) {
        const v = this.voice; v.t++;
        if (v.c < v.s.length) { v.c += 0.8; if (Math.floor(v.c) % 3 === 0) SKA.sfx('blip'); }
        if (v.t > v.s.length * 1.25 + 170) this.voice = null;
      }
      if (this.memory) this.memory.t++;
      if (this.memory && this.memory.t > 460) this.memory = null;
    },
    updateCut() {
      const c = this.cut, lines = ST.soldier;
      c.t++;
      if (pressed.has('back')) { this.cut = null; return; }
      if (c.phase === 'talk') {
        const ln = lines[c.i], s = tr(ln);
        if (c.chars < s.length) { c.chars += 0.8; if (Math.floor(c.chars) % 3 === 0) SKA.sfx(ln.s === 'V' ? 'blip' : 'talk'); }
        if (ln.chains) c.chainY = Math.min(c.chainY + 6, 0);
        if (pressed.has('confirm') || pressed.has('jump')) {
          if (c.chars < s.length) c.chars = s.length;
          else if (ln.leave) { c.phase = 'leave'; c.t = 0; SKA.sfx('chains'); }
          else { c.i++; c.chars = 0; if (lines[c.i].chains) SKA.sfx('chains'); }
        }
      } else if (c.phase === 'leave') {
        c.npcY -= Math.min(12, c.t * 0.25); c.chainY = c.npcY;
        if (c.t === 20) { for (let i = 0; i < 8; i++) burst(this.w.npcs[0].x + 12, this.w.npcs[0].y + c.npcY, 2, COL.orange, 2, 4); }
        if (c.t > 90) this.cut = null;
      }
    },
    updatePause() {
      const items = [
        { label: ui('resume'), act: () => { this.paused = false; SKA.pauseAll(false); } },
        { label: ui('restart'), act: () => { this.paused = false; SKA.pauseAll(false); this.check = null; this.load(false); } },
        { label: ui('options'), act: () => { SKA.pauseAll(false); go(optionsScene, 'pause'); } },
        { label: ui('quit'), act: () => { this.paused = false; SKA.pauseAll(false); persist(); go(titleScene); } },
      ];
      const m = { sel: this.pauseSel || 0, _items: this._pItems };
      runMenu(m, items);
      this.pauseSel = m.sel; this._pItems = items;
      if (pressed.has('back') && scene === play && this.paused) { this.paused = false; SKA.pauseAll(false); }
    },
    updateSurrender() {
      const s = this.surrender; s.t++;
      if (s.phase === 'ask') {
        if (mouse.click && mouse.y > 280 && mouse.y < 370) { s.sel = mouse.x < VW / 2 ? 0 : 1; pressed.add('confirm'); mouse.click = false; }
        if (pressed.has('left') || pressed.has('right') || pressed.has('up') || pressed.has('down')) { s.sel ^= 1; SKA.sfx('move'); }
        if (pressed.has('confirm') || pressed.has('jump')) {
          if (s.sel === 0) { s.phase = 'glitch'; s.t = 0; SKA.sfx('bonk'); }
          else { s.phase = 'answer'; s.t = 0; SKA.sfx('select'); }
        }
      } else if (s.phase === 'glitch') {
        if (s.t % 6 === 0) SKA.sfx('blip');
        if (s.t > 50) { s.phase = 'answer'; s.t = 0; s.sel = 1; }
      } else if (s.phase === 'answer' && (s.t > 150 || (s.t > 30 && (pressed.has('confirm') || pressed.has('jump') || mouse.click)))) this.surrender = null;
    },

    // ---------------- dibujo ----------------
    draw() {
      const w = this.w;
      const sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0;
      const cx = Math.round(this.cam.x - sx), cy = Math.round(this.cam.y - sy);
      const tint = [null, 'rgba(181,51,255,.09)', 'rgba(255,52,52,.08)', `rgba(255,52,52,${0.14 + Math.sin(clock * 0.05) * 0.05})`][this.L.act];
      drawBackdrop(cx, cy, tint, clock);
      // jefe: engranajes gigantes girando al fondo
      if (this.L.act === 3) {
        const rage = w.boss && w.boss.rage || 0;
        for (let i = 0; i < 4; i++) {
          const gx = 160 + i * 330 - cx * 0.3, gy = 150 + (i % 2) * 260 - cy * 0.3;
          star(gx, gy, 150 + (i % 2) * 40, clock * (0.006 + rage * 0.004) * (i % 2 ? 1 : -1), 12, 0.09, `rgba(255,52,52,${0.05 + rage * 0.015})`);
        }
      }
      // capas
      ctx.drawImage(this.layers.solid, -cx, -cy);
      const pulse = 0.75 + Math.sin(clock * 0.06) * 0.15 + (Math.random() < 0.01 ? 0.3 : 0);
      ctx.globalAlpha = pulse; ctx.drawImage(this.layers.red, -cx, -cy); ctx.globalAlpha = 1;
      this.drawTiles(cx, cy);
      this.drawEnts(cx, cy);
      if (w.boss) this.drawBoss(cx, cy);
      if (w.drops && w.drops.length) this.drawDrops(cx, cy);
      this.drawPlayer(cx, cy);
      drawParts(cx, cy);
      if (w.rise) this.drawRise(cx, cy);
      if (this.L.dark) this.drawDark(cx, cy);
      if (this.cut) this.drawCut(cx, cy);
      if (flash > 0) { ctx.globalAlpha = flash; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }
      if (this.wipe) this.drawWipe();
      this.drawHud();
      if (this.surrender) this.drawSurrender();
      if (this.paused) this.drawPause();
    },
    drawTiles(cx, cy) {
      const w = this.w;
      const c0 = Math.max(0, Math.floor(cx / T)), c1 = Math.min(w.W - 1, Math.floor((cx + VW) / T));
      const r0 = Math.max(0, Math.floor(cy / T)), r1 = Math.min(w.H - 1, Math.floor((cy + VH) / T));
      const tf = this.toggleFlash > 0 ? this.toggleFlash-- / 10 : 0;
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
        const t = w.grid[r * w.W + c];
        if (!t || t === TL.SOLID || t === TL.RED || (t >= TL.SPK_U && t <= TL.SPK_R)) continue;
        const X = c * T - cx, Y = r * T - cy;
        switch (t) {
          case TL.ONEWAY:
            ctx.fillStyle = '#fff'; ctx.fillRect(X, Y, T, 6);
            ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(X + 4, Y + 6, 2, 6); ctx.fillRect(X + 24, Y + 6, 2, 6);
            break;
          case TL.CRUMBLE: {
            const s = w.crumble.get(r * w.W + c);
            if (s && s.broken > 0) {
              ctx.strokeStyle = `rgba(255,255,255,${0.15 + 0.2 * (1 - s.broken / SKE.PHY.crumbleRespawn)})`; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
              ctx.strokeRect(X + 2, Y + 2, T - 4, T - 4); ctx.setLineDash([]);
              break;
            }
            const sh = s ? (Math.random() - 0.5) * 3 * (1 - s.t / SKE.PHY.crumbleDelay) : 0;
            ctx.fillStyle = '#fff'; ctx.fillRect(X + sh, Y, T, T);
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath();
            ctx.moveTo(X + sh + 6, Y); ctx.lineTo(X + sh + 12, Y + 12); ctx.lineTo(X + sh + 8, Y + 20); ctx.lineTo(X + sh + 16, Y + T);
            ctx.moveTo(X + sh + 12, Y + 12); ctx.lineTo(X + sh + 24, Y + 9);
            ctx.stroke();
            break;
          }
          case TL.TOG_A: case TL.TOG_B: {
            const on = (t === TL.TOG_A) === (w.phase === 0);
            if (on) {
              ctx.fillStyle = '#fff'; ctx.fillRect(X, Y, T, T);
              ctx.fillStyle = '#000'; ctx.fillRect(X + 7, Y + 7, T - 14, T - 14);
              ctx.fillStyle = '#fff'; ctx.fillRect(X + 12, Y + 12, T - 24, T - 24);
              if (tf) { ctx.globalAlpha = tf; ctx.fillStyle = COL.purple; ctx.fillRect(X, Y, T, T); ctx.globalAlpha = 1; }
            } else {
              ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.setLineDash([3, 5]); ctx.lineWidth = 2;
              ctx.strokeRect(X + 3, Y + 3, T - 6, T - 6); ctx.setLineDash([]);
            }
            break;
          }
          case TL.CONV_L: case TL.CONV_R: {
            ctx.fillStyle = '#fff'; ctx.fillRect(X, Y, T, T);
            const d = t === TL.CONV_R ? 1 : -1, off = ((clock * 2 * d) % 15 + 15) % 15;
            ctx.fillStyle = '#000';
            for (let k = -1; k < 3; k++) {
              const x = X + k * 15 + off;
              if (x < X - 6 || x > X + T - 4) continue;
              ctx.beginPath();
              if (d > 0) { ctx.moveTo(x, Y + 8); ctx.lineTo(x + 6, Y + 15); ctx.lineTo(x, Y + 22); }
              else { ctx.moveTo(x + 6, Y + 8); ctx.lineTo(x, Y + 15); ctx.lineTo(x + 6, Y + 22); }
              ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke();
            }
            break;
          }
          case TL.DOOR: {
            const o = w.doorOpen;
            if (o > 40) break;
            const k = o ? 1 - o / 40 : 1;
            glow(COL.orange, 12);
            ctx.fillStyle = COL.orange2; ctx.fillRect(X + 10, Y + (1 - k) * T, 10, T * k);
            noGlow();
            if (o && o % 3 === 0) burst(c * T + 15, r * T + 15, 1, COL.orange, 2, 4);
            break;
          }
          case TL.TRAMP: {
            const k = this.tramps[c + ',' + r] || 0;
            if (k) this.tramps[c + ',' + r] = k - 1;
            const comp = k > 6 ? (12 - k) / 6 : k / 6;
            ctx.fillStyle = '#7a4a10'; ctx.fillRect(X + 4, Y + T - 5, T - 8, 5);
            glow(COL.orange, 10);
            ctx.fillStyle = COL.orange; ctx.fillRect(X + 1, Y + T - 10 + comp * 4 - (k ? 3 : 0), T - 2, 6);
            noGlow();
            break;
          }
          case TL.LAS_A: case TL.LAS_B: {
            const st = SKE.laserState(w, t), vert = SKE.beamVertical(w, c, r);
            if (st === 2) {
              glow(COL.red, 16); ctx.fillStyle = COL.red;
              if (vert) ctx.fillRect(X + 10, Y, 10, T); else ctx.fillRect(X, Y + 10, T, 10);
              noGlow(); ctx.fillStyle = '#ffd0d0';
              if (vert) ctx.fillRect(X + 14, Y, 2, T); else ctx.fillRect(X, Y + 14, T, 2);
            } else if (st === 1) {
              ctx.fillStyle = (clock % 6 < 3) ? 'rgba(255,52,52,.7)' : 'rgba(255,52,52,.25)';
              if (vert) ctx.fillRect(X + 14, Y, 2, T); else ctx.fillRect(X, Y + 14, T, 2);
            } else {
              ctx.fillStyle = 'rgba(255,52,52,.14)';
              for (let k = 0; k < T; k += 6) { if (vert) ctx.fillRect(X + 14, Y + k, 2, 3); else ctx.fillRect(X + k, Y + 14, 3, 2); }
            }
            // emisores donde el rayo toca algo sólido
            ctx.fillStyle = '#fff';
            if (vert) {
              if (SKE.at(w, c, r - 1) === TL.SOLID) ctx.fillRect(X + 8, Y, 14, 5);
              if (SKE.at(w, c, r + 1) === TL.SOLID) ctx.fillRect(X + 8, Y + T - 5, 14, 5);
            } else {
              if (SKE.at(w, c - 1, r) === TL.SOLID) ctx.fillRect(X, Y + 8, 5, 14);
              if (SKE.at(w, c + 1, r) === TL.SOLID) ctx.fillRect(X + T - 5, Y + 8, 5, 14);
            }
            break;
          }
        }
      }
    },
    drawEnts(cx, cy) {
      const w = this.w;
      // señales
      for (const s of this.L.signs || []) {
        const col = s.red ? COL.red : s.orange ? COL.orange : '#fff';
        text(tr(s), s.x * T - cx, s.y * T - cy, s.small ? 13 : 17, col, 'center', 'px', s.small ? 0.4 : 0.6);
      }
      // plataformas móviles
      for (const pl of w.plats) {
        glow('rgba(255,255,255,.4)', 12);
        ctx.fillStyle = '#fff'; ctx.fillRect(pl.x - cx, pl.y - cy, pl.w, pl.h);
        noGlow();
        ctx.fillStyle = '#000'; for (let k = 8; k < pl.w - 4; k += 14) ctx.fillRect(pl.x - cx + k, pl.y - cy + 12, 6, 6);
        // cadena
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.setLineDash([4, 6]); ctx.lineWidth = 2; ctx.beginPath();
        pl.path.forEach((q, i) => { const X = q[0] + pl.w / 2 - cx, Y = q[1] + pl.h / 2 - cy; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.stroke(); ctx.setLineDash([]);
      }
      // sierras
      for (const s of w.saws) {
        if (s.x === undefined) continue;
        if (s.path.length > 1) {
          ctx.strokeStyle = 'rgba(255,52,52,.15)'; ctx.setLineDash([3, 6]); ctx.lineWidth = 2; ctx.beginPath();
          s.path.forEach((q, i) => { const X = q[0] * T - cx, Y = q[1] * T - cy; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
          ctx.stroke(); ctx.setLineDash([]);
        }
        glow(COL.red, 16);
        star(s.x - cx, s.y - cy, s.r, clock * 0.28, 8, 0.24);
        noGlow();
      }
      // llaves
      for (const k of w.keys) {
        if (k.got) continue;
        const X = k.x - cx + 15, Y = k.y - cy + 15 + Math.sin(clock * 0.09) * 4;
        glow(COL.orange, 14);
        ctx.strokeStyle = COL.orange; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(X + 6, Y, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = COL.orange; ctx.fillRect(X - 11, Y - 1.5, 12, 3); ctx.fillRect(X - 11, Y, 3, 6); ctx.fillRect(X - 5, Y, 3, 4);
        noGlow();
        if (clock % 20 === 0) burst(k.x + 15, k.y + 15, 1, COL.orange, 0.8, 2, -0.02, 30);
      }
      // portales
      for (const k in w.ports) {
        const a = w.ports[k], b = w.exits[k];
        const X = a.x - cx + 15, Y = a.y - cy + 15;
        glow(COL.purple, 18);
        ctx.strokeStyle = COL.purple; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(X, Y, 9 + Math.sin(clock * 0.1) * 1.5, 15, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(181,51,255,.25)'; ctx.fill();
        noGlow();
        for (let i = 0; i < 3; i++) { const an = clock * 0.08 + i * 2.1; ctx.fillStyle = COL.purple; ctx.fillRect(X + Math.cos(an) * 12 - 1.5, Y + Math.sin(an) * 17 - 1.5, 3, 3); }
        if (b) {
          ctx.strokeStyle = 'rgba(181,51,255,.35)'; ctx.setLineDash([2, 4]); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(b.x - cx + 15, b.y - cy + 15, 8, 12, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        }
      }
      // fragmento
      for (const f of w.frags) {
        const got = w.gotFrag;
        const X = f.x - cx + 15, Y = f.y - cy + 15 + Math.sin(clock * 0.07) * 3;
        const sxk = Math.cos(clock * 0.05);
        ctx.save(); ctx.translate(X, Y); ctx.scale(sxk, 1); ctx.rotate(Math.PI / 4);
        if (got) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.strokeRect(-6, -6, 12, 12); }
        else { glow('#fff', 20); ctx.fillStyle = '#fff'; ctx.fillRect(-6, -6, 12, 12); noGlow(); }
        ctx.restore();
        if (!got && clock % 12 === 0) burst(f.x + 15, f.y + 15, 1, '#fff', 0.7, 2, -0.02, 40);
      }
      // puntos de control
      w.checks.forEach((k, i) => {
        const on = !!k.on, X = k.x - cx + T / 2, Y = k.y - cy + T;
        if (on) glow('#fff', 14);
        ctx.fillStyle = on ? '#fff' : 'rgba(255,255,255,.3)'; ctx.fillRect(X - 2, Y - 34, 4, 34);
        ctx.save(); ctx.translate(X, Y - 36 + (on ? Math.sin(clock * 0.1) * 2 : 0)); ctx.rotate(Math.PI / 4);
        if (on) ctx.fillRect(-5, -5, 10, 10); else { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.strokeRect(-5, -5, 10, 10); }
        ctx.restore(); noGlow();
      });
      // bandera
      for (const f of w.flags) {
        if (w.def.boss && w.def.boss.kind === 'mill') continue;
        const X = f.x - cx + 8, Y = f.y - cy;
        glow(COL.green, 16);
        ctx.fillStyle = COL.green; ctx.fillRect(X, Y - 6, 4, T + 6);
        ctx.beginPath(); ctx.moveTo(X + 4, Y - 6);
        for (let k = 0; k <= 6; k++) ctx.lineTo(X + 4 + k * 3.3, Y - 6 + Math.sin(clock * 0.15 + k * 0.7) * 2);
        for (let k = 6; k >= 0; k--) ctx.lineTo(X + 4 + k * 3.3, Y + 8 + Math.sin(clock * 0.15 + k * 0.7) * 2);
        ctx.fill(); noGlow();
      }
      // alma soldado
      if (w.npcs.length && this.cut) {
        const n = w.npcs[0], c = this.cut;
        const X = n.x - cx, Y = n.y - cy + (c ? c.npcY : 0) + Math.sin(clock * 0.05) * 1;
        ctx.fillStyle = COL.grey; ctx.fillRect(X, Y, 24, 24);
        ctx.fillStyle = '#5a5a5f'; ctx.fillRect(X - 2, Y - 4, 28, 6); ctx.fillRect(X + 4, Y - 9, 16, 6);
        const look = (w.p.x > n.x ? 1 : -1) * 2;
        ctx.fillStyle = '#000'; ctx.fillRect(X + 7 + look, Y + 8, 3, 5); ctx.fillRect(X + 14 + look, Y + 8, 3, 5);
      }
      // cola de almas
      for (const s of this.souls) { ctx.globalAlpha = Math.max(0, s.a); ctx.fillStyle = COL.grey; ctx.fillRect(s.x - cx, s.y - cy + Math.abs(Math.sin(s.x * 0.08)) * -3, 20, 20); }
      ctx.globalAlpha = 1;
      // frenos del jefe
      if (w.boss && w.boss.kind === 'mill') {
        const b = w.boss;
        b.brakes.forEach((br, i) => {
          const X = br.x - cx, Y = br.y - cy;
          if (i < b.brake || (i === b.brake && b.stun > 0 && b.hits > i)) { ctx.fillStyle = 'rgba(255,170,51,.2)'; ctx.fillRect(X + 6, Y + 18, 18, 12); return; }
          if (i === b.brake) {
            const pz = 0.6 + Math.sin(clock * 0.2) * 0.4;
            glow(COL.orange, 20 * pz);
            ctx.fillStyle = COL.orange; ctx.fillRect(X + 4, Y + 20, 22, 10);
            ctx.fillRect(X + 13, Y + 2, 4, 20);
            ctx.beginPath(); ctx.arc(X + 15, Y + 4, 6, 0, Math.PI * 2); ctx.fill();
            noGlow();
            text('!', X + 15, Y - 14 + Math.sin(clock * 0.2) * 3, 18, COL.orange);
          } else { ctx.strokeStyle = 'rgba(255,170,51,.25)'; ctx.lineWidth = 2; ctx.strokeRect(X + 4, Y + 20, 22, 10); }
        });
      }
    },
    drawBoss(cx, cy) {
      const b = this.w.boss, p = this.w.p;
      if (!b.x && b.x !== 0) return;
      const X = b.x - cx, Y = b.y - cy;
      const stun = b.stun > 0;
      const tele = b.tele > 0 ? 1 - b.tele / 42 : 0;
      const rage = b.rage || 0;
      if (b.down) {
        // se rompe: tiembla, se infla y estalla en trozos
        const k = Math.min(1, b.down / 90);
        const jx = (Math.random() - 0.5) * 14 * (1 - k), jy = (Math.random() - 0.5) * 14 * (1 - k);
        ctx.globalAlpha = 1 - k;
        glow(COL.red, 40); star(X + jx, Y + jy + k * 40, b.r * (1 + k * 0.8), b.rot, 8, 0.2, b.down % 6 < 3 ? '#fff' : COL.red); noGlow();
        ctx.globalAlpha = 1;
        if (b.down % 4 === 0) burst(b.x, b.y, 4, b.down % 8 ? COL.red : '#fff', 5, 6, 0.1, 50);
        if (b.down % 12 === 0) { SKA.sfx('slam'); addShake(8); }
        return;
      }
      const pulse = 1 + Math.sin(clock * 0.22) * 0.04 + tele * 0.18 + (b.aim && b.aim.t > 0 ? 0.12 : 0);
      const R = b.r * pulse;
      const body = stun ? (clock % 6 < 3 ? '#fff' : COL.red) : rage >= 2 ? '#ff2020' : COL.red;
      // estela de imágenes
      (b.trail || []).forEach((q, i, arr) => {
        ctx.globalAlpha = 0.05 + 0.05 * i;
        star(q[0] - cx, q[1] - cy, R, b.rot - (arr.length - i) * 0.1, 8, 0.2, COL.red);
      });
      ctx.globalAlpha = 1;
      // aura
      const gr = ctx.createRadialGradient(X, Y, 10, X, Y, R * 2.6);
      gr.addColorStop(0, `rgba(255,52,52,${0.4 + tele * 0.4 + rage * 0.08})`); gr.addColorStop(1, 'rgba(255,52,52,0)');
      ctx.fillStyle = gr; ctx.fillRect(X - R * 2.6, Y - R * 2.6, R * 5.2, R * 5.2);
      // anillo de dientes que gira al revés
      star(X, Y, R * 1.28, -b.rot * 0.55, 16, 0.07, rage >= 1 ? 'rgba(255,120,60,.55)' : 'rgba(150,20,20,.8)');
      // cuerpo
      glow(COL.red, 26 + rage * 8);
      star(X, Y, R, b.rot, 8, 0.22, body);
      noGlow();
      // ojo
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X, Y, R * 0.36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = rage >= 2 ? '#ffd0d0' : '#fff'; ctx.beginPath(); ctx.arc(X, Y, R * 0.27, 0, Math.PI * 2); ctx.fill();
      const ang = Math.atan2(p.y + 11 - b.y, p.x + 11 - b.x);
      const ex = X + Math.cos(ang) * R * 0.1, ey = Y + Math.sin(ang) * R * 0.1;
      if (rage >= 1 && !stun) { ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(ex, ey, R * 0.17, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(ex, ey, R * (stun ? 0.07 : 0.11), 0, Math.PI * 2); ctx.fill();
      // ceño
      if (!stun) {
        ctx.fillStyle = '#000';
        ctx.save(); ctx.translate(X, Y - R * 0.3); ctx.rotate(0.28 + rage * 0.06); ctx.fillRect(-R * 0.4, -R * 0.08, R * 0.8, R * 0.14); ctx.restore();
      } else {
        for (let i = 0; i < 3; i++) { const a = clock * 0.12 + i * 2.1; star(X + Math.cos(a) * R * 0.9, Y - R * 0.9 + Math.sin(a) * 8, 6, clock * 0.2, 4, 0.3, '#fff'); }
      }
      // grietas
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
      for (let i = 0; i < (b.hits || 0); i++) {
        const a = b.rot + i * 2.1;
        ctx.beginPath(); ctx.moveTo(X + Math.cos(a) * R * 0.4, Y + Math.sin(a) * R * 0.4);
        ctx.lineTo(X + Math.cos(a + 0.3) * R * 0.7, Y + Math.sin(a + 0.3) * R * 0.7);
        ctx.lineTo(X + Math.cos(a) * R, Y + Math.sin(a) * R); ctx.stroke();
      }
      // aviso de ráfaga
      if (tele) { ctx.strokeStyle = `rgba(255,52,52,${tele})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, R * (2 - tele), 0, Math.PI * 2); ctx.stroke(); }
      // aviso de embestida
      if (b.aim && b.aim.t > 0) {
        const on = clock % 8 < 5;
        ctx.strokeStyle = on ? 'rgba(255,52,52,.9)' : 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + (b.aim.x - b.x) * 3, Y + (b.aim.y - b.y) * 3); ctx.stroke(); ctx.setLineDash([]);
        text('!', X, Y - R - 22, 34, on ? COL.red : '#fff');
      }
      // brasas
      if (clock % 2 === 0) burst(b.x + (Math.random() - 0.5) * R, b.y + (Math.random() - 0.5) * R, 1, Math.random() < 0.5 ? COL.red : COL.orange, 1.2, 3, -0.03, 35);
      if (stun && clock % 4 === 0) burst(b.x, b.y, 2, '#fff', 3, 3);
      for (const m of b.minis || []) { glow(COL.red, 10); star(m.x - cx, m.y - cy, m.r + 3, m.rot, 8, 0.28); noGlow(); }
    },
    drawDrops(cx, cy) {
      const w = this.w;
      for (const s of w.drops || []) {
        const X = s.x - cx, Y = s.y - cy;
        if (s.tele > 0) {
          // línea de aviso hasta el suelo
          let r = Math.floor(s.y / T);
          while (r < w.H && !SKE.isSolid(w, Math.floor(s.x / T), r)) r++;
          const gy = r * T - cy, on = clock % 10 < 6;
          ctx.strokeStyle = `rgba(255,52,52,${on ? 0.55 : 0.25})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
          ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, gy); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = on ? COL.red : 'rgba(255,52,52,.4)';
          ctx.beginPath(); ctx.moveTo(X - 9, gy); ctx.lineTo(X + 9, gy); ctx.lineTo(X, gy - 12); ctx.fill();
          star(X + (Math.random() - 0.5) * 3, Y, s.r * (0.5 + 0.5 * (1 - s.tele / 45)), s.rot, 8, 0.28, 'rgba(255,52,52,.8)');
        } else {
          glow(COL.red, 14); star(X, Y, s.r + 3, s.rot, 8, 0.28); noGlow();
          if (clock % 2 === 0) burst(s.x, s.y - 8, 1, COL.orange, 0.6, 3, -0.02, 18);
        }
      }
    },
    drawPlayer(cx, cy) {
      const w = this.w, p = w.p;
      if (p.dead) return;
      for (const t of this.trail) { ctx.fillStyle = `rgba(255,255,255,${t.a * 0.6})`; ctx.fillRect(t.x - cx, t.y - cy, p.w, p.h); }
      const appear = Math.min(1, (this.spawnT = (this.spawnT || 0) + 1) / 14);
      const sqx = this.squash.x, sqy = this.squash.y;
      const W = 24 * sqx * appear, H = 24 * sqy * appear;
      const X = p.x + p.w / 2 - cx, Y = p.y + p.h - cy;
      const lean = Math.max(-0.12, Math.min(0.12, p.vx * 0.015));
      ctx.save(); ctx.translate(X, Y); ctx.rotate(p.onGround ? 0 : lean);
      glow('rgba(255,255,255,.75)', 16);
      ctx.fillStyle = '#fff'; ctx.fillRect(-W / 2, -H, W, H);
      noGlow();
      // ojos
      const blink = (clock % 200) < 6;
      const lx = p.face * 3 + (p.vx * 0.3), ly = p.vy < -2 ? -2 : p.vy > 3 ? 2 : 0;
      ctx.fillStyle = '#000';
      if (appear > 0.9) {
        ctx.fillRect(-6 + lx, -H + 7 + ly, 3, blink ? 1 : 5);
        ctx.fillRect(3 + lx, -H + 7 + ly, 3, blink ? 1 : 5);
      }
      ctx.restore();
    },
    drawRise(cx, cy) {
      const r = this.w.rise, top = r.y - cy;
      if (top > VH + 20) return;
      // la Trituradora, atascada, sube con la lava y mira al jugador
      {
        const p = this.w.p, X = VW / 2 + Math.sin(clock * 0.02) * 120, Y = top + 30, R = 95;
        const jam = Math.sin(clock * 0.9) * 0.08 + clock * 0.02;
        glow(COL.red, 40); star(X, Y, R, jam, 8, 0.2, '#ff2a2a'); noGlow();
        star(X, Y, R * 1.25, -jam * 0.6, 16, 0.07, 'rgba(255,120,60,.5)');
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X, Y, R * 0.36, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X, Y, R * 0.27, 0, Math.PI * 2); ctx.fill();
        const ang = Math.atan2(p.y + 11 - cy - Y, p.x + 11 - cx - X);
        ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(X + Math.cos(ang) * R * 0.1, Y + Math.sin(ang) * R * 0.1, R * 0.16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X + Math.cos(ang) * R * 0.1, Y + Math.sin(ang) * R * 0.1, R * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(X, Y - R * 0.3); ctx.rotate(0.4); ctx.fillStyle = '#000'; ctx.fillRect(-R * 0.4, -R * 0.08, R * 0.8, R * 0.14); ctx.restore();
        if (clock % 5 === 0) burst(X + cx + (Math.random() - 0.5) * R, Y + cy - R * 0.5, 1, '#fff', 2, 3, 0.1, 25);
      }
      glow(COL.red, 30);
      ctx.fillStyle = COL.red;
      ctx.beginPath(); ctx.moveTo(0, VH);
      for (let x = 0; x <= VW; x += 20) ctx.lineTo(x, top + Math.sin(x * 0.03 + clock * 0.1) * 5);
      ctx.lineTo(VW, VH); ctx.fill(); noGlow();
      ctx.fillStyle = '#b01d1d'; ctx.fillRect(0, top + 20, VW, VH);
      for (let i = 0; i < 6; i++) { const x = (i * 157 + clock * 3) % VW; star(x, top + 40 + (i % 3) * 30, 16, clock * 0.2 + i, 8, 0.25, '#ff6b6b'); }
      if (clock % 3 === 0) burst(Math.random() * VW + cx, r.y, 1, COL.red, 2, 4, 0.05, 30);
    },
    drawDark(cx, cy) {
      const w = this.w, p = w.p;
      if (!this.darkC) this.darkC = mk(VW, VH);
      const g = this.darkC.getContext('2d');
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(0,0,0,.97)'; g.fillRect(0, 0, VW, VH);
      g.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r) => { const gr = g.createRadialGradient(x, y, r * 0.3, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
      const flick = 150 + Math.sin(clock * 0.3) * 4 + (Math.random() < 0.05 ? -12 : 0);
      if (!p.dead) hole(p.x + 11 - cx, p.y + 11 - cy, flick);
      for (const f of w.flags) hole(f.x + 15 - cx, f.y + 15 - cy, 60);
      for (const f of w.frags) if (!w.gotFrag) hole(f.x + 15 - cx, f.y + 15 - cy, 40);
      ctx.drawImage(this.darkC, 0, 0);
      // lo rojo sigue brillando un poco en la oscuridad
      ctx.globalAlpha = 0.28 + Math.sin(clock * 0.05) * 0.08; ctx.drawImage(this.layers.redFlat, -cx, -cy); ctx.globalAlpha = 1;
    },
    drawCut(cx, cy) {
      const c = this.cut, lines = ST.soldier;
      const n = this.w.npcs[0];
      // cadenas
      if (c.chainY > -60 && n) {
        ctx.strokeStyle = COL.red; ctx.lineWidth = 3;
        const X = n.x + 12 - cx, bottom = n.y - cy + c.chainY;
        for (let y = -20; y < bottom; y += 12) { ctx.strokeRect(X - 4, y, 8, 10); }
      }
      if (c.phase !== 'talk') return;
      const ln = lines[c.i], s = tr(ln).slice(0, Math.floor(c.chars));
      const isV = ln.s === 'V';
      const bx = 150, by = isV ? 40 : 300, bw = 660, bh = 110;
      ctx.fillStyle = '#000'; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = isV ? COL.red : COL.grey; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
      text(isV ? ui('voice') : ui('soldier'), bx + 16, by + 18, 13, isV ? COL.red : COL.grey, 'left');
      const ls = wrap(s, bw - 40, isV ? 20 : 22, isV ? 'px' : 'serif');
      ls.forEach((l, k) => text(l, bx + 20, by + 50 + k * 26, isV ? 20 : 22, '#fff', 'left', isV ? 'px' : 'serif'));
      if (c.chars >= tr(ln).length) text('›', bx + bw - 20, by + bh - 18, 22, (clock % 40 < 20) ? '#fff' : '#666');
      text(ui('skip'), VW - 20, VH - 16, 12, 'rgba(255,255,255,.3)', 'right');
    },
    drawWipe() {
      const wp = this.wipe, k = Math.max(0, Math.min(1, wp.t / wp.dur));
      const p = this.w.p;
      const x = wp.x !== undefined ? wp.x : p.x + 11 - this.cam.x, y = wp.y !== undefined ? wp.y : p.y + 11 - this.cam.y;
      const maxR = Math.hypot(VW, VH);
      const r = wp.mode === 'open' ? k * maxR : (1 - k) * maxR;
      if (wp.mode === 'close' && wp.t < 0) return;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2, true); ctx.fill('evenodd');
    },
    drawHud() {
      const L = this.L;
      const a = this.nameT < 200 ? 1 : Math.max(0.35, 1 - (this.nameT - 200) / 60);
      text(L.id, 22, 26, 16, COL.red, 'left', 'px', a);
      text(tr(L.name).toUpperCase(), 70, 26, 16, '#fff', 'left', 'px', a * 0.9);
      text(`✕ ${this.levelDeaths}`, VW - 24, 26, 16, 'rgba(255,255,255,.7)', 'right');
      text(fmtTime(this.levelTime), VW - 100, 26, 16, 'rgba(255,255,255,.45)', 'right');
      if (this.w.frags.length) {
        ctx.save(); ctx.translate(VW - 200, 26); ctx.rotate(Math.PI / 4);
        if (this.w.gotFrag) { ctx.fillStyle = '#fff'; ctx.fillRect(-5, -5, 10, 10); } else { ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.strokeRect(-5, -5, 10, 10); }
        ctx.restore();
      }
      if (L.bossPart !== undefined) this.drawBossBar();
      if (this.voice) {
        const v = this.voice, s = v.s.slice(0, Math.floor(v.c));
        const al = Math.min(1, v.t / 12, (v.s.length * 1.25 + 170 - v.t) / 20);
        const ls = wrap(v.s, 640, 15), bw = 680, bx = (VW - bw) / 2, by = L.bossPart !== undefined ? 72 : 46, bh = 26 + ls.length * 18;
        ctx.globalAlpha = al * 0.72; ctx.fillStyle = '#000'; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = COL.red; ctx.fillRect(bx, by, 3, bh); ctx.globalAlpha = 1;
        text(ui('voice'), bx + 14, by + 11, 10, COL.red, 'left', 'px', al * 0.9);
        let left = s.length;
        ls.forEach((l, k) => { const part = l.slice(0, Math.max(0, left)); left -= l.length + 1; text(part, bx + 14, by + 29 + k * 18, 15, '#fff', 'left', 'px', al); });
      }
      if (this.hint && this.hint.t < 230) {
        const t = this.hint.t, al = Math.min(1, t / 15, (230 - t) / 30);
        if (L.bossPart !== undefined) {
          const slide = Math.max(0, 1 - t / 18) * 80;
          ctx.globalAlpha = al * 0.7; ctx.fillStyle = '#000'; ctx.fillRect(0, VH / 2 - 196, VW, 156); ctx.globalAlpha = 1;
          text(`${tr(ST.phase)} ${['I', 'II', 'III'][L.bossPart]}`, VW / 2 - slide, VH / 2 - 150, 54, '#fff', 'center', 'px', al);
          ctx.fillStyle = COL.red; ctx.globalAlpha = al; ctx.fillRect(VW / 2 - 90 + slide, VH / 2 - 118, 180, 4); ctx.globalAlpha = 1;
          text(tr(L.name).toUpperCase(), VW / 2 + slide, VH / 2 - 94, 22, 'rgba(255,255,255,.8)', 'center', 'px', al);
          text(this.hint.s, VW / 2, VH / 2 - 60, 26, COL.orange, 'center', 'px', al * (t > 40 ? 1 : t / 40));
        } else text(this.hint.s, VW / 2, VH / 2 - 120, 34, COL.orange, 'center', 'px', al);
      }
      if (this.rageMsg && this.rageMsg.t < 110) {
        const m = this.rageMsg, al = Math.min(1, m.t / 8, (110 - m.t) / 20);
        const msg = m.hits >= 3 ? (save.lang === 'en' ? 'IT BREAKS!' : '¡SE ROMPE!') : (save.lang === 'en' ? 'IT GETS ANGRIER!' : '¡SE ENFURECE!');
        text(msg, VW / 2 + (Math.random() - 0.5) * 4, VH / 2 - 130, 44, m.hits >= 3 ? '#fff' : COL.red, 'center', 'px', al);
      }
      if (this.memory) {
        const m = this.memory, al = Math.min(1, m.t / 30, (460 - m.t) / 40);
        ctx.globalAlpha = al * 0.75; ctx.fillStyle = '#000'; ctx.fillRect(0, VH - 96, VW, 70); ctx.globalAlpha = 1;
        text(ui('memGot'), VW / 2, VH - 82, 12, 'rgba(255,255,255,.6)', 'center', 'px', al);
        text(m.s, VW / 2, VH - 54, 26, '#fff', 'center', 'serif', al);
      }
      if (this.L.id === '1-1' && this.nameT < 400 && !save.beaten && usingTouch) text('←  →  ⤒', VW / 2, VH - 40, 16, 'rgba(255,255,255,.4)');
    },
    drawBossBar() {
      const part = this.L.bossPart, w = this.w;
      this.barShow = this.barShow === undefined ? 0 : this.barShow + (1 - this.barShow) * 0.08;
      const prog = w.bossProg || 0;
      this.barVal = this.barVal === undefined ? prog : this.barVal + (prog - this.barVal) * 0.15;
      const bw = 360, seg = (bw - 12) / 3, x0 = VW / 2 - bw / 2, y = 38 - (1 - this.barShow) * 30;
      text(tr(ST.boss.name), VW / 2, y - 16, 14, COL.red, 'center', 'px', this.barShow);
      for (let k = 0; k < 3; k++) {
        const fill = k < part ? 0 : k > part ? 1 : 1 - prog;
        const sx = x0 + k * (seg + 6);
        ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(sx, y, seg, 10);
        if (fill > 0) {
          if (k === part) glow(COL.red, 10 + Math.sin(clock * 0.2) * 5);
          ctx.fillStyle = k === part ? COL.red : 'rgba(255,52,52,.45)'; ctx.fillRect(sx, y, seg * fill, 10);
          noGlow();
          // lo perdido parpadea en blanco
        }
        if (k === part && prog > this.barVal + 0.002) { ctx.fillStyle = '#fff'; ctx.fillRect(sx + seg * fill, y, seg * (prog - this.barVal), 10); }
        ctx.strokeStyle = k === part ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.strokeRect(sx + 0.5, y + 0.5, seg - 1, 9);
        text(['I', 'II', 'III'][k], sx + seg / 2, y + 22, 11, k === part ? '#fff' : 'rgba(255,255,255,.3)', 'center', 'px', this.barShow);
      }
    },
    drawPause() {
      ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, 0, VW, VH);
      text(ui('paused'), VW / 2, 110, 48, '#fff');
      if (this._pItems) drawMenu({ sel: this.pauseSel }, this._pItems, VW / 2, 210, 48, 24);
      const h = ui('help');
      h.forEach((l, i) => text(l, VW / 2, 410 + i * 22, 13, 'rgba(255,255,255,.45)'));
    },
    drawSurrender() {
      const s = this.surrender;
      ctx.fillStyle = 'rgba(0,0,0,.86)'; ctx.fillRect(0, 0, VW, VH);
      text(ui('voice'), VW / 2, 170, 14, COL.red);
      text(tr(ST.surrender.q), VW / 2, 220, 42, '#fff');
      if (s.phase === 'answer') {
        text(tr(ST.surrender.no), VW / 2, 320, 44, COL.red);
        text(tr(ST.surrender.a), VW / 2, 400, 28, '#fff', 'center', 'serif', Math.min(1, s.t / 30));
        return;
      }
      let yes = tr(ST.surrender.yes);
      let yx = VW / 2 - 110, yy = 320;
      if (s.phase === 'glitch') {
        yx += (Math.random() - 0.5) * 16; yy += (Math.random() - 0.5) * 10;
        if (s.t > 25) yes = Math.random() < 0.5 ? tr(ST.surrender.no) : '█▓';
      }
      text(yes, yx, yy, 40, s.sel === 0 ? COL.red : '#777');
      text(tr(ST.surrender.no), VW / 2 + 110, 320, 40, s.sel === 1 ? COL.red : '#777');
    },
  });

  function openPause() { play.paused = true; play.pauseSel = 0; SKA.sfx('back'); SKA.pauseAll(true); }
  function stepFx() {
    updParts();
    if (shake > 0) shake = Math.max(0, shake * 0.86 - 0.1);
    if (flash > 0) flash = Math.max(0, flash - 0.03);
  }

  function finishGame() {
    const first = !save.beaten;
    save.beaten = true; save.cur = LV.findIndex(l => l.bossPart === 0); persist();
    go(finaleScene, { skippable: !first, then: () => go(statsScene) });
  }

  // ---------- cinemática final ----------
  // A: la Trituradora estalla · B: las almas suben · C: la Voz · D: cadenas y caída · E: el Torturador · F: título
  const FIN = { blast: 170, souls: 260, voice: 640, chains: 1010, eyes: 1230, title: 1490 };
  const finaleScene = {
    enter(o) { this.o = o; this.t = 0; this.shards = []; this.souls = []; this.ky = 0; this.kv = 0; SKA.play(null); SKA.sfx('rumble'); },
    update() {
      const t = ++this.t, F = ST.finale;
      if (pressed.has('back') && this.o.skippable) { this.o.then(); return; }
      if (t >= FIN.title + 90 && (pressed.has('confirm') || pressed.has('jump'))) { SKA.sfx('select'); this.o.then(); return; }
      // A · grietas y estallido
      if (t === 40 || t === 90 || t === 135) { SKA.sfx('crack'); SKA.sfx('slam'); shake = Math.max(shake, 6 + t / 20); }
      if (t === FIN.blast) {
        SKA.sfx('shatter'); shake = 30; flash = 1; flashCol = '#fff';
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2 + 0.2, v = 7 + Math.random() * 4;
          this.shards.push({ x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, rot: a, vr: (Math.random() - 0.5) * 0.4 });
        }
        for (let i = 0; i < 6; i++) burst(GX, GY, 30, i % 2 ? COL.red : '#fff', 9, 7, 0.12, 90);
      }
      const slow = t > FIN.blast && t < FIN.blast + 40 ? 0.35 : 1;
      for (const q of this.shards) { q.x += q.vx * slow; q.y += q.vy * slow; q.vy += 0.3 * slow; q.rot += q.vr * slow; }
      // B · almas liberadas
      if (t === FIN.souls) { SKA.play('final'); SKA.sfx('souls'); }
      if (t > FIN.blast + 20 && t < FIN.voice - 60 && t % 3 === 0) {
        this.souls.push({ x: GX + (Math.random() - 0.5) * 160, y: GY + 10, vy: -(0.8 + Math.random() * 1.6), ph: Math.random() * 6, sz: 6 + Math.random() * 8, a: 0 });
      }
      for (const q of this.souls) { q.y += q.vy; q.a = Math.min(1, q.a + 0.03); q.ph += 0.05; }
      this.souls = this.souls.filter(q => q.y > -30);
      // C · la Voz
      F.voice.forEach((v, i) => {
        const st = FIN.voice + 40 + i * 85, n = tr(v).length;
        const c = (t - st) * 0.7;
        if (c > 0 && c < n && Math.floor(c) % 2 === 0) SKA.sfx('blip');
      });
      if (t === FIN.voice + 40 + 2 * 85 + 20) { shake = 12; SKA.sfx('slam'); }
      // D · cadenas y caída
      if (t === FIN.chains) SKA.sfx('chains');
      if (t === FIN.chains + 55) { SKA.sfx('rumble'); SKA.sfx('chains'); shake = 14; }
      if (t > FIN.chains + 70) { this.kv += 0.35; this.ky += this.kv; }
      // E · el Torturador
      if (t === FIN.eyes) SKA.play(null);
      if (t === FIN.eyes + 40) { SKA.sfx('roar'); shake = 10; }
      // F · título
      if (t === FIN.title) SKA.play('final');
      if (t === FIN.title + 60) { SKA.sfx('slamTitle'); shake = 22; flash = 0.7; flashCol = '#fff'; }
    },
    draw() {
      const t = this.t, F = ST.finale;
      const sx = shake ? (Math.random() - 0.5) * shake : 0, sy = shake ? (Math.random() - 0.5) * shake : 0;
      ctx.save(); ctx.translate(sx, sy);
      ctx.fillStyle = '#000'; ctx.fillRect(-20, -20, VW + 40, VH + 40);
      const fadeIn = (a, b) => Math.max(0, Math.min(1, (t - a) / 30, (b - t) / 30));
      if (t < FIN.voice) {
        // escenario: saliente a la izquierda y lava abajo
        drawBackdrop(0, 0, `rgba(255,52,52,${t < FIN.blast ? 0.18 : 0.08})`, clock);
        const calm = t > FIN.blast ? Math.min(1, (t - FIN.blast) / 200) : 0;
        const lavaY = VH - 80 + calm * 30;
        glow(COL.red, 30 * (1 - calm)); ctx.fillStyle = calm ? `rgb(${255 - calm * 120},${52 - calm * 20},${52 - calm * 20})` : COL.red;
        ctx.beginPath(); ctx.moveTo(-20, VH + 20);
        for (let x = -20; x <= VW + 20; x += 20) ctx.lineTo(x, lavaY + Math.sin(x * 0.03 + clock * 0.1) * (5 - calm * 4));
        ctx.lineTo(VW + 20, VH + 20); ctx.fill(); noGlow();
        ctx.fillStyle = '#fff'; ctx.fillRect(-20, KY, KX + 60, VH);
        // la Trituradora
        if (t < FIN.blast) {
          const k = t / FIN.blast, j = k * 10;
          const X = GX + (Math.random() - 0.5) * j, Y = GY + (Math.random() - 0.5) * j;
          const gr = ctx.createRadialGradient(X, Y, 10, X, Y, 260);
          gr.addColorStop(0, `rgba(255,52,52,${0.3 + k * 0.4})`); gr.addColorStop(1, 'rgba(255,52,52,0)');
          ctx.fillStyle = gr; ctx.fillRect(X - 260, Y - 260, 520, 520);
          const rot = Math.sin(t * 0.8) * 0.06 * (1 + k * 3);
          star(X, Y, 130, -rot, 16, 0.07, 'rgba(150,20,20,.8)');
          glow(COL.red, 30 + k * 30); star(X, Y, 105 * (1 + k * 0.08), rot, 8, 0.22, t % 10 < 2 && k > 0.6 ? '#fff' : COL.red); noGlow();
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X, Y, 38, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X, Y, 28, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = COL.red; ctx.beginPath(); ctx.arc(X - 8, Y - 2, 15 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X - 8, Y - 2, 8 * (1 - k * 0.6), 0, Math.PI * 2); ctx.fill();
          // grietas blancas que crecen
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
          const cracks = t > 135 ? 3 : t > 90 ? 2 : t > 40 ? 1 : 0;
          for (let i = 0; i < cracks; i++) {
            const a = i * 2.2 + 0.5;
            ctx.beginPath(); ctx.moveTo(X + Math.cos(a) * 30, Y + Math.sin(a) * 30);
            ctx.lineTo(X + Math.cos(a + 0.35) * 60, Y + Math.sin(a + 0.35) * 60);
            ctx.lineTo(X + Math.cos(a - 0.1) * 110, Y + Math.sin(a - 0.1) * 110); ctx.stroke();
          }
          if (t % 3 === 0) burst(X + (Math.random() - 0.5) * 150, Y - 40, 1, Math.random() < 0.5 ? '#fff' : COL.orange, 3 + k * 3, 3, 0.15, 30);
        }
        // onda expansiva y trozos
        if (t >= FIN.blast && t < FIN.blast + 60) {
          const k = (t - FIN.blast) / 60;
          ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 10 * (1 - k) + 1;
          ctx.beginPath(); ctx.arc(GX, GY, k * 700, 0, Math.PI * 2); ctx.stroke();
        }
        for (const q of this.shards) {
          ctx.save(); ctx.translate(GX + q.x, GY + q.y); ctx.rotate(q.rot);
          glow(COL.red, 12); ctx.fillStyle = COL.red; ctx.fillRect(-50, -11, 100, 22); noGlow(); ctx.restore();
        }
        // almas que suben
        for (const q of this.souls) {
          const X = q.x + Math.sin(q.ph) * 10, fade = q.a * Math.min(1, q.y / 120);
          ctx.globalAlpha = Math.max(0, fade) * 0.9; glow('#fff', 14);
          ctx.fillStyle = '#fff'; ctx.fillRect(X - q.sz / 2, q.y - q.sz / 2, q.sz, q.sz); noGlow();
        }
        ctx.globalAlpha = 1;
        // Keznit mira la escena
        const look = t > FIN.blast + 30 ? { x: 0, y: -3 } : { x: 3, y: 0 };
        soul(KX, KY - 12, 24, 1, look);
        // narración
        if (t < FIN.blast) text(tr(F.crack), VW / 2, 70, 26, 'rgba(255,255,255,.85)', 'center', 'serif', fadeIn(20, FIN.blast - 10));
        text(tr(F.freed), VW / 2, 70, 30, '#fff', 'center', 'serif', fadeIn(FIN.souls + 30, FIN.souls + 200));
        text(tr(F.free2), VW / 2, 70, 30, '#fff', 'center', 'serif', fadeIn(FIN.souls + 210, FIN.voice - 20));
      } else if (t < FIN.eyes) {
        // la Voz: fondo que se apaga con interferencias rojas
        const dark = Math.min(1, (t - FIN.voice) / 40);
        drawBackdrop(0, 0, `rgba(255,52,52,${0.08 * (1 - dark)})`, clock);
        ctx.fillStyle = `rgba(0,0,0,${dark * 0.85})`; ctx.fillRect(-20, -20, VW + 40, VH + 40);
        if (Math.random() < 0.25) { ctx.fillStyle = 'rgba(255,52,52,.12)'; ctx.fillRect(0, Math.random() * VH, VW, 4 + Math.random() * 20); }
        text(ui('voice'), VW / 2, 100, 14, COL.red, 'center', 'px', dark);
        F.voice.forEach((v, i) => {
          const st = FIN.voice + 40 + i * 85, full = tr(v), c = Math.floor((t - st) * 0.7);
          if (c <= 0) return;
          const gl = i === 0 && t % 20 < 3 ? (Math.random() - 0.5) * 10 : 0;
          text(full.slice(0, c), VW / 2 + gl, 160 + i * 52, i === 0 ? 48 : 26, i === 0 || i === 2 ? COL.red : '#fff');
        });
        // Keznit, en el centro
        const kx = VW / 2, ky = VH - 130 + this.ky;
        if (t >= FIN.chains) {
          const grow = Math.min(1, (t - FIN.chains) / 45);
          ctx.strokeStyle = COL.red; ctx.lineWidth = 4;
          for (const side of [-1, 1]) {
            const x0 = VW / 2 + side * (VW / 2 + 20), y0 = VH + 20;
            for (let k = 0; k <= 14 * grow; k++) {
              const q = k / 14;
              const x = x0 + (kx + side * 12 - x0) * q, y = y0 + (ky - y0) * q - Math.sin(q * Math.PI) * 60;
              ctx.save(); ctx.translate(x, y); ctx.rotate(q * 2 + side + t * 0.02); ctx.strokeRect(-7, -4, 14, 8); ctx.restore();
            }
          }
          // líneas de velocidad al caer
          if (t > FIN.chains + 70) {
            ctx.fillStyle = 'rgba(255,255,255,.15)';
            for (let i = 0; i < 14; i++) { const x = (i * 71 + 13) % VW, y = (VH - ((t * 22 + i * 97) % (VH + 200))); ctx.fillRect(x, y, 2, 120); }
          }
        }
        if (ky < VH + 40) soul(kx, ky, 26, 1, { x: 0, y: t > FIN.chains ? 3 : 0 }, t > FIN.chains + 40);
      } else if (t < FIN.title) {
        // el Torturador abre los ojos
        const o = Math.max(0, Math.min(1, (t - FIN.eyes - 40) / 40));
        const blink = t > FIN.eyes + 170 && t < FIN.eyes + 180 ? 0.1 : 1;
        for (const side of [-1, 1]) {
          const X = VW / 2 + side * 130, Y = 200, h = 46 * o * blink;
          glow(COL.red, 40 * o);
          ctx.fillStyle = COL.red;
          ctx.beginPath(); ctx.ellipse(X, Y, 90, Math.max(0.5, h), side * 0.18, 0, Math.PI * 2); ctx.fill();
          noGlow();
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(X - side * 10, Y, 10, Math.max(0.5, h * 0.9), 0, 0, Math.PI * 2); ctx.fill();
        }
        text(tr(F.down), VW / 2, VH - 110, 30, '#fff', 'center', 'serif', fadeIn(FIN.eyes + 90, FIN.title - 10));
      } else {
        // título
        const k = t - FIN.title;
        drawBackdrop(0, 0, 'rgba(255,52,52,.08)', clock);
        text(tr(F.cont), VW / 2, 180, 28, 'rgba(255,255,255,.75)', 'center', 'serif', Math.min(1, k / 30));
        if (k >= 60) {
          const pop = 1 + Math.max(0, 1 - (k - 60) / 10) * 0.8;
          text('SOUL KEZNIT', VW / 2, 270, 70 * pop, '#fff');
          glow(COL.red, 30); text('2', VW / 2, 360, 100 * pop, COL.red); noGlow();
        }
        if (k > 90) text(ui('press'), VW / 2, VH - 40, 14, (clock % 60 < 30) ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)');
      }
      ctx.restore();
      if (flash > 0) { ctx.globalAlpha = flash; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }
      if (this.o.skippable && t < FIN.title) text(ui('skip'), 30, VH - 26, 12, 'rgba(255,255,255,.25)', 'left');
    },
  };
  const GX = VW / 2 + 110, GY = VH - 120, KX = VW / 2 - 300, KY = VH - 150;
  // Keznit: cuadrado blanco con ojos que miran hacia 'look'
  function soul(x, y, sz, a, look, scared) {
    ctx.globalAlpha = a; glow('#fff', 20);
    const j = scared ? (Math.random() - 0.5) * 3 : 0;
    ctx.fillStyle = '#fff'; ctx.fillRect(x - sz / 2 + j, y - sz / 2, sz, sz); noGlow();
    ctx.fillStyle = '#000';
    const ex = look.x, ey = look.y;
    ctx.fillRect(x - 7 + ex + j, y - 5 + ey, 3, scared ? 7 : 5); ctx.fillRect(x + 4 + ex + j, y - 5 + ey, 3, scared ? 7 : 5);
    ctx.globalAlpha = 1;
  }
  const statsScene = {
    enter() { this.t = 0; SKA.play('final'); },
    update() { this.t++; if (this.t > 60 && (pressed.has('confirm') || pressed.has('back'))) { SKA.sfx('select'); go(creditsScene); } },
    draw() {
      drawBackdrop(0, this.t * 0.3, 'rgba(255,52,52,.06)', clock);
      text(ui('stats'), VW / 2, 110, 40, '#fff');
      const rows = [[ui('deaths'), String(save.deaths)], [ui('time'), fmtTime(save.time)], [ui('frags'), `${save.frags.filter(Boolean).length} / 13`]];
      rows.forEach(([k, v], i) => {
        const a = Math.min(1, Math.max(0, (this.t - 20 - i * 20) / 20));
        text(k, VW / 2 - 20, 200 + i * 60, 24, 'rgba(255,255,255,.6)', 'right', 'px', a);
        text(v, VW / 2 + 20, 200 + i * 60, 30, i === 2 ? '#fff' : COL.red, 'left', 'px', a);
      });
      text(ui('thanks'), VW / 2, 420, 30, '#fff', 'center', 'serif', Math.min(1, Math.max(0, (this.t - 90) / 40)));
      if (this.t > 60) text(ui('press'), VW / 2, VH - 40, 14, (clock % 60 < 30) ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)');
    },
  };

  // ======================================================
  // BUCLE
  // ======================================================
  let clock = 0, last = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    const stepMs = 1000 / 60;
    let n = 0;
    while (acc >= stepMs && n < 4) {
      pollPad();
      clock++;
      scene.update();
      if (scene !== play) stepFx();
      pressed.clear(); mouse.click = false;
      acc -= stepMs; n++;
    }
    if (n === 4) acc = 0;
    updateTouchUi();
    // si el dispositivo va justo, se quitan los brillos (lo más caro de dibujar)
    const dt = now - (frame.prev || now); frame.prev = now;
    frame.avg = (frame.avg || 16) * 0.95 + Math.min(dt, 100) * 0.05;
    if (!lowFx && frame.avg > 24 && clock > 240) lowFx = true;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    scene.draw();
    if (scene !== play) drawParts(0, 0);
    ctx.drawImage(vignette, 0, 0);
    if (save.opts.crt) ctx.drawImage(scan, 0, 0);
    requestAnimationFrame(frame);
  }

  // Inicio
  SKA.setVolumes(save.opts.music, save.opts.sfx);
  if (save.opts.orig) SKA.setOriginal(true);
  const fontsReady = document.fonts ? document.fonts.load(PX(20)).catch(() => {}) : Promise.resolve();
  const boot = {
    t: 0,
    update() { this.t++; if (pressed.has('confirm') || pressed.has('jump') || mouse.click) { SKA.init(); SKA.sfx('select'); if (usingTouch) goFullscreen(); if (save.lang) go(titleScene); else go(langScene, 'title'); } },
    draw() {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
      glow('rgba(255,255,255,.8)', 24); ctx.fillStyle = '#fff';
      const b = Math.abs(Math.sin(this.t * 0.06)) * 30;
      ctx.fillRect(VW / 2 - 12, 250 - b, 24, 24); noGlow();
      ctx.fillStyle = '#fff'; ctx.fillRect(VW / 2 - 60, 278, 120, 3);
      text('SOUL KEZNIT', VW / 2, 150, 44, '#fff');
      text('REMAKE', VW / 2, 190, 16, 'rgba(255,255,255,.5)');
      const bl = (Math.floor(this.t / 30) % 2) ? 0.8 : 0.35;
      text(usingTouch ? (save.lang === 'en' ? 'TAP THE SCREEN' : 'TOCA LA PANTALLA') : save.lang === 'en' ? 'PRESS SPACE OR CLICK' : 'PULSA ESPACIO O HAZ CLIC', VW / 2, 360, 18, `rgba(255,255,255,${bl})`);
    },
  };
  fontsReady.then(() => { scene = boot; requestAnimationFrame(frame); });
  // Permite probar desde fuera: ?nivel=3-2
  const qs = new URLSearchParams(location.search);
  if (qs.get('nivel')) {
    const i = LV.findIndex(l => l.id === qs.get('nivel'));
    if (i >= 0) fontsReady.then(() => { if (!save.lang) save.lang = 'es'; save.started = true; save.unlocked = Math.max(save.unlocked, i); startLevel(i, true); });
  }
  // ?final: ver la cinemática final directamente (se puede saltar con Esc)
  if (qs.has('final')) fontsReady.then(() => { if (!save.lang) save.lang = 'es'; go(finaleScene, { skippable: true, then: () => go(titleScene) }); });
  window.SKGame = { play, go: (i) => startLevel(i, true), get scene() { return scene === play ? 'play' : 'other'; }, save: () => save };
})();
