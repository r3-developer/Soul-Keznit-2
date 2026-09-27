// Historias — cuaderno de historias de juegos.
// Todo se guarda en IndexedDB (en este navegador). Exportar/importar para copias.

/* ───────────── Utilidades ───────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nf = new Intl.NumberFormat('es-ES');
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const countWords = t => (String(t).trim().match(/\S+/g) || []).length;
const pad = n => String(n).padStart(2, '0');
const plural = (n, one, many) => `${nf.format(n)} ${n === 1 ? one : many}`;
const readMins = w => Math.max(1, Math.round(w / 220));

function ago(ts) {
  const s = (ts - Date.now()) / 1000;
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [u, n] of units) if (Math.abs(s) >= n) return rtf.format(Math.round(s / n), u);
  return 'ahora mismo';
}
function lsGet(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

/* ───────────── Iconos ───────────── */
const svg = d => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  book: svg('<path d="M5 4.5h9a4 4 0 0 1 4 4V20H9a4 4 0 0 1-4-4z"/><path d="M5 16a4 4 0 0 1 4-4h9"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  back: svg('<path d="M15 18l-6-6 6-6"/>'),
  chev: svg('<path d="M9 6l6 6-6 6"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
  more: svg('<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  pencil: svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
  image: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-9 8.5"/>'),
  quote: svg('<path d="M7 17c-1.7 0-3-1.3-3-3 0-3 2-6 5-7M16 17c-1.7 0-3-1.3-3-3 0-3 2-6 5-7"/><circle cx="7" cy="14" r="3" /><circle cx="16" cy="14" r="3"/>'),
  ul: svg('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>'),
  ol: svg('<path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 14.5a1.5 1.5 0 0 1 3 .5c0 1-3 2-3 3.5h3"/>'),
  hr: svg('<path d="M4 12h16"/><circle cx="12" cy="6" r=".6" fill="currentColor"/><circle cx="12" cy="18" r=".6" fill="currentColor"/>'),
  alignL: svg('<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>'),
  alignC: svg('<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>'),
  grip: svg('<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>'),
  download: svg('<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>'),
  upload: svg('<path d="M12 16V5M7 9.5l5-5 5 5M5 20h14"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  read: svg('<path d="M2.5 6.5C5 5 8.5 5 12 7c3.5-2 7-2 9.5-.5V19c-2.5-1.5-6-1.5-9.5.5-3.5-2-7-2-9.5-.5z"/><path d="M12 7v12.5"/>'),
  text: svg('<path d="M5 7V5h14v2M12 5v14M9 19h6"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>'),
};

/* ───────────── Estilos de juego ───────────── */
const FONTS = {
  sistema:   { name: 'Sistema',   css: 'var(--display)', w: 700 },
  playfair:  { name: 'Playfair',  css: "'Playfair Display', serif", w: 700 },
  cormorant: { name: 'Cormorant', css: "'Cormorant Garamond', serif", w: 600, s: 1.12 },
  cinzel:    { name: 'Cinzel',    css: "'Cinzel', serif", w: 700, ls: '0.01em', s: .9 },
  fell:      { name: 'IM Fell',   css: "'IM Fell English', serif", w: 400, ls: '0' },
  pirata:    { name: 'Pirata',    css: "'Pirata One', serif", w: 400, ls: '0.005em', s: 1.05 },
  bebas:     { name: 'Bebas',     css: "'Bebas Neue', sans-serif", w: 400, ls: '0.01em', s: 1.15 },
  unbounded: { name: 'Unbounded', css: "'Unbounded', sans-serif", w: 700, ls: '-0.03em', s: .88 },
  syne:      { name: 'Syne',      css: "'Syne', sans-serif", w: 800, ls: '-0.03em' },
  orbitron:  { name: 'Orbitron',  css: "'Orbitron', sans-serif", w: 700, ls: '0.02em', s: .85 },
  pixel:     { name: 'Píxel',     css: "'Press Start 2P', monospace", w: 400, ls: '0', s: .55 },
};
const ACCENTS = [
  { c: '#0a84ff', ink: '#fff', n: 'Azul' },
  { c: '#5e5ce6', ink: '#fff', n: 'Índigo' },
  { c: '#bf5af2', ink: '#fff', n: 'Morado' },
  { c: '#ff375f', ink: '#fff', n: 'Rosa' },
  { c: '#e5332a', ink: '#fff', n: 'Rojo' },
  { c: '#ff9f0a', ink: '#1d1d1f', n: 'Naranja' },
  { c: '#ffd60a', ink: '#1d1d1f', n: 'Amarillo' },
  { c: '#30d158', ink: '#1d1d1f', n: 'Verde' },
  { c: '#64d2ff', ink: '#1d1d1f', n: 'Cian' },
  { c: '#8e8e93', ink: '#fff', n: 'Grafito' },
];
function styleVars(g) {
  const f = FONTS[g.titleFont] || FONTS.sistema;
  const a = ACCENTS.find(x => x.c === g.accent) || ACCENTS[0];
  return `--tf:${f.css};--tw:${f.w};--ts:${f.s || 1};--tls:${f.ls || '-0.02em'};--accent:${a.c};--accent-ink:${a.ink};--bf:${g.bodyFont === 'sans' ? 'var(--ui)' : 'var(--serif)'}`;
}
function coverHTML(g) {
  if (g.cover) return `<img src="${esc(g.cover)}" alt="" decoding="async">`;
  const ch = (g.title || '?').trim().charAt(0) || '?';
  return `<div class="cover-empty"><span>${esc(ch)}</span></div>`;
}

/* ───────────── Base de datos ───────────── */
const DB = (() => {
  let dbp;
  const open = () => dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open('historias', 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      db.createObjectStore('games', { keyPath: 'id' });
      db.createObjectStore('chapters', { keyPath: 'id' }).createIndex('gameId', 'gameId');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      let out;
      if (req) req.onsuccess = () => { out = req.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  }
  return {
    all: s => tx(s, 'readonly', st => st.getAll()),
    get: (s, id) => tx(s, 'readonly', st => st.get(id)),
    put: (s, v) => tx(s, 'readwrite', st => st.put(v)),
    del: (s, id) => tx(s, 'readwrite', st => st.delete(id)),
    chapters: gid => tx('chapters', 'readonly', st => st.index('gameId').getAll(gid))
      .then(list => list.sort((a, b) => a.order - b.order)),
  };
})();

async function touchGame(gid) {
  const g = await DB.get('games', gid);
  if (g) { g.updatedAt = Date.now(); await DB.put('games', g); }
}
let persistAsked = false;
function askPersist() {
  if (persistAsked) return;
  persistAsked = true;
  navigator.storage?.persist?.().catch(() => {});
}

/* ───────────── Saneado de HTML ───────────── */
const OK_TAGS = new Set(['P', 'H2', 'H3', 'H4', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'BR', 'HR', 'FIGURE', 'IMG', 'FIGCAPTION', 'A', 'DIV', 'SPAN']);
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'TEMPLATE', 'SVG', 'MATH', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT']);
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');
  const walk = node => {
    for (const el of [...node.children]) {
      if (DROP_TAGS.has(el.tagName)) { el.remove(); continue; }
      walk(el);
      if (!OK_TAGS.has(el.tagName)) { el.replaceWith(...el.childNodes); continue; }
      for (const a of [...el.attributes]) {
        const n = a.name.toLowerCase();
        if (n === 'src' && el.tagName === 'IMG' && /^(data:image\/(png|jpe?g|gif|webp);|https:)/i.test(a.value)) continue;
        if (n === 'href' && el.tagName === 'A' && /^https?:/i.test(a.value)) continue;
        if (n === 'style') {
          const m = a.value.match(/text-align:\s*(left|center|right|justify)/i);
          if (m) { el.setAttribute('style', `text-align:${m[1].toLowerCase()}`); continue; }
        }
        el.removeAttribute(a.name);
      }
      if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
function textOf(html) {
  return new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html').body.textContent || '';
}

/* ───────────── Imágenes ───────────── */
async function compress(file, max = 2000, q = .86) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  } finally { URL.revokeObjectURL(url); }
}
function pickFile(accept = 'image/*') {
  return new Promise(res => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = () => res(inp.files[0] || null);
    inp.click();
  });
}

/* ───────────── Toast, sheets y menús ───────────── */
function toast(msg, icon = I.check) {
  const host = $('#toast');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icon || ''}<span>${esc(msg)}</span>`;
  host.append(t);
  setTimeout(() => { t.classList.add('out'); t.addEventListener('animationend', () => t.remove(), { once: true }); }, 2400);
}

function sheet(inner, { size = '', onClose } = {}) {
  const layer = $('#layer');
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="backdrop"></div><div class="sheet-host"><div class="sheet ${size}" role="dialog" aria-modal="true">${inner}</div></div>`;
  layer.append(wrap);
  const prevFocus = document.activeElement;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    wrap.classList.add('closing');
    wrap.classList.remove('open');
    setTimeout(() => { wrap.remove(); prevFocus?.focus?.({ preventScroll: true }); }, reduced ? 0 : 320);
    onClose?.();
  };
  const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  document.addEventListener('keydown', onKey);
  wrap.querySelector('.sheet-host').addEventListener('mousedown', e => { if (e.target === e.currentTarget) close(); });
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  const el = wrap.querySelector('.sheet');
  setTimeout(() => (el.querySelector('[autofocus]') || el.querySelector('input, button'))?.focus({ preventScroll: true }), 60);
  return { el, close };
}

function confirmSheet({ title, text, ok = 'Eliminar', danger = true }) {
  return new Promise(res => {
    let v = false;
    const s = sheet(`
      <h2>${esc(title)}</h2>
      <p class="lead">${esc(text)}</p>
      <div class="sheet-foot">
        <button class="btn btn-soft" data-a="no">Cancelar</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-a="yes" autofocus>${esc(ok)}</button>
      </div>`, { size: 'sm', onClose: () => res(v) });
    s.el.addEventListener('click', e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      v = a === 'yes';
      s.close();
    });
  });
}

