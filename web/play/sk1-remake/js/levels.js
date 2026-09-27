// Soul Keznit Remake · niveles e historia
// Leyenda: # sólido · R rojo · ^ v < > pinchos · T trampolín · K llave · D puerta
// = suelo frágil · - plataforma fina · [ ] bloques que cambian al saltar
// ( ) cintas · x y láseres alternos · * sierra · M fragmento · F bandera · P inicio
// N alma soldado · a-e portal de entrada / A-E salida
(function (root) {
  'use strict';

  // Ayuda para mapas grandes: rellena rectángulos
  function build(W, H, ops) {
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    const put = (c, r, ch) => { if (r >= 0 && r < H && c >= 0 && c < W) g[r][c] = ch; };
    const rect = (c, r, w, h, ch) => { for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) put(x, y, ch); };
    rect(0, 0, W, 1, '#'); rect(0, H - 1, W, 1, '#'); rect(0, 0, 1, H, '#'); rect(W - 1, 0, 1, H, '#');
    ops({ put, rect });
    return g.map(r => r.join(''));
  }

  const L = [];

  // ================= ACTO I · LA LLEGADA =================
  L.push({
    id: '1-1', act: 0, music: 'acto1',
    name: { es: 'Recepción', en: 'Reception' },
    voice: [
      { es: 'BIENVENIDO AL ABISMO. SIGA LAS BANDERAS VERDES.', en: 'WELCOME TO THE ABYSS. FOLLOW THE GREEN FLAGS.' },
      { es: 'RECUERDE: LO ROJO MATA. INCLUSO A LOS QUE YA ESTÁN MUERTOS.', en: 'REMEMBER: RED KILLS. EVEN THOSE WHO ARE ALREADY DEAD.' },
    ],
    signs: [
      { x: 5.5, y: 7, es: 'A D  ·  ← →   MOVERSE', en: 'A D  ·  ← →   MOVE' },
      { x: 13, y: 4, es: 'W · ↑ · ESPACIO   SALTAR', en: 'W · ↑ · SPACE   JUMP' },
      { x: 13, y: 5, es: 'mantén para saltar más alto', en: 'hold to jump higher', small: true },
      { x: 23, y: 8, es: 'LO ROJO MATA', en: 'RED KILLS', red: true },
      { x: 27, y: 10, es: 'LA BANDERA →', en: 'THE FLAG →' },
    ],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#................M.............#',
      '#...............###............#',
      '#.............................F#',
      '#.......................########',
      '#...............###.....########',
      '#.P.............###...^.########',
      '########RRR#####################',
      '################################',
    ],
  });

  L.push({
    id: '1-2', act: 0, music: 'acto1',
    name: { es: 'Sala de espera', en: 'Waiting Room' },
    voice: [
      { es: 'LAS ALMAS QUE ESPERAN EN SILENCIO SON PROCESADAS ANTES.', en: 'SOULS THAT WAIT QUIETLY ARE PROCESSED FIRST.' },
    ],
    signs: [
      { x: 4.5, y: 11, es: 'LO NARANJA IMPULSA', en: 'ORANGE LAUNCHES YOU', orange: true },
      { x: 13.5, y: 3, es: 'PÉGATE A UNA PARED Y SALTA', en: 'HUG A WALL AND JUMP' },
      { x: 13.5, y: 4, es: 'una y otra vez', en: 'again and again', small: true },
    ],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..................#...........#',
      '#..................#.........F.#',
      '#..................#...#########',
      '#..................#...#########',
      '#........#.........#...#########',
      '#........#.....M...#...#########',
      '#........#.....##..#...#########',
      '#........#.........#...#########',
      '#........#.........#...#########',
      '#........#..##.....#...#########',
      '#........#.............#########',
      '#.P....T.#.............#########',
      '################################',
      '################################',
    ],
  });

  L.push({
    id: '1-3', act: 0, music: 'acto1', cut: 'soldier',
    name: { es: 'La primera prueba', en: 'The First Trial' },
    voice: [
      { es: 'PRIMERA PRUEBA: LLAVE, PUERTA, BANDERA. HASTA UN ALMA PODRÍA HACERLO.', en: 'FIRST TRIAL: KEY, DOOR, FLAG. EVEN A SOUL COULD DO IT.' },
    ],
    signs: [
      { x: 7.5, y: 12.3, es: 'las plataformas finas se atraviesan desde abajo', en: 'thin platforms can be jumped through', small: true },
    ],
    map: [
      '################################',
      '#...................D..........#',
      '#...................D..........#',
      '#.K.................D........F.#',
      '######...#######################',
      '#..............................#',
      '#.....---......................#',
      '#..............................#',
      '#.....---......................#',
      '#........R..........RR..M......#',
      '##############...###########...#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#.P.N.^...^^...T...............#',
      '################################',
      '################################',
    ],
  });

  L.push({
    id: '1-4', act: 0, music: 'acto1',
    name: { es: 'Pasillo de admisión', en: 'Admission Hall' },
    voice: [
      { es: 'PASILLO DE ADMISIÓN. NO CORRA. BUENO, SÍ: CORRA.', en: 'ADMISSION HALL. NO RUNNING. WELL, ACTUALLY: RUN.' },
    ],
    signs: [],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#.F............................#',
      '##########.....................#',
      '##########.....................#',
      '##########.....................#',
      '##########.............M.......#',
      '##########T...R...RR...##......#',
      '###########################....#',
      '#..............................#',
      '#..............................#',
      '#...........................####',
      '#..............................#',
      '#..............................#',
      '#.P..#...##...#...##...#..##...#',
      '###RRRRRRRRRRRRRRRRRRRRRRRRRRRR#',
      '################################',
    ],
  });

  // ================= ACTO II · LAS PRUEBAS =================
  L.push({
    id: '2-1', act: 1, music: 'acto2',
    name: { es: 'Suelo frágil', en: 'Fragile Ground' },
    voice: [
      { es: 'NADA AQUÍ ABAJO DURA. TAMPOCO USTED.', en: 'NOTHING DOWN HERE LASTS. NEITHER DO YOU.' },
    ],
    signs: [
      { x: 6, y: 11.2, es: 'NO TE QUEDES QUIETO', en: "DON'T STAND STILL" },
    ],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#........................F.....#',
      '#....................#########.#',
      '#..............................#',
      '#...............==.............#',
      '#......M.......................#',
      '#......==..........==..........#',
      '#..............................#',
      '#..........==............==....#',
      '#..............................#',
      '#.P.......................==...#',
      '###..==..==..==..==..==........#',
      '#..............................#',
      '#..............................#',
      '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#',
      '################################',
    ],
  });

  L.push({
    id: '2-2', act: 1, music: 'acto2',
    name: { es: 'El salto de fe', en: 'Leap of Faith' },
    voice: [
      { es: 'LOS PORTALES MORADOS NO LLEVAN A LA SALIDA. LO HEMOS COMPROBADO.', en: 'THE PURPLE PORTALS DO NOT LEAD OUTSIDE. WE CHECKED.' },
    ],
    signs: [
      { x: 29.5, y: 13.6, es: '¿SALIDA?', en: 'EXIT?', small: true },
    ],
    map: [
      '################################',
      '#.........#.........#..........#',
      '#.........#.A.......#..........#',
      '#.........#.........#......F...#',
      '#.........#........M#.....######',
      '#.........#........##..........#',
      '#.........#.........#..........#',
      '#.........#.........#.###......#',
      '#......M..#####.....#..........#',
      '#.........#.........#..........#',
      '#.........#.........#........###',
      '#.........#.........#..........#',
      '#.........#.........#.B........#',
      '#.........#.........#.....##...#',
      '#.C.......#.......b.#..........#',
      '#.P..^.T.a#.........#..^^.....c#',
      '###########RRRRRRRRR############',
      '################################',
    ],
  });

  L.push({
    id: '2-3', act: 1, music: 'acto2', toggles: true,
    name: { es: 'Latidos', en: 'Heartbeats' },
    voice: [
      { es: 'CADA VEZ QUE SALTA, EL ABISMO CAMBIA. DEJE DE SALTAR.', en: 'EVERY TIME YOU JUMP, THE ABYSS CHANGES. STOP JUMPING.' },
    ],
    signs: [
      { x: 13, y: 2, es: 'CADA SALTO LO CAMBIA TODO', en: 'EVERY JUMP CHANGES EVERYTHING' },
    ],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#...........................F..#',
      '#.......................]]######',
      '#..............................#',
      '#.......M......................#',
      '#.......[[.........[[..........#',
      '#..............................#',
      '#..............................#',
      '#....]]................]]......#',
      '#..............................#',
      '#.P............................#',
      '####..]]..[[..]]..[[..]]..######',
      '#..............................#',
      '#..............................#',
      '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#',
      '################################',
    ],
  });

  L.push({
    id: '2-4', act: 1, music: 'acto2',
    name: { es: 'El laberinto', en: 'The Maze' },
    voice: [
      { es: 'ESTE LABERINTO LO DISEÑÓ UN ALMA QUE SE ABURRÍA MUCHO.', en: 'THIS MAZE WAS DESIGNED BY A VERY BORED SOUL.' },
    ],
    signs: [],
    map: [
      '################################',
      '#.........................D....#',
      '#.............*...........D....#',
      '#.........................D....#',
      '#.........................D....#',
      '#......^^.....R.......^^..D..F.#',
      '#...############################',
      '#...########################...#',
      '#---.......v........v..........#',
      '#..............................#',
      '#.K...R.........R......R.......#',
      '############################...#',
      '############################...#',
      '#..........v....M....v.........#',
      '#..............................#',
      '#.P....^^.......RR.......^...T.#',
      '################################',
      '################################',
    ],
  });

  L.push({
    id: '2-5', act: 1, music: 'acto2',
    name: { es: 'Cadenas', en: 'Chains' },
    voice: [
      { es: 'LAS TRITURADORAS PEQUEÑAS SON INOFENSIVAS. ES BROMA.', en: 'THE SMALL GRINDERS ARE HARMLESS. JUST KIDDING.' },
    ],
    signs: [],
    ents: [
      { k: 'plat', w: 3, path: [[5, 13], [11, 13]], speed: 1.6 },
      { k: 'plat', w: 2, path: [[15, 14], [15, 7]], speed: 1.3 },
      { k: 'plat', w: 3, path: [[18, 7], [23, 7]], speed: 1.8 },
      { k: 'saw', path: [[18.5, 4.5], [18.5, 14.5]], speed: 2.2 },
      { k: 'saw', path: [[5.5, 10.2], [13.5, 10.2]], speed: 2.4 },
    ],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#.............*.M.*............#',
      '#..............................#',
      '#..............................#',
      '#............................F.#',
      '#..........................#####',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#.P............................#',
      '####...........................#',
      '#..............................#',
      '#..............................#',
      '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#',
      '################################',
    ],
  });

  // ================= ACTO III · EL PROCESADO =================
  L.push({
    id: '3-1', act: 2, music: 'acto3',
    name: { es: 'Cinta transportadora', en: 'Conveyor Belt' },
    voice: [
      { es: 'POR FAVOR, PERMANEZCA EN LA CINTA. SERÁ PROCESADO EN BREVE.', en: 'PLEASE REMAIN ON THE BELT. YOU WILL BE PROCESSED SHORTLY.' },
    ],
    signs: [],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#............................F.#',
      '#......#########################',
      '#..............................#',
      '#..^^..........................#',
      '#..(((((((((((((((((((((((.....#',
      '#..............................#',
      '#.........*................^^..#',
      '#......))))))))))))))))))))))..#',
      '#M.............................#',
      '#..^^.........RR...............#',
      '#..((((((((((((((((((((((((....#',
      '#..............................#',
      '#.P......R..........R..........#',
      '#)))))))))))))))))))))))))))RRR#',
      '################################',
    ],
  });

  L.push({
    id: '3-2', act: 2, music: 'acto3',
    name: { es: 'Turnos', en: 'Shifts' },
    voice: [
      { es: 'NO SE MUEVA MIENTRAS SE LE ESCANEA.', en: 'DO NOT MOVE WHILE BEING SCANNED.' },
    ],
    signs: [],
    map: [
      '################################',
      '#.......x.....y.....x..........#',
      '#.......x.....y.....x..........#',
      '#F......x.....y.....x........M.#',
      '###########################....#',
      '#........................#yyyyy#',
      '#........................#.....#',
      '#........................#.--..#',
      '#........................#xxxxx#',
      '#........................#.....#',
      '#........................#...--#',
      '#........................#yyyyy#',
      '##########################.....#',
      '#.....x...y...x...y...x...--...#',
      '#.....x...y...x...y...x........#',
      '#.P...x...y...x...y...x........#',
      '################################',
      '################################',
    ],
  });

  L.push({
    id: '3-3', act: 2, music: 'acto3', dark: true,
    name: { es: 'Apagón', en: 'Blackout' },
    voice: [
      { es: 'SE HA IDO LA LUZ. QUÉ PENA.', en: 'THE LIGHTS WENT OUT. WHAT A SHAME.' },
      { es: 'AUNQUE SU ALMA BRILLA UN POCO, ¿NO?', en: 'THOUGH YOUR SOUL GLOWS A LITTLE, DOESN\'T IT?' },
    ],
    signs: [],
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#.F....R....^.......^..........#',
      '###########################....#',
      '#..............................#',
      '#............................#.#',
      '#.........^......^^.....^......#',
      '#....###########################',
      '#..............................#',
      '#.#............................#',
      '#.....^......^......^..........#',
      '###########################....#',
      '#..............................#',
      '#...........................#..#',
      '#.P.....^.....^^.....^........M#',
      '################################',
      '################################',
    ],
  });

  L.push({
    id: '3-4', act: 2, music: 'acto3', toggles: true, queue: true,
    name: { es: 'La cola', en: 'The Queue' },
    voice: [
      { es: 'ALMA Nº 4.816.302: ES USTED EL SIGUIENTE.', en: 'SOUL NO. 4,816,302: YOU ARE NEXT.' },
      { es: 'PASE A LA TRITURADORA, POR FAVOR.', en: 'PLEASE PROCEED TO THE GRINDER.' },
    ],
    signs: [],
    ents: [
      { k: 'saw', path: [[5.5, 10.6], [13.5, 10.6]], speed: 2.0 },
    ],
    map: [
      '################################',
      '#.....................x..y..x..#',
      '#.....................x..y..x..#',
      '#.....................x..y..x.F#',
      '#...................)))))))))))#',
      '#..............................#',
      '#..........M...................#',
      '#..........]]...[[.............#',
      '#..............................#',
      '#..............................#',
      '#..................]]..........#',
      '#..............................#',
      '#.P............................#',
      '####..=..=..=..###.............#',
      '#..............................#',
      '#..............................#',
      '#RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR#',
      '################################',
    ],
  });

  // ================= JEFE · LA TRITURADORA =================
  L.push({
    id: 'J-1', act: 3, music: 'boss', cut: 'boss', bossPart: 0,
    name: { es: 'La persecución', en: 'The Chase' },
    voice: [
      { es: 'RELÁJESE. NO DUELE. BUENO, UN POCO.', en: 'RELAX. IT DOES NOT HURT. WELL, A LITTLE.' },
    ],
    boss: { kind: 'chase', delay0: 110, delay1: 62, ramp: 1500 },
    map: build(64, 18, ({ put, rect }) => {
      rect(1, 16, 17, 1, '#'); rect(18, 16, 9, 1, 'R'); rect(27, 16, 36, 1, '#');
      put(2, 15, 'P');
      put(8, 15, '^'); rect(12, 14, 2, 2, '#'); put(16, 15, '^');
      put(19, 13, '='); put(22, 12, '='); put(25, 13, '=');
      put(30, 15, '^'); put(31, 15, '^');
      put(34, 15, 'T'); rect(37, 10, 1, 6, '#');
      put(40, 15, '^'); put(43, 15, 'a');
      rect(45, 1, 2, 15, '#');
      put(49, 3, 'A'); rect(47, 6, 10, 1, '#'); put(52, 5, '^');
      put(58, 15, '^'); put(61, 15, 'F');
    }),
  });

  L.push({
    id: 'J-2', act: 3, music: 'boss', bossPart: 1,
    name: { es: 'El molino', en: 'The Mill' },
    voice: [
      { es: '¿POR QUÉ SIGUE CORRIENDO? NADIE SIGUE CORRIENDO.', en: 'WHY ARE YOU STILL RUNNING? NOBODY KEEPS RUNNING.' },
    ],
    boss: { kind: 'mill', every: 170, brakes: [[5, 10], [26, 10], [15, 5]] },
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#............------............#',
      '#..............................#',
      '#........--..........--........#',
      '#..............................#',
      '#..............................#',
      '#..-----................-----..#',
      '#..............................#',
      '#..............................#',
      '#--..........................--#',
      '#..............P...............#',
      '################################',
      '################################',
    ],
  });

  L.push({
    id: 'J-3', act: 3, music: 'boss', bossPart: 2,
    name: { es: 'La huida', en: 'The Escape' },
    voice: [
      { es: '¡ALERTA! LA TRITURADORA SE HA ATASCADO. ¡ALERTA!', en: 'ALERT! THE GRINDER IS JAMMED. ALERT!' },
    ],
    boss: { kind: 'rise', rise: { speed: 0.42, acc: 0.00012, wait: 150 } },
    map: build(32, 36, ({ put, rect }) => {
      rect(1, 34, 30, 1, '#');
      put(15, 33, 'P');
      rect(19, 31, 5, 1, '-');
      rect(25, 28, 5, 1, '-');
      rect(19, 25, 4, 1, '=');
      rect(11, 22, 6, 1, '#'); put(13, 21, '^');
      rect(2, 19, 8, 1, '#'); put(3, 18, 'T'); put(7, 18, '^');
      rect(2, 11, 7, 1, '-');
      rect(9, 11, 7, 1, '#');
      rect(10, 3, 1, 7, '#');
      rect(15, 4, 1, 7, '#');
      put(14, 7, '<');
      rect(15, 3, 9, 1, '#');
      rect(24, 3, 1, 1, '#');
      put(22, 2, 'F');
    }),
  });

  // ================= HISTORIA =================
  const STORY = {
    acts: [
      { es: 'ACTO I · LA LLEGADA', en: 'ACT I · THE ARRIVAL' },
      { es: 'ACTO II · LAS PRUEBAS', en: 'ACT II · THE TRIALS' },
      { es: 'ACTO III · EL PROCESADO', en: 'ACT III · THE PROCESSING' },
      { es: 'JEFE · LA TRITURADORA', en: 'BOSS · THE GRINDER' },
    ],
    intro: [
      { t: 'n', es: 'Keznit murió defendiendo a los suyos.', en: 'Keznit died defending his people.' },
      { t: 'n', es: 'No recuerda el golpe. Solo la caída.', en: "He doesn't remember the blow. Only the fall." },
      { t: 'n', es: 'Una caída larga. Muy larga. Hasta el fondo del abismo.', en: 'A long fall. A very long one. All the way down to the abyss.' },
      { t: 'n', es: 'Cuando abrió los ojos, ya no tenía cuerpo.', en: 'When he opened his eyes, he no longer had a body.' },
      { t: 'sq', es: 'Era un pequeño cuadrado blanco.', en: 'He was a small white square.' },
      { t: 'v', es: 'BIENVENIDO AL ABISMO, ALMA Nº 4.816.302.', en: 'WELCOME TO THE ABYSS, SOUL NO. 4,816,302.' },
      { t: 'v', es: 'POR FAVOR, ESPERE A SER PROCESADA.', en: 'PLEASE WAIT TO BE PROCESSED.' },
      { t: 'sq', es: 'Keznit no esperó.', en: 'Keznit did not wait.' },
    ],
    soldier: [
      { s: 'S', es: 'Eh, tú. Eres nuevo, ¿verdad? Se te nota. Todavía brillas.', en: "Hey, you. You're new, right? It shows. You still shine." },
      { s: 'S', es: 'Yo llegué ayer. O hace cien años. Aquí abajo no hay forma de saberlo.', en: "I got here yesterday. Or a hundred years ago. There's no way to tell down here." },
      { s: 'S', es: 'Esta es la primera prueba: la llave, la puerta y la bandera.', en: 'This is the first trial: the key, the door and the flag.' },
      { s: 'S', es: 'Yo era soldado, ¿sabes? Juré que nunca me rendiría.', en: 'I was a soldier, you know. I swore I would never give up.' },
      { s: 'S', es: 'Pero lo he intentado mil veces. Y ya no puedo más.', en: "But I've tried a thousand times. And I can't anymore." },
      { s: 'S', es: '...Me rindo.', en: '...I give up.' },
      { s: 'V', es: 'ALMA Nº 4.816.301 SE HA RENDIDO. ENHORABUENA.', en: 'SOUL NO. 4,816,301 HAS GIVEN UP. CONGRATULATIONS.' },
      { s: 'V', es: 'PUESTO ASIGNADO: CARCELERO. SE LE ENTREGARÁN LAS LLAVES DE TODAS LAS CELDAS.', en: 'ASSIGNED POST: JAILER. YOU WILL RECEIVE THE KEYS TO EVERY CELL.', chains: true },
      { s: 'S', es: 'Oye, nuevo... No hagas como yo. No te rindas.', en: "Hey, new guy... Don't be like me. Don't give up.", leave: true },
    ],
    boss: {
      name: { es: 'LA TRITURADORA', en: 'THE GRINDER' },
      epi: { es: 'La que procesa las almas', en: 'She who processes souls' },
      hints: [
        { es: '¡NO DEJES DE CORRER!', en: "DON'T STOP RUNNING!" },
        { es: 'TOCA LOS FRENOS NARANJAS', en: 'HIT THE ORANGE BRAKES' },
        { es: '¡SUBE! ¡CORRE!', en: 'CLIMB! RUN!' },
      ],
    },
    ending: [
      { t: 'orig', es: 'El final... ¿o no?', en: 'The end... or not?' },
      { t: 'v', es: 'ERROR.', en: 'ERROR.' },
      { t: 'v', es: 'ALMA Nº 4.816.302: NO PROCESABLE.', en: 'SOUL NO. 4,816,302: CANNOT BE PROCESSED.' },
      { t: 'v', es: 'MOTIVO: NO SE RINDE.', en: 'REASON: WILL NOT GIVE UP.' },
      { t: 'v', es: 'SOLUCIÓN: ENVIAR DIRECTAMENTE AL TORTURADOR.', en: 'SOLUTION: SEND DIRECTLY TO THE TORTURER.' },
      { t: 'chains', es: '', en: '' },
      { t: 'n', es: 'Y allí, en lo más hondo, le esperaba el Torturador.', en: 'And there, at the very bottom, the Torturer was waiting.' },
      { t: 'title', es: 'Continúa en SOUL KEZNIT 2', en: 'Continued in SOUL KEZNIT 2' },
    ],
    memories: [
      { es: 'Una casa pequeña al final del camino. La puerta siempre abierta.', en: 'A small house at the end of the road. The door always open.' },
      { es: 'Su madre cantaba mientras cosía. Nunca terminaba la canción.', en: 'His mother sang while she sewed. She never finished the song.' },
      { es: 'Su hermana pequeña le llamaba «Kez». Nadie más podía.', en: 'His little sister called him "Kez". Nobody else was allowed to.' },
      { es: 'Aprendió a luchar con un palo de escoba. Perdía siempre.', en: 'He learned to fight with a broomstick. He always lost.' },
      { es: 'Su padre le dio un colgante: «para que sepas volver».', en: 'His father gave him a pendant: "so you always find your way back".' },
      { es: 'Los días de mercado olían a pan y a lluvia.', en: 'Market days smelled of bread and rain.' },
      { es: 'Juró proteger a los suyos. Lo dijo en voz alta, para que contara.', en: 'He swore to protect his people. He said it out loud, so it would count.' },
      { es: 'La noche del ataque, las campanas no dejaron de sonar.', en: 'The night of the attack, the bells never stopped ringing.' },
      { es: 'Se quedó en el puente él solo. Alguien tenía que hacerlo.', en: 'He stayed on the bridge alone. Someone had to.' },
      { es: 'Vio a los suyos cruzar el río. Todos. Fue lo último que vio.', en: 'He watched his people cross the river. All of them. It was the last thing he saw.' },
      { es: 'Ofreció su alma a cambio de sus vidas. Alguien, abajo, aceptó.', en: 'He offered his soul in exchange for their lives. Someone, down below, accepted.' },
      { es: 'No lo pensó dos veces. Lo volvería a hacer.', en: "He didn't think twice. He would do it again." },
      { es: 'Prometió volver a casa. Todavía no lo ha olvidado.', en: 'He promised to come home. He still has not forgotten.' },
    ],
    surrender: {
      q: { es: '¿DESEA RENDIRSE?', en: 'DO YOU WISH TO GIVE UP?' },
      yes: { es: 'SÍ', en: 'YES' }, no: { es: 'NO', en: 'NO' },
      a: { es: 'Keznit no sabe rendirse.', en: "Keznit doesn't know how to give up." },
    },
  };

  const api = { LEVELS: L, STORY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, { SKL: api });
})(typeof self !== 'undefined' ? self : this);
