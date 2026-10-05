// Terra (110m) + Brasil + EUA contíguo em GeoJSON para o globo da parte 2.  node gen/mundo.mjs → src/p2/mundo.json
import fs from 'node:fs';
import {feature} from 'topojson-client';
const land = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)));
const ct = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/countries-110m.json', import.meta.url)));
const paises = feature(ct, ct.objects.countries).features;
const r = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)));
const us = paises.find((f) => f.id === '840');
us.geometry.coordinates = us.geometry.coordinates.filter((p) => p[0].every(([x, y]) => x > -126 && x < -66 && y > 24 && y < 50));
fs.writeFileSync(new URL('../src/p2/mundo.json', import.meta.url), JSON.stringify(r({
  land: feature(land, land.objects.land), br: paises.find((f) => f.id === '076'), us,
})));
console.log('ok', fs.statSync(new URL('../src/p2/mundo.json', import.meta.url)).size);
