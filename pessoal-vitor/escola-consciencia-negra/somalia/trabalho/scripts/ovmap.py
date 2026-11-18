import json,urllib.request,urllib.parse,io,os,re,time,sys
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
M='/mnt/project-files/escola-consciencia-negra/somalia/midia/mapas-historia/mapas'
UA={'User-Agent':'EscolaBusca/1.0'}
d=json.load(open('cand/cm_map.json')); src=open('bin/dlmap.py').read()
picks=eval(re.search(r'picks=(\{.*?\})\n',src,re.S).group(1))
res=json.load(open('cand/map_done.json')); done={r['nome'] for r in res}
for i,nm in picks.items():
    if nm in done: continue
    x=d[i]; title=x['id'][5:].rsplit('.',1)[0]
    q=re.sub(r'[^A-Za-z0-9 ]',' ',title)[:80]
    try:
        r=json.load(urllib.request.urlopen(urllib.request.Request('https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'source':'wikimedia','page_size':10}),headers=UA),timeout=60))
    except Exception as e: print('serr',nm,e); time.sleep(3); continue
    hit=None
    want=urllib.parse.unquote(x['file'].split('/')[-1]).lower()
    for it in r['results']:
        if urllib.parse.unquote(it['url'].split('/')[-1]).lower()==want or (it.get('title') or '').lower()==title.lower(): hit=it;break
    if not hit: print('nohit',nm,q,[it.get('title') for it in r['results'][:3]]); continue
    try:
        b=urllib.request.urlopen(urllib.request.Request(f"https://api.openverse.org/v1/images/{hit['id']}/thumb/?full_size=true&compressed=false",headers=UA),timeout=90).read()
        im=Image.open(io.BytesIO(b)); out=f'{M}/{nm}.jpg'; im.convert('RGB').save(out,quality=90)
        x['arquivo']='mapas-historia/mapas/'+nm+'.jpg'; x['nome']=nm; res.append(x); print('ok',nm,im.size,flush=True)
    except Exception as e: print('derr',nm,e)
    time.sleep(1.5)
json.dump(res,open('cand/map_done.json','w'),indent=1)
