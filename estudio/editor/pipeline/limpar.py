"""Limpeza completa em um comando: transcrever -> propor cortes -> montar a base -> acompanhar o rosto.

Uso: python3 limpar.py <projeto> [--ritmo anuncio|conteudo|aula] [--modelo large-v3-turbo] [--termos "A,B"]
     [--roteiro roteiro.txt] [--velocidade 1.0] [--parar-nos-cortes]

--parar-nos-cortes: para depois de propor os cortes, para revisar cortes.md antes de montar (recomendado em vídeo
longo ou com muitas tomadas). Depois de mexer em cortes.json, rode só: montar.py e enquadrar.py.
Tempo típico em CPU comum: ~1 min por minuto de vídeo (a transcrição é a parte mais lenta).
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

AQUI = Path(__file__).resolve().parent


def roda(script: str, *args: str) -> None:
    t = time.time()
    print(f"\n== {script} ==", flush=True)
    subprocess.run([sys.executable, str(AQUI / script), *args], check=True)
    print(f"   ({time.time() - t:.0f} s)", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--ritmo", default="conteudo")
    ap.add_argument("--modelo", default="large-v3-turbo")
    ap.add_argument("--termos")
    ap.add_argument("--roteiro")
    ap.add_argument("--motor", default="local")
    ap.add_argument("--velocidade", default="1.0")
    ap.add_argument("--parar-nos-cortes", action="store_true")
    a = ap.parse_args()
    tr = [a.projeto, "--modelo", a.modelo, "--motor", a.motor]
    if a.termos:
        tr += ["--termos", a.termos]
    if a.roteiro:
        tr += ["--roteiro", a.roteiro]
    roda("transcrever.py", *tr)
    roda("cortes.py", a.projeto, "--ritmo", a.ritmo)
    if a.parar_nos_cortes:
        print(f"\nproposta em {Path(a.projeto) / 'projeto' / 'cortes.md'}; revise e rode montar.py + enquadrar.py")
        return
    roda("montar.py", a.projeto, "--velocidade", a.velocidade)
    roda("enquadrar.py", a.projeto)
    print("\nbase pronta: projeto/base.mp4 + base-palavras.json + rosto.json. Próximo: roteiro-visual.json e o painel de revisão.")


if __name__ == "__main__":
    main()
