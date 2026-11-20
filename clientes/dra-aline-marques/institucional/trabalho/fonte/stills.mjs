// uso: node stills.mjs <pasta-saida> <quadro> [quadro...]   (1 bundle, vários stills)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const out = process.argv[2];
const frames = process.argv.slice(3).map(Number);
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const comp = await selectComposition({serveUrl, id: 'Aline'});
for (const f of frames) {
  await renderStill({composition: comp, serveUrl, frame: f, output: path.join(out, `f${String(f).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 90});
  console.log('ok', f);
}
