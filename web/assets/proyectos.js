// R3K1 · lista de proyectos
// Para añadir uno nuevo, copia una entrada y cambia los datos:
//   cat: 'juegos' | 'webs' | 'otros'   (categoría en la que sale)
//   titulo, desc: textos de la tarjeta
//   url: a dónde lleva (una página de esta web o un enlace externo con https://)
//   img: imagen de la tarjeta (opcional; si no hay, se dibuja una con las iniciales)
//   etiquetas: palabras cortas (opcional)
//   estado: por ejemplo 'En desarrollo' (opcional)
//   destacado: true para que salga en "Lo último" en el inicio (opcional)
window.PROYECTOS = [
  {
    cat: 'juegos', titulo: 'Soul Keznit · Remake', destacado: true,
    desc: 'La llegada al abismo, rehecha desde cero para la web: 13 niveles, un jefe en tres fases y controles táctiles.',
    url: '/soul-keznit/', img: '/img/sk1r/titulo.jpg', etiquetas: ['Nuevo', 'Móvil', 'Plataformas'],
  },
  {
    cat: 'juegos', titulo: 'Soul Keznit 2', destacado: true,
    desc: '24 niveles, 5 jefes y el trato que lo empezó todo. Hecho en Scratch.',
    url: '/soul-keznit-2/', img: '/img/sk2/portada.svg', etiquetas: ['Plataformas', 'Jefes'],
  },
  {
    cat: 'juegos', titulo: 'Soul Keznit 3', estado: 'En desarrollo',
    desc: 'El siguiente capítulo. Esta vez, fuera de Scratch.',
    url: '/soul-keznit-3/', etiquetas: ['Próximamente'],
  },
  {
    cat: 'webs', titulo: 'R3K1', destacado: true,
    desc: 'Esta web: mi escaparate como desarrollador, con los juegos jugables en el navegador y en el móvil.',
    url: '/', img: '/img/sk2/emblema.svg', etiquetas: ['HTML', 'CSS', 'JavaScript'],
  },
];

// Pinta las tarjetas donde haya data-proyectos="categoría" (o "destacados")
(() => {
  const list = window.PROYECTOS || [];
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const NOMBRE = { juegos: 'Juego', webs: 'Web', otros: 'Otro' };
  const card = (p) => {
    const ext = /^https?:/.test(p.url);
    const ini = esc(p.titulo.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase());
    const img = p.img
      ? `<img src="${esc(p.img)}" alt="" loading="lazy" decoding="async">`
      : `<span class="ph" aria-hidden="true">${ini}</span>`;
    const tags = (p.etiquetas || []).map(t => `<span class="chip">${esc(t)}</span>`).join('');
    return `<a class="card pcard lift" data-tilt href="${esc(p.url)}"${ext ? ' target="_blank" rel="noopener"' : ''}>
      <div class="pimg">${img}${p.estado ? `<span class="badge">${esc(p.estado)}</span>` : ''}</div>
      <div class="pbody"><small>${NOMBRE[p.cat] || ''}</small><h3>${esc(p.titulo)}</h3><p>${esc(p.desc || '')}</p>
      ${tags ? `<div class="chips">${tags}</div>` : ''}<span class="link-arrow">${ext ? 'Abrir' : 'Ver'}</span></div></a>`;
  };
  document.querySelectorAll('[data-proyectos]').forEach(el => {
    const k = el.dataset.proyectos;
    const items = k === 'destacados' ? list.filter(p => p.destacado) : list.filter(p => p.cat === k);
    el.innerHTML = items.length ? items.map(card).join('')
      : `<div class="empty"><b>Todavía no hay nada aquí.</b><span>Pronto subiré cosas nuevas.</span></div>`;
  });
  document.querySelectorAll('[data-cuenta]').forEach(el => {
    const n = list.filter(p => p.cat === el.dataset.cuenta).length;
    el.textContent = n ? `${n} ${n === 1 ? 'proyecto' : 'proyectos'}` : 'Pronto';
  });
})();