function popover(anchor, items) {
  $$('.pop').forEach(p => p.remove());
  const p = document.createElement('div');
  p.className = 'pop';
  p.innerHTML = items.map((it, i) => `<button data-i="${i}" class="${it.danger ? 'danger' : ''}">${it.icon || ''}<span>${esc(it.label)}</span></button>`).join('');
  document.body.append(p);
  const r = anchor.getBoundingClientRect();
  p.style.top = `${r.bottom + 8}px`;
  p.style.right = `${Math.max(12, innerWidth - r.right)}px`;
  const close = () => {
    document.removeEventListener('pointerdown', out, true);
    removeEventListener('hashchange', close);
    p.classList.add('out');
    p.addEventListener('animationend', () => p.remove(), { once: true });
  };
  const out = e => { if (!p.contains(e.target)) close(); };
  setTimeout(() => document.addEventListener('pointerdown', out, true));
  addEventListener('hashchange', close);
  p.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    close();
    items[+b.dataset.i].action();
  });
}

function segmented(el, value, onChange) {
  const btns = $$('button', el);
  let thumb = el.querySelector('.seg-thumb');
  if (!thumb) { thumb = document.createElement('span'); thumb.className = 'seg-thumb'; el.prepend(thumb); }
  const set = (v, anim = true) => {
    btns.forEach(b => b.classList.toggle('on', b.dataset.v === v));
    const on = btns.find(b => b.dataset.v === v) || btns[0];
    if (!anim) thumb.style.transition = 'none';
    thumb.style.width = `${on.offsetWidth}px`;
    thumb.style.transform = `translateX(${on.offsetLeft - 3}px)`;
    if (!anim) requestAnimationFrame(() => { thumb.style.transition = ''; });
  };
  btns.forEach(b => b.addEventListener('click', () => { set(b.dataset.v); onChange(b.dataset.v); }));
  requestAnimationFrame(() => set(value, false));
}

/* ───────────── Tema ───────────── */
function applyTheme(t) {
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  lsSet('theme', t);
}

