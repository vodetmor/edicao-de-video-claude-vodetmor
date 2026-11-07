// node capashot.js <arquivo.html> -> PNG de cada .fr (fundo transparente quando o .fr não tem fundo)
const { chromium } = require('playwright');
(async () => {
  const f = process.argv[2] || 'C:/tmp/vz/capas.html';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file:///' + f);
  await p.waitForFunction(() => window.PRONTO === 1, { timeout: 20000 });
  for (const el of await p.$$('.fr')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: `C:/tmp/vz/${id}.png`, omitBackground: true });
  }
  await b.close();
})();
