# Guía: hacer juegos con Claude sin gastar todos tus créditos

Esta guía es para ti si tienes ideas de juegos pero no sabes programar ni diseñar.
Claude escribe el código. Tú pones las ideas, pruebas el juego y dices qué cambiar.

---

## 1. Cómo se gastan los créditos (lo que tienes que entender)

- **Cada mensaje que mandas hace que Claude vuelva a leer TODA la conversación.**
  Si la conversación es larga, cada mensaje nuevo cuesta más que el anterior.
  El mensaje 50 de una conversación cuesta mucho más que el mensaje 1 de una nueva.
- **Leer archivos gasta créditos.** Un archivo grande cuesta mucho aunque solo quieras cambiar una cosa pequeña.
  Por ejemplo, el `project.json` de *Soul Keznit 2* ocupa 1,4 MB (más de 6.000 bloques).
  Si Claude tiene que leerlo entero solo para cambiar un salto, gastas muchísimo.
- **Repetir trabajo es lo que más gasta.** Si pides algo sin explicarlo bien y luego tienes que pedir
  "no, así no, rehazlo", pagas dos veces.
- **Si escribes que "investigue a fondo", "revise todo" o "lo haga perfecto", Claude trabaja más y gasta más.**
  Solo pídelo cuando de verdad haga falta.

Puedes ver cuánto llevas gastado en **claude.ai → Ajustes → Uso**. En Claude Code (la terminal),
escribe `/usage`.

---

## 2. Las 10 reglas de oro

1. **Una conversación para cada tarea.** "Añadir el doble salto" es una conversación.
   "Hacer el menú" es otra. Cuando termines una tarea, abre una conversación nueva.
   En la terminal puedes usar `/clear` para empezar de cero o `/compact` para resumir la conversación.
2. **Piensa la idea ANTES de abrir Claude.** Escribe en tu móvil o en un papel qué quieres exactamente.
   Pensar es gratis, pero pensar dentro del chat gasta créditos.
3. **Junta varios cambios en un solo mensaje.** Mejor un mensaje con 4 cambios en una lista que 4 mensajes sueltos.
4. **Sé concreto.** En vez de "haz que el salto se sienta mejor", escribe "que salte un 20 % más alto
   y que caiga más rápido de lo que sube".
5. **Empieza por lo mínimo jugable.** Primero un cuadrado que se mueve y salta. Después los enemigos.
   Después los gráficos bonitos. Nunca le pidas todo el juego de golpe.
6. **Ten un archivo `CLAUDE.md` en tu proyecto** (ver sección 5). Claude lo lee solo al empezar
   y así no tiene que investigar el proyecto cada vez.
7. **Ten un archivo `PROGRESO.md`** con lo que está hecho y lo que falta.
   Al final de cada sesión escribe: *"Actualiza PROGRESO.md y haz commit y push"*.
   **Para que lo haga solo**, pide una vez que añada esto a `CLAUDE.md`:
   *"Al terminar cada tarea, actualiza PROGRESO.md sin que te lo pida (máximo 20 líneas), y haz commit y push.
   Al empezar, lee PROGRESO.md y no revises todo el proyecto si no hace falta."*
8. **Cuando algo falle, copia el error exacto** (el texto rojo) y explica qué esperabas y qué pasó.
   Si solo pones "no funciona", Claude tiene que ponerse a adivinar, y eso gasta créditos.
9. **Usa el modelo adecuado.** Para cambios simples (colores, textos, números) usa un modelo más barato
   como Sonnet o Haiku. Deja el modelo más potente (Opus) para cosas difíciles o bugs raros.
   En la terminal se cambia con `/model`, y en la app, con el selector de modelo.
10. **Pide respuestas cortas.** Añade "no me expliques el código, solo hazlo y dime cómo probarlo".
    Claude escribe menos texto y gastas menos.

---

## 3. ¿Roblox, Scratch o juegos web? Mi recomendación

