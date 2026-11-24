"""Escolhe, para cada vídeo da 232, o trecho mais "cheio" (nítido, bem exposto, com conteúdo) -> triagem/videos-trecho.json
Uso: python -I trabalho/scripts/melhor_trecho.py   (pula o que não deve mudar: dv02 fica fixo)"""
import csv
import json
import subprocess

import numpy as np

BASE = "C:/dev/maquina-de-editar"
TRAB = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho"
AC = json.load(open(f"{BASE}/estudio/motor/src/obras/terceirao/acervo.json", encoding="utf8"))
MAN = {r["arquivo"].rsplit(".", 1)[0]: r for r in csv.DictReader(open(f"{TRAB}/triagem/manifest.csv", encoding="utf8"))}
FIXO = {"dv02": 13.5}  # o vídeo da cadeira: o rapaz sobe na cadeira (~15 s) e o professor ri (~18 s)
JAN = 7.0  # segundos de trecho procurados
R = 2  # amostras por segundo


def pontua(f):
    a = f.astype(float)
    lap = np.abs(4 * a[1:-1, 1:-1] - a[:-2, 1:-1] - a[2:, 1:-1] - a[1:-1, :-2] - a[1:-1, 2:]).mean()
    m, sd = a.mean(), a.std()
    if m < 45 or m > 225:
        return 0.0
    return float(min(lap / 11.0, 1.0) * min(sd / 42.0, 1.0))


out = {}
for v in AC["videos"]:
    q = MAN.get(v["id"], {}).get("quem_aparece", "")
    if "232" not in q or "231" in q:
        continue
    if v["id"] in FIXO:
        out[v["id"]] = FIXO[v["id"]]
        continue
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{BASE}/estudio/motor/public/final/v/{v['id']}.mp4", "-vf", f"fps={R},scale=96:96", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 96, 96)
    s = np.array([pontua(f) for f in fr])
    dif = np.r_[0, np.abs(np.diff(fr.astype(float), axis=0)).mean(axis=(1, 2))]
    s = s * (dif < 30)  # câmera balançando (borrão): não vale
    n = min(int(JAN * R), len(s))
    melhor, mi = -1, 0
    for i in range(0, len(s) - n + 1):
        w = s[i:i + n]
        sc = w.mean() - 0.6 * (w < 0.2).mean()
        if sc > melhor:
            melhor, mi = sc, i
    out[v["id"]] = round(mi / R, 2)
    print(v["id"], "dur", round(v["dur"], 1), "ini antigo", v.get("ini", 0), "-> novo", out[v["id"]], "nota", round(melhor, 2))
json.dump(out, open(f"{TRAB}/triagem/videos-trecho.json", "w"), indent=0)
