"""Recorta a pessoa do fundo, quadro a quadro, para texto atrás da cabeça, troca de fundo e objetos em volta dela.

Uso: python3 recortar.py <projeto> [--entrada base.mp4] [--modelo u2net_human_seg] [--escala 0.75]

Modelo: u2net_human_seg do rembg (grátis, ~170 MB baixados na 1ª vez, ~1 s por quadro em CPU de 4 núcleos).
BiRefNet tem borda melhor, mas leva ~45 s por quadro em CPU: só para um trecho curto, com --modelo birefnet-portrait.
A máscara anda suave no tempo (média com o quadro anterior onde quase não mudou) para a borda não tremer,
e recebe 1 px de erosão + desfoque leve para não sobrar halo do fundo.
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
    ap.add_argument("--modelo", default="u2net_human_seg")
    ap.add_argument("--escala", type=float, default=0.75, help="tamanho em que a máscara é calculada (a saída mantém o original)")
    a = ap.parse_args()
    import cv2
    from rembg import new_session, remove

    pj = Projeto(a.pasta)
    ent = pj.arq(a.entrada)
    if not ent.exists():
        sair(f"não achei {ent}: rode a limpeza antes")
    info = sonda(ent)
    w, h, fps = info["w"], info["h"], info["fps"]
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
