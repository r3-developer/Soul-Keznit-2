# Progreso

## Hecho
- Web R3K1 (web/), publicada en https://r3k1.pages.dev. Publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
  - Tema oscuro, fuentes propias (web/fonts), portada con brasas, banda, tarjetas con inclinación, sección móvil.
- Soul Keznit REMAKE (web/play/sk1-remake/js: engine, levels, audio, game). Nivel directo: ?nivel=2-3.
  - 13 niveles en 3 actos + jefe La Trituradora en 3 fases con barra de vida, rótulo y tarjeta entre fases:
    persecución pegada + esquirlas que caen; molino con 3 frenos, embestidas y ráfagas dobles; huida con lava, esquirlas y la Trituradora asomando.
  - Cinemática final animada (finaleScene; ver con ?final): estallido, almas liberadas, la Voz, cadenas, ojos del Torturador, título SK2.
  - Móvil: botones táctiles HTML (#pad), en vertical juego arriba; ?from= añade VOLVER A LA WEB; instalable (manifest).
  - Ajustes: sierras normales, más velocidad y margen de salto, inercia, puntos de control (C) en 2-4, 3-1, 3-3.
  - tools/solver.js comprueba niveles (`--frag`, `--checks`); probe.js tramos. SK1 original en /soul-keznit/.
- SK2 en Scratch (.sb3 en scratch/). Página SK2: historia en 5 capítulos y zonas en filas con su trasfondo.

## Falta
- Que R3K1 pruebe el jefe nuevo (el molino no lo comprueba el solver). Empezar Soul Keznit 3.

## Falla
- Sin comprobar con el solver: 3-2 y J-3 enteros con la física nueva, y el jefe (molino y huida más difíciles).
- El progreso se guarda solo en el navegador de cada uno.
