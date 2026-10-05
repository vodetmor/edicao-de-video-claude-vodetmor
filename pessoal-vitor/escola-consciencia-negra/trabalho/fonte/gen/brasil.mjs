// Gera os pontos do mapa do Brasil (parte 3, Cainã) e das 10 figuras humanas.
import fs from 'node:fs';
import {feature} from 'topojson-client';
import {geoMercator, geoContains} from 'd3-geo';
const topo = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const br = feature(topo, topo.objects.countries).features.find((f) => f.id === '076');
const proj = geoMercator().fitExtent([[150, 110], [1000, 980]], br);
const SP = 13;
const rnd = (s) => { const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const mapa = [];
for (let y = 60; y < 1040; y += SP)
  for (let x = 100; x < 1060; x += SP) {
    const ll = proj.invert([x, y]);
    if (geoContains(br, ll)) mapa.push([x, y]);
  }
const metros = [
  [-46.63, -23.55, 1], [-43.2, -22.9, 1], [-48.5, -1.45, 0.8], [-60.02, -3.1, 0.7], [-38.5, -12.97, 0.65], [-34.9, -8.05, 0.65],
  [-38.54, -3.73, 0.5], [-43.94, -19.92, 0.5], [-47.9, -15.8, 0.35], [-51.2, -30.03, 0.35], [-49.27, -25.43, 0.3],
  [-44.3, -2.53, 0.4], [-49.25, -16.68, 0.3], [-35.73, -9.66, 0.35], [-40.3, -20.3, 0.35],
].map(([lo, la, w]) => ({p: proj([lo, la]), w}));
const favela = [];
mapa.forEach(([x, y], i) => {
  let s = 0;
  for (const m of metros) { const d = Math.hypot(x - m.p[0], y - m.p[1]); s += m.w * Math.exp(-(d * d) / (2 * 34 * 34)); }
  if (rnd(i + 3) < Math.min(0.95, s * 1.25)) favela.push(i);
});
// 10 figuras: cabeça (círculo) + corpo (ombros arredondados), grade de 11 px
const pessoas = []; const dono = [];
const FW = 150, gap = 22, total = 10 * FW + 9 * gap, x0 = (1920 - total) / 2, base = 790;
for (let k = 0; k < 10; k++) {
  const cx = x0 + k * (FW + gap) + FW / 2;
  for (let y = base - 330; y <= base; y += 13)
    for (let x = cx - 80; x <= cx + 80; x += 13) {
      const head = Math.hypot(x - cx, y - (base - 280)) < 44;
      const by = y - (base - 215); // corpo começa 215 px acima da base
      let body = false;
      if (by >= 0) {
        const halfW = by < 40 ? Math.sqrt(Math.max(0, 40 * 40 - (40 - by) ** 2)) * (68 / 40) : 68;
        body = Math.abs(x - cx) <= halfW;
      }
      if (head || body) { pessoas.push([x, y]); dono.push(k); }
    }
}
fs.mkdirSync(new URL('../public/p3/', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('../public/p3/brasil.json', import.meta.url), JSON.stringify({mapa, favela, pessoas, dono, metros: metros.map((m) => m.p.map(Math.round))}));
fs.writeFileSync(new URL('../src/p3/brasil-data.json', import.meta.url), JSON.stringify({mapa, favela, pessoas, dono}));
console.log('mapa', mapa.length, 'favela', favela.length, 'pessoas', pessoas.length);
