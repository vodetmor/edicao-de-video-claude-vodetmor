"""Recorta a pessoa do fundo, quadro a quadro, para texto atrás da cabeça, troca de fundo e objetos em volta dela.

Uso: python3 recortar.py <projeto> [--entrada base.mp4] [--modelo rvm|rvm-leve|u2net_human_seg] [--escala 0.75]

Padrão: RVM (Robust Video Matting, licença GPL-3.0, ONNX ~107 MB baixado na 1ª vez em pipeline/modelos). É feito para
VÍDEO: guarda memória dos quadros anteriores, então a borda não pisca e pega fio de cabelo e mão em movimento.
`rvm-leve` (MobileNetV3, 15 MB) é mais rápido e um pouco pior. `u2net_human_seg` (rembg) decide quadro a quadro:
rápido, mas falha em mão, objeto segurado e borda (o Vítor viu "cheio de falhas" em 30/10/2026).
Nos modelos de imagem a máscara é suavizada no tempo e recebe 1 px de erosão para não sobrar halo do fundo.
Saída: projeto/pessoa.webm (VP9 com transparência, mesmo tamanho e tempo da base) e projeto/pessoa-amostra.png.
"""
from __future__ import annotations

import argparse
import subprocess

import numpy as np

from comum import Projeto, sair, sonda


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pasta")
    ap.add_argument("--entrada", default="base.mp4")
    ap.add_argument("--modelo", default="rvm")
    ap.add_argument("--escala", type=float, default=0.75, help="tamanho em que a máscara é calculada (a saída mantém o original)")
    a = ap.parse_args()
    import cv2

    pj = Projeto(a.pasta)
    ent = pj.arq(a.entrada)
    if not ent.exists():
        sair(f"não achei {ent}: rode a limpeza antes")
    info = sonda(ent)
    w, h, fps = info["w"], info["h"], info["fps"]
    rvm = a.modelo.startswith("rvm")
    if rvm:
        import urllib.request
        import onnxruntime as ort
        from comum import MODELOS
        nome = "rvm_mobilenetv3_fp32.onnx" if a.modelo == "rvm-leve" else "rvm_resnet50_fp32.onnx"
        arq = MODELOS / nome
        if not arq.exists():
            print(f"baixando {nome}...", flush=True)
            urllib.request.urlretrieve(f"https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/{nome}", arq)
        sessao = ort.InferenceSession(str(arq), providers=["CPUExecutionProvider"])
        rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
        razao = np.array([min(1.0, 512 / max(w, h) * 1.0) if max(w, h) > 512 else 1.0], np.float32)

        def mascara(q, aquece=False):
            nonlocal rec
            src = (q[:, :, ::-1].astype(np.float32) / 255).transpose(2, 0, 1)[None]
            _, pha, *rec2 = sessao.run(None, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": razao})
            rec = rec2
            return pha[0, 0]
    else:
        from rembg import new_session, remove
        sessao = new_session(a.modelo)
    ler = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(ent), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    saida = pj.arq("pessoa.webm")
    grava = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{w}x{h}", "-r", str(fps),
                              "-i", "-", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-row-mt", "1",
                              "-auto-alt-ref", "0", str(saida)], stdin=subprocess.PIPE)
    anterior = None
    n = 0
    tam = w * h * 3
    pw, ph = int(w * a.escala) // 2 * 2, int(h * a.escala) // 2 * 2
    nucleo = np.ones((3, 3), np.uint8)
    while True:
        bruto = ler.stdout.read(tam)
        if len(bruto) < tam:
            break
        q = np.frombuffer(bruto, np.uint8).reshape(h, w, 3)
        if rvm:
            if n == 0:  # a memória do RVM começa vazia: aquece no 1º quadro para a borda já nascer estável
                for _ in range(8):
                    mascara(q)
            m8 = (np.clip(mascara(q), 0, 1) * 255).astype(np.uint8)
        else:
            peq = cv2.resize(q, (pw, ph), interpolation=cv2.INTER_AREA)
            m = np.asarray(remove(peq[:, :, ::-1], session=sessao, only_mask=True)).astype(np.float32) / 255
            m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
            if anterior is not None:  # onde a máscara quase não mudou, mistura com a anterior: borda estável
                calma = np.abs(m - anterior) < 0.25
                m = np.where(calma, 0.6 * m + 0.4 * anterior, m)
            anterior = m
            m8 = cv2.erode((m * 255).astype(np.uint8), nucleo)
            m8 = cv2.GaussianBlur(m8, (3, 3), 0)
        rgba = np.dstack([q, m8])
        grava.stdin.write(rgba.tobytes())
        if n == int(fps * 2):
            cv2.imwrite(str(pj.arq("pessoa-amostra.png")), np.dstack([q, m8]))
        n += 1
        if n % 60 == 0:
            print(f"  {n} quadros", flush=True)
    grava.stdin.close()
    grava.wait()
    ler.wait()
    pj.salvar_config(pessoa={"arquivo": "pessoa.webm", "modelo": a.modelo, "quadros": n})
    print(f"pronto: {saida} ({n} quadros)")


if __name__ == "__main__":
    main()
