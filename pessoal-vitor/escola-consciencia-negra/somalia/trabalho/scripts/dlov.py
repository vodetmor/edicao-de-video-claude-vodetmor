import json,urllib.request,os,re,sys,concurrent.futures as cf,io
from PIL import Image
d=json.load(open('cand/ov2.json')); M='/mnt/project-files/escola-consciencia-negra/somalia/midia'
cats={'triste':[27,28,29,30,31,34,36,37,80,81,82,83,84,85,87,88,89,90,12,139,136,192,194,191,199,202],
'bonito':[0,1,2,3,4,5,6,8,9,10,25,26,35,40,42,43,45,48,49,56,64,62,115,118,119,121,125,127,143,144,154,156,155,158,166,170,168,164,174,175,178],
'mapas-historia':[33,137,177,183]}
jobs=[(c,d[i]) for c,l in cats.items() for i in l]
def go(j):
    c,x=j; os.makedirs(f'{M}/{c}/fotos',exist_ok=True)
    t=re.sub(r'[^a-z0-9]+','-',(x.get('titulo') or 'foto').lower())[:45].strip('-')
    out=f'{M}/{c}/fotos/ov-{t}-{x["id"][:6]}.jpg'
    r=urllib.request.Request(f"https://api.openverse.org/v1/images/{x['id']}/thumb/?full_size=true",headers={'User-Agent':'EscolaBusca/1.0'})
    try:
        im=Image.open(io.BytesIO(urllib.request.urlopen(r,timeout=60).read())).convert('RGB')
        im.thumbnail((1920,1920)); im.save(out,quality=86)
        x['arquivo']=out.replace(M+'/',''); x['cat']=c; x['px']=im.size; return x
    except Exception as e: print('ERR',x['id'],e); return None
with cf.ThreadPoolExecutor(4) as ex: res=[r for r in ex.map(go,jobs) if r]
json.dump(res,open('cand/ov_done.json','w'),indent=1); print(len(res)); import collections; print(collections.Counter(tuple(r['px']) for r in res).most_common(5))
