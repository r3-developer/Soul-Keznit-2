# Progreso

## Hecho
- Soul Keznit 2 (Scratch) terminado y publicado: ES/EN, 24 niveles en 5 zonas, 5 jefes, 15 logros, 19 fragmentos, 5 historias.
- Textos para Scratch en INSTRUCCIONES_SCRATCH.md (sin emojis).
- Web "Historias" (carpeta historias/) para escribir las historias de los juegos: https://historias-de-juegos.pages.dev
  - Juegos con portada, subtítulo, fuente de títulos (11), color y texto serif/sans. Capítulos con editor (títulos, negrita, citas, listas, imágenes), guardado automático, reordenar arrastrando y modo lectura.
  - Datos en IndexedDB del navegador. Exportar/importar copia .json en Ajustes.
  - Publicar: `npx wrangler pages deploy historias --project-name historias-de-juegos --branch main`

## Falta
- Decidir cómo empezar Soul Keznit 3 (web): tecnología, alcance y qué se reutiliza de SK2.
- Confirmar el autor de la canción "She Knows" que usa SK2 y ponerlo en los créditos.
- Historias: sincronizar entre dispositivos (el token de Cloudflare no tiene permisos de KV/D1/R2).

## Falla
- Historias: los datos no se comparten entre navegadores/dispositivos; hay que exportar e importar.
- El .sb3 no está en el repo (solo se subió al chat).
