// plano.html -> PDF (A4 deitado). Uso: CHROME=/opt/pw-browsers/chromium NODE_PATH=... node pdf.mjs
import {chromium} from 'playwright';
import path from 'path';
const here = process.env.PLANO || path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch({executablePath: process.env.CHROME || undefined});
const p = await b.newPage();
await p.goto('file://' + path.join(here, 'plano.html'));
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
await p.pdf({path: path.join(here, 'plano-criativos-rei-da-vsl.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true});
await b.close();
