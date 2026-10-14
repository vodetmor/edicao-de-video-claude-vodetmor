// html/*.html -> ../public/tex/*.png (fundo transparente, 2x). Precisa de playwright num node_modules (scratch).
import {chromium} from 'playwright'; import fs from 'node:fs'; import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const tam = JSON.parse(fs.readFileSync(path.join(here, 'html/tamanhos.json')));
const b = await chromium.launch();
for (const [k, [w, h]] of Object.entries(tam)) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2});
  await p.goto('file://' + path.join(here, 'html', k + '.html')); await p.waitForTimeout(250);
  await p.screenshot({path: path.join(here, '../public/tex', k + '.png'), omitBackground: true}); await p.close();
}
await b.close();
