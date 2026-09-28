# Progreso

## Hecho
- Web R3K1 (carpeta web/): https://r3k1.pages.dev · publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
  - Inicio estilo Apple, páginas de SK1 (remake + original), SK2 (juego + historia) y avance de SK3.
- Soul Keznit REMAKE (web/play/sk1-remake/): juego propio en canvas, sin Scratch.
  - js/engine.js (física y mecánicas), js/levels.js (mapas + historia ES/EN), js/audio.js (efectos + chiptune), js/game.js (dibujo, menús, escenas).
  - 13 niveles en 3 actos + jefe La Trituradora (persecución, molino con 3 frenos, huida con lava). Historia: llegada al abismo, el soldado que será el Carcelero, la Voz del abismo, final que enlaza con SK2.
  - 13 fragmentos, selección de niveles, récords, opciones (volumen con barras de ratón, música original, sacudida, retro, idioma), mando y táctil.
  - Ajuste: sierras móviles a velocidad normal (iban x30), correr más rápido, más margen de salto, reaparición rápida, jefe más suave.
  - Probar un nivel directo: /play/sk1-remake/?nivel=2-3
  - tools/solver.js comprueba que cada nivel se puede superar con la física real (`node tools/solver.js --frag`; probe.js prueba tramos).
- SK2 terminado en Scratch; .sb3 en scratch/. El SK1 original se juega en /soul-keznit/ (botón arriba y pestaña).

## Falta
- Que R3K1 juegue el remake con los ajustes nuevos; decidir cómo hacerlo más frenético.
- Publicar la web con los cambios (wrangler).
- Empezar Soul Keznit 3.

## Falla
- Con la física nueva el solver no confirma el tramo de abajo de 3-2 (se queda sin memoria; antes pasaba). Probar a mano.
- J-3 no se puede comprobar entero; sus tramos altos salen bien.
- El progreso se guarda solo en el navegador de cada uno.
