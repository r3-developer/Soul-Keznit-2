# Progreso

## Hecho
- Web R3K1 (web/), publicada en https://r3k1.pages.dev: SK1 (remake + original), SK2 y avance de SK3. Publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
- Soul Keznit REMAKE (web/play/sk1-remake/): juego propio en canvas, sin Scratch.
  - js/engine.js (física y mecánicas), js/levels.js (mapas + historia ES/EN), js/audio.js (efectos + chiptune), js/game.js (dibujo, menús, escenas).
  - 13 niveles en 3 actos + jefe La Trituradora (persecución, molino con 3 frenos, huida con lava). Historia: llegada al abismo, el soldado que será el Carcelero, la Voz del abismo, final que enlaza con SK2.
  - 13 fragmentos, selección de niveles, récords, opciones (volumen con barras de ratón, música original, sacudida, retro, idioma), mando y táctil. VOLVER de Recuerdos y Créditos funciona con ratón.
  - Ajuste: sierras a velocidad normal, correr más rápido, más margen de salto, reaparición rápida, jefe más suave.
  - Puntos de control (casilla C) en 2-4, 3-1 y 3-3. Inercia: el salto conserva el empuje de la cinta y se frena menos en el aire.
  - Nivel directo: ?nivel=2-3. tools/solver.js comprueba niveles (`--frag`); probe.js prueba tramos.
- SK2 terminado en Scratch; .sb3 en scratch/. El SK1 original se juega en /soul-keznit/ (botón arriba y pestaña).

## Falta
- Que R3K1 juegue el remake con los ajustes nuevos; decidir cómo hacerlo más frenético.
- Empezar Soul Keznit 3.

## Falla
- Con la última física (inercia) falta repetir la comprobación por tramos de 3-2 y J-3 y el solver de 2-4, 3-3.
- El progreso se guarda solo en el navegador de cada uno.
