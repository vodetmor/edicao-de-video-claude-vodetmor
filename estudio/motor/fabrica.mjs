// Fábrica: lê uma spec e renderiza TODAS as variações de uma vez (ou só as pedidas).
// Uso: node fabrica.mjs specs/gancho-c2.json [A,B] [--stills]
//   -> out/<spec>/<variante>.mp4 (áudio normalizado a -14 LUFS, pico -1 dBTP) e, com --stills, quadros de conferência.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [specPath, only, ...flags] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const palavras = JSON.parse(fs.readFileSync(spec.palavras ?? 'src/data/words_c2.json', 'utf8')).words;
const pedidas = only && !only.startsWith('--') ? only.split(',') : spec.variantes.map((v) => v.id);
const stills = [only, ...flags].includes('--stills');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const outDir = path.resolve('out', spec.id);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of pedidas) {
  const inputProps = {spec, variante: id, palavras};
  const comp = await selectComposition({serveUrl, id: 'Video', inputProps, browserExecutable});
  const t0 = Date.now();
  if (stills) {
    for (const fr of [0.12, 0.3, 0.5, 0.75, 0.97].map((x) => Math.round(x * (comp.durationInFrames - 1)))) {
      await renderStill({serveUrl, composition: comp, inputProps, frame: fr, output: `${outDir}/${id}_${fr}.png`, browserExecutable, timeoutInMilliseconds: 120000});
    }
    console.log(`${id}: stills ok`);
    continue;
  }
  const bruto = `${outDir}/${id}_bruto.mp4`;
  await renderMedia({serveUrl, composition: comp, inputProps, codec: 'h264', crf: 16, outputLocation: bruto, browserExecutable,
    imageFormat: 'jpeg', jpegQuality: 95, concurrency: 4, timeoutInMilliseconds: 120000});
  // loudness final do anúncio: -14 LUFS integrado, pico real -1 dBTP
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', bruto, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1:LRA=9',
    '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', `${outDir}/${id}.mp4`]);
  fs.rmSync(bruto);
  console.log(`${id}: ${comp.width}x${comp.height}, ${(comp.durationInFrames / comp.fps).toFixed(1)} s, ${((Date.now() - t0) / 1000).toFixed(0)} s de render`);
}
