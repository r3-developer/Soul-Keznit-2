# Soul Keznit 2

Proyecto de Scratch 3. Todo el juego está en `Soul Keznit 2.sb3`, que es un zip con `project.json` (~1,4 MB) y ~700 recursos (svg, png, wav).

## Reglas para no gastar contexto

- Nunca leas `project.json` entero ni hagas `cat`/`unzip -p` sin filtrar. Consulta solo lo que necesites con `jq` o un script corto de Python:
  - Lista de sprites: `unzip -p "Soul Keznit 2.sb3" project.json | jq -r '.targets[].name'`
  - Variables de un sprite: `... | jq '.targets[] | select(.name=="NOMBRE") | .variables'`
- No listes los recursos del zip salvo que la tarea sea sobre ellos.
- Para modificar el proyecto: descomprime en una carpeta temporal, edita `project.json` con un script, vuelve a comprimir. No reescribas el JSON a mano.