/* ───────────── Router ───────────── */
const app = $('#app');
let cleanup = null;
let firstRender = true;

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'g' && parts[1]) {
    if (parts[2] === 'c' && parts[3]) return { name: 'editor', gid: parts[1], cid: parts[3] };
    if (parts[2] === 'leer') return { name: 'reader', gid: parts[1], cid: parts[3] };
    return { name: 'game', gid: parts[1] };
  }
  return { name: 'library' };
}
const go = h => { if (location.hash !== h) location.hash = h; else render(); };

let renderSeq = 0;
async function render() {
  const seq = ++renderSeq;
  if (cleanup) { const c = cleanup; cleanup = null; await c(); }
  const route = parseRoute();
  const view = await (VIEWS[route.name] || VIEWS.library)(route);
  if (seq !== renderSeq) return;
  if (!view) { go('#/'); return; }
  const swap = () => {
    app.replaceChildren(view.el);
    scrollTo(0, 0);
    cleanup = view.cleanup || null;
    view.mount?.();
  };
  if (!firstRender && document.startViewTransition && !reduced) {
    view.el.classList.add('no-anim');
    document.startViewTransition(swap);
  } else swap();
  firstRender = false;
}

function h(html, style = '') {
  const d = document.createElement('div');
  d.className = 'view';
  if (style) d.setAttribute('style', style);
  d.innerHTML = html;
  return d;
}
function navBar({ left, center = '', right = '' }) {
  return `<header class="nav"><div class="nav-in"><div class="nav-l">${left}</div><div class="nav-c">${center}</div><div class="nav-r">${right}</div></div></header>`;
}
const brand = `<a class="brand" href="#/"><span class="brand-mark">${I.book}</span><span>Historias</span></a>`;
const backLink = (href, label) => `<a class="nav-back" href="${href}">${I.back}<span>${esc(label)}</span></a>`;

/* ───────────── Vista: Biblioteca ───────────── */
async function viewLibrary() {
  const [games, chapters] = await Promise.all([DB.all('games'), DB.all('chapters')]);
  const stats = {};
  for (const c of chapters) { const s = stats[c.gameId] ||= { n: 0, w: 0 }; s.n++; s.w += c.words || 0; }
  games.sort((a, b) => b.updatedAt - a.updatedAt);
  const totalW = chapters.reduce((a, c) => a + (c.words || 0), 0);

  const cards = games.map((g, i) => {
    const s = stats[g.id] || { n: 0, w: 0 };
    return `
      <a class="card reveal" href="#/g/${g.id}" style="--i:${i};${styleVars(g)}" data-q="${esc((g.title + ' ' + (g.tagline || '')).toLowerCase())}">
        <div class="cover" style="view-transition-name:cv-${g.id}">${coverHTML(g)}</div>
        <div class="card-body">
          <h3 class="card-title title-font">${esc(g.title || 'Sin título')}</h3>
          ${g.tagline ? `<p class="card-tag">${esc(g.tagline)}</p>` : ''}
          <p class="card-meta"><span class="dot"></span>${plural(s.n, 'capítulo', 'capítulos')} · ${plural(s.w, 'palabra', 'palabras')} · ${ago(g.updatedAt)}</p>
        </div>
      </a>`;
  }).join('');

  const el = h(`
    ${navBar({
      left: brand,
      right: `<button class="icon-btn" data-a="settings" aria-label="Ajustes">${I.gear}</button>
              <button class="btn btn-primary" data-a="new">${I.plus}<span>Nuevo juego</span></button>`,
    })}
    <main class="wrap">
      <section class="lib-head">
        <p class="eyebrow reveal" style="--i:0">Tu biblioteca</p>
        <h1 class="lib-title reveal" style="--i:1">Cada juego tiene <span class="muted">una historia.</span></h1>
        <p class="lib-sub reveal" style="--i:2">${games.length
          ? `${plural(games.length, 'juego', 'juegos')} · ${plural(chapters.length, 'capítulo', 'capítulos')} · ${plural(totalW, 'palabra', 'palabras')} escritas.`
          : 'Escribe los mundos, personajes y capítulos de tus juegos. Con portada, tipografía propia y todo en un sitio.'}</p>
      </section>
      ${games.length ? `
        <div class="lib-bar reveal" style="--i:3">
          <label class="search"><span class="ic">${I.search}</span><span class="sr">Buscar</span>
            <input type="search" placeholder="Buscar juegos" autocomplete="off"><kbd>/</kbd></label>
        </div>
        <div class="grid">
          ${cards}
          <button class="card card-new reveal" data-a="new" style="--i:${games.length}">
            <span class="card-new-in"><span class="plus-circle">${I.plus}</span>Nuevo juego</span>
          </button>
          <p class="no-results">Nada coincide con la búsqueda.</p>
        </div>` : `
        <div class="empty reveal" style="--i:3">
          <div class="empty-art">${I.book}</div>
          <h3>Aún no hay historias</h3>
          <p>Crea tu primer juego: ponle portada, elige una tipografía y empieza a escribir.</p>
          <button class="btn btn-primary btn-lg" data-a="new">${I.plus}<span>Crear juego</span></button>
        </div>`}
    </main>`);

  el.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'new') gameSheet();
    if (a === 'settings') settingsSheet();
  });
  const input = $('.search input', el);
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      $$('.card[data-q]', el).forEach(c => { const ok = !q || c.dataset.q.includes(q); c.classList.toggle('hide', !ok); shown += ok; });
      $('.card-new', el).classList.toggle('hide', !!q);
      $('.no-results', el).classList.toggle('show', !shown);
    });
  }
  const onKey = e => {
    if (e.key === '/' && input && document.activeElement?.tagName !== 'INPUT' && !$('#layer').children.length) { e.preventDefault(); input.focus(); }
  };
  document.addEventListener('keydown', onKey);
  return { el, cleanup: () => document.removeEventListener('keydown', onKey) };
}

