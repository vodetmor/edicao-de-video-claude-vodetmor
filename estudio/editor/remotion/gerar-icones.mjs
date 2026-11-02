// Gera src/icones.ts com os caminhos SVG dos ícones de icones.lista.txt (Phosphor, MIT), nos pesos fill e bold.
import fs from 'node:fs';
const base = 'node_modules/@phosphor-icons/core/assets';
const nomes = fs.readFileSync('icones.lista.txt', 'utf8').split('\n').filter((l) => !l.startsWith('#')).join(' ').split(/\s+/).filter(Boolean);
const tira = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const out = {};
const faltam = [];
for (const n of nomes) {
  for (const peso of ['fill', 'bold']) {
    const f = `${base}/${peso}/${n}-${peso}.svg`;
    if (fs.existsSync(f)) out[peso === 'fill' ? n : `${n}:linha`] = tira(fs.readFileSync(f, 'utf8'));
    else faltam.push(`${n} (${peso})`);
  }
}
fs.writeFileSync('src/icones.ts', '// Gerado por gerar-icones.mjs a partir de @phosphor-icons/core (MIT). Não editar à mão.\n' +
  '// "nome" = peso fill; "nome:linha" = peso bold. viewBox 0 0 256 256.\nexport const ICONES: Record<string, string> = ' + JSON.stringify(out, null, 0).replace(/","/g, '",\n"') + ';\n');
console.log(`${Object.keys(out).length} ícones` + (faltam.length ? `; não achei: ${faltam.join(', ')}` : ''));
