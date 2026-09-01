/* =====================================================================
   Brisa e Lamentações - Script de build das mecânicas
   Uso:  node build/build.js
   Gera: game-data.json (raiz) a partir de build/data.js

   O game-data.json é o arquivo que o Livro do Jogador baixa do servidor.
   Fluxo de atualização das mecânicas:
     1. edite build/data.js  (ou crie as raças/classes/magias etc.)
     2. node build/build.js  -> regenera game-data.json
     3. git add/commit/push -> os jogadores recebem no próximo acesso
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, 'data.js');
const OUT = path.join(__dirname, '..', 'game-data.json');

const src = fs.readFileSync(SOURCE, 'utf8');
global.DEFAULT_DATA = undefined;
eval(src + "\n;global.DEFAULT_DATA = DEFAULT_DATA; global.MECHANICS = MECHANICS; global.REACTIONS = REACTIONS;");
const { DEFAULT_DATA, MECHANICS, REACTIONS } = global;

const payload = {
  version: "1.0.0",
  metadata: {
    name: "Brisa e Lamentações — Mecânicas oficiais",
    author: "Ildevdio",
    updatedAt: new Date().toISOString()
  },
  data: DEFAULT_DATA,
  mechanics: MECHANICS,
  reactions: REACTIONS
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');

console.log('game-data.json gerado em:', OUT);
console.log('  version :', payload.version);
console.log('  races   :', DEFAULT_DATA.races.length);
console.log('  classes :', DEFAULT_DATA.classes.length);
console.log('  spells  :', DEFAULT_DATA.spells.length);
console.log('  techs   :', DEFAULT_DATA.techniques.length);
console.log('  items   :', DEFAULT_DATA.items.length);
console.log('  party   :', DEFAULT_DATA.particularities.length, '(particularidades)');
console.log('  mechanics:', MECHANICS.length, '| reactions:', REACTIONS.length);