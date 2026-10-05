// Quadros-chave da vitrine GLSL: node glsl-stills.mjs <pasta> [segundos,...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const [out = 'out/glsl-stills', lista] = process.argv.slice(2);
const ts = (lista ?? '0.0,1.9,4.2,6.6,7.6,9.5,10.6,11.5,13.0,16.9,18.3,20.9,26.5').split(',').map(Number);
fs.mkdirSync(out, {recursive: true});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'GlslVitrine', browserExecutable, chromiumOptions: {gl: 'angle'}});
for (const t of ts) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(t * 30));
  const t0 = Date.now();
  await renderStill({serveUrl, composition: comp, frame, output: `${out}/q${String(frame).padStart(4, '0')}.png`, browserExecutable, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 180000});
  console.log(t, frame, Date.now() - t0, 'ms');
}
