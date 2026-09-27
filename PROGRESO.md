# Progreso

## Hecho
- Web R3K1 (carpeta web/): https://r3k1.pages.dev · publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
  - Inicio estilo Apple, páginas de SK1 (remake + original), SK2 (juego + historia) y avance de SK3.
- Soul Keznit REMAKE (web/play/sk1-remake/): juego propio en canvas, sin Scratch.
  - js/engine.js (física y mecánicas), js/levels.js (mapas + historia ES/EN), js/audio.js (efectos + chiptune), js/game.js (dibujo, menús, escenas).
  - 13 niveles en 3 actos + jefe La Trituradora (persecución, molino con 3 frenos, huida con lava). Historia: llegada al abismo, el soldado que será el Carcelero, la Voz del abismo, final que enlaza con SK2.
  - 13 fragmentos de memoria, selección de niveles, récords, opciones (volumen, música original, sacudida, efecto retro, idioma), mando y táctil.
  - Probar un nivel directo: /play/sk1-remake/?nivel=2-3
  - tools/solver.js comprueba que cada nivel se puede superar con la física real (`node tools/solver.js --frag`; probe.js prueba tramos).
- SK2 terminado en Scratch; los .sb3 de SK1 y SK2 están en scratch/.

## Falta
- Que R3K1 juegue el remake entero y ajuste dificultad (sobre todo 2-3, 3-2, 3-4 y el jefe).
- Empezar Soul Keznit 3.

## Falla
- El solver no puede con 3-2, J-3 enteros (demasiados estados); se comprobaron por tramos y salen bien.
- El progreso se guarda solo en el navegador de cada uno.
