// uso: node render_vsl.mjs [concorrencia]  -> out/vsl-vixplay/partes/pNN.mp4 (mudo, 300 quadros cada) e mudo.mp4
// Pedaço pronto não é refeito (apague o arquivo para refazer só aquele trecho).
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync, renameSync, writeFileSync} from 'fs';
import {execSync} from 'child_process';
import path from 'path';

const conc = parseInt(process.argv[2] || '1', 10);
const dir = path.resolve('out/vsl-vixplay/partes');
mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'VslVixplay'});
const N = comp.durationInFrames;
const PASSO = 300;
const lista = [];
for (let a = 0, i = 0; a < N; a += PASSO, i++) {
  const b = Math.min(N - 1, a + PASSO - 1);
  const out = path.join(dir, `p${String(i).padStart(2, '0')}.mp4`);
  lista.push(`file '${out.replace(/\\/g, '/')}'`);
  if (existsSync(out)) { console.log('pula', out); continue; }
  const t0 = Date.now();
  await renderMedia({serveUrl, composition: comp, codec: 'h264', crf: 16, muted: true, frameRange: [a, b], outputLocation: out + '.tmp.mp4', concurrency: conc, chromiumOptions: {gl: 'angle'}, imageFormat: 'jpeg', jpegQuality: 95});
  renameSync(out + '.tmp.mp4', out);
  console.log('ok', i, a, b, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
writeFileSync(path.join(dir, 'lista.txt'), lista.join('\n'));
execSync(`ffmpeg -v error -y -f concat -safe 0 -i "${path.join(dir, 'lista.txt')}" -c copy "${path.resolve('out/vsl-vixplay/mudo.mp4')}"`);
console.log('pronto mudo.mp4');
