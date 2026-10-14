// Renderiza html/Kxx.html -> quadros/Kxx.png (1080x1920). Precisa de playwright num node_modules
// (ex.: scratch com npm i playwright). Uso: node render.mjs <pasta storyboard> [K01 K02 ...]
import {chromium} from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const dir=process.argv[2]; const so=process.argv.slice(3);
fs.mkdirSync(path.join(dir,'quadros'),{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROME||'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1080,height:1920}});
for (const f of fs.readdirSync(path.join(dir,'html')).sort()){
  const id=f.replace('.html',''); if(so.length&&!so.includes(id)) continue;
  await p.goto('file://'+path.join(dir,'html',f)); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(150);
  await p.screenshot({path:path.join(dir,'quadros',id+'.png')});
}
await b.close();
