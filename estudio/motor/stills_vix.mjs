// Renderiza os quadros-chave (composição "Quadro") de um frames.json, com um único bundle.
// Uso: node stills_vix.mjs <pasta-com-frames.json>   (grava <pasta>/quadros/<ID>.png)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {readFileSync, mkdirSync} from 'fs';
import path from 'path';

const pasta = path.resolve(process.argv[2]);
const frames = JSON.parse(readFileSync(path.join(pasta, 'frames.json'), 'utf8'));
mkdirSync(path.join(pasta, 'quadros'), {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const ids = process.argv[3] ? process.argv[3].split(',') : null;
for (const vid of Object.keys(frames)) {
  for (const q of frames[vid]) {
    if (ids && !ids.includes(q.id)) continue;
    const {f = 60, ...inputProps} = q.spec;
    const comp = await selectComposition({serveUrl, id: 'Quadro', inputProps});
    await renderStill({composition: comp, serveUrl, inputProps, frame: f, output: path.join(pasta, 'quadros', `${q.id}.png`), imageFormat: 'png'});
    console.log('ok', q.id);
  }
}
