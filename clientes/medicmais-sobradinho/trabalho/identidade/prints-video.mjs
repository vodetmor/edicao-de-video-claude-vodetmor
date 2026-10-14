// Prints do site para o vídeo: sem a barra fixa (vai sobreposta no vídeo) e com quadros reais dos reels
// nos espaços de vídeo (o próprio site diz que esses links viram <video> com esses reels).
import {chromium} from 'playwright';
const [url,out]=process.argv.slice(2);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const css=`.pend{display:none!important}.float{display:none!important}
.video::before{display:none!important}.video{background:#121216 center/165% auto no-repeat!important;background-position:50% 0!important}
.hero .video{background-image:url(v-tour.jpg)!important}
.vids .video:nth-child(1){background-image:url(v-ana.jpg)!important}
.vids .video:nth-child(2){background-image:url(v-maria.jpg)!important}
.vids .video:nth-child(4){background-image:url(v-familia.jpg)!important}`;
for (const [nome,vp,dpr,mob] of [['celular',{width:390,height:844},3,true],['desktop',{width:1440,height:900},2,false]]){
  const p=await b.newPage({viewport:vp,deviceScaleFactor:dpr,isMobile:mob,hasTouch:mob});
  await p.goto(url,{waitUntil:'networkidle'}); await p.addStyleTag({content:css});
  if(mob) await p.addStyleTag({content:'.bar{display:none!important}'});
  await p.waitForTimeout(500);
  if(mob) await p.screenshot({path:`${out}/celular-pagina.png`,fullPage:true}); else await p.screenshot({path:`${out}/desktop-dobra.png`});
  await p.close();
}
await b.close();
