// Gera src/data/mundo.json: mapa-múndi (Natural Earth 110m) centrado no Atlântico, para a ligação África-Brasil.
import fs from 'fs';
import {geoNaturalEarth1, geoPath, geoInterpolate} from 'd3-geo';
const G = process.argv[2];
const w = JSON.parse(fs.readFileSync(`${G}/ne_110m_admin_0_countries.geojson`));
const proj = geoNaturalEarth1().rotate([0, 0]).center([0, 0]);
const foco = {type: 'FeatureCollection', features: w.features.filter(f => ['South America', 'Africa'].includes(f.properties.CONTINENT))};
proj.fitExtent([[260, 90], [1660, 990]], foco);
const path = geoPath(proj);
const simp = d => (d || '').replace(/(\d+\.\d)\d+/g, '$1');
const paises = w.features.filter(f => f.properties.CONTINENT !== 'Antarctica').map(f => ({iso: f.properties.ISO_A3_EH, cont: f.properties.CONTINENT, d: simp(path(f))}));
const A = [45.3, 5.5], B = [-47.9, -15.8]; // Mogadíscio aprox. / Brasília
const interp = geoInterpolate(A, B);
const arco = Array.from({length: 80}, (_, i) => proj(interp(i / 79)).map(v => Math.round(v * 10) / 10));
fs.writeFileSync('src/data/mundo.json', JSON.stringify({paises, arco, somalia: proj(A), brasil: proj(B)}));
console.log('ok', paises.length);