| | **Juegos web 2D (HTML/JavaScript)** | **Roblox Studio** | **Scratch** |
|---|---|---|---|
| ¿Puede Claude hacer todo el trabajo? | **Sí**: escribe, prueba y publica | A medias: escribe los scripts, pero tú montas el mapa en Studio | Mal: los bloques no están hechos para que los escriba una IA |
| ¿Puede Claude probar el juego? | **Sí**, lo abre en un navegador | No, tú tienes que probarlo y contarle qué pasa | Casi no |
| Gasto de créditos | **Bajo** | Medio (muchos mensajes de ida y vuelta) | **Alto** (archivos enormes) |
| Público | El que tú consigas (itch.io, enlaces) | **Enorme**, ya está ahí | Niños, comunidad de Scratch |
| Multijugador | Difícil | **Viene hecho** | No |
| Ganar dinero | Posible (itch.io) | **Sí** (Robux, pases) | No |

### Mi recomendación

1. **Para empezar y para probar ideas: juegos web 2D.** Es donde más puedo hacer por ti.
   Escribo el juego, lo pruebo yo mismo en un navegador, lo arreglo y te paso un enlace para que juegues.
   Puedes probar si una idea es divertida en una o dos sesiones gastando poco.
2. **Para las ideas multijugador, en 3D o que quieras monetizar: Roblox.**
   Cuando ya tengas claro cómo funciona una idea, pásala a Roblox. Allí está el público.
   Tendrás que aprender lo básico de Studio (mover piezas, pegar scripts, leer la ventana Output),
   pero eso se aprende en una tarde.
3. **Scratch, para proyectos nuevos, no.** *Soul Keznit 2* tiene 42 sprites, 812 disfraces y más de 6.000 bloques.
   Es un proyecto serio, pero Scratch se queda corto para ese tamaño y cada cambio que me pidas me obliga a
   trabajar con un archivo gigante. Si quieres seguir con *Soul Keznit*, la mejor opción es rehacerlo como
   juego web (JavaScript) aprovechando sus dibujos.

---

## 4. Antes de empezar un juego: la ficha de la idea

Rellena esto ANTES de hablar con Claude. Cópialo en tu primer mensaje.

```
NOMBRE: 
PLATAFORMA: web 2D / Roblox
EN UNA FRASE: (ej: "plataformas oscuro donde eres un alma que tiene que escapar")
MECÁNICA PRINCIPAL: (lo que haces el 90 % del tiempo: saltar, disparar, construir...)
CONTROLES: (ej: flechas para moverte, espacio para saltar, shift para dash)
CÓMO SE GANA: 
CÓMO SE PIERDE: 
VERSIÓN MÍNIMA (lo primero que quiero ver funcionando):
  - 
  - 
  - 
LO QUE VIENE DESPUÉS (no hacer todavía):
  - 
ESTILO VISUAL: (ej: pixel art oscuro, formas simples de colores, "como Hollow Knight")
```

La sección "VERSIÓN MÍNIMA" es la más importante. Máximo 3–5 cosas.

---

## 5. Plantilla de `CLAUDE.md` (pon una en cada proyecto)

Crea un archivo llamado `CLAUDE.md` en la carpeta del juego. Claude lo lee automáticamente al empezar
cada sesión. **Mantenlo corto** (menos de 40 líneas): como se lee siempre, si es largo gasta en cada sesión.

```markdown
# Mi juego: NOMBRE

## Qué es
Una frase explicando el juego.

## Tecnología
- Juego web con HTML + JavaScript (Phaser 3)   ← o "Roblox, scripts en Luau"
- Se abre con index.html

## Archivos importantes
- src/jugador.js → movimiento y salto del jugador
- src/enemigos.js → enemigos
- src/niveles.js → diseño de los niveles

## Reglas para Claude
- Soy principiante: no expliques el código salvo que lo pida.
- Haz cambios pequeños, no reescribas archivos enteros.
- Al terminar, dime en 2-3 líneas cómo probar el cambio.
- El estado del proyecto está en PROGRESO.md.
```

---

## 6. Mensajes que funcionan (cópialos)

**Empezar un juego nuevo (web):**
> Quiero hacer este juego web 2D con JavaScript. Aquí va la ficha: [pega la ficha].
> Haz SOLO la versión mínima. Usa formas simples de colores en vez de dibujos.
> Crea también CLAUDE.md y PROGRESO.md. Pruébalo tú en el navegador, y cuando funcione haz commit y push.

**Añadir una función:**
> Lee PROGRESO.md. Quiero añadir: [cosa concreta].
> Detalles: [números, comportamiento exacto]. No toques nada más.

