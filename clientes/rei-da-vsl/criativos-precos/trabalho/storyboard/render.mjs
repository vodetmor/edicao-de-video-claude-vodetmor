// Renderiza cada quadro em 1080x1920 e uma folha de contato por criativo. Uso: NODE_PATH=<node_modules com playwright> node render.mjs
import {chromium} from 'playwright';
import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({executablePath: process.env.CHROME || undefined});
const p = await b.newPage({deviceScaleFactor: 2, viewport: {width: 1400, height: 1000}});
for (const c of ['A', 'B']) {
  await p.goto('file://' + path.join(here, `criativo-${c}.html`));
  await p.evaluate(() => document.fonts.ready);
  const fr = await p.$$('.frame');
  for (let i = 0; i < fr.length; i++) await fr[i].screenshot({path: path.join(here, 'quadros', `${c}${String(i + 1).padStart(2, '0')}.png`)});
}
await b.close();
