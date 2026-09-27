// R3K1 · comportamiento compartido
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Borde de la barra al hacer scroll
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', scrollY > 8);
    document.documentElement.style.setProperty('--scroll', Math.min(scrollY / innerHeight, 1.5).toFixed(3));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Letras del título, una a una
  document.querySelectorAll('[data-letters]').forEach(el => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.setProperty('--i', i);
      s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    });
    el.style.setProperty('--n', text.length);
    el.classList.add('letters');
  });

  // Aparecer al entrar en pantalla
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Frase que se va iluminando palabra a palabra
  const statements = [...document.querySelectorAll('.statement')];
  statements.forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });
  const lightWords = () => {
    statements.forEach(el => {
      const r = el.getBoundingClientRect();
      const words = el.querySelectorAll('.w');
      const p = reduce ? 1 : (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
      const n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  };
  if (statements.length) { addEventListener('scroll', lightWords, { passive: true }); lightWords(); }

  // Contadores
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const end = +e.target.dataset.count;
      if (reduce) { e.target.textContent = end; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = t => {
        const k = Math.min(1, (t - t0) / dur);
        e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  // Reproductor de juegos Scratch empaquetados
  document.querySelectorAll('.player').forEach(player => {
    const stage = player.querySelector('.stage');
    const start = player.querySelector('.stage-start');
    const src = player.dataset.src;
    let frame = null;
    const load = () => {
      if (frame) return;
      frame = document.createElement('iframe');
      frame.src = src;
      frame.title = player.dataset.title || 'Juego';
      frame.allow = 'autoplay; fullscreen; gamepad';
      frame.setAttribute('allowfullscreen', '');
      frame.addEventListener('load', () => frame.focus());
      stage.appendChild(frame);
      stage.classList.add('playing');
      player.querySelectorAll('[data-needs-game]').forEach(b => b.disabled = false);
    };
    start && start.addEventListener('click', load);
    player.querySelector('[data-action="fullscreen"]')?.addEventListener('click', () => {
      load();
      const el = stage;
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
      frame && frame.focus();
    });
    player.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
      if (!frame) return;
      frame.src = src;
    });
    // Si se llega con #jugar desde otra página, prepara el juego
    document.querySelectorAll('a[href="#jugar"]').forEach(a => a.addEventListener('click', load));
  });

  // Mostrar/ocultar spoilers
  document.querySelectorAll('[data-spoiler]').forEach(btn => {
    const target = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      target.classList.toggle('open', !open);
      btn.textContent = open ? btn.dataset.show : btn.dataset.hide;
    });
  });

  // Brasas flotando (fondo animado)
  document.querySelectorAll('canvas.embers').forEach(cv => {
    if (reduce) return;
    const ctx = cv.getContext('2d');
    let w, h, dpr, parts = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, w * h / 14000));
      parts = Array.from({ length: n }, () => spawn(true));
    };
    const spawn = (any) => ({
      x: Math.random() * w, y: any ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + .4, v: Math.random() * .5 + .15,
      d: Math.random() * Math.PI * 2, a: Math.random() * .6 + .25
    });
    let visible = true;
    new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(cv);
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        parts.forEach((p, i) => {
          p.y -= p.v; p.d += .01; p.x += Math.sin(p.d) * .3;
          if (p.y < -10) parts[i] = spawn(false);
          const fade = Math.min(1, p.y / (h * .6));
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,${70 + p.r * 30 | 0},60,${p.a * fade})`;
          ctx.shadowColor = 'rgba(229,36,59,.9)'; ctx.shadowBlur = 8;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        });
      }
      requestAnimationFrame(draw);
    };
    addEventListener('resize', size);
    size(); draw();
  });

  // Botones del carrusel
  document.querySelectorAll('[data-rail]').forEach(b => b.addEventListener('click', () => {
    const rail = document.getElementById('rail');
    const card = rail.querySelector(':scope > *');
    rail.scrollBy({ left: (+b.dataset.rail) * ((card?.offsetWidth || 360) + 18), behavior: reduce ? 'auto' : 'smooth' });
  }));

  // Año en el pie
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
