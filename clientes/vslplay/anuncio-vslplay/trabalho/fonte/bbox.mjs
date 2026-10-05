import {getBoundingBox} from '@remotion/paths';
import fs from 'fs';
const src = fs.readFileSync('src/logoData.ts','utf8');
const get = (name) => { const m = src.match(new RegExp(name+"\\s*[:=]\\s*'([^']+)'")); return m && m[1]; };
for (const k of ['cool','warm','purple']) {
  const d = get(k);
  const b = getBoundingBox(d);
  // RIBBON_TRANSFORM: translate(-40,-40) scale(0.25) translate(0,3460) scale(0.1,-0.1)
  const tx = (x)=> -40 + 0.25*(0 + 0.1*x);
  const ty = (y)=> -40 + 0.25*(3460 - 0.1*y);
  console.log(k, 'x', tx(b.x1).toFixed(1), tx(b.x2).toFixed(1), 'y', ty(b.y2).toFixed(1), ty(b.y1).toFixed(1));
}
