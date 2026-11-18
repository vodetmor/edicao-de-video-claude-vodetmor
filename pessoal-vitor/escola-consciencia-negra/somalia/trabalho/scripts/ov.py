import json,sys,urllib.request,urllib.parse,time
out=[]
for q in sys.argv[2:]:
    u='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({'q':q,'page_size':20,'license_type':'all-cc'})
    try: d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'EscolaBusca/1.0'}),timeout=40))
    except Exception as e: print(q,e);continue
    for r in d['results']:
        out.append(dict(q=q,id=r['id'],url=r['foreign_landing_url'],file=r['url'],thumb=r.get('thumbnail'),w=r.get('width'),h=r.get('height'),lic=(r['license']+' '+(r.get('license_version') or '')).upper(),autor=r.get('creator'),titulo=r.get('title'),fonte=r.get('source')))
    time.sleep(1)
json.dump(out,open(sys.argv[1],'w'),indent=1);print(len(out))
