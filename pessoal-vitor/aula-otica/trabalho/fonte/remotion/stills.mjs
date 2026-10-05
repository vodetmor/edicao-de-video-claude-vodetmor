// Quadros soltos da aula: node stills.mjs <pasta> <quadro,quadro,...>  (+ folha de contato em <pasta>/folha.jpg)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
const [out = 'out/stills', lista = '0'] = process.argv.slice(2);
const qs = lista.split(',').map(Number);
fs.mkdirSync(out, {recursive: true});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const comp = await selectComposition({serveUrl, id: 'Aula', browserExecutable, chromiumOptions: {gl: 'angle'}});
for (const q of qs) {
  const t0 = Date.now();
  await renderStill({serveUrl, composition: comp, frame: q, output: `${out}/q${String(q).padStart(4, '0')}.png`, browserExecutable, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 240000});
  console.log(q, Date.now() - t0, 'ms');
}
