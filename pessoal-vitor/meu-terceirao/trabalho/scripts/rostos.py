"""Acha os rostos de cada foto do acervo e gera as miniaturas da cena final.

Por quê: o enquadramento automático centralizava no meio da foto (pegava o chapéu, não o rosto).
Com o ponto do rosto, o motor enquadra e dá zoom no rosto sem cortar o que está acima (chapéu).

Lê   : estudio/motor/public/final/p/<id>.jpg
Grava: estudio/motor/src/obras/terceirao/rostos.json   {id: {x, y, topo, n}}  (0..1; x,y = centro dos rostos; topo = topo do rosto mais alto)
       estudio/motor/public/final/t/<id>.jpg           (miniatura 480x360 centrada no rosto, para a cena do "3")
Modelo: YuNet (OpenCV Zoo), baixado uma vez para trabalho/modelos/.
Rodar: python trabalho/scripts/rostos.py
"""
import json
import os
import urllib.request

import cv2

BASE = "C:/dev/maquina-de-editar"
P = f"{BASE}/estudio/motor/public/final/p"
T = f"{BASE}/estudio/motor/public/final/t"
SAIDA = f"{BASE}/estudio/motor/src/obras/terceirao/rostos.json"
MOD_DIR = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/modelos"
MOD = f"{MOD_DIR}/face_detection_yunet_2023mar.onnx"
URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"

os.makedirs(T, exist_ok=True)
os.makedirs(MOD_DIR, exist_ok=True)
if not os.path.exists(MOD) or os.path.getsize(MOD) < 100000:
    urllib.request.urlretrieve(URL, MOD)

det = cv2.FaceDetectorYN.create(MOD, "", (320, 320), 0.6, 0.3, 50)
out = {}
sem = []
for f in sorted(os.listdir(P)):
    if not f.endswith(".jpg"):
        continue
    id_ = f[:-4]
    im = cv2.imread(f"{P}/{f}")
    h, w = im.shape[:2]
    k = 960 / max(w, h)
    pq = cv2.resize(im, (round(w * k), round(h * k)))
    det.setInputSize((pq.shape[1], pq.shape[0]))
    _, faces = det.detect(pq)
    if faces is not None and len(faces):
        fs = [(float(x) / k, float(y) / k, float(fw) / k, float(fh) / k) for x, y, fw, fh, *_ in faces]
        maior = max(a[2] * a[3] for a in fs)
        fs = [a for a in fs if a[2] * a[3] >= 0.25 * maior]  # ignora rostinhos de fundo
        peso = sum(a[2] * a[3] for a in fs)
        cx = sum((a[0] + a[2] / 2) * a[2] * a[3] for a in fs) / peso / w
        cy = sum((a[1] + a[3] / 2) * a[2] * a[3] for a in fs) / peso / h
        topo = min(a[1] for a in fs) / h
        out[id_] = {"x": round(min(1, max(0, cx)), 3), "y": round(min(1, max(0, cy)), 3), "topo": round(max(0, topo), 3), "n": len(fs)}
    else:
        sem.append(id_)
        out[id_] = {"x": 0.5, "y": 0.42, "topo": 0.3, "n": 0}
    # miniatura 4:3 centrada no rosto
    r = out[id_]
    alvo = 4 / 3
    if w / h > alvo:
        ch_, cw_ = h, round(h * alvo)
    else:
        cw_, ch_ = w, round(w / alvo)
    x0 = int(min(max(0, r["x"] * w - cw_ / 2), w - cw_))
    y0 = int(min(max(0, r["y"] * h - ch_ * 0.45), h - ch_))
    mini = cv2.resize(im[y0:y0 + ch_, x0:x0 + cw_], (480, 360), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{T}/{id_}.jpg", mini, [cv2.IMWRITE_JPEG_QUALITY, 86])

json.dump(out, open(SAIDA, "w", encoding="utf8"), indent=0)
print("fotos", len(out), "| sem rosto detectado", len(sem), sem)