/* ───────────── Vista: Juego ───────────── */
async function viewGame({ gid }) {
  const g = await DB.get('games', gid);
  if (!g) return null;
  const chs = await DB.chapters(gid);
  const totalW = chs.reduce((a, c) => a + (c.words || 0), 0);

  const rows = chs.map((c, i) => `
    <li class="ch-row reveal" style="--i:${Math.min(i, 12)}" data-id="${c.id}">
      <span class="grip" title="Arrastra para reordenar">${I.grip}</span>
      <a class="ch-link" href="#/g/${g.id}/c/${c.id}" draggable="false">
        <span class="ch-num">${pad(i + 1)}</span>
        <span class="ch-main">
          <span class="ch-title title-font ${c.title ? '' : 'untitled'}">${esc(c.title || 'Capítulo sin título')}</span>
          <span class="ch-ex">${esc(c.excerpt || 'Vacío')}</span>
        </span>
        <span class="ch-w">${plural(c.words || 0, 'palabra', 'palabras')}</span>
        <span class="ic">${I.chev}</span>
      </a>
    </li>`).join('');

  const el = h(`
    ${navBar({
      left: backLink('#/', 'Biblioteca'),
      right: `<button class="icon-btn" data-a="more" aria-label="Más opciones">${I.more}</button>`,
    })}
    <div>
      <header class="hero">
        <div class="hero-media" style="view-transition-name:cv-${g.id}">${coverHTML(g)}</div>
        <div class="hero-shade"></div>
        <div class="hero-content"><div class="wrap">
          <p class="eyebrow reveal" style="--i:0">${plural(chs.length, 'capítulo', 'capítulos')} · ${plural(totalW, 'palabra', 'palabras')}${totalW ? ` · ${readMins(totalW)} min de lectura` : ''}</p>
          <h1 class="hero-title title-font reveal" style="--i:1">${esc(g.title || 'Sin título')}</h1>
          ${g.tagline ? `<p class="hero-tag reveal" style="--i:2">${esc(g.tagline)}</p>` : ''}
          <div class="hero-actions reveal" style="--i:3">
            ${chs.length ? `<a class="btn btn-light btn-lg" href="#/g/${g.id}/leer">${I.read}<span>Leer</span></a>` : ''}
            <button class="btn btn-glass btn-lg" data-a="edit">${I.pencil}<span>Editar ficha</span></button>
          </div>
        </div></div>
      </header>
      <section class="section wrap">
        <div class="sec-head">
          <div><h2>Capítulos</h2><p>Actualizado ${ago(g.updatedAt)}</p></div>
          <button class="btn btn-accent" data-a="newch">${I.plus}<span>Nuevo capítulo</span></button>
        </div>
        ${chs.length ? `<ol class="ch-list">${rows}</ol>` : `<div class="ch-empty reveal">Todavía no hay capítulos. Empieza por el primero.</div>`}
        <div class="danger-link"><button data-a="delete">Eliminar juego</button></div>
      </section>
    </div>`, styleVars(g));

  el.addEventListener('click', async e => {
    const btn = e.target.closest('[data-a]');
    const a = btn?.dataset.a;
    if (a === 'edit') gameSheet(g);
    if (a === 'newch') newChapter(g.id);
    if (a === 'delete') deleteGame(g);
    if (a === 'more') popover(btn, [
      { label: 'Editar ficha', icon: I.pencil, action: () => gameSheet(g) },
      { label: 'Nuevo capítulo', icon: I.plus, action: () => newChapter(g.id) },
      ...(chs.length ? [{ label: 'Leer', icon: I.read, action: () => go(`#/g/${g.id}/leer`) }] : []),
      { label: 'Exportar este juego', icon: I.download, action: () => exportData([g.id]) },
      { label: 'Eliminar juego', icon: I.trash, danger: true, action: () => deleteGame(g) },
    ]);
  });

  // Reordenar arrastrando
  const list = $('.ch-list', el);
  if (list) {
    let dragging = null;
    list.addEventListener('pointerdown', e => { const gr = e.target.closest('.grip'); if (gr) gr.parentElement.draggable = true; });
    list.addEventListener('dragstart', e => {
      dragging = e.target.closest('.ch-row');
      if (!dragging) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragging.dataset.id);
      requestAnimationFrame(() => dragging.classList.add('dragging'));
    });
    list.addEventListener('dragover', e => {
      if (!dragging) return;
      e.preventDefault();
      const after = $$('.ch-row:not(.dragging)', list).find(r => { const b = r.getBoundingClientRect(); return e.clientY < b.top + b.height / 2; });
      if (after === dragging.nextElementSibling && after) return;
      if (!after && dragging === list.lastElementChild) return;
      flip(list, () => after ? list.insertBefore(dragging, after) : list.append(dragging));
    });
    list.addEventListener('dragend', async () => {
      if (!dragging) return;
      dragging.classList.remove('dragging');
      dragging.draggable = false;
      dragging = null;
      const ids = $$('.ch-row', list).map(r => r.dataset.id);
      $$('.ch-num', list).forEach((n, i) => { n.textContent = pad(i + 1); });
      const byId = Object.fromEntries(chs.map(c => [c.id, c]));
      for (const [i, id] of ids.entries()) {
        if (byId[id].order !== i) { byId[id].order = i; await DB.put('chapters', byId[id]); }
      }
      await touchGame(g.id);
    });
  }

  // Parallax del hero
  let raf = 0;
  const onScroll = () => {
    if (raf || reduced) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = Math.min(scrollY, 900);
      const media = $('.hero-media', el), content = $('.hero-content', el);
      if (!media) return;
      media.style.transform = `translate3d(0, ${y * .38}px, 0) scale(${1 + y * .00025})`;
      content.style.transform = `translate3d(0, ${y * .18}px, 0)`;
      content.style.opacity = String(Math.max(0, 1 - y / 460));
    });
  };
  return {
    el,
    mount: () => addEventListener('scroll', onScroll, { passive: true }),
    cleanup: () => removeEventListener('scroll', onScroll),
  };
}

function flip(container, mutate) {
  const items = [...container.children];
  const first = new Map(items.map(n => [n, n.getBoundingClientRect().top]));
  mutate();
  if (reduced) return;
  for (const n of items) {
    const dy = first.get(n) - n.getBoundingClientRect().top;
    if (!dy) continue;
    n.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
  }
}

async function newChapter(gid) {
  const chs = await DB.chapters(gid);
  const c = { id: uid('c'), gameId: gid, title: '', html: '', excerpt: '', words: 0, order: chs.length ? chs[chs.length - 1].order + 1 : 0, createdAt: Date.now(), updatedAt: Date.now() };
  await DB.put('chapters', c);
  await touchGame(gid);
  askPersist();
  go(`#/g/${gid}/c/${c.id}`);
}

