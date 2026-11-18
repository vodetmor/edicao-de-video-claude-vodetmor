import json,os,sys,urllib.request,urllib.parse
key=[l.split('=',1)[1].strip() for l in open('/mnt/project-files/escola-consciencia-negra/edicao/.env') if l.startswith('PEXELS_API_KEY=')][0]
def get(u):
    r=urllib.request.Request(u,headers={'Authorization':key,'User-Agent':'busca/1.0'})
    return json.load(urllib.request.urlopen(r,timeout=30))
out=[]
for q in sys.argv[2:]:
    d=get('https://api.pexels.com/videos/search?'+urllib.parse.urlencode({'query':q,'per_page':15,'orientation':'landscape'}))
    for v in d['videos']:
        f=[x for x in v['video_files'] if x.get('height') and x['height']<=720 and x['height']>=540]
        f=sorted(f,key=lambda x:-x['height'])
        out.append(dict(q=q,id=v['id'],url=v['url'],dur=v['duration'],autor=v['user']['name'],thumb=v['image'],file=f[0]['link'] if f else None,h=f[0]['height'] if f else None))
json.dump(out,open(sys.argv[1],'w'),indent=1)
print(len(out))
