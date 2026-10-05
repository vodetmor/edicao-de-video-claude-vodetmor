// Contorno dos EUA (48 estados contíguos) + ponto de Warren County (NC) para a parte 2.  node gen/eua.mjs → src/p2/eua.json
import fs from 'node:fs';
import {feature} from 'topojson-client';
import {geoAlbers, geoPath} from 'd3-geo';
const topo = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const us = feature(topo, topo.objects.countries).features.find((f) => f.id === '840');
// só o território contíguo: descarta polígonos fora da caixa (Alasca, Havaí, ilhas)
const polys = us.geometry.coordinates.filter((p) => p[0].every(([x, y]) => x > -126 && x < -66 && y > 24 && y < 50));
const cont = {type: 'Feature', geometry: {type: 'MultiPolygon', coordinates: polys}};
const proj = geoAlbers().fitExtent([[60, 60], [900, 560]], cont);
const d = geoPath(proj)(cont);
const pin = proj([-78.16, 36.4]);
fs.writeFileSync(new URL('../src/p2/eua.json', import.meta.url), JSON.stringify({d, pin: pin.map((v) => Math.round(v))}));
console.log('eua', d.length, pin);
