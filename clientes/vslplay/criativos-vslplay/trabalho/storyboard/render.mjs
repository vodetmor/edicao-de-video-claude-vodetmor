// Renderiza cada quadro (1080x1920) e as pranchas. Uso: copiar para uma pasta com playwright instalado e rodar: node render.mjs <pasta-do-storyboard>
import {chromium} from 'playwright';
import path from 'path';
const here = process.argv[2] || path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch();
const p = await b.newPage({deviceScaleFactor: 2, viewport: {width: 1300, height: 1000}});
for (const c of ['c2', 'c3']) {
  await p.goto('file://' + path.join(here, c + '.html'));
  await p.evaluate(() => document.fonts.ready);
  const fr = await p.$$('.frame');
  for (let i = 0; i < fr.length; i++) await fr[i].screenshot({path: path.join(here, 'quadros', `${c}-${String(i + 1).padStart(2, '0')}.png`)});
}
const ps = await b.newPage({deviceScaleFactor: 2, viewport: {width: 1300, height: 800}});
for (const s of ['prancha-c2-1', 'prancha-c2-2', 'prancha-c3-1', 'prancha-c3-2']) {
  await ps.goto('file://' + path.join(here, s + '.html'));
  await ps.evaluate(() => document.fonts.ready);
  await ps.screenshot({path: path.join(here, s + '.png'), fullPage: true});
}
await b.close();
