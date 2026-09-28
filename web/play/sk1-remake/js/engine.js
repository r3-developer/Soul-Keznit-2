// Soul Keznit Remake · motor (simulación pura, sin DOM)
// Paso fijo de 60 Hz. Unidades: píxeles lógicos (casilla = 30 px).
(function (root) {
  'use strict';

  const T = 30;
  const PHY = {
    runMax: 5.5,
    groundAcc: 1.1, groundDec: 1.4, turnBoost: 1.8,
    airAcc: 0.62, airDec: 0.12, airTurn: 1.8,
    gravUp: 0.55, gravDown: 0.82, apexHang: 0.5,
    jump: 10.4, jumpCut: 0.45,
    maxFall: 12, wallSlide: 2.2,
    wallJumpX: 5.8, wallJumpY: 9.8, wallLock: 9,
    coyote: 9, buffer: 10,
    tramp: 16.5,
    conveyor: 2.0,
    crumbleDelay: 26, crumbleRespawn: 160,
    laserPeriod: 120, laserWarn: 24,
  };
  const PW = 22, PH = 22;

  // Tipos de casilla
  const E = 0, SOLID = 1, RED = 2, SPK_U = 3, SPK_D = 4, SPK_L = 5, SPK_R = 6,
    TRAMP = 7, DOOR = 8, CRUMBLE = 9, ONEWAY = 10, TOG_A = 11, TOG_B = 12,
    CONV_L = 13, CONV_R = 14, LAS_A = 15, LAS_B = 16;
  const CH = {
    '#': SOLID, 'R': RED, '^': SPK_U, 'v': SPK_D, '<': SPK_L, '>': SPK_R,
    'T': TRAMP, 'D': DOOR, '=': CRUMBLE, '-': ONEWAY, '[': TOG_A, ']': TOG_B,
    '(': CONV_L, ')': CONV_R, 'x': LAS_A, 'y': LAS_B,
  };

  function parse(def) {
    const rows = def.map;
    const H = rows.length, W = Math.max(...rows.map(r => r.length));
    const grid = new Uint8Array(W * H);
    const w = {
      def, W, H, grid, pw: W * T, ph: H * T,
      start: { x: T, y: T }, keys: [], flags: [], frags: [], checks: [], ports: {}, exits: {},
      saws: [], plats: [], npcs: [], crumble: new Map(),
    };
    for (let r = 0; r < H; r++) {
      const row = rows[r];
      for (let c = 0; c < W; c++) {
        const ch = row[c] || '.';
        const i = r * W + c;
        if (CH[ch] !== undefined) grid[i] = CH[ch];
        else if (ch === 'P') w.start = { x: c * T + (T - PW) / 2, y: r * T + T - PH };
        else if (ch === 'K') w.keys.push({ x: c * T, y: r * T });
        else if (ch === 'F') w.flags.push({ x: c * T, y: r * T });
        else if (ch === 'M') w.frags.push({ x: c * T, y: r * T });
        else if (ch === 'C') w.checks.push({ x: c * T, y: r * T });
        else if (ch === 'N') w.npcs.push({ x: c * T + 3, y: r * T + T - 24 });
        else if (ch === '*') w.saws.push({ path: [[c + .5, r + .5]], speed: 0, r: 22 });
        else if (/[a-e]/.test(ch)) w.ports[ch] = { x: c * T, y: r * T };
        else if (/[A-E]/.test(ch)) w.exits[ch.toLowerCase()] = { x: c * T, y: r * T };
      }
    }
    for (const e of def.ents || []) {
      if (e.k === 'saw') w.saws.push({ path: e.path.map(p => [p[0], p[1]]), speed: e.speed || 0, r: e.r || 22, loop: e.loop });
      if (e.k === 'plat') w.plats.push({ w: e.w * T, h: (e.h || 1) * T, path: e.path.map(p => [p[0] * T, p[1] * T]), speed: e.speed, loop: e.loop });
    }
    return w;
  }

  // Posición a lo largo de un camino (ida y vuelta o bucle) según distancia recorrida
  function along(path, dist, loop) {
    if (path.length < 2) return path[0];
    const segs = [];
    let total = 0;
    const pts = loop ? path.concat([path[0]]) : path;
    for (let i = 0; i < pts.length - 1; i++) {
      const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push(l); total += l;
    }
    let d;
    if (loop) d = ((dist % total) + total) % total;
    else { d = dist % (2 * total); if (d > total) d = 2 * total - d; }
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const k = segs[i] ? Math.min(1, d / segs[i]) : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
      }
      d -= segs[i];
    }
    return path[0];
  }

  function create(def, opts = {}) {
    const w = parse(def);
    w.t = 0;
    w.phase = 0;          // bloques que cambian con cada salto
    w.hasKey = false;
    w.doorOpen = 0;       // 0 cerrada, >0 abriéndose/abierta
    w.gotFrag = !!opts.gotFrag;
    w.done = false;
    w.events = [];
    w.p = {
      x: w.start.x, y: w.start.y, w: PW, h: PH, vx: 0, vy: 0,
      onGround: false, wall: 0, coyote: 0, buffer: 0, wallCoyote: 0, wallDir: 0,
      lock: 0, tramp: false, dead: false, face: 1, port: 0, ride: null, landed: 0, airTime: 0, belt: 0,
    };
    // punto de control: se reaparece allí y se conserva la llave
    w.check = -1;
    const ck = opts.check && w.checks[opts.check.i];
    if (ck) {
      w.check = opts.check.i; ck.on = true;
      w.p.x = ck.x + (T - PW) / 2; w.p.y = ck.y + T - PH;
      if (opts.check.key && w.keys.length) { for (const k of w.keys) k.got = true; w.hasKey = true; w.doorOpen = 60; }
    }
    w.hist = [];
    initBoss(w);
    return w;
  }

  // ---------- consultas de casillas ----------
  const at = (w, c, r) => (c < 0 || c >= w.W) ? SOLID : (r < 0 ? SOLID : (r >= w.H ? E : w.grid[r * w.W + c]));

  function crumbleBroken(w, c, r) {
    const s = w.crumble.get(r * w.W + c);
    return s && s.broken > 0;
  }

  // ¿La casilla bloquea el movimiento?
  function isSolid(w, c, r, ghost) {
    const t = at(w, c, r);
    switch (t) {
      case SOLID: case CONV_L: case CONV_R: return true;
      case DOOR: return w.doorOpen === 0;
      case CRUMBLE: return !crumbleBroken(w, c, r);
      case TOG_A: return w.phase === 0 && !(ghost && ghost.has(r * w.W + c));
      case TOG_B: return w.phase === 1 && !(ghost && ghost.has(r * w.W + c));
      default: return false;
    }
  }

  function overlapTiles(w, x, y, ww, hh, fn) {
    const c0 = Math.floor(x / T), c1 = Math.floor((x + ww - 0.001) / T);
    const r0 = Math.floor(y / T), r1 = Math.floor((y + hh - 0.001) / T);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (fn(c, r)) return true;
    return false;
  }

  const rectHit = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

  function platRects(w) {
    return w.plats.map(pl => ({ x: pl.x, y: pl.y, w: pl.w, h: pl.h, dx: pl.dx || 0, dy: pl.dy || 0, pl }));
  }

  // ---------- láseres ----------
  function laserState(w, type) {
    const P = PHY.laserPeriod, half = P / 2;
    const t = (w.t + (type === LAS_B ? half : 0)) % P;
    if (t < half) return 2;                       // activo (mata)
    if (t >= P - PHY.laserWarn) return 1;         // aviso
    return 0;
  }

  // ---------- jefe ----------
  // Tres fases: persecución (chase), molino (mill) y huida (rise).
  // w.bossProg (0..1) indica cuánto de la fase actual se ha superado, para la barra de vida.
  function initBoss(w) {
    const b = w.def.boss;
    w.boss = null;
    w.rise = null;
    w.drops = [];
    w.bossProg = 0;
    if (!b) return;
    w.dropT = b.drops ? b.drops.first || b.drops.every : 0;
    if (b.kind === 'chase') {
      const f = w.flags[0];
      w.boss = { kind: 'chase', x: w.start.x - 200, y: w.start.y - 240, r: 40, rot: 0, enter: 90, delay: b.delay0, trail: [] };
      w.track = { x0: w.start.x, x1: f ? f.x : w.pw };
    }
    if (b.kind === 'mill') {
      w.boss = {
        kind: 'mill', x: w.pw / 2, y: 170, r: 46, rot: 0, vx: 2.4, vy: 1.7, speed: 2.9,
        hits: 0, stun: 0, burst: 150, tele: 0, every: b.every, count: 8, minis: [], brake: 0,
        brakes: b.brakes.map(p => ({ x: p[0] * T, y: p[1] * T })), enter: 90, down: 0, spin: 0.12,
        charge: 0, chargeT: b.charge || 0, aim: null, dash: 0, rage: 0, trail: [],
        // la palanca siguiente no se puede usar hasta que se recarga (tantos pulsos de música)
        lock: b.lock0 || 8, lockMax: b.lock0 || 8, lockBeats: b.lock || [14, 16], wave2: false, teleBeats: 0,
      };
    }
    if (b.rise) {
      w.rise = { y: w.ph + 40, speed: b.rise.speed, acc: b.rise.acc, wait: b.rise.wait };
      const f = w.flags[0];
      w.track = { y0: w.start.y, y1: f ? f.y : 0 };
    }
  }

  // Esquirlas que caen del techo: primero un aviso donde va a caer, luego caen
  function stepDrops(w, p, beat) {
    const d = w.def.boss.drops;
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    if (d && w.dropT > 0) w.dropT--;
    if (d && w.dropT <= 0 && beat) {
      w.dropT = d.every;
      // apunta a donde estará el jugador, un poco por delante
      const x = Math.max(T * 1.5, Math.min(w.pw - T * 1.5, pcx + p.vx * (d.lead || 30)));
      let top = Math.max(T + 10, pcy - (d.height || 300));
      // que no aparezca dentro de un bloque
      while (top < pcy && isSolid(w, Math.floor(x / T), Math.floor(top / T))) top += T;
      w.drops.push({ x, y: top, vy: 0, tele: d.tele || 40, r: 10, rot: 0 });
      w.events.push({ e: 'dropWarn', x, y: top });
    }
    for (let i = w.drops.length - 1; i >= 0; i--) {
      const s = w.drops[i];
      s.rot += 0.25;
      if (s.tele > 0) { s.tele--; continue; }
      s.vy = Math.min(s.vy + 0.45, 11); s.y += s.vy;
      if (s.y > w.ph || isSolid(w, Math.floor(s.x / T), Math.floor((s.y + s.r * 0.5) / T))) {
        w.events.push({ e: 'shard', x: s.x, y: s.y }); w.drops.splice(i, 1); continue;
      }
      if (Math.hypot(s.x - pcx, s.y - pcy) < s.r + 7) return 'shard';
    }
    return null;
  }

  // beat: en este paso empieza un pulso de la música (si no hay música, uno cada 24 pasos = 150 ppm)
  function stepBoss(w, p, input) {
    const b = w.boss;
    const beat = input && input.beat !== undefined && input.beat !== null ? !!input.beat : w.t % 24 === 0;
    const bf = (input && input.beatLen) || 24;
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    if (b && b.kind === 'chase') {
      b.rot += 0.2;
      w.hist.push([pcx, pcy]);
      const d = w.def.boss;
      b.delay = Math.max(d.delay1, d.delay0 - (d.delay0 - d.delay1) * Math.min(1, w.t / d.ramp));
      const idx = w.hist.length - 1 - Math.round(b.delay);
      const target = idx >= 0 ? w.hist[idx] : [w.start.x - 60, w.start.y - 120];
      b.trail.push([b.x, b.y]); if (b.trail.length > 6) b.trail.shift();
      if (b.enter > 0) {
        b.enter--;
        b.x += (target[0] - b.x) * 0.07; b.y += (target[1] - b.y) * 0.07;
      } else {
        b.x += (target[0] - b.x) * 0.5; b.y += (target[1] - b.y) * 0.5;
        if (Math.hypot(b.x - pcx, b.y - pcy) < b.r - 6) return 'boss';
      }
      w.bossProg = Math.max(w.bossProg, clamp01((p.x - w.track.x0) / (w.track.x1 - w.track.x0)));
    }
    if (b && b.kind === 'mill') {
      w.bossProg = b.hits / 3;
      if (b.down > 0) { b.down++; b.rot += 0.02; return null; }
      if (b.enter > 0) { b.enter--; b.rot += 0.08; return null; }
      const minX = 60 + b.r, maxX = w.pw - 60 - b.r, minY = 60 + b.r, maxY = w.ph - 90 - b.r;
      b.trail.push([b.x, b.y]); if (b.trail.length > 6) b.trail.shift();
      if (b.stun > 0) {
        b.stun--; b.rot += 0.03;
        if (b.stun === 0) {
          if (b.hits >= 3) { b.down = 1; w.events.push({ e: 'bossDown' }); w.done = true; return null; }
          // se despierta furiosa: la palanca siguiente tarda en recargarse y hay que aguantar mientras
          b.brake++;
          b.lock = b.lockMax = b.lockBeats[Math.min(b.hits - 1, b.lockBeats.length - 1)];
          b.burst = 0; b.charge = Math.max(b.charge, bf * 3);
          w.events.push({ e: 'wake', x: b.x, y: b.y });
        }
      } else if (b.aim) {
        // embestida: se para, apunta y se lanza
        if (b.aim.t > 0) {
          if (b.aim.t > 1) b.aim.t--;
          b.rot += 0.35;
          b.aim.x = pcx; b.aim.y = pcy;       // sigue apuntando hasta el último momento
          if (beat && --b.aim.beats <= 0) {   // se lanza justo en el pulso
            b.aim.t = 0;
            const dx = b.aim.x - b.x, dy = b.aim.y - b.y, l = Math.hypot(dx, dy) || 1;
            b.vx = dx / l * 10.5; b.vy = dy / l * 10.5; b.dash = 42;
            w.events.push({ e: 'dash', x: b.x, y: b.y });
          }
        } else {
          b.rot += 0.45;
          b.x += b.vx; b.y += b.vy;
          if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx); w.events.push({ e: 'slam', x: b.x, y: b.y }); }
          if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); w.events.push({ e: 'slam', x: b.x, y: b.y }); }
          if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy); w.events.push({ e: 'slam', x: b.x, y: b.y }); }
          if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); w.events.push({ e: 'slam', x: b.x, y: b.y }); }
          if (--b.dash <= 0) { b.aim = null; b.charge = b.chargeT; }
        }
        if (Math.hypot(b.x - pcx, b.y - pcy) < b.r - 4) return 'boss';
      } else {
        b.rot += b.spin;
        const sp = Math.hypot(b.vx, b.vy) || 1;
        b.vx = b.vx / sp * b.speed; b.vy = b.vy / sp * b.speed;
        // se acerca un poco al jugador para que no haya sitio seguro
        const ax = pcx - b.x, ay = pcy - b.y, al = Math.hypot(ax, ay) || 1;
        b.vx += ax / al * 0.05; b.vy += ay / al * 0.05;
        b.x += b.vx; b.y += b.vy;
        if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx); }
        if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
        if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy); }
        if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }
        // ráfagas de estrellas al ritmo: aviso en un pulso, disparo dos pulsos después
        // (con rabia, segunda oleada en el pulso siguiente, a contratiempo de la primera)
        const fire = (second) => {
          const off = (w.t * 0.37) % (Math.PI * 2) + (second ? Math.PI / b.count : 0);
          const v = 3.1 + b.rage * 0.35;
          for (let i = 0; i < b.count; i++) {
            const a = off + i / b.count * Math.PI * 2;
            b.minis.push({ x: b.x, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 9, rot: 0 });
          }
          w.events.push({ e: 'burst', x: b.x, y: b.y });
        };
        if (b.wave2 && beat) { b.wave2 = false; fire(true); }
        if (b.tele > 0) {
          if (b.tele > 1) b.tele--;
          if (beat && --b.teleBeats <= 0) { b.tele = 0; fire(false); if (b.rage >= 2) b.wave2 = true; }
        } else if (b.burst > 0) b.burst--;
        else if (beat && !b.aim) {
          b.teleBeats = 2; b.tele = b.teleDur = bf * 2; b.burst = b.every;
          w.events.push({ e: 'tele', x: b.x, y: b.y });
        }
        // embestida desde el primer golpe, empezando en un pulso
        if (b.rage >= 1 && b.tele === 0 && b.charge > 0) b.charge--;
        if (b.rage >= 1 && b.tele === 0 && b.charge <= 0 && beat) {
          b.aim = { t: bf * 2, dur: bf * 2, beats: 2, x: pcx, y: pcy };
          w.events.push({ e: 'aim', x: b.x, y: b.y });
        }
        if (Math.hypot(b.x - pcx, b.y - pcy) < b.r - 4) return 'boss';
      }
      // freno activo
      if (b.stun === 0 && b.lock > 0 && beat) {
        b.lock--;
        w.events.push({ e: b.lock === 0 ? 'leverReady' : 'leverTick', left: b.lock });
      }
      const br = b.brakes[b.brake];
      if (br && b.stun === 0 && b.lock === 0 && rectHit(p.x, p.y, p.w, p.h, br.x + 2, br.y + 2, T - 4, T - 4)) {
        b.hits++; b.rage = b.hits; b.stun = 70; b.speed *= 1.2; b.spin += 0.05;
        b.every = Math.round(b.every * 0.82); b.count += 2; b.burst = 80;
        b.aim = null; b.charge = Math.round(b.chargeT * 0.6); b.chargeT = Math.round(b.chargeT * 0.8);
        b.minis.length = 0;
        w.events.push({ e: 'bossHit', x: b.x, y: b.y, hits: b.hits });
      }
      for (let i = b.minis.length - 1; i >= 0; i--) {
        const m = b.minis[i];
        m.x += m.vx; m.y += m.vy; m.rot += 0.3;
        if (m.x < -20 || m.x > w.pw + 20 || m.y < -20 || m.y > w.ph + 20 ||
          isSolid(w, Math.floor(m.x / T), Math.floor(m.y / T))) { b.minis.splice(i, 1); continue; }
        if (Math.hypot(m.x - pcx, m.y - pcy) < m.r + 8) return 'mini';
      }
    }
    if (w.rise) {
      const r = w.rise;
      if (r.wait > 0) r.wait--;
      else { r.y -= r.speed; r.speed += r.acc; }
      if (p.y + p.h > r.y + 6) return 'rise';
      w.bossProg = Math.max(w.bossProg, clamp01((w.track.y0 - p.y) / (w.track.y0 - w.track.y1)));
    }
    if (w.def.boss.drops && !(b && b.enter > 0)) return stepDrops(w, p, beat);
    return null;
  }

  // ---------- paso de simulación ----------
  // input: {left,right,down,jump,jumpPressed}
  function step(w, input) {
    w.events.length = 0;
    const p = w.p;
    if (p.dead || w.done) { w.t++; return w.events; }
    w.t++;

    // Plataformas móviles
    for (const pl of w.plats) {
      const d = w.t * pl.speed;
      const [nx, ny] = along(pl.path, d, pl.loop);
      pl.dx = pl.x === undefined ? 0 : nx - pl.x;
      pl.dy = pl.y === undefined ? 0 : ny - pl.y;
      pl.x = nx; pl.y = ny;
    }
    // Sierras (camino en casillas, velocidad en píxeles por paso)
    for (const s of w.saws) {
      const pos = s.speed ? along(s.path, w.t * s.speed / T, s.loop) : s.path[0];
      s.x = pos[0] * T; s.y = pos[1] * T;
    }

    // Llevado por plataforma
    if (p.ride) { p.x += p.ride.dx; p.y += p.ride.dy; }

    // Casillas que se vuelven sólidas estando dentro no bloquean
    const ghost = new Set();
    overlapTiles(w, p.x, p.y, p.w, p.h, (c, r) => {
      const t = at(w, c, r);
      if (t === TOG_A || t === TOG_B) ghost.add(r * w.W + c);
      return false;
    });

    // ---- horizontal ----
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir) p.face = dir;
    let acc = p.onGround ? PHY.groundAcc : PHY.airAcc;
    if (p.lock > 0) { p.lock--; if (dir === p.wallDir) acc *= 0.15; }
    if (dir) {
      if (Math.sign(p.vx) === -dir) acc *= p.onGround ? PHY.turnBoost : PHY.airTurn;
      if (Math.abs(p.vx) <= PHY.runMax || Math.sign(p.vx) !== dir) {
        p.vx = Math.max(-PHY.runMax, Math.min(PHY.runMax, p.vx + dir * acc));
      } else {
        // más rápido que el máximo (tras un salto de pared): frena poco a poco
        p.vx = Math.max(Math.abs(p.vx) - (p.onGround ? 0.8 : 0.1), PHY.runMax) * dir;
      }
    } else {
      const dec = p.onGround ? PHY.groundDec : PHY.airDec;
      p.vx = Math.abs(p.vx) <= dec ? 0 : p.vx - dec * Math.sign(p.vx);
    }

    // ---- saltos ----
    if (input.jumpPressed) p.buffer = PHY.buffer; else if (p.buffer > 0) p.buffer--;
    if (p.onGround) p.coyote = PHY.coyote; else if (p.coyote > 0) p.coyote--;
    if (p.wall && !p.onGround) { p.wallCoyote = 6; p.wallDir = p.wall; } else if (p.wallCoyote > 0) p.wallCoyote--;
    let jumped = false;
    if (p.buffer > 0) {
      if (p.coyote > 0) {
        p.vy = -PHY.jump; p.coyote = 0; p.buffer = 0; jumped = true; p.tramp = false;
        p.vx += p.belt * PHY.conveyor; p.belt = 0;   // el salto conserva el empuje de la cinta
        w.events.push({ e: 'jump', x: p.x + p.w / 2, y: p.y + p.h });
      } else if (p.wallCoyote > 0) {
        p.vy = -PHY.wallJumpY; p.vx = -p.wallDir * PHY.wallJumpX; p.lock = PHY.wallLock;
        p.wallCoyote = 0; p.buffer = 0; jumped = true; p.tramp = false; p.face = -p.wallDir;
        w.events.push({ e: 'walljump', x: p.x + (p.wallDir > 0 ? p.w : 0), y: p.y + p.h / 2, dir: p.wallDir });
      }
    }
    if (jumped) {
      p.onGround = false; p.ride = null;
      if (w.def.toggles) { w.phase ^= 1; w.events.push({ e: 'toggle' }); }
    }
    if (jumped) p.cut = false;
    if (!input.jump && p.vy < 0 && !p.tramp && !p.cut) { p.vy *= PHY.jumpCut; p.cut = true; }

    // ---- gravedad ----
    let g = p.vy < 0 ? PHY.gravUp : PHY.gravDown;
    if (Math.abs(p.vy) < 1.6 && input.jump && !p.tramp) g *= PHY.apexHang;
    p.vy += g;
    const slide = p.wall && !p.onGround && dir === p.wall && p.vy > PHY.wallSlide;
    if (slide) p.vy = PHY.wallSlide;
    if (p.vy > PHY.maxFall) p.vy = PHY.maxFall;
    p.sliding = slide;

    // Cinta transportadora
    let conv = 0;
    if (p.onGround) {
      overlapTiles(w, p.x + 1, p.y + p.h, p.w - 2, 2, (c, r) => {
        const t = at(w, c, r);
        if (t === CONV_L) conv = -1; else if (t === CONV_R) conv = 1;
        return false;
      });
      p.belt = conv;
    }

    // ---- mover y colisionar ----
    const plats = platRects(w);
    const hitSolid = (x, y) => overlapTiles(w, x, y, p.w, p.h, (c, r) => isSolid(w, c, r, ghost)) ||
      plats.some(q => rectHit(x, y, p.w, p.h, q.x, q.y, q.w, q.h));

    const moveX = (dx) => {
      if (!dx) return false;
      const stepS = Math.sign(dx);
      let remaining = Math.abs(dx);
      while (remaining > 0) {
        const d = Math.min(1, remaining) * stepS;
        if (hitSolid(p.x + d, p.y)) return true;
        p.x += d; remaining -= 1;
      }
      return false;
    };
    const wasGround = p.onGround;
    const prevBottom = p.y + p.h;
    if (moveX(p.vx + conv * PHY.conveyor)) p.vx = 0;

    // vertical
    let landed = false;
    p.ride = null;
    {
      const dy = p.vy;
      const s = Math.sign(dy);
      let remaining = Math.abs(dy);
      while (remaining > 0) {
        const d = Math.min(1, remaining) * s;
        let blocked = hitSolid(p.x, p.y + d);
        if (!blocked && s > 0 && !input.down) {
          // plataformas de un solo sentido
          const bottom = p.y + p.h, nb = bottom + d;
          blocked = overlapTiles(w, p.x, nb - 1, p.w, 1, (c, r) => at(w, c, r) === ONEWAY && bottom <= r * T + 0.01 && nb > r * T);
        }
        if (blocked) {
          if (s > 0) landed = true; else w.events.push({ e: 'bonk' });
          p.vy = 0; break;
        }
        p.y += d; remaining -= 1;
      }
    }
    // ¿en el suelo?
    p.onGround = landed || (p.vy >= 0 && (hitSolid(p.x, p.y + 1) ||
      overlapTiles(w, p.x, p.y + p.h, p.w, 1, (c, r) => at(w, c, r) === ONEWAY && Math.abs(p.y + p.h - r * T) < 0.5)));
    if (p.onGround) {
      for (const q of plats) if (rectHit(p.x, p.y + 1, p.w, p.h, q.x, q.y, q.w, q.h) && p.y + p.h <= q.y + 1) p.ride = q.pl;
      if (!wasGround) { w.events.push({ e: 'land', x: p.x + p.w / 2, y: p.y + p.h, v: p.airTime }); p.tramp = false; }
      p.airTime = 0;
    } else {
      p.airTime++;
      // al caer de una cinta sin saltar también se conserva su empuje
      if (wasGround && p.belt) { p.vx += p.belt * PHY.conveyor; p.belt = 0; }
    }
    // pared
    p.wall = 0;
    if (!p.onGround) {
      if (hitSolid(p.x + 1, p.y)) p.wall = 1; else if (hitSolid(p.x - 1, p.y)) p.wall = -1;
    }

    // Suelo que se rompe
    if (p.onGround) {
      overlapTiles(w, p.x, p.y + p.h, p.w, 1, (c, r) => {
        if (at(w, c, r) === CRUMBLE) {
          const k = r * w.W + c;
          if (!w.crumble.has(k)) { w.crumble.set(k, { t: PHY.crumbleDelay, broken: 0, c, r }); w.events.push({ e: 'crack', c, r }); }
        }
        return false;
      });
    }
    for (const [k, s] of w.crumble) {
      if (s.broken > 0) {
        s.broken--;
        if (s.broken === 0) {
          if (rectHit(p.x, p.y, p.w, p.h, s.c * T, s.r * T, T, T)) s.broken = 1;
          else { w.crumble.delete(k); w.events.push({ e: 'restore', c: s.c, r: s.r }); }
        }
      } else if (--s.t <= 0) { s.broken = PHY.crumbleRespawn; w.events.push({ e: 'break', c: s.c, r: s.r }); }
    }

    // ---- interacciones ----
    const px = p.x, py = p.y;
    // trampolines
    overlapTiles(w, px, py, p.w, p.h, (c, r) => {
      if (at(w, c, r) === TRAMP && p.vy >= 0 && rectHit(px, py, p.w, p.h, c * T + 2, r * T + 20, T - 4, 10)) {
        p.vy = -PHY.tramp; p.tramp = true; p.onGround = false; p.coyote = 0;
        w.events.push({ e: 'tramp', c, r });
        return true;
      }
      return false;
    });
    // llaves
    for (const k of w.keys) if (!k.got && rectHit(px, py, p.w, p.h, k.x + 4, k.y + 6, T - 8, T - 12)) {
      k.got = true; w.hasKey = true; w.doorOpen = 1; w.events.push({ e: 'key', x: k.x + T / 2, y: k.y + T / 2 });
    }
    if (w.doorOpen > 0) w.doorOpen++;
    // fragmento
    for (const f of w.frags) if (!f.got && !w.gotFrag && rectHit(px, py, p.w, p.h, f.x + 5, f.y + 5, T - 10, T - 10)) {
      f.got = true; w.gotFrag = true; w.events.push({ e: 'frag', x: f.x + T / 2, y: f.y + T / 2 });
    }
    // portales
    if (p.port > 0) p.port--;
    else for (const k in w.ports) {
      const a = w.ports[k], b = w.exits[k];
      if (b && rectHit(px, py, p.w, p.h, a.x + 6, a.y + 2, T - 12, T - 4)) {
        const from = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
        p.x = b.x + (T - p.w) / 2; p.y = b.y + (T - p.h) / 2; p.port = 24;
        w.events.push({ e: 'port', from, to: { x: p.x + p.w / 2, y: p.y + p.h / 2 } });
        break;
      }
    }
    // puntos de control
    w.checks.forEach((k, i) => {
      if (!k.on && rectHit(p.x, p.y, p.w, p.h, k.x + 4, k.y - T, T - 8, T * 2)) {
        k.on = true; w.check = i; w.events.push({ e: 'check', i, key: w.hasKey, x: k.x + T / 2, y: k.y + T / 2 });
      }
    });
    // bandera
    if (!w.def.boss || w.def.boss.kind !== 'mill') {
      for (const f of w.flags) if (rectHit(p.x, p.y, p.w, p.h, f.x + 6, f.y, T - 10, T)) {
        w.done = true; w.events.push({ e: 'flag', x: f.x + T / 2, y: f.y + T / 2 });
      }
    }

    // ---- muerte ----
    let cause = null;
    const hx = p.x + 3, hy = p.y + 3, hw = p.w - 6, hh = p.h - 6;
    overlapTiles(w, p.x, p.y, p.w, p.h, (c, r) => {
      const t = at(w, c, r), X = c * T, Y = r * T;
      let hit = false;
      if (t === RED) hit = rectHit(hx, hy, hw, hh, X + 1, Y + 1, T - 2, T - 2);
      else if (t === SPK_U) hit = rectHit(hx, hy, hw, hh, X + 6, Y + 13, T - 12, T - 13);
      else if (t === SPK_D) hit = rectHit(hx, hy, hw, hh, X + 6, Y, T - 12, T - 13);
      else if (t === SPK_L) hit = rectHit(hx, hy, hw, hh, X + 13, Y + 6, T - 13, T - 12);
      else if (t === SPK_R) hit = rectHit(hx, hy, hw, hh, X, Y + 6, T - 13, T - 12);
      else if (t === LAS_A || t === LAS_B) {
        if (laserState(w, t) === 2) {
          const vert = beamVertical(w, c, r);
          hit = vert ? rectHit(hx, hy, hw, hh, X + 11, Y, 8, T) : rectHit(hx, hy, hw, hh, X, Y + 11, T, 8);
        }
      }
      if (hit) cause = 'spike';
      return hit;
    });
    for (const s of w.saws) {
      const cx = Math.max(p.x, Math.min(s.x, p.x + p.w)), cy = Math.max(p.y, Math.min(s.y, p.y + p.h));
      if (Math.hypot(cx - s.x, cy - s.y) < s.r - 5) cause = 'saw';
    }
    if (p.y > w.ph + 40) cause = 'fall';
    if (!cause && w.boss) cause = stepBoss(w, p, input);
    else if (!cause && w.rise) cause = stepBoss(w, p, input);
    if (cause && !w.done) {
      p.dead = true;
      w.events.push({ e: 'death', x: p.x + p.w / 2, y: p.y + p.h / 2, cause });
    }
    return w.events;
  }

  // Un láser es vertical si tiene vecinos del mismo tipo arriba/abajo
  function beamVertical(w, c, r) {
    const t = at(w, c, r);
    if (at(w, c, r - 1) === t || at(w, c, r + 1) === t) return true;
    if (at(w, c - 1, r) === t || at(w, c + 1, r) === t) return false;
    return true;
  }

  const api = { T, PHY, PW, PH, create, step, at, isSolid, laserState, beamVertical, along, crumbleBroken,
    TILES: { E, SOLID, RED, SPK_U, SPK_D, SPK_L, SPK_R, TRAMP, DOOR, CRUMBLE, ONEWAY, TOG_A, TOG_B, CONV_L, CONV_R, LAS_A, LAS_B } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SKE = api;
})(typeof self !== 'undefined' ? self : this);
