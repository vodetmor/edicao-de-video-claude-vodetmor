// Renderiza um projeto do editor.
// Uso: node renderizar.mjs <projeto> [--amostra 8] [--trecho 3.5-9] [--quadros] [--nome V01]
//   --amostra N   só os primeiros N segundos (a amostra que o usuário aprova antes do vídeo inteiro)
//   --trecho a-b  só um trecho (para conferir uma correção com a entrada e a saída)
//   --quadros     em vez de vídeo, salva quadros-chave + uma folha de contato (projeto/quadros/)
//   --roteiro R   usa outro roteiro visual com a mesma base (ex.: comparar estilos)
//   --vitrine V   vídeo-vitrine: a mesma fala em vários estilos com câmera entre eles (V = JSON com estilos, camera, palco...)
//   --quadros-em 1.2,4,7.5   quadros-chave nesses segundos (em vez de espaçados)
//   --nome X      nome da versão (padrão: V01). Vídeo inteiro vai para entregas/, amostra e trecho para projeto/amostras/
// Lê do projeto: projeto/roteiro-visual.json, base.mp4, base-palavras.json, rosto.json (opcional), marca.json (opcional).
// Escreve também projeto/entrada.json, para abrir no Studio:
//   npx remotion studio src/index.ts --props=<projeto>/projeto/entrada.json --public-dir=<projeto>/projeto/.publico
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {caminhos, montaEntrada, preparaPublico} from './entrada.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const raiz = path.resolve(args[0] ?? '');
const opt = (k) => {
  const i = args.indexOf(k);
  return i > 0 ? args[i + 1] : undefined;
};
const tem = (k) => args.includes(k);
const {pj} = caminhos(raiz);
const entrada = montaEntrada(raiz);
if (opt('--roteiro')) entrada.roteiro = JSON.parse(fs.readFileSync(opt('--roteiro'), 'utf8')); // outro roteiro, mesma base (galeria de estilos)
if (opt('--vitrine')) Object.assign(entrada, JSON.parse(fs.readFileSync(opt('--vitrine'), 'utf8')));
const pub = preparaPublico(raiz);
fs.writeFileSync(pj('entrada.json'), JSON.stringify(entrada));

// navegador: o do sistema se houver (REMOTION_BROWSER ou o pré-instalado do Playwright); senão o Remotion baixa sozinho
const achaNavegador = () => {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const base = '/opt/pw-browsers';
  if (!fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell'))) {
    const p = path.join(base, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
    if (fs.existsSync(p)) return p;
  }
  return undefined;
};
const browserExecutable = achaNavegador();
const t0 = Date.now();
const serveUrl = await bundle({entryPoint: path.join(aqui, 'src/index.ts'), publicDir: pub});
const comp = await selectComposition({serveUrl, id: opt('--vitrine') ? 'Vitrine' : 'Editor', inputProps: entrada, browserExecutable});
const fps = comp.fps;
const nome = opt('--nome') ?? 'V01';
const conc = Math.max(1, Math.min(8, os.cpus().length));

if (tem('--quadros')) {
  const dir = pj('quadros', nome);
  fs.rmSync(dir, {recursive: true, force: true});
  fs.mkdirSync(dir, {recursive: true});
  const n = Number(opt('--quadros-n') ?? 8);
  const frames = opt('--quadros-em') ? opt('--quadros-em').split(',').map((x) => Math.min(comp.durationInFrames - 1, Math.round(Number(x) * fps)))
    : Array.from({length: n}, (_, i) => Math.round(((i + 0.5) / n) * (comp.durationInFrames - 1)));
  for (const fr of frames) {
    await renderStill({serveUrl, composition: comp, inputProps: entrada, frame: fr, output: path.join(dir, `q${String(fr).padStart(5, '0')}.png`),
      browserExecutable, timeoutInMilliseconds: 120000});
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(dir, 'q*.png'), '-vf',
    `scale=-2:640,tile=${Math.min(frames.length, 4)}x${Math.ceil(frames.length / 4)}:padding=8:color=white`, '-frames:v', '1', path.join(dir, 'folha.png')]);
  console.log(`${frames.length} quadros em ${dir} (folha.png = todos juntos)`);
  process.exit(0);
}

let frameRange = null;
let destino;
if (opt('--amostra')) {
  frameRange = [0, Math.min(comp.durationInFrames - 1, Math.round(Number(opt('--amostra')) * fps) - 1)];
  destino = pj('amostras', `${nome}-amostra.mp4`);
} else if (opt('--trecho')) {
  const [a, b] = opt('--trecho').split('-').map(Number);
  frameRange = [Math.max(0, Math.round(a * fps)), Math.min(comp.durationInFrames - 1, Math.round(b * fps))];
  destino = pj('amostras', `${nome}-trecho-${a}-${b}.mp4`);
} else {
  destino = path.join(raiz, 'entregas', `${nome}.mp4`);
}
fs.mkdirSync(path.dirname(destino), {recursive: true});
const bruto = destino.replace(/\.mp4$/, '.bruto.mp4');
await renderMedia({serveUrl, composition: comp, inputProps: entrada, codec: 'h264', crf: 17, outputLocation: bruto, browserExecutable,
  imageFormat: 'jpeg', jpegQuality: 92, concurrency: conc, frameRange, timeoutInMilliseconds: 180000});
// master: -14 LUFS integrado, pico real -1 dBTP (DESIGN-SYSTEM §7.1)
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', bruto, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1:LRA=9', '-ar', '48000',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', destino]);
fs.rmSync(bruto);
const seg = ((frameRange ? frameRange[1] - frameRange[0] + 1 : comp.durationInFrames) / fps).toFixed(1);
console.log(`${path.relative(raiz, destino)}: ${comp.width}x${comp.height}, ${seg} s, render em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
