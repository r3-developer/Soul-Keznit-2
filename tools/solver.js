// Comprueba que cada nivel del remake de Soul Keznit se puede superar,
// buscando una secuencia de controles con la física real del motor.
// Uso: node tools/solver.js [id] [--frag]
const SKE = require('../web/play/sk1-remake/js/engine.js');
const { LEVELS } = require('../web/play/sk1-remake/js/levels.js');

const HOLD = 5;
function clone(w) {
  const c = Object.assign({}, w);
  c.p = Object.assign({}, w.p, { ride: null });
  c.crumble = new Map([...w.crumble].map(([k, v]) => [k, Object.assign({}, v)]));
  c.keys = w.keys.map(k => Object.assign({}, k));
  c.frags = w.frags.map(k => Object.assign({}, k));
  c.plats = w.plats.map(k => Object.assign({}, k));
  c.saws = w.saws.map(k => Object.assign({}, k));
  if (w.p.ride) c.p.ride = c.plats[w.plats.indexOf(w.p.ride)];
  c.rise = w.rise && Object.assign({}, w.rise);
  c.boss = w.boss && Object.assign({}, w.boss, { minis: (w.boss.minis || []).map(m => Object.assign({}, m)) });
  c.hist = w.hist.slice();
  c.events = [];
  return c;
}
function key(w, held, timed, q) {
  const p = w.p;
  let k = `${Math.round(p.x / q)},${Math.round(p.y / q)},${Math.round(p.vx)},${Math.round(p.vy)},${p.onGround ? 1 : 0},${held ? 1 : 0},${w.hasKey ? 1 : 0},${w.phase},${w.gotFrag ? 1 : 0}`;
  if (w.crumble.size) k += '|' + [...w.crumble.keys()].sort().join('.');
  if (timed) k += '|' + Math.floor((w.period ? w.t % w.period : w.t) / HOLD);
  return k;
}
class Heap {
  constructor() { this.a = []; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i) { const j = (i - 1) >> 1; if (a[j].f <= a[i].f) break; [a[i], a[j]] = [a[j], a[i]]; i = j; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l].f < a[m].f) m = l; if (r < a.length && a[r].f < a[m].f) m = r; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } } return top; }
  get size() { return this.a.length; }
}
function goalOf(w, wantFrag) {
  if (wantFrag) return w.frags[0];
  if (w.boss && w.boss.kind === 'mill') return null;
  if (w.keys.length && !w.hasKey) return w.keys[0];
  return w.flags[0];
}
function solve(def, wantFrag, maxNodes = 400000) {
  const w0 = SKE.create(def, {});
  const timed = !!(w0.plats.length || w0.saws.some(s => s.speed) || def.map.some(r => /[xy]/.test(r)) || w0.rise || w0.boss);
  const q = timed ? 5 : 3;
  // periodo común de todo lo que se mueve (si existe y es pequeño)
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  let per = def.map.some(r => /[xy]/.test(r)) ? SKE.PHY.laserPeriod : 1;
  for (const m of w0.saws.concat(w0.plats)) {
    if (!m.speed) continue;
    let len = 0;
    for (let i = 0; i < m.path.length - 1; i++) len += Math.hypot(m.path[i + 1][0] - m.path[i][0], m.path[i + 1][1] - m.path[i][1]);
    const P = 2 * len * (m.w ? 1 : SKE.T) / m.speed;
    if (Math.abs(P - Math.round(P)) > 1e-6) { per = 0; break; }
    per = per / gcd(per, Math.round(P)) * Math.round(P);
  }
  w0.period = (per > 1 && per <= 2400 && !w0.rise && !w0.boss) ? per : 0;
  const acts = [];
  for (const d of [-1, 0, 1]) for (const j of [false, true]) acts.push([d, j]);
  // distancia por los pasillos del mapa (ignora la física) hacia cada objetivo
  const T = SKE.T;
  const free = (c, r) => { const t = SKE.at(w0, c, r); return c >= 0 && r >= 0 && c < w0.W && r < w0.H && t !== 1 && t !== 13 && t !== 14; };
  const field = (g) => {
    const D = new Float64Array(w0.W * w0.H).fill(1e9);
    const gc = Math.floor((g.x + T / 2) / T), gr = Math.floor((g.y + T / 2) / T);
    const qq = [[gc, gr]]; D[gr * w0.W + gc] = 0;
    // puertas y portales: se tratan como libres; los portales conectan entrada y salida
    for (let i = 0; i < qq.length; i++) {
      const [c, r] = qq[i], d0 = D[r * w0.W + c];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nc = c + dc, nr = r + dr;
        if ((dc || dr) && free(nc, nr) && D[nr * w0.W + nc] > d0 + 1) { D[nr * w0.W + nc] = d0 + (dc && dr ? 1.4 : 1); qq.push([nc, nr]); }
      }
      for (const k in w0.ports) {
        const a = w0.ports[k], b = w0.exits[k];
        if (b && Math.floor(b.x / T) === c && Math.floor(b.y / T) === r) {
          const ac = Math.floor(a.x / T), ar = Math.floor(a.y / T);
          if (D[ar * w0.W + ac] > d0 + 1) { D[ar * w0.W + ac] = d0 + 1; qq.push([ac, ar]); }
        }
      }
    }
    return D;
  };
  const goals = wantFrag ? [w0.frags[0]] : (w0.keys.length ? [w0.keys[0], w0.flags[0]] : [w0.flags[0]]);
  const fields = goals.map(field);
  const keyToFlag = w0.keys.length && !wantFrag ? fields[1][Math.floor((w0.keys[0].y + 15) / T) * w0.W + Math.floor((w0.keys[0].x + 15) / T)] : 0;
  const h = (w) => {
    const c = Math.floor((w.p.x + 11) / T), r = Math.floor((w.p.y + 11) / T);
    const i = r * w0.W + c;
    let d;
    if (!wantFrag && w0.keys.length && !w.hasKey) d = fields[0][i] + keyToFlag;
    else d = fields[fields.length - 1][i];
    if (d > 1e8) d = 200;
    return d * T / SKE.PHY.runMax / HOLD;
  };
  const heap = new Heap();
  heap.push({ w: w0, held: false, g: 0, f: h(w0), path: null });
  const seen = new Set([key(w0, false, timed, q)]);
  let nodes = 0;
  while (heap.size) {
    const n = heap.pop();
    for (const [d, j] of acts) {
      const w = clone(n.w);
      let ok = true;
      for (let s = 0; s < HOLD; s++) {
        SKE.step(w, { left: d < 0, right: d > 0, down: false, jump: j, jumpPressed: j && (s === 0 ? !n.held : false) });
        if (w.p.dead) { ok = false; break; }
        if (wantFrag ? w.gotFrag : w.done) return { steps: n.g * HOLD + s + 1, nodes };
      }
      if (!ok) continue;
      const k = key(w, j, timed, q);
      if (seen.has(k)) continue;
      seen.add(k);
      if (++nodes > maxNodes) return { fail: 'limite', nodes };
      heap.push({ w, held: j, g: n.g + 1, f: n.g + 1 + 2.5 * h(w) });
    }
  }
  return { fail: 'imposible', nodes };
}
const only = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const frag = process.argv.includes('--frag');
for (const def of LEVELS) {
  if (only && def.id !== only) continue;
  const W = def.map[0].length;
  const bad = def.map.map((r, i) => r.length !== W ? `fila ${i}: ${r.length}` : null).filter(Boolean);
  if (bad.length) { console.log(def.id, 'ANCHO MAL', bad.join('; ')); continue; }
  if (def.boss && def.boss.kind === 'mill') { console.log(def.id, '(jefe molino: se prueba aparte)'); continue; }
  const t0 = Date.now();
  const r = solve(def, false);
  let msg = `${def.id} ${r.fail ? 'NO SUPERABLE (' + r.fail + ')' : 'ok en ' + (r.steps / 60).toFixed(1) + ' s'} nodos=${r.nodes} ${Date.now() - t0}ms`;
  if (frag && def.map.some(x => x.includes('M'))) {
    const f = solve(def, true);
    msg += ` · fragmento ${f.fail ? 'NO (' + f.fail + ')' : 'ok'}`;
  }
  console.log(msg);
}