async function deleteGame(g) {
  const ok = await confirmSheet({ title: `¿Eliminar «${g.title || 'Sin título'}»?`, text: 'Se borrarán el juego y todos sus capítulos. No se puede deshacer.' });
  if (!ok) return;
  const chs = await DB.chapters(g.id);
  for (const c of chs) await DB.del('chapters', c.id);
  await DB.del('games', g.id);
  toast('Juego eliminado', I.trash);
  go('#/');
}

/* ───────────── Ficha del juego (crear / editar) ───────────── */
function gameSheet(existing) {
  const d = existing ? { ...existing } : { title: '', tagline: '', cover: null, titleFont: 'playfair', accent: ACCENTS[0].c, bodyFont: 'serif' };
  const fontOpts = Object.entries(FONTS).map(([k, f]) => `
    <button type="button" class="font-opt" data-font="${k}" style="--tf:${f.css};--tw:${f.w};--ts:${f.s || 1}">
      <b></b><small>${esc(f.name)}</small>
    </button>`).join('');
  const sw = ACCENTS.map(a => `<button type="button" class="sw" data-c="${a.c}" style="--c:${a.c}" aria-label="${a.n}" title="${a.n}"></button>`).join('');

  const s = sheet(`
    <button class="icon-btn sheet-x" data-a="close" aria-label="Cerrar">${I.x}</button>
    <h2>${existing ? 'Editar ficha' : 'Nuevo juego'}</h2>
    <p class="lead">${existing ? 'Cambia la portada, el nombre o el estilo.' : 'Dale una portada y un estilo. Podrás cambiarlo cuando quieras.'}</p>
    <div class="drop" tabindex="0" role="button" aria-label="Elegir portada">
      <div class="drop-media"></div>
      <div class="drop-shade"></div>
      <span class="drop-hint">${I.image}<span>Portada</span></span>
      <button type="button" class="drop-rm" data-a="rmcover" aria-label="Quitar portada" hidden>${I.x}</button>
      <p class="drop-title title-font"></p>
    </div>
    <label class="field"><span>Título</span><input class="input" name="title" maxlength="80" placeholder="Nombre del juego" autocomplete="off" autofocus></label>
    <label class="field"><span>Subtítulo</span><input class="input" name="tagline" maxlength="140" placeholder="Una frase que lo resuma" autocomplete="off"></label>
    <div class="field"><span>Fuente de títulos</span><div class="fontgrid">${fontOpts}</div></div>
    <div class="field"><span>Color</span><div class="swatches">${sw}</div></div>
    <div class="field"><span>Texto de los capítulos</span><div class="seg" data-seg="body"><button type="button" data-v="serif">Serif</button><button type="button" data-v="sans">Sans</button></div></div>
    <div class="sheet-foot">
      <button class="btn btn-soft" data-a="close">Cancelar</button>
      <button class="btn btn-primary" data-a="save">${existing ? 'Guardar' : 'Crear juego'}</button>
    </div>`);
  const el = s.el;
  const drop = $('.drop', el), title = $('[name=title]', el), tag = $('[name=tagline]', el);
  title.value = d.title; tag.value = d.tagline || '';

  const paint = () => {
    el.setAttribute('style', styleVars(d));
    $('.drop-media', drop).innerHTML = coverHTML(d);
    $('.drop-rm', drop).hidden = !d.cover;
    $('.drop-title', drop).textContent = d.title || 'Tu juego';
    const sample = (d.title || 'Aa').slice(0, 14);
    $$('.font-opt', el).forEach(b => { b.classList.toggle('on', b.dataset.font === d.titleFont); b.querySelector('b').textContent = sample; });
    $$('.sw', el).forEach(b => b.classList.toggle('on', b.dataset.c === d.accent));
  };
  paint();

  const setCover = async file => {
    if (!file || !file.type.startsWith('image/')) return;
    try { d.cover = await compress(file, 2200, .86); paint(); }
    catch { toast('No se pudo leer la imagen', I.x); }
  };
  drop.addEventListener('click', async e => {
    if (e.target.closest('[data-a=rmcover]')) { d.cover = null; paint(); return; }
    setCover(await pickFile());
  });
  drop.addEventListener('keydown', async e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCover(await pickFile()); } });
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); setCover(e.dataTransfer.files[0]); });

  title.addEventListener('input', () => { d.title = title.value; paint(); });
  tag.addEventListener('input', () => { d.tagline = tag.value; });
  segmented($('[data-seg=body]', el), d.bodyFont, v => { d.bodyFont = v; });

  const save = async () => {
    d.title = title.value.trim() || 'Sin título';
    d.tagline = tag.value.trim();
    const now = Date.now();
    const g = { ...d, id: d.id || uid('g'), createdAt: d.createdAt || now, updatedAt: now };
    try { await DB.put('games', g); }
    catch { toast('No hay espacio para guardar', I.x); return; }
    askPersist();
    s.close();
    toast(existing ? 'Ficha guardada' : 'Juego creado');
    go(`#/g/${g.id}`);
  };
  el.addEventListener('click', e => {
    const fo = e.target.closest('[data-font]');
    if (fo) { d.titleFont = fo.dataset.font; paint(); return; }
    const c = e.target.closest('[data-c]');
    if (c) { d.accent = c.dataset.c; paint(); return; }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'close') s.close();
    if (a === 'save') save();
  });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); save(); } });
}

