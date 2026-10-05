import fs from 'fs';
const src = fs.readFileSync('src/logoData.ts','utf8');
const get = (name) => { const m = src.match(new RegExp(name+"\\s*[:=]\\s*'([^']+)'")); return m && m[1]; };
const T = "translate(-40,-40) scale(0.25) translate(0,3460) scale(0.1,-0.1)";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="-60 -60 900 900"><rect x="-60" y="-60" width="900" height="900" fill="#eee"/>
<path d="${get('cool')}" transform="${T}" fill="#3DCBEE" fill-opacity="0.8"/>
<path d="${get('warm')}" transform="${T}" fill="#EC5F78" fill-opacity="0.8"/>
<path d="${get('purple')}" transform="${T}" fill="#6A10D8" fill-opacity="0.6"/>
<path d="${get('SQUIRCLE')}" fill="none" stroke="#000" stroke-width="2"/>
</svg>`;
fs.writeFileSync('/tmp/claude-0/-home-user/dbcde345-8f4b-529d-8cdb-8b388ee59a12/scratchpad/ribs.svg', svg);
