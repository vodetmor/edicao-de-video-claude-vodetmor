// Usage: node stills.mjs out/dir 0,14,20,...   (bundles once, renders PNG stills)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [outDir, list, scaleArg, compId] = process.argv.slice(2);
const frames = list.split(',').map((x) => parseInt(x, 10));
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: compId || 'Anuncio', browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, browserExecutable, timeoutInMilliseconds: 240000, scale: scaleArg ? parseFloat(scaleArg) : 1, overwrite: true});
  process.stdout.write(frame + ' ');
}
console.log('done');
