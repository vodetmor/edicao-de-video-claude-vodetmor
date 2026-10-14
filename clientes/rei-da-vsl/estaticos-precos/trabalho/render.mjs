// Renderiza os 6 estáticos de estaticos-WxH.html em PNG. Uso: copie para uma pasta com playwright (npm i playwright@1) e rode DIR=<esta pasta> CHROME=/opt/pw-browsers/chromium node render.mjs 1080 1350
import {chromium} from 'playwright';
import path from 'path';
const here = process.env.DIR || path.dirname(new URL(import.meta.url).pathname);
const [W, H] = [process.argv[2] || 1080, process.argv[3] || 1350];
const nomes = ['01a-preco', '01b-pacote', '01c-teste-10', '02a-preco', '02b-3-pessoas', '02c-pronto'];
const b = await chromium.launch({executablePath: process.env.CHROME || undefined});
const p = await b.newPage({deviceScaleFactor: 1, viewport: {width: 3600, height: 1500}});
await p.goto('file://' + path.join(here, `estaticos-${W}x${H}.html`));
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
const fr = await p.$$('.f');
for (let i = 0; i < fr.length; i++) await fr[i].screenshot({path: path.join(here, '..', `${W}x${H}`, `rei-da-vsl-estatico-${nomes[i]}.png`)});
await b.close();
