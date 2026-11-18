import json,sys,urllib.request,urllib.parse,time
UA={'User-Agent':'EscolaBusca/1.0 (school project)'}
def api(p):
    p.update(format='json')
    for t in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(p),headers=UA),timeout=40))
        except Exception as e: time.sleep(3+t*3)
    return {}
out=[];mode=sys.argv[2]
for q in sys.argv[3:]:
    s=q+(' filetype:video' if mode=='video' else ' filetype:bitmap')
    d=api(dict(action='query',generator='search',gsrsearch=s,gsrnamespace=6,gsrlimit=25,prop='imageinfo',iiprop='url|size|extmetadata|mediatype',iiurlwidth=320))
    for pg in d.get('query',{}).get('pages',{}).values():
        ii=pg['imageinfo'][0];m=ii.get('extmetadata',{})
        g=lambda k:(m.get(k,{}).get('value') or '')
        out.append(dict(q=q,id=pg['title'],url=ii['descriptionurl'],file=ii['url'].split('?')[0],thumb=(ii.get('thumburl') or '').split('?')[0],w=ii.get('width'),h=ii.get('height'),dur=round(ii.get('duration') or 0),size=ii.get('size'),lic=g('LicenseShortName'),autor=g('Artist')[:200],data=g('DateTimeOriginal')[:40],desc=g('ImageDescription')[:300]))
    time.sleep(1)
json.dump(out,open(sys.argv[1],'w'),indent=1);print(len(out))
