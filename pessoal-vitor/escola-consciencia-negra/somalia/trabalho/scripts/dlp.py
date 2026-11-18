import json,urllib.request,os,sys,concurrent.futures as cf
sel=json.load(open(sys.argv[1]))
def dl(x):
    fn=f"raw/px_{x['id']}.mp4"
    if not os.path.exists(fn) and x['file']:
        r=urllib.request.Request(x['file'],headers={'User-Agent':'Mozilla/5.0'})
        open(fn,'wb').write(urllib.request.urlopen(r,timeout=300).read())
    return fn
with cf.ThreadPoolExecutor(6) as ex:
    for r in ex.map(dl,sel): print(r,flush=True)
