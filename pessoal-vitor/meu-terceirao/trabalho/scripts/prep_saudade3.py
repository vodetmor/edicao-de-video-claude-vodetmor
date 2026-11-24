"""Prepara os materiais da Aula da Saudade V3 (álbum folheado em 3D) -> estudio/motor/public/saudade/v3/
- kraft.jpg  : papel kraft real (Pexels #1, livre), 2048 px, tom medido na referência da capa
- preta.jpg  : página preta de álbum antigo (cartolina: fibra fina, sem amassado), gerada a partir do kraft #3 escurecido
- marfim.jpg : página clara de hoje (o mesmo fibrado, clareado e quase sem cor)
- posters/<id>.jpg : quadro do vídeo no ponto de início (vira a foto na página antes de a câmera entrar no vídeo)
Rodar: python -I trabalho/scripts/prep_saudade3.py
"""
import json
import os
import subprocess

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

BASE = "C:/dev/maquina-de-editar"
REF = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/referencias/papel/v3-kraft-paper-texture"
OUT = f"{BASE}/estudio/motor/public/saudade/v3"
os.makedirs(f"{OUT}/posters", exist_ok=True)

kraft = Image.open(f"{REF}/01-pexels-detailed-texture-of-a-brown-ca.jpeg").convert("RGB")
kraft = ImageOps.fit(kraft, (2048, 1536))
kraft.save(f"{OUT}/kraft.jpg", quality=90)

fibra = ImageOps.fit(Image.open(f"{REF}/03-pexels-close-up-of-brown-recycled-pap.jpeg").convert("L"), (2048, 1536))
f = np.asarray(fibra).astype("float32")
f = (f - f.mean()) / (f.std() + 1e-6)  # só o relevo da fibra

preta = np.stack([np.full_like(f, c) for c in (30, 26, 24)], -1) + f[..., None] * 6.5
Image.fromarray(np.clip(preta, 0, 255).astype("uint8")).save(f"{OUT}/preta.jpg", quality=92)

marfim = np.stack([np.full_like(f, c) for c in (236, 228, 212)], -1) + f[..., None] * 5.0
Image.fromarray(np.clip(marfim, 0, 255).astype("uint8")).save(f"{OUT}/marfim.jpg", quality=92)

# pôsteres dos vídeos (quadro no início usado)
ac = json.load(open(f"{BASE}/estudio/motor/src/obras/terceirao/acervo.json", encoding="utf8"))
for v in ac["videos"]:
    dst = f"{OUT}/posters/{v['id']}.jpg"
    if os.path.exists(dst):
        continue
    src = f"{BASE}/estudio/motor/public/final/v/{v['id']}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(v.get("ini", 0) + 0.3), "-i", src, "-frames:v", "1", "-q:v", "3", dst])
print("ok", len(os.listdir(f"{OUT}/posters")), "pôsteres")
