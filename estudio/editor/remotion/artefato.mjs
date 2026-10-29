// Gera o painel de revisão como página estática para publicar como artefato do claude.ai.
// Uso: node artefato.mjs <projeto> [--saida <pasta>]   (padrão: <projeto>/projeto/artefato/)
// A página leva o roteiro, as palavras e o rosto embutidos; as notas ficam no banco do artefato (coleção "notas").
// Publicar: página index.html + arquivos app.js, app.css, fontes/*, base.mp4 e assets/* da mesma pasta,
// com capabilities {db:{}, user:{}}. Mudou o roteiro: rode de novo e republique no mesmo endereço.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {caminhos, montaEntrada} from './entrada.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const raiz = path.resolve(args[0] ?? '');
const i = args.indexOf('--saida');
const saida = path.resolve(i >= 0 ? args[i + 1] : path.join(raiz, 'projeto', 'artefato'));
const {pj, assets} = caminhos(raiz);
const entrada = montaEntrada(raiz);

fs.rmSync(saida, {recursive: true, force: true});
fs.mkdirSync(saida, {recursive: true});
await esbuild.build({
  entryPoints: [path.join(aqui, 'painel', 'app.tsx')],
  bundle: true, outdir: saida, entryNames: 'app', format: 'iife', jsx: 'automatic', minify: true,
  loader: {'.woff2': 'file', '.woff': 'file'}, assetNames: 'fontes/[name]', publicPath: './',
  define: {'process.env.NODE_ENV': '"production"'}, logLevel: 'warning',
});
// só as fontes latinas: as outras escritas não aparecem na legenda em português e pesam no artefato
const css = path.join(saida, 'app.css');
let textoCss = fs.readFileSync(css, 'utf8');
const usadas = new Set();
textoCss = textoCss.replace(/@font-face\s*\{[^}]*\}/g, (bloco) => {
  const m = bloco.match(/url\(["']?\.?\/?fontes\/([^)"']+)/);
  if (!m || /-(cyrillic|greek|vietnamese|latin-ext)[-.]/.test(m[1])) return '';
  usadas.add(m[1]);
  return bloco;
});
fs.writeFileSync(css, textoCss);
for (const f of fs.readdirSync(path.join(saida, 'fontes'))) if (!usadas.has(f)) fs.rmSync(path.join(saida, 'fontes', f));

fs.copyFileSync(pj('base.mp4'), path.join(saida, 'base.mp4'));
if (fs.existsSync(assets)) {
  fs.mkdirSync(path.join(saida, 'assets'), {recursive: true});
  for (const f of fs.readdirSync(assets)) {
    if (fs.statSync(path.join(assets, f)).isFile()) fs.copyFileSync(path.join(assets, f), path.join(saida, 'assets', f));
  }
}

// a página: o mesmo estilo do painel local, sem o esqueleto (o claude.ai coloca doctype, head e body)
const html = fs.readFileSync(path.join(aqui, 'painel', 'index.html'), 'utf8');
const estilo = html.match(/<style>[\s\S]*?<\/style>/)[0];
const pagina = `<title>Revisão da edição</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="app.css">
${estilo}
<div id="raiz"></div>
<script>window.remotion_staticBase = "."; window.__ENTRADA = ${JSON.stringify(entrada).replace(/</g, '\\u003c')};</script>
<script src="app.js"></script>
`;
fs.writeFileSync(path.join(saida, 'index.html'), pagina);
const arquivos = [];
const anda = (d, rel = '') => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) anda(p, rel + f + '/');
    else if (f !== 'index.html') arquivos.push(rel + f);
  }
};
anda(saida);
fs.writeFileSync(path.join(saida, 'arquivos.json'), JSON.stringify(arquivos, null, 1));
const mb = (p) => (fs.statSync(path.join(saida, p)).size / 1e6).toFixed(1);
console.log(`pronto: ${saida}\n  ${arquivos.map((a) => `${a} (${mb(a)} MB)`).join('\n  ')}`);
