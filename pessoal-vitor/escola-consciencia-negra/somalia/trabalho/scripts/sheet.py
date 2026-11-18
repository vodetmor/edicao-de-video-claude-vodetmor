import json,sys,io,urllib.request,concurrent.futures as cf
from PIL import Image,ImageDraw,ImageFont
items=json.load(open(sys.argv[1])); out=sys.argv[2]
seen=set(); its=[]
for i,x in enumerate(items):
    if x['id'] in seen: continue
    seen.add(x['id']); x['i']=i; its.append(x)
W,H=240,135
def th(x):
    try:
        r=urllib.request.Request(x['thumb'],headers={'User-Agent':'EscolaBusca/1.0'})
        im=Image.open(io.BytesIO(urllib.request.urlopen(r,timeout=30).read())).convert('RGB')
        im.thumbnail((W,H)); return im
    except Exception as e: return Image.new('RGB',(W,H),'gray')
with cf.ThreadPoolExecutor(6) as ex: ims=list(ex.map(th,its))
cols=8; rows=(len(its)+cols-1)//cols
S=Image.new('RGB',(cols*W,rows*(H+28)),'white'); d=ImageDraw.Draw(S)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11)
for k,(x,im) in enumerate(zip(its,ims)):
    c,r=k%cols,k//cols; S.paste(im,(c*W,r*(H+28)))
    d.text((c*W+2,r*(H+28)+H+1),f"{x['i']} {x.get('dur','')}s {x['q'][:22]}",fill='black',font=f)
    d.text((c*W+2,r*(H+28)+H+14),str((x.get('lic') or '')[:10]+' '+str(x.get('autor','')))[:34],fill='gray',font=f)
S.save(out,quality=80); print(len(its),S.size)
