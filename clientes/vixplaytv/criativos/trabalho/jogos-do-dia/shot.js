// node shot.js  (NODE_PATH com playwright) -> saida/<id>.png
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const A = __dirname.replace(/\\/g, '/');
  fs.mkdirSync(A + '/saida', { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1440 } });
  await p.goto('file:///' + A + '/artes.html');
  await p.waitForFunction(() => window.PRONTO === 1, { timeout: 20000 });
  for (const el of await p.$$('.arte')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: `${A}/saida/vixplay-${id}.png` });
  }
  await b.close();
})();