/* ───────────── Ajustes ───────────── */
async function settingsSheet() {
  const est = await navigator.storage?.estimate?.().catch(() => null);
  const used = est?.usage ? `${(est.usage / 1048576).toFixed(1)} MB usados` : '';
  const pct = est?.usage && est?.quota ? Math.max(1, Math.min(100, est.usage / est.quota * 100)) : 0;
  const s = sheet(`
    <button class="icon-btn sheet-x" data-a="close" aria-label="Cerrar">${I.x}</button>
    <h2>Ajustes</h2>
    <p class="lead">Tus historias se guardan en este navegador.</p>
    <div class="field"><span>Apariencia</span>
      <div class="seg" data-seg="theme"><button data-v="auto">Auto</button><button data-v="light">Claro</button><button data-v="dark">Oscuro</button></div>
    </div>
    <div class="rows">
      <button class="row-btn" data-a="export"><span class="ic">${I.download}</span><span><b>Exportar copia de seguridad</b><small>Descarga todo en un archivo .json</small></span></button>
      <button class="row-btn" data-a="import"><span class="ic">${I.upload}</span><span><b>Importar copia</b><small>Recupera tus historias desde un archivo</small></span></button>
    </div>
    ${used ? `<p class="note">${used}<span class="meter"><span style="width:0"></span></span></p>` : ''}
    <p class="note">Consejo: exporta una copia de vez en cuando. Si borras los datos del navegador o cambias de dispositivo, podrás recuperarlas importando el archivo.</p>`, { size: 'sm' });
  segmented($('[data-seg=theme]', s.el), lsGet('theme', 'auto'), applyTheme);
  const bar = $('.meter span', s.el);
  if (bar) setTimeout(() => { bar.style.width = `${pct}%`; }, 250);
  s.el.addEventListener('click', async e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'close') s.close();
    if (a === 'export') { await exportData(); }
    if (a === 'import') { const f = await pickFile('application/json,.json'); if (f) { s.close(); importData(f); } }
  });
}

async function exportData(onlyIds) {
  let games = await DB.all('games');
  let chapters = await DB.all('chapters');
  if (onlyIds) { games = games.filter(g => onlyIds.includes(g.id)); chapters = chapters.filter(c => onlyIds.includes(c.gameId)); }
  const data = { app: 'historias', version: 1, exportedAt: new Date().toISOString(), games, chapters };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  const d = new Date();
  const name = onlyIds && games[0] ? games[0].title.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/gi, '-') : 'historias';
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  lsSet('lastExport', String(Date.now()));
  toast('Copia descargada', I.download);
}

async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'historias' || !Array.isArray(data.games)) throw new Error('formato');
    for (const g of data.games) if (g && g.id) await DB.put('games', { ...g, cover: typeof g.cover === 'string' && /^data:image\//.test(g.cover) ? g.cover : null });
    for (const c of data.chapters || []) if (c && c.id && c.gameId) await DB.put('chapters', { ...c, html: sanitize(c.html) });
    toast(`${plural(data.games.length, 'juego importado', 'juegos importados')}`);
    render();
  } catch {
    toast('Ese archivo no es una copia válida', I.x);
  }
}

