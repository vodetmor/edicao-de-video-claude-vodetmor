// Ponte site -> tema do motor (protótipo do teste da extract-ds, 07/10/2026).
// Uso: node tokens.mjs <url ou file://...> <pasta-saida>
// Abre a página no Chromium, rola até o fim (carrega o lazy), tira print e mede
// os estilos COMPUTADOS dos elementos visíveis, ponderados por área/qtd de texto.
// Saída: tema.json (cores por função, fontes, tamanhos, raios, sombras, variáveis CSS do :root) + print.png
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [url, out = 'saida'] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
await page.goto(url, {waitUntil: 'networkidle', timeout: 90000}).catch(() => {});
for (let y = 0; y < 30000; y += 700) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({path: path.join(out, 'print.png'), fullPage: true});

const dados = await page.evaluate(() => {
  const add = (m, k, w) => { if (!k) return; m[k] = (m[k] || 0) + w; };
  const bg = {}, txt = {}, borda = {}, fonteTit = {}, fonteTxt = {}, tam = {}, raio = {}, sombra = {}, botao = {};
  const vis = (cs) => cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05;
  const transp = (c) => !c || c === 'transparent' || /rgba\(.*,\s*0\)$/.test(c);
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (!vis(cs)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const area = r.width * r.height;
    if (!transp(cs.backgroundColor)) add(bg, cs.backgroundColor, area);
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (own.length) {
      add(txt, cs.color, own.length);
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const big = parseFloat(cs.fontSize) >= 28 || /^H[1-3]$/.test(el.tagName);
      add(big ? fonteTit : fonteTxt, `${fam} ${cs.fontWeight}`, own.length);
      add(tam, `${Math.round(parseFloat(cs.fontSize))}px`, own.length);
    }
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') add(borda, cs.borderTopColor, r.width);
    if (parseFloat(cs.borderTopLeftRadius) > 0) add(raio, cs.borderTopLeftRadius, 1);
    if (cs.boxShadow && cs.boxShadow !== 'none') add(sombra, cs.boxShadow, 1);
    const isBtn = el.matches('a.elementor-button, button, .btn, [class*="button"], input[type=submit]');
    if (isBtn && !transp(cs.backgroundColor)) add(botao, `${cs.backgroundColor} | texto ${cs.color} | raio ${cs.borderTopLeftRadius} | ${cs.fontWeight} ${cs.fontSize}`, 1);
  }
  const vars = {};
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules; } catch { continue; }
    for (const ru of rules || []) {
      if (!ru.style || !/(^|,)\s*(:root|body|\.elementor-kit-\d+)/.test(ru.selectorText || '')) continue;
      for (const p of ru.style) if (p.startsWith('--') && /color|font|radius|typography/i.test(p)) vars[p] = ru.style.getPropertyValue(p).trim();
    }
  }
  const top = (m, n = 8) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({valor: k, peso: Math.round(v)}));
  return {
    titulo: document.title,
    fundos: top(bg), textos: top(txt), bordas: top(borda, 5),
    fontesTitulo: top(fonteTit, 5), fontesTexto: top(fonteTxt, 5), tamanhos: top(tam, 10),
    raios: top(raio, 6), sombras: top(sombra, 4), botoes: top(botao, 4),
    variaveisCss: vars,
  };
});
dados.fonte = url;
dados.medidoEm = new Date().toISOString();
fs.writeFileSync(path.join(out, 'tema-bruto.json'), JSON.stringify(dados, null, 2));
await browser.close();
console.log(JSON.stringify(dados, null, 1).slice(0, 6000));
