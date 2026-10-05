import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const [out, list] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: './src/index.ts'});
const comp = await selectComposition({serveUrl, id: 'Bastidores', browserExecutable: process.env.CHROME});
for (const fr of list.split(',').map(Number)) {
  await renderStill({serveUrl, composition: comp, frame: fr, output: `${out}/q${String(fr).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable: process.env.CHROME, scale: 0.5});
  console.log('ok', fr);
}
