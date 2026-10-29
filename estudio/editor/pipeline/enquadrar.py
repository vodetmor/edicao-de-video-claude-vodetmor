"""Acompanha o rosto do apresentador quadro a quadro para os estilos recortarem o vídeo sem cortar a cabeça.

Uso: python3 enquadrar.py <projeto> [--entrada base.mp4] [--passo 2]

Detector: YuNet (OpenCV, modelo de 230 KB em pipeline/modelos, roda em qualquer CPU).
Suavização em três camadas, para o recorte andar como um operador de câmera e não tremer:
  1. mediana de 0,3 s tira detecções erradas isoladas;
  2. zona morta: o enquadramento só anda quando o rosto sai de uma folga (3% da largura);
  3. média gaussiana de 0,5 s arredonda o começo e o fim de cada movimento.
Saída: projeto/rosto.json {fps, w, h, n, cx, cy, tam, achou}  (cx, cy = centro do rosto 0..1; tam = altura do rosto / altura do vídeo)
"""
from __future__ import annotations

import argparse

import numpy as np

from comum import MODELOS, Projeto, escrever, sair


def detector(w, h):
    import cv2
    m = MODELOS / "face_detection_yunet_2023mar.onnx"
    if not m.exists():
        sair(f"falta o modelo {m}")
    return cv2.FaceDetectorYN.create(str(m), "", (w, h), 0.6, 0.3, 50)


def mediana(x, k):
    k = max(1, k | 1)
    p = np.pad(x, (k // 2, k // 2), mode="edge")
    return np.array([np.median(p[i:i + k]) for i in range(len(x))])


def gauss(x, sigma):
    if sigma < 0.5:
        return x
    r = int(3 * sigma)
    g = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    g /= g.sum()
    return np.convolve(np.pad(x, (r, r), mode="edge"), g, mode="valid")


def zona_morta(x, dz):
    y, t = np.empty_like(x), x[0]
    for i, v in enumerate(x):
        d = v - t
        if abs(d) > dz:
            t += d - np.sign(d) * dz
        y[i] = t
    return y


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--entrada", default="base.mp4")
    ap.add_argument("--passo", type=int, default=0, help="detectar a cada N quadros (0 = automático)")
    a = ap.parse_args()
    import cv2
    pj = Projeto(a.projeto)
    src = pj.arq(a.entrada)
    if not src.exists():
        sair(f"não achei {src}; rode montar.py antes")
    cap = cv2.VideoCapture(str(src))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    passo = a.passo or (1 if n < 1800 else 2 if n < 9000 else 3)
    esc = 480 / max(W, H)
    dw, dh = int(W * esc), int(H * esc)
    det = detector(dw, dh)
    cx, cy, tam, ok = [np.nan] * n, [np.nan] * n, [np.nan] * n, [False] * n
    i = 0
    while True:
        bom = cap.grab()
        if not bom:
            break
        if i % passo == 0:
            _, fr = cap.retrieve()
            _, faces = det.detect(cv2.resize(fr, (dw, dh)))
            if faces is not None and len(faces):
                # o maior rosto (o apresentador), não alguém no fundo
                x, y, w, h = max(faces, key=lambda f: f[2] * f[3])[:4]
                cx[i], cy[i], tam[i], ok[i] = (x + w / 2) / dw, (y + h / 2) / dh, h / dh, True
        i += 1
    n = i
    cx, cy, tam = (np.array(v[:n], dtype=float) for v in (cx, cy, tam))
    achou = int(sum(ok[:n]))
    if achou == 0:
        sair("nenhum rosto encontrado; os estilos vão usar o centro do quadro (use --passo 1 ou confira a luz)")
    idx = np.arange(n)
    for v in (cx, cy, tam):
        m = ~np.isnan(v)
        v[:] = np.interp(idx, idx[m], v[m])
    k = int(0.3 * fps)
    cx = gauss(zona_morta(mediana(cx, k), 0.03), 0.5 * fps)
    cy = gauss(zona_morta(mediana(cy, k), 0.03 * W / H), 0.5 * fps)
    tam = gauss(mediana(tam, int(fps)), 1.0 * fps)
    escrever(pj.arq("rosto.json"), {"fps": fps, "w": W, "h": H, "n": n, "passo": passo,
                                    "cx": [round(float(v), 4) for v in cx], "cy": [round(float(v), 4) for v in cy],
                                    "tam": [round(float(v), 4) for v in tam], "achou": round(achou * passo / n, 3)})
    print(f"rosto em {100 * achou * passo / n:.0f}% dos quadros; centro médio ({cx.mean():.2f}, {cy.mean():.2f}), "
          f"rosto = {100 * tam.mean():.0f}% da altura")


if __name__ == "__main__":
    main()
