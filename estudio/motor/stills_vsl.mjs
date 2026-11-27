// uso: node stills_vsl.mjs <pasta-saida> <seg1> <seg2> ...  (stills da composição VslVixplay, um bundle só)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';

const [, , out, ...segs] = process.argv;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'VslVixplay'});
for (const s of segs) {
  const frame = Math.round(parseFloat(s) * 30);
  const output = path.join(out, `s${String(s).replace('.', '_')}.jpg`);
  await renderStill({serveUrl, composition: comp, frame, output, imageFormat: 'jpeg', jpegQuality: 85, chromiumOptions: {gl: 'angle'}});
  console.log('ok', s, output);
}
