"""Troca uma foto provisória pela candidata escolhida.
Uso: python3 trocar_foto.py <slot> <NN> [corte%] [projeto_remotion]
Copia cand/<slot>/NN.jpg → fotos2/<slot>.jpg e → <projeto>/public/fotos/<slot>.jpg (e fonte/public/fotos), registra o crédito em
fotos2/CREDITOS.json e o nome em <projeto>/gen/fotos-trocadas.json. Depois: python3 gen/creditos.py"""
import json, os, sys
from PIL import Image
BASE = os.path.dirname(os.path.abspath(__file__))
slot, nn = sys.argv[1], sys.argv[2]
corte = float(sys.argv[3]) if len(sys.argv) > 3 else 0
proj = sys.argv[4] if len(sys.argv) > 4 else os.environ.get("PROJ", "")
meta = json.load(open(f"{BASE}/fotos2/cand/{slot}/meta.json"))
m = next(x for x in meta if x["file"] == f"{nn}.jpg")
im = Image.open(f"{BASE}/fotos2/cand/{slot}/{nn}.jpg").convert("RGB")
if corte:
    dx, dy = im.width * corte / 100, im.height * corte / 100
    im = im.crop((dx, dy, im.width - dx, im.height - dy))
destinos = [f"{BASE}/fotos2/{slot}.jpg", f"{BASE}/../fonte/public/fotos/{slot}.jpg"] + ([f"{proj}/public/fotos/{slot}.jpg"] if proj else [])
for d in destinos:
    os.makedirs(os.path.dirname(d), exist_ok=True); im.save(d, quality=92)
cp = f"{BASE}/fotos2/CREDITOS.json"
cred = json.load(open(cp))
cred = [x for x in cred if not (x.get("slot") == slot and x.get("file") == f"{slot}.jpg")]
cred.append({"slot": slot, "file": f"{slot}.jpg", "title": m["title"], "page": m["page"], "author": m["author"], "license": m["license"],
             "license_url": m.get("license_url", ""), "date": m.get("date", "")})
json.dump(cred, open(cp, "w"), ensure_ascii=False, indent=1)
for tp in [f"{BASE}/../fonte/gen/fotos-trocadas.json"] + ([f"{proj}/gen/fotos-trocadas.json"] if proj else []):
    try: t = json.load(open(tp))
    except Exception: t = []
    if slot not in t: t.append(slot)
    json.dump(t, open(tp, "w"), ensure_ascii=False, indent=1)
print("trocada:", slot, m["title"], m["license"])
