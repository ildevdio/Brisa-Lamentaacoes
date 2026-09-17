/* =====================================================================
   Brisa e Lamentações - Sincroniza o index.html com o build/data.js
   Uso:  node build/sync-index.js
   Substitui os blocos embutidos no Livro_do_Jogador/index.html:
     - const DEFAULT_DATA = { ... };
     - const MECHANICS = [ ... ];
     - const REACTIONS = [ ... ];
   SEMPRE rode depois do build/build.js (regenera o game-data.json).
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, 'data.js');
const INDEX = path.join(__dirname, '..', 'Livro_do_Jogador', 'index.html');

const src = fs.readFileSync(SOURCE, 'utf8');
global.DEFAULT_DATA = undefined;
eval(src + "\n;global.DEFAULT_DATA = DEFAULT_DATA; global.MECHANICS = MECHANICS; global.REACTIONS = REACTIONS;");
const payload = { DEFAULT_DATA: global.DEFAULT_DATA, MECHANICS: global.MECHANICS, REACTIONS: global.REACTIONS };

let html = fs.readFileSync(INDEX, 'utf8');

function replaceBlock(text, name){
  const marker = `const ${name} = `;
  const i = text.indexOf(marker);
  if (i === -1) throw new Error(`Marcador "${marker}" não encontrado no index.html`);
  const open = (name === 'DEFAULT_DATA') ? '{' : '[';
  const close = (name === 'DEFAULT_DATA') ? '}' : ']';
  let j = i + marker.length;
  while (j < text.length && text[j] !== open) j++;
  if (text[j] !== open) throw new Error(`Abertura ${open} não encontrada para ${name}`);
  let depth = 0;
  for (; j < text.length; j++){
    const c = text[j];
    if (c === '"' || c === "'" || c === "`"){
      // pula strings (para não contar chaves dentro de descrições)
      const quote = c;
      j++;
      while (j < text.length){
        const cc = text[j];
        if (cc === '\\'){ j++; }
        else if (cc === quote) break;
        j++;
      }
      continue;
    }
    if (c === open) depth++;
    else if (c === close){ depth--; if (depth === 0) break; }
  }
  if (depth !== 0 || text[j] !== close) throw new Error(`Bloco ${name} não fechou corretamente`);
  const end = j + 1;
  let k = end;
  while (k < text.length && (text[k] === ' ' || text[k] === '\r' || text[k] === '\n')) k++;
  const literalEnd = (text[k] === ';') ? k + 1 : end;
  const replacement = marker + JSON.stringify(payload[name], null, 2) + ';';
  return text.slice(0, i) + replacement + text.slice(literalEnd);
}

html = replaceBlock(html, 'DEFAULT_DATA');
html = replaceBlock(html, 'MECHANICS');
html = replaceBlock(html, 'REACTIONS');

fs.writeFileSync(INDEX, html, 'utf8');
console.log('index.html sincronizado:');
console.log('  spells    :', payload.DEFAULT_DATA.spells.length);
console.log('  techs     :', payload.DEFAULT_DATA.techniques.length);
console.log('  items     :', payload.DEFAULT_DATA.items.length);
console.log('  party     :', payload.DEFAULT_DATA.particularities.length, '(particularidades)');
console.log('  mechanics :', payload.MECHANICS.length, '| reactions:', payload.REACTIONS.length);