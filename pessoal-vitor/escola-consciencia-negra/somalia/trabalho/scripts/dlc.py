import json,urllib.request,os,time,sys
sel=json.load(open(sys.argv[1])); pre=sys.argv[2]
UA={'User-Agent':'EscolaBusca/1.0 (school project)'}
def tr(f,r):
    n=f.split('/')[-1]; return f.replace('/commons/','/commons/transcoded/',1)+'/'+n+f'.{r}p.vp9.webm'
for k,x in enumerate(sel):
    fn=f'raw/{pre}_{k:02d}.webm'
    if os.path.exists(fn) and os.path.getsize(fn)>10000: continue
    h=x.get('h') or 480
    urls=[tr(x['file'],r) for r in ([720] if h>=720 else [])+[480,360]]+[x['file']]
    ok=False
    for u in urls:
        try:
            data=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=300).read()
            open(fn,'wb').write(data); ok=u.split('.')[-3] if 'transcoded' in u else 'orig'; break
        except urllib.error.HTTPError as e:
            print(' ',e.code,u[-40:],flush=True)
            if e.code==429: time.sleep(30)
    print(k,ok,x['id'][5:60],flush=True); time.sleep(4)
