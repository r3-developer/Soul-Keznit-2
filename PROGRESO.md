# Progreso

## Hecho
- Web R3K1 (web/), en https://r3k1.pages.dev. Publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
  - Inicio = portfolio de desarrollador: categorías Juegos (/juegos/), Webs (/webs/), Otros (/otros/), Lo último, Sobre mí.
  - Añadir un proyecto: una entrada en web/assets/proyectos.js (cat, titulo, desc, url, img, etiquetas, destacado).
  - Ligera: fuentes propias, brasas pre-pintadas, scroll agrupado por fotograma.
- Soul Keznit REMAKE (web/play/sk1-remake/js: engine, levels, audio, game). Nivel directo: ?nivel=2-3 · final: ?final
  - 13 niveles, 3 actos y jefe La Trituradora en 3 fases al ritmo de la música (150 ppm); palancas con recarga.
  - Sonido: reverb, batería, pads, canciones A/B, ambiente y aura por acto que late con la música (SKA.beat()).
  - Móvil: controles táctiles deslizables, pantalla completa (botón, pausa, opciones, tecla F), instalable como app.
  - Rendimiento: resolución que baja sola si va lento, fondo/brillos cacheados, partículas baratas.

## Falta
- Que R3K1 pruebe el jefe nuevo en su móvil. Empezar Soul Keznit 3.

## Falla
- El solver no llega a resolver J-3 (límite de nodos; ya pasaba antes). El molino no lo comprueba el solver.
- El progreso se guarda solo en el navegador de cada uno.
