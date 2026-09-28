# Progreso

## Hecho
- Web R3K1 (web/), en https://r3k1.pages.dev. Publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
  - Más ligera: brasas con imagen pre-pintada (sin sombras), scroll agrupado por fotograma, se paran fuera de pantalla.
- Soul Keznit REMAKE (web/play/sk1-remake/js: engine, levels, audio, game). Nivel directo: ?nivel=2-3 · final: ?final
  - 13 niveles, 3 actos y jefe La Trituradora en 3 fases. Créditos del remake: solo R3K1 (juego y página).
  - Sonido nuevo: reverb, batería y pads, canciones con parte A/B, ambiente por acto (viento, reloj, lava, taller),
    jingles al empezar, al entrar a un nivel, tarjetas de acto/jefe, música que se "ahoga" al morir.
  - Aura por acto: color de fondo y motas propias, haces de luz / engranajes / calor, todo late con la música (SKA.beat()).
  - Jefe: ataca al ritmo (150 ppm); el molino tras cada golpe despierta y la palanca siguiente tarda 14-16 pulsos en
    recargarse (anillo + cuenta atrás): ya no se puede correr a la siguiente. Más capas de música según la rabia.
  - Móvil: botón de pantalla completa (entrar/salir) arriba, también en pausa, opciones y tecla F; bloquea en horizontal.
    En iPhone (sin API) explica cómo instalarla. Controles: se puede deslizar entre flechas y zonas táctiles grandes;
    el botón BAJAR solo aparece en niveles con plataformas finas.
  - Rendimiento: resolución que baja sola si va lento, fondo/brillos cacheados, partículas más baratas.

## Falta
- Publicar con wrangler. Que R3K1 pruebe el jefe nuevo en su móvil. Empezar Soul Keznit 3.

## Falla
- El solver no llega a resolver J-3 (límite de nodos; ya pasaba antes). El molino no lo comprueba el solver.
- El progreso se guarda solo en el navegador de cada uno.
