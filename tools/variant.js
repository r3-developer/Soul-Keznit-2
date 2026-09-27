// Prueba un nivel quitando elementos (láseres, lava) para aislar problemas
const path = require('path');
const { LEVELS } = require('../web/play/sk1-remake/js/levels.js');
const id = process.argv[2], mode = process.argv[3];
const def = JSON.parse(JSON.stringify(LEVELS.find(l => l.id === id)));
if (mode === 'nolaser') def.map = def.map.map(r => r.replace(/[xy]/g, '.'));
if (mode === 'norise') def.boss = null;
if (mode === 'nosaw') def.ents = [];
LEVELS.length = 0; LEVELS.push(def);
process.argv = [process.argv[0], path.join(__dirname, 'solver.js'), id, '--frag'];
require('./solver.js');
