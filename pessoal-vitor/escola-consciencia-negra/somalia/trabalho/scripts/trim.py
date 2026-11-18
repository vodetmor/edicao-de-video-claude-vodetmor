import json,subprocess,os,sys,re,concurrent.futures as cf
sel=json.load(open(sys.argv[1])); M='/mnt/project-files/escola-consciencia-negra/somalia/midia'
def slug(x): return re.sub(r'-\d+/?$','',x['url'].rstrip('/').split('/')[-1])[:50] or str(x['id'])
def go(x):
    src=f"raw/px_{x['id']}.mp4"; d=x['dur']; L=min(8,d); ss=max(0,(d-L)/2) if d>12 else 0
    os.makedirs(f"{M}/{x['cat']}/videos",exist_ok=True)
    out=f"{M}/{x['cat']}/videos/px-{slug(x)}-{x['id']}.mp4"
    tmp=f"tmp_{x['id']}.mp4"
    subprocess.run(['ffmpeg','-y','-v','error','-ss',str(ss),'-i',src,'-t',str(L),'-an','-vf','scale=-2:720,fps=30','-c:v','libx264','-crf','29','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',tmp],check=True)
    os.replace(tmp,out) if False else subprocess.run(['cp',tmp,out]); os.remove(tmp)
    x['arquivo']=out.replace(M+'/',''); x['corte']=f"{ss:.1f}-{ss+L:.1f}s"
    return x
with cf.ThreadPoolExecutor(4) as ex: res=list(ex.map(go,sel))
json.dump(res,open(sys.argv[2],'w'),indent=1)
