// Gera src/data/africa.json a partir do Natural Earth (domínio público).
// Uso: node scripts/prep-geo.mjs <pasta-com-geojson>
import fs from 'fs';
import {geoNaturalEarth1, geoPath, geoArea, geoCentroid} from 'd3-geo';
import {topology} from 'topojson-server';
import {merge, feature} from 'topojson-client';
import polylabel from 'polylabel';
const G = process.argv[2];
const W = 1920, H = 1080;
const a0 = JSON.parse(fs.readFileSync(`${G}/ne_50m_admin_0_countries.geojson`));
const a1 = JSON.parse(fs.readFileSync(`${G}/ne_10m_admin_1_states_provinces.geojson`));
const extra = ['Cabo Verde','Mauritius','Seychelles','Comoros','São Tomé and Principe','Madagascar'];
let af = a0.features.filter(f => f.properties.CONTINENT === 'Africa' || extra.includes(f.properties.ADMIN));
const proj = geoNaturalEarth1().rotate([-17, 0]);
// enquadra o continente (sem as ilhas distantes) com folga
const core = {type:'FeatureCollection', features: af.filter(f=>!['Cabo Verde','Mauritius','Seychelles'].includes(f.properties.ADMIN))};
proj.fitExtent([[W/2-470, 70],[W/2+470, H-70]], core);
const path = geoPath(proj);
const r1 = n => Math.round(n*10)/10;
const simp = d => d.replace(/(\d+\.\d)\d+/g,'$1');
// Somalilândia: entra na Somália (54 países da ONU), mas guarda o desenho próprio para o mapa colonial
const sl = af.find(f=>f.properties.ADMIN==='Somaliland');
const topo = topology({c: {type:'FeatureCollection', features: af}}, 1e5);
const somIdx = af.findIndex(f=>f.properties.ADMIN==='Somalia');
const slIdx = af.indexOf(sl);
const somaliaFull = merge(topo, [topo.objects.c.geometries[somIdx], topo.objects.c.geometries[slIdx]]);
const outline = merge(topo, topo.objects.c.geometries);
const countries = [];
af.forEach((f,i) => {
  const p = f.properties; if (p.ADMIN === 'Somaliland') return;
  const geom = p.ADMIN === 'Somalia' ? somaliaFull : f.geometry;
  const ff = {type:'Feature', geometry: geom};
  const [[x0,y0],[x1,y1]] = path.bounds(ff);
  // maior polígono -> polo de inacessibilidade (centro "visual")
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let best = null, ba = -1;
  for (const pc of polys) { const a = geoArea({type:'Polygon', coordinates: pc}); if (a > ba) { ba = a; best = pc; } }
  const pr = best.map(r => r.map(c => proj(c)));
  const pl = polylabel(pr, 0.5);
  const iso = p.ADMIN === 'Western Sahara' ? null : p.ISO_A2_EH.toLowerCase();
  const [lon, lat] = geoCentroid(ff);
  countries.push({ name: p.ADMIN, iso, d: simp(path(ff)), bbox: [r1(x0),r1(y0),r1(x1),r1(y1)],
    label: [r1(pl[0]), r1(pl[1])], inR: r1(pl.distance), area: r1((x1-x0)*(y1-y0)), lon: r1(lon), lat: r1(lat) });
});
// regiões somalis repartidas na partilha (5 pontas da estrela)
const adm1 = (adm, names) => merge(topology({c:{type:'FeatureCollection',features:a1.features.filter(f=>f.properties.adm0_a3===adm && names.includes(f.properties.name))}},1e5), topology({c:{type:'FeatureCollection',features:a1.features.filter(f=>f.properties.adm0_a3===adm && names.includes(f.properties.name))}},1e5).objects.c.geometries);
const somali = {
  britanica: {type:'Feature', geometry: sl.geometry},
  italiana: af.find(f=>f.properties.ADMIN==='Somalia'),
  francesa: af.find(f=>f.properties.ADMIN==='Djibouti'),
  etiope: {type:'Feature', geometry: adm1('ETH', ['Somali'])},
  queniana: {type:'Feature', geometry: adm1('KEN', ['North-Eastern'])},
};
const regions = Object.fromEntries(Object.entries(somali).map(([k,f]) => [k, {d: simp(path(f)), c: path.centroid(f).map(r1), bbox: path.bounds(f).flat().map(r1)}]));
const out = { W, H, outline: simp(path(outline)), somalia: simp(path(somaliaFull)), countries, regions,
  proj: { rotate: proj.rotate(), scale: proj.scale(), translate: proj.translate() } };
fs.mkdirSync('src/data', {recursive: true});
fs.writeFileSync('src/data/africa.json', JSON.stringify(out));
console.log(countries.length, 'países', countries.filter(c=>c.iso).length, 'com bandeira', (JSON.stringify(out).length/1024).toFixed(0)+' KB');
console.log('ETH somali', a1.features.filter(f=>f.properties.adm0_a3==='ETH').map(f=>f.properties.name).join(','));
console.log('KEN', a1.features.filter(f=>f.properties.adm0_a3==='KEN').map(f=>f.properties.name).slice(0,60).join(','));
