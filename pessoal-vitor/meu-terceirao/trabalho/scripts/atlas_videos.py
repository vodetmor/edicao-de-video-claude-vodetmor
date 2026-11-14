"""Junta TODOS os vídeos do acervo num só vídeo-mosaico mudo (atlas) para a cena final do "3".

Por quê: 74 vídeos tocando ao mesmo tempo no Remotion = 74 extrações por quadro (horas de render e RAM estourada).
Com o atlas, o motor extrai UM quadro por quadro e recorta cada célula num canvas.

Lê   : estudio/motor/src/obras/terceirao/acervo.json + public/final/v/<id>.mp4
Grava: estudio/motor/public/final/atlas.mp4 (10 colunas, células 256x192, 30 fps, sem som, vídeos em laço)
       estudio/motor/src/obras/terceirao/atlas.json {cols, rows, cw, ch, pos: {id: [col, lin]}}
Rodar: python trabalho/scripts/atlas_videos.py [duração em s, padrão 44]
"""
import json
import os
import subprocess
import sys

BASE = "C:/dev/maquina-de-editar"
OBRA = f"{BASE}/estudio/motor/src/obras/terceirao"
V = f"{BASE}/estudio/motor/public/final/v"
SAIDA = f"{BASE}/estudio/motor/public/final/atlas.mp4"
TMP = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/previa/atlas-tmp"
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 44
COLS, CW, CH = 10, 256, 192

os.makedirs(TMP, exist_ok=True)
vids = json.load(open(f"{OBRA}/acervo.json", encoding="utf8"))["videos"]
rows = (len(vids) + COLS - 1) // COLS
pos = {}
linhas = []
for r in range(rows):
    grupo = vids[r * COLS:(r + 1) * COLS]
    cmd = ["ffmpeg", "-v", "error", "-y"]
    filtros = []
    for c, v in enumerate(grupo):
        pos[v["id"]] = [c, r]
        cmd += ["-stream_loop", "-1", "-ss", f"{v.get('ini', 0):.2f}", "-i", f"{V}/{v['id']}.mp4"]
        filtros.append(f"[{c}:v]trim=duration={DUR},setpts=PTS-STARTPTS,fps=30,scale={CW}:{CH}:force_original_aspect_ratio=increase,crop={CW}:{CH},setsar=1[v{c}]")
    n = len(grupo)
    for c in range(n, COLS):  # completa a linha com preto
        filtros.append(f"color=c=black:s={CW}x{CH}:r=30:d={DUR}[v{c}]")
    filtros.append("".join(f"[v{c}]" for c in range(COLS)) + f"hstack=inputs={COLS}[o]")
    dst = f"{TMP}/linha{r}.mp4"
    cmd += ["-filter_complex", ";".join(filtros), "-map", "[o]", "-t", str(DUR), "-an", "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", dst]
    subprocess.run(cmd, check=True)
    linhas.append(dst)
    print("linha", r, "ok", flush=True)

cmd = ["ffmpeg", "-v", "error", "-y"]
for l in linhas:
    cmd += ["-i", l]
cmd += ["-filter_complex", "".join(f"[{i}:v]" for i in range(rows)) + f"vstack=inputs={rows}[o]", "-map", "[o]", "-an",
        "-c:v", "libx264", "-crf", "19", "-preset", "veryfast", "-g", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", SAIDA]
subprocess.run(cmd, check=True)
json.dump({"cols": COLS, "rows": rows, "cw": CW, "ch": CH, "dur": DUR, "pos": pos}, open(f"{OBRA}/atlas.json", "w", encoding="utf8"))
print("atlas", SAIDA, f"{COLS * CW}x{rows * CH}", len(pos), "vídeos")
