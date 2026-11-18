import json,urllib.request,os,re,time,io
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
d=json.load(open('cand/cm_map.json')); M='/mnt/project-files/escola-consciencia-negra/somalia/midia/mapas-historia/mapas'
os.makedirs(M,exist_ok=True)
picks={8:'somalia-italiana-1900',9:'chifre-da-africa-partilha-1900',121:'somalia-reinos-somalis-e-partilha',12:'grande-somalia',31:'protetorado-britanico-1906',36:'somalilandia-paget-1893',76:'africa-1913',78:'africa-colonial-1912',95:'partilha-da-africa-1880-1913',130:'africa-antes-de-berlim',131:'africa-depois-de-berlim',128:'possessoes-europeias-1884',137:'charge-leopoldo-conferencia-berlim',142:'conferencia-de-berlim-1884',151:'tamanho-real-da-africa',109:'africa-recortada-possessoes-europeias',68:'somalia-francesa-1931',34:'somalia-britanica-mapa',10:'ocupacao-italiana-etapas',257:'chifre-da-africa-1898',268:'ogaden-1898',197:'somalia-relevo-cia-1992',222:'somalia-seca-e-deslocamento-2016-2017',212:'seca-out2022-jan2023',201:'chifre-da-africa-seca-2017',277:'bandeira-somalia-cgi',293:'bandeira-bantu-somali',196:'somalia-relevo-localizacao'}
UA={'User-Agent':'EscolaBusca/1.0 (school project)'}
res=json.load(open('cand/map_done.json')) if os.path.exists('cand/map_done.json') else []
done={r['nome'] for r in res}
for i,nm in picks.items():
    if nm in done: continue
    x=d[i]; f=x['file']; w=x['w'] or 0
    base=f.split('/commons/')[1]; fn=f.split('/')[-1]
    urls=[]
    for W in [1920,1280,960,500]:
        if w>W: urls.append(f'https://upload.wikimedia.org/wikipedia/commons/thumb/{base}/{W}px-{fn}'+('.jpg' if fn.lower().endswith(('.tif','.svg')) else '').replace('.svg.jpg','.svg.png')); break
    urls.append(f)
    for u in urls:
        try:
            b=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read()
            im=Image.open(io.BytesIO(b)); im.thumbnail((2400,2400))
            ext='png' if im.mode in('RGBA','P','LA') or fn.lower().endswith('.png') else 'jpg'
            out=f'{M}/{nm}.{ext}'
            (im.save(out,optimize=True) if ext=='png' else im.convert('RGB').save(out,quality=88))
            x['arquivo']='mapas-historia/mapas/'+os.path.basename(out); x['nome']=nm; res.append(x); print('ok',nm,im.size,os.path.getsize(out)//1000,'KB',flush=True); break
        except Exception as e:
            print('  err',nm,str(e)[:60],flush=True); time.sleep(8)
    time.sleep(6)
json.dump(res,open('cand/map_done.json','w'),indent=1)
