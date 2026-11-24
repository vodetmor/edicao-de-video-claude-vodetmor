"""Renderiza a composição Saudade em pedaços de 450 quadros (15 s), retomando de onde parou, e junta com o áudio.

Uso : python -I trabalho/scripts/render_saudade.py --orcamento 520        (renderiza pedaços novos por até 520 s; repetir até sair PRONTO)
      python -I trabalho/scripts/render_saudade.py --juntar               (cola os pedaços + música com fade -> previa/aula-da-saudade-vN.mp4, master -14 LUFS)
Refazer um trecho: apagar previa/saudade-pedacos/pNNN.mp4 (pedaço N = quadros N*450...) e rodar de novo.
"""
import argparse
import os
import subprocess
import sys
import time

BASE = "C:/dev/maquina-de-editar"
MOTOR = f"{BASE}/estudio/motor"
PREV = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/previa"
PED = f"{PREV}/saudade-pedacos"
import json
TOTAL = round(json.load(open(f"{MOTOR}/src/obras/saudade/plano3.json", encoding="utf8"))["duracao"] * 30) if os.environ.get("SAUDADE_PLANO") else 8100
TAM = 450

ap = argparse.ArgumentParser()
ap.add_argument("--orcamento", type=int, default=520)
ap.add_argument("--conc", type=int, default=2)
ap.add_argument("--juntar", action="store_true")
ap.add_argument("--saida", default="aula-da-saudade-v1")
ap.add_argument("--comp", default="Saudade")
ap.add_argument("--pedacos", default="saudade-pedacos")
a = ap.parse_args()
PED = f"{PREV}/{a.pedacos}"
os.makedirs(PED, exist_ok=True)
n = -(-TOTAL // TAM)

if a.juntar:
    faltam = [i for i in range(n) if not os.path.exists(f"{PED}/p{i:03d}.mp4")]
    if faltam:
        sys.exit(f"faltam pedaços {faltam}")
    with open(f"{PED}/lista.txt", "w") as f:
        for i in range(n):
            f.write(f"file 'p{i:03d}.mp4'\n")
    bruto = f"{PREV}/{a.saida}-bruto.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{PED}/lista.txt", "-c", "copy", bruto], check=True)
    # áudio já montado (música com pausas + áudio dos vídeos + violão): previa/saudade6-audio.wav (master -14 LUFS) se existir; senão a música crua
    wav = f"{PREV}/saudade6-audio.wav"
    out = f"{PREV}/{a.saida}.mp4"
    if os.environ.get("SAUDADE_PLANO") and os.path.exists(wav):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", bruto, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", out], check=True)
    else:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", bruto, "-i", f"{MOTOR}/public/saudade/bem.mp3", "-map", "0:v", "-map", "1:a",
                        "-af", "afade=t=in:d=1.5,afade=t=out:st=267.5:d=2.5,loudnorm=I=-14:TP=-1:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-t", "270", out], check=True)
    print("PRONTO", out)
    sys.exit(0)

t0 = time.time()
feitos = 0
for i in range(n):
    dst = f"{PED}/p{i:03d}.mp4"
    if os.path.exists(dst):
        continue
    if time.time() - t0 > a.orcamento:
        print("ORÇAMENTO ESGOTADO: rode de novo")
        sys.exit(3)
    ini, fim = i * TAM, min(TOTAL, (i + 1) * TAM) - 1
    tmp = dst + ".tmp.mp4"
    r = subprocess.run(["npx", "remotion", "render", "src/index.ts", a.comp, tmp, f"--frames={ini}-{fim}", "--gl=angle", f"--concurrency={a.conc}",
                        "--codec=h264", "--crf=17", "--muted", "--log=error"], cwd=MOTOR, shell=True)
    if r.returncode != 0 or not os.path.exists(tmp):
        print(f"pedaço {i} falhou (rc={r.returncode}); tente de novo com --conc 1")
        sys.exit(2)
    os.replace(tmp, dst)
    feitos += 1
    print(f"pedaço {i + 1}/{n} ok ({time.time() - t0:.0f}s)", flush=True)
print("PRONTO (todos os pedaços); rode com --juntar")