/* ───────────── Vista: Editor de capítulo ───────────── */
async function viewEditor({ gid, cid }) {
  const [g, c] = await Promise.all([DB.get('games', gid), DB.get('chapters', cid)]);
  if (!g || !c || c.gameId !== gid) return null;
  const chs = await DB.chapters(gid);
  const idx = chs.findIndex(x => x.id === cid);
  const prev = chs[idx - 1], next = chs[idx + 1];

  const tb = (cmd, label, inner, cls = '') => `<button type="button" class="tb ${cls}" data-cmd="${cmd}" title="${label}" aria-label="${label}">${inner}</button>`;
  const el = h(`
    ${navBar({
      left: backLink(`#/g/${g.id}`, g.title || 'Juego'),
      center: `<span class="status"><i></i><span>Guardado</span></span>`,
      right: `<a class="icon-btn" href="#/g/${g.id}/leer/${c.id}" aria-label="Leer" title="Leer">${I.read}</a>
              <button class="icon-btn" data-a="more" aria-label="Más opciones">${I.more}</button>`,
    })}
    <div>
      <div class="toolbar-wrap"><div class="toolbar" role="toolbar" aria-label="Formato">
        ${tb('h2', 'Título', 'Título', 'tb-h')}
        ${tb('h3', 'Subtítulo', 'Subtítulo', 'tb-h')}
        ${tb('p', 'Texto normal', I.text)}
        <span class="tb-sep"></span>
        ${tb('bold', 'Negrita (Ctrl+B)', 'B')}
        ${tb('italic', 'Cursiva (Ctrl+I)', 'I', 'tb-i')}
        ${tb('underline', 'Subrayado (Ctrl+U)', 'U', 'tb-u')}
        ${tb('strikeThrough', 'Tachado', 'S', 'tb-s')}
        <span class="tb-sep"></span>
        ${tb('blockquote', 'Cita', I.quote)}
        ${tb('insertUnorderedList', 'Lista', I.ul)}
        ${tb('insertOrderedList', 'Lista numerada', I.ol)}
        ${tb('hr', 'Separador', I.hr)}
        <span class="tb-sep"></span>
        ${tb('justifyLeft', 'Alinear a la izquierda', I.alignL)}
        ${tb('justifyCenter', 'Centrar', I.alignC)}
        ${tb('image', 'Insertar imagen', I.image)}
      </div></div>
      <article class="paper">
        <p class="ch-label">Capítulo ${idx + 1}</p>
        <h1 class="ed-title title-font" contenteditable="true" spellcheck="true" data-ph="Título del capítulo"></h1>
        <div class="ed-body prose" contenteditable="true" spellcheck="true" data-ph="Érase una vez…"></div>
        <nav class="pager">
          ${prev ? `<a class="prev" href="#/g/${g.id}/c/${prev.id}"><small>‹ Anterior</small><span>${esc(prev.title || 'Sin título')}</span></a>` : ''}
          ${next ? `<a class="next" href="#/g/${g.id}/c/${next.id}"><small>Siguiente ›</small><span>${esc(next.title || 'Sin título')}</span></a>`
                 : `<a class="next" href="#/g/${g.id}" data-a="newch"><small>Siguiente ›</small><span>+ Nuevo capítulo</span></a>`}
        </nav>
      </article>
      <div class="pill"><span class="wc"></span></div>
    </div>`, styleVars(g));

  const titleEl = $('.ed-title', el), body = $('.ed-body', el), status = $('.status', el), wc = $('.wc', el);
  titleEl.textContent = c.title || '';
  body.innerHTML = sanitize(c.html) || '<p><br></p>';

  const refreshEmpty = () => body.classList.toggle('is-empty', !body.textContent.trim() && !body.querySelector('img, hr, li'));
  const refreshCount = () => {
    const w = countWords(body.innerText);
    wc.textContent = `${plural(w, 'palabra', 'palabras')} · ${readMins(w)} min`;
    return w;
  };
  refreshEmpty(); refreshCount();

  // Guardado automático
  let timer = 0, saving = null, dirty = false;
  const setStatus = (txt, busy) => { status.classList.toggle('busy', busy); status.lastElementChild.textContent = txt; };
  const save = async () => {
    clearTimeout(timer);
    if (!dirty) return saving;
    dirty = false;
    const text = body.innerText;
    c.title = titleEl.textContent.replace(/\s+/g, ' ').trim();
    c.html = body.innerHTML;
    c.words = countWords(text);
    c.excerpt = text.replace(/\s+/g, ' ').trim().slice(0, 140);
    c.updatedAt = Date.now();
    setStatus('Guardando…', true);
    saving = (async () => {
      try {
        await DB.put('chapters', c);
        await touchGame(gid);
        setStatus('Guardado', false);
      } catch {
        setStatus('Sin espacio', true);
        toast('No se pudo guardar: el almacenamiento está lleno', I.x);
      }
    })();
    return saving;
  };
  const changed = () => {
    dirty = true;
    setStatus('Editando', true);
    clearTimeout(timer);
    timer = setTimeout(save, 700);
  };

  // Título: una línea, texto plano
  titleEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      body.focus();
      const r = document.createRange(); r.setStart(body, 0); r.collapse(true);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    }
  });
  titleEl.addEventListener('paste', e => {
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' '));
  });
  titleEl.addEventListener('input', () => { if (!titleEl.textContent) titleEl.innerHTML = ''; changed(); });

  // Cuerpo
  body.addEventListener('input', () => { refreshEmpty(); refreshCount(); changed(); });
  body.addEventListener('paste', async e => {
    const file = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
    e.preventDefault();
    if (file) { insertImage(file); return; }
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const html = text.replace(/\r/g, '').split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
    document.execCommand('insertHTML', false, html);
  });
  body.addEventListener('drop', e => {
    const file = [...(e.dataTransfer?.files || [])].find(f => f.type.startsWith('image/'));
    if (!file) return;
    e.preventDefault();
    const pos = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (pos) { const sel = getSelection(); sel.removeAllRanges(); sel.addRange(pos); }
    insertImage(file);
  });
  body.addEventListener('click', e => {
    $$('img.sel', body).forEach(i => i.classList.remove('sel'));
    if (e.target.tagName === 'IMG') e.target.classList.add('sel');
  });
  body.addEventListener('keydown', e => {
    const sel = $('img.sel', body);
    if (sel && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      (sel.closest('figure') || sel).remove();
      refreshEmpty(); changed();
    }
  });

  let savedRange = null;
  const keepRange = () => {
    const s = getSelection();
    if (s.rangeCount && body.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange();
  };
  const restoreRange = () => {
    body.focus({ preventScroll: true });
    if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
  };
  async function insertImage(file) {
    keepRange();
    setStatus('Procesando imagen…', true);
    try {
      const src = await compress(file, 1600, .84);
      restoreRange();
      document.execCommand('insertHTML', false, `<figure><img src="${src}" alt=""></figure><p><br></p>`);
      refreshEmpty(); changed();
    } catch { toast('No se pudo leer la imagen', I.x); setStatus('Guardado', false); }
  }

  // Barra de herramientas
  const toolbar = $('.toolbar', el);
  toolbar.addEventListener('mousedown', e => { if (e.target.closest('.tb')) e.preventDefault(); });
  toolbar.addEventListener('click', async e => {
    const b = e.target.closest('.tb');
    if (!b) return;
    const cmd = b.dataset.cmd;
    if (cmd === 'image') { keepRange(); const f = await pickFile(); if (f) insertImage(f); return; }
    if (!body.contains(getSelection().anchorNode)) restoreRange();
    if (['h2', 'h3', 'p', 'blockquote'].includes(cmd)) {
      const cur = blockOf();
      document.execCommand('formatBlock', false, `<${cur === cmd && cmd !== 'p' ? 'p' : cmd}>`);
    } else if (cmd === 'hr') {
      document.execCommand('insertHTML', false, '<hr><p><br></p>');
    } else {
      document.execCommand(cmd, false, null);
    }
    refreshEmpty(); changed(); syncToolbar();
  });
  const blockOf = () => {
    let n = getSelection().anchorNode;
    while (n && n !== body) {
      if (n.nodeType === 1 && /^(H2|H3|H4|P|BLOCKQUOTE)$/.test(n.tagName)) return n.tagName.toLowerCase();
      n = n.parentNode;
    }
    return 'p';
  };
  const syncToolbar = () => {
    if (!body.contains(getSelection().anchorNode)) return;
    keepRange();
    const blk = blockOf();
    $$('.tb', toolbar).forEach(b => {
      const cmd = b.dataset.cmd;
      let on = false;
      if (['h2', 'h3', 'blockquote'].includes(cmd)) on = blk === cmd;
      else if (['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyCenter'].includes(cmd)) {
        try { on = document.queryCommandState(cmd); } catch {}
      }
      b.classList.toggle('on', on);
    });
  };

  // Menú
  el.addEventListener('click', async e => {
    const btn = e.target.closest('[data-a]');
    if (!btn) return;
    if (btn.dataset.a === 'newch') { e.preventDefault(); await save(); newChapter(gid); }
    if (btn.dataset.a === 'more') popover(btn, [
      { label: 'Leer capítulo', icon: I.read, action: () => go(`#/g/${gid}/leer/${cid}`) },
      { label: 'Nuevo capítulo', icon: I.plus, action: async () => { await save(); newChapter(gid); } },
      { label: 'Eliminar capítulo', icon: I.trash, danger: true, action: async () => {
        const ok = await confirmSheet({ title: '¿Eliminar este capítulo?', text: `«${c.title || 'Sin título'}» se borrará para siempre.` });
        if (!ok) return;
        clearTimeout(timer); dirty = false;
        await DB.del('chapters', cid);
        await touchGame(gid);
        toast('Capítulo eliminado', I.trash);
        go(`#/g/${gid}`);
      } },
    ]);
  });

  // Atajos, pill que se esconde al escribir
  const pill = $('.pill', el);
  let lastY = scrollY;
  const onScroll = () => { pill.classList.toggle('away', scrollY > lastY + 4); if (scrollY < lastY - 4) pill.classList.remove('away'); lastY = scrollY; };
  const onKey = e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); dirty = true; save().then(() => toast('Guardado')); }
  };
  const onSel = () => syncToolbar();
  const onUnload = () => { if (dirty) save(); };

  return {
    el,
    mount: () => {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      document.execCommand('styleWithCSS', false, false);
      document.addEventListener('keydown', onKey);
      document.addEventListener('selectionchange', onSel);
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('pagehide', onUnload);
      if (!c.title) titleEl.focus();
    },
    cleanup: async () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('selectionchange', onSel);
      removeEventListener('scroll', onScroll);
      removeEventListener('pagehide', onUnload);
      await save();
    },
  };
}

