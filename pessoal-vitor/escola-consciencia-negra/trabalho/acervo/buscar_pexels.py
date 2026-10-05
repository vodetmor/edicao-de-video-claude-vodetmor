"""Busca fotos (e vídeos, com --video) no Pexels por vaga. Chave: PEXELS_API_KEY em escola-consciencia-negra/edicao/.env (nunca imprimir).
Fotos → fotos2/cand/<slot>/NN.jpg + meta.json + _folha.jpg (mesmo formato do buscar_fotos.py, então trocar_foto.py funciona).
Vídeos → videos/cand/<slot>/NN.mp4 + meta.json.  Uso: python3 buscar_pexels.py [--video] slot "consulta" [slot "consulta" ...]"""
import json, os, sys, io, urllib.parse, urllib.request
from PIL import Image, ImageDraw
BASE = os.path.dirname(os.path.abspath(__file__))
KEY = next(l.split("=", 1)[1].strip() for l in open(f"{BASE}/../../edicao/.env") if l.startswith("PEXELS_API_KEY="))
def get(url, raw=False):
    req = urllib.request.Request(url, headers={"Authorization": KEY, "User-Agent": "EscolaRacismoAmbiental/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read() if raw else json.load(r)
video = "--video" in sys.argv
args = [a for a in sys.argv[1:] if a != "--video"]
for slot, q in zip(args[::2], args[1::2]):
    if video:
        d = f"{BASE}/videos/cand/{slot}"; os.makedirs(d, exist_ok=True)
        r = get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "per_page": 8, "orientation": "landscape", "size": "medium"}))
        meta = []
        for v in r.get("videos", [])[:5]:
            fs = sorted([x for x in v["video_files"] if x.get("width") and x["width"] <= 1920 and x.get("file_type") == "video/mp4"], key=lambda x: -x["width"])
            if not fs: continue
            fn = f"{len(meta):02d}.mp4"; open(f"{d}/{fn}", "wb").write(get(fs[0]["link"], raw=True))
            meta.append({"file": fn, "title": v.get("url"), "page": v.get("url"), "author": v["user"]["name"], "license": "Licença Pexels",
                         "w": fs[0]["width"], "dur": v.get("duration"), "query": q, "thumb": v.get("image")})
        json.dump(meta, open(f"{d}/meta.json", "w"), ensure_ascii=False, indent=1)
        print(slot, len(meta), "vídeos", flush=True); continue
    d = f"{BASE}/fotos2/cand/{slot}"; os.makedirs(d, exist_ok=True)
    r = get("https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "per_page": 12, "orientation": "landscape", "size": "large"}))
    meta = []
    for p in r.get("photos", [])[:6]:
        im = Image.open(io.BytesIO(get(p["src"]["large2x"], raw=True))).convert("RGB"); im.thumbnail((2560, 2560))
        fn = f"{len(meta):02d}.jpg"; im.save(f"{d}/{fn}", quality=90)
        meta.append({"file": fn, "title": "Pexels: " + (p.get("alt") or q), "page": p["url"], "author": p["photographer"], "license": "Licença Pexels",
                     "license_url": "https://www.pexels.com/license/", "query": q, "width": im.width, "height": im.height})
    json.dump(meta, open(f"{d}/meta.json", "w"), ensure_ascii=False, indent=1)
    if meta:
        w, h = 480, 300; sheet = Image.new("RGB", (w * 3, h * ((len(meta) + 2) // 3)), "black")
        for i, m in enumerate(meta):
            im = Image.open(f"{d}/{m['file']}"); im.thumbnail((w, h - 20)); sheet.paste(im, ((i % 3) * w, (i // 3) * h))
            ImageDraw.Draw(sheet).text(((i % 3) * w + 4, (i // 3) * h + h - 18), f"{m['file']} {m['title'][:50]}", fill="yellow")
        sheet.save(f"{d}/_folha.jpg", quality=80)
    print(slot, len(meta), flush=True)
