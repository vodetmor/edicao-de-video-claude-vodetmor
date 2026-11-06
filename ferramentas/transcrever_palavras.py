# -*- coding: utf-8 -*-
"""Tempo de cada palavra de uma voz (faster-whisper, CPU). Saída: JSON UTF-8 [{w, s, e}].
Uso: python -I ferramentas/transcrever_palavras.py voz.mp3 [voz2.mp3 ...] --out pasta
Gera <pasta>/<nome>.palavras.json. Modelo "small" (bom em PT-BR; erra nomes próprios, números e
"R$": normalizar depois). Serve de âncora para legenda e para eventos do motor presos à fala."""
import argparse, json
from pathlib import Path
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("audios", nargs="+")
ap.add_argument("--out", default=".")
ap.add_argument("--modelo", default="small")
a = ap.parse_args()
m = WhisperModel(a.modelo, device="cpu", compute_type="int8")
Path(a.out).mkdir(parents=True, exist_ok=True)
for f in a.audios:
    segs, _ = m.transcribe(f, language="pt", word_timestamps=True)
    ws = [{"w": w.word.strip(), "s": round(float(w.start), 2), "e": round(float(w.end), 2)} for s in segs for w in s.words]
    dest = Path(a.out) / (Path(f).stem + ".palavras.json")
    dest.write_text(json.dumps(ws, ensure_ascii=False), encoding="utf-8")
    print(dest, len(ws), "palavras")
