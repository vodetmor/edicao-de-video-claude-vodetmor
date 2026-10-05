// node gen/stills.mjs <CompId> <outDir> <seg1,seg2,...>  → um JPG por instante (segundos)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [id, outDir, lista] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id});
for (const s of lista.split(',').filter(Boolean)) {
  const frame = Math.round(parseFloat(s) * 30);
  await renderStill({serveUrl, composition, frame, output: `${outDir}/${String(frame).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80});
  process.stdout.write(`${s} `);
}
console.log('ok');
