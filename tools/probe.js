// Mueve la bandera de un nivel a otra casilla para probar tramos (sin jefe)
const path = require('path');
const { LEVELS } = require('../web/play/sk1-remake/js/levels.js');
const [id, fc, fr, pc, pr] = process.argv.slice(2).map((v, i) => i ? +v : v);
const def = JSON.parse(JSON.stringify(LEVELS.find(l => l.id === id)));
def.boss = null;
def.map = def.map.map(r => r.replace('F', '.'));
const set = (c, r, ch) => { const row = def.map[r]; def.map[r] = row.slice(0, c) + ch + row.slice(c + 1); };
set(fc, fr, 'F');
if (pc !== undefined) { def.map = def.map.map(r => r.replace('P', '.')); set(pc, pr, 'P'); }
LEVELS.length = 0; LEVELS.push(def);
process.argv = [process.argv[0], path.join(__dirname, 'solver.js'), id];
require('./solver.js');
