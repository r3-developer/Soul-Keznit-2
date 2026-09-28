# Progreso

## Hecho
- Web R3K1 (web/), publicada en https://r3k1.pages.dev: SK1 (remake + original), SK2 y avance de SK3. Publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
- Soul Keznit REMAKE (web/play/sk1-remake/): juego propio en canvas, sin Scratch.
  - js/engine.js (física), levels.js (mapas + historia ES/EN), audio.js, game.js (dibujo, menús, escenas). Nivel directo: ?nivel=2-3.
  - 13 niveles en 3 actos + jefe La Trituradora en 3 fases con barra de vida, rótulo y tarjeta entre fases:
    persecución pegada + esquirlas que caen; molino con 3 frenos, embestidas y ráfagas dobles; huida con lava, esquirlas y la Trituradora asomando.
  - Cinemática final animada (finaleScene; ver con ?final): estallido, almas liberadas, la Voz, cadenas, ojos del Torturador, título SK2.
  - 13 fragmentos, selección de niveles, récords, opciones (volumen con barras de ratón, música original, sacudida, retro, idioma), mando y táctil. VOLVER de Recuerdos y Créditos funciona con ratón.
  - Ajuste: sierras a velocidad normal, correr más rápido, más margen de salto, reaparición rápida, jefe más suave.
  - Puntos de control (casilla C) en 2-4, 3-1, 3-3. Inercia de cinta y aire. 3-1: pincho bajo y sierra pequeña pegada al techo.
  - tools/solver.js comprueba niveles (`--frag`, `--checks`, SOLVER_MAX=n); probe.js prueba tramos.
- SK2 terminado en Scratch; .sb3 en scratch/. El SK1 original se juega en /soul-keznit/ (botón arriba y pestaña).

## Falta
- Que R3K1 pruebe el jefe nuevo (el molino no lo comprueba el solver). Empezar Soul Keznit 3.

## Falla
- Sin comprobar con el solver: 3-2 y J-3 enteros con la física nueva, y el jefe (molino y huida más difíciles).
- El progreso se guarda solo en el navegador de cada uno.
