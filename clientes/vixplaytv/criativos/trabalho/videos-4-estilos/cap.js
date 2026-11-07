// node cap.js <html> <segundos> <pasta_saida> [--teste t1,t2,...]  -> quadros JPG a 30 fps (ou só os tempos de teste)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [html, durS, out] = process.argv.slice(2);
  const ti = process.argv.indexOf('--teste');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file:///' + html);
  await p.waitForFunction(() => window.PRONTO === 1, { timeout: 30000 });
  const tempos = ti > 0 ? process.argv[ti + 1].split(',').map(Number) : [...Array(Math.round(+durS * 30)).keys()].map((i) => i / 30);
  let i = 0;
  for (const t of tempos) {
    await p.evaluate(async (t) => { await window.seek(t); }, t);
    await p.screenshot({ path: `${out}/${ti > 0 ? 't' + t : String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    i++;
  }
  console.log(i, 'quadros');
  await b.close();
})();
