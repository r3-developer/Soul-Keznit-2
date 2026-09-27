# Soul Keznit 2 / Taller de Juegos

## Qué hay aquí
- `Soul Keznit 2.sb3` → juego original en Scratch (1,4 MB de JSON; no leerlo entero salvo que se pida).
- `sitio/index.html` → página "Taller de Juegos" (guía para hacer juegos con Claude). Se publica en Cloudflare Pages.
- `GUIA_CLAUDE_JUEGOS.md` → la misma guía en texto.

## Publicar en Cloudflare Pages
Credenciales en variables de entorno: `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (nunca pedirlas en el chat).

Solo la primera vez (crea el proyecto):
```
npx --yes wrangler@latest pages project create taller-de-juegos --production-branch=main
```

Cada publicación:
```
npx --yes wrangler@latest pages deploy sitio --project-name=taller-de-juegos --branch=main
```
La dirección queda en https://taller-de-juegos.pages.dev

## Reglas para Claude
- El usuario es principiante: respuestas cortas, en español, sin explicar código salvo que lo pida.
- Cambios pequeños; no reescribir archivos enteros.
- Al terminar: commit y push.