/* ───────────── Vista: Lectura ───────────── */
async function viewReader({ gid, cid }) {
  const g = await DB.get('games', gid);
  if (!g) return null;
  const chs = await DB.chapters(gid);
  const totalW = chs.reduce((a, c) => a + (c.words || 0), 0);
  const size = lsGet('readSize', '20');

  const el = h(`
    <div class="progress"><span></span></div>
    ${navBar({
      left: backLink(`#/g/${g.id}`, g.title || 'Juego'),
      right: `<button class="icon-btn" data-a="size" aria-label="Tamaño del texto" title="Tamaño del texto"><b style="font:600 15px var(--serif)">Aa</b></button>`,
    })}
    <div>
      <div class="read-hero reveal"><div class="read-cover">${coverHTML(g)}</div></div>
      <header class="read-head">
        <h1 class="read-title title-font reveal" style="--i:1">${esc(g.title)}</h1>
        ${g.tagline ? `<p class="read-tag reveal" style="--i:2">${esc(g.tagline)}</p>` : ''}
        <p class="read-meta reveal" style="--i:3">${plural(chs.length, 'capítulo', 'capítulos')} · ${readMins(totalW)} min de lectura</p>
      </header>
      ${chs.length > 1 ? `<nav class="toc reveal" style="--i:4"><h2>Índice</h2><ol>${chs.map((c, i) =>
        `<li><button data-go="${c.id}"><small>${pad(i + 1)}</small><span>${esc(c.title || 'Sin título')}</span></button></li>`).join('')}</ol></nav>` : ''}
      ${chs.map((c, i) => `
        <article class="read-ch fade-in" id="r-${c.id}">
          <header>
            <p class="ch-label">Capítulo ${i + 1}</p>
            <h2 class="title-font">${esc(c.title || 'Sin título')}</h2>
          </header>
          <div class="prose">${sanitize(c.html)}</div>
        </article>`).join('')}
      <p class="read-end fade-in"><span class="fin">Fin</span><a class="btn btn-soft" href="#/g/${g.id}">Volver al juego</a></p>
    </div>`, `${styleVars(g)};--prose-size:${size}px`);

  el.addEventListener('click', e => {
    const t = e.target.closest('[data-go]');
    if (t) $(`#r-${t.dataset.go}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (e.target.closest('[data-a=size]')) {
      const sizes = ['18', '20', '23'];
      const nextSize = sizes[(sizes.indexOf(lsGet('readSize', '20')) + 1) % sizes.length];
      lsSet('readSize', nextSize);
      el.style.setProperty('--prose-size', `${nextSize}px`);
      toast(`Texto ${{ 18: 'pequeño', 20: 'normal', 23: 'grande' }[nextSize]}`, null);
    }
  });

  const bar = $('.progress span', el);
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    });
  };
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  const onKey = e => { if (e.key === 'Escape' && !$('#layer').children.length) go(`#/g/${g.id}`); };

  return {
    el,
    mount: () => {
      $$('.fade-in', el).forEach(n => io.observe(n));
      addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('keydown', onKey);
      if (cid) {
        const t = $(`#r-${cid}`, el);
        if (t) { t.classList.add('seen'); requestAnimationFrame(() => t.scrollIntoView()); }
      }
    },
    cleanup: () => {
      io.disconnect();
      removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
    },
  };
}

const VIEWS = { library: viewLibrary, game: viewGame, editor: viewEditor, reader: viewReader };

/* ───────────── Primer arranque ───────────── */
async function seed() {
  if (lsGet('seeded')) return;
  lsSet('seeded', '1');
  if ((await DB.all('games')).length) return;
  const now = Date.now();
  const g = { id: uid('g'), title: 'Soul Keznit 2', tagline: 'Un plataformas oscuro a través de cinco zonas y cinco jefes.', cover: null, titleFont: 'pirata', accent: '#e5332a', bodyFont: 'serif', createdAt: now, updatedAt: now };
  const html = `
    <p>Aquí va la historia de Soul Keznit 2. Este capítulo es solo una ficha de referencia: edítalo o bórralo cuando quieras.</p>
    <h2>Las cinco zonas</h2>
    <ol><li>Umbral</li><li>Carnicería</li><li>Horno</li><li>Péndulos</li><li>Torturador</li></ol>
    <h2>Los jefes</h2>
    <p>Cada jefe derrotado entrega un poder: doble salto, impulso, salto de pared y la moneda rúnica.</p>
    <ul><li>El Carcelero</li><li>La Carnicera</li><li>El Fogonero</li><li>El Relojero</li><li>El Torturador</li></ul>
    <hr>
    <blockquote><p>24 niveles, 19 fragmentos de memoria y 15 logros esperan dentro.</p></blockquote>`;
  const text = textOf(html);
  await DB.put('games', g);
  await DB.put('chapters', { id: uid('c'), gameId: g.id, title: 'El mundo', html, excerpt: text.replace(/\s+/g, ' ').trim().slice(0, 140), words: countWords(text), order: 0, createdAt: now, updatedAt: now });
}

addEventListener('hashchange', render);
seed().catch(() => {}).finally(render);
