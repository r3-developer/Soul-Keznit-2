# Progreso

## Hecho
- Soul Keznit 2 (Scratch) terminado: ES/EN, 24 niveles en 5 zonas, 5 jefes, 15 logros, 19 fragmentos.
- Los .sb3 de SK1 (Remastered) y SK2 están en scratch/.
- Web de desarrollador R3K1 (carpeta web/): https://r3k1.pages.dev
  - Inicio estilo Apple, animado, claro/oscuro: R3K1 / TheKittyBoyfriend, saga Soul Keznit, juegos, sobre mí.
  - /soul-keznit/ y /soul-keznit-2/: se juegan en la página (TurboWarp Packager en web/play/) + historia, zonas, jefes, final con spoiler, logros y créditos.
  - /soul-keznit-3/: avance "En desarrollo".
  - Publicar: `npx wrangler pages deploy web --project-name r3k1 --branch main`
  - Regenerar web/play/: empaquetar los .sb3 con @turbowarp/packager (target zip, nube en "local") y descomprimir.
- Cloudflare: borradas repasarexamen, taller-de-juegos e historias-de-juegos. Quedan ainhoa-gym y ana-garcia-hairdresser.
- Música: "She Knows" es el remix 8 bit de 8 Bit Universe (original de J. Cole).

## Falta
- Empezar Soul Keznit 3 (web) y ponerlo en /soul-keznit-3/.
- Añadir más juegos a la web cuando los haya (p. ej. "Kitty y la Ciudad Rosa").

## Falla
- La carpeta historias/ ya no está publicada (se borró de Cloudflare).
- El progreso de los juegos solo se guarda en el navegador de cada uno.