**Varios cambios pequeños a la vez:**
> Haz estos cambios, sin explicaciones:
> 1. Jugador un 15 % más rápido.
> 2. Los pinchos, de color rojo.
> 3. Al morir, reiniciar el nivel en 1 segundo en vez de 3.
> 4. Añadir el contador de muertes arriba a la izquierda.

**Arreglar un bug:**
> Bug: cuando [lo que hago], pasa [lo que pasa], pero debería [lo que espero].
> Error exacto: [pega el texto rojo].
> Arréglalo con el cambio más pequeño posible.

**Cerrar la sesión:**
> Actualiza PROGRESO.md con lo que hemos hecho y lo siguiente que falta. Luego haz commit y push.

**Cosas grandes (un sistema de inventario, multijugador, un jefe final...):**
> Antes de programar, dame un plan corto (máximo 8 pasos) para hacer [cosa].
> No escribas código todavía.

Así revisas el plan (que es barato) antes de que Claude escriba mucho código (que es caro).
Si el plan no te convence, lo corriges en ese momento.

---

## 7. Si trabajas en Roblox

Claude **no puede ver ni tocar tu Roblox Studio** desde aquí. Tú eres sus ojos y sus manos. Para que eso gaste poco:

- **Pregunta siempre dónde va cada script.** Lo básico:
  - `Script` en **ServerScriptService** → lógica del servidor (puntos, daño, guardar datos).
  - `LocalScript` en **StarterPlayer → StarterPlayerScripts** → controles, cámara, interfaz.
  - `ModuleScript` en **ReplicatedStorage** → código compartido.
- **Abre la ventana Output** (menú View → Output). Cuando algo falle, copia el texto rojo **entero** y pégaselo a Claude.
- **Nombra las piezas igual que en el script.** Si el script busca `workspace.Puerta`, la pieza se tiene que llamar exactamente `Puerta`.
- **Cuidado con los modelos gratis de la Toolbox.** Algunos traen scripts escondidos (virus o "backdoors").
  Antes de meter un modelo, busca si trae scripts dentro y bórralos si no sabes para qué sirven.
- **Nivel avanzado (más adelante):** si instalas Claude Code en tu PC, puedes conectarlo a Roblox Studio con
  el conector oficial de Roblox (MCP) o con la herramienta Rojo. Así Claude puede ver y cambiar tu juego directamente,
  y te ahorras muchos mensajes de copiar y pegar.

---

## 8. Gráficos y sonidos sin saber dibujar

No le pidas a Claude que dibuje todo: gasta mucho y el resultado suele ser simple. Mejor:

- **Empieza con cuadrados y círculos de colores.** Si el juego es divertido así, lo será con gráficos bonitos.
- **Usa recursos gratis:**
  - [kenney.nl](https://kenney.nl): miles de gráficos y sonidos gratis, se pueden usar en cualquier juego.
  - [opengameart.org](https://opengameart.org) y la sección de recursos gratis de [itch.io](https://itch.io/game-assets/free).
  - [sfxr.me](https://sfxr.me): para crear efectos de sonido retro con un clic.
- Descarga el pack, mételo en la carpeta del juego y dile a Claude: *"usa los sprites de la carpeta assets/"*.
- **Mira la licencia** de cada recurso. Los que dicen "CC0" se pueden usar libremente.

---

## 9. Lo que NO hay que hacer (esto quema créditos)

- ❌ Una sola conversación eterna para todo el juego.
- ❌ "Hazme un juego como Hollow Knight" sin más detalles.
- ❌ "Mejóralo", "hazlo más bonito", "arréglalo" (sin decir qué).
- ❌ Pedir que reescriba el juego entero para cambiar una cosa.
- ❌ Mandar 10 mensajes seguidos con cambios pequeños en vez de juntarlos en uno.
- ❌ Pegar archivos enormes en el chat cuando basta con el error.
- ❌ Empezar los gráficos bonitos antes de que el juego sea divertido.
- ❌ Olvidarte de hacer commit y push: si la sesión se cierra, pierdes el trabajo.

---

## 10. Resumen en 5 líneas

1. Idea escrita antes de abrir Claude (ficha de la sección 4).
2. Primero la versión mínima, con formas simples.
3. Una conversación por tarea, con los cambios agrupados y explicados con detalle.
4. `CLAUDE.md` corto + `PROGRESO.md` actualizado + commit y push al terminar.
5. Web 2D para probar ideas rápido y barato; Roblox para las ideas que necesiten público o multijugador.
