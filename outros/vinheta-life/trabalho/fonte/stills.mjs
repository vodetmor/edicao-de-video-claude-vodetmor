// node stills.mjs <Composição> <pasta> f1,f2,...  -> PNGs de cada quadro
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [comp, out, lista] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const f of lista.split(',').map(Number)) {
  await renderStill({serveUrl, composition, frame: f, output: `${out}/${comp}-${String(f).padStart(3, '0')}.png`, browserExecutable});
  console.log('ok', f);
}
