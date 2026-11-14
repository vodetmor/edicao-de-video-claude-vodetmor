"""Master de áudio da FINAL: mede o loudness do vídeo renderizado e ajusta para -14 LUFS / -1 dBTP.

Uso: python masterizar.py entrada.mp4 saida.mp4
Método (lição do projeto): medir com ebur128 e aplicar `volume=` + limitador; o loudnorm de 2 passos estourou antes.
"""
import re
import subprocess
import sys

ALVO = -14.0
entrada, saida = sys.argv[1], sys.argv[2]


def medir(p):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True, encoding="utf8", errors="replace")
    i = float(re.findall(r"I:\s+(-?\d+\.\d+) LUFS", r.stderr)[-1])
    pk = re.findall(r"Peak:\s+(-?\d+\.\d+) dBFS", r.stderr)
    return i, float(pk[-1]) if pk else None


i, pk = medir(entrada)
ganho = ALVO - i
print(f"antes: {i:.1f} LUFS, pico {pk} dBFS -> ganho {ganho:+.1f} dB")
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", entrada, "-c:v", "copy",
    "-af", f"volume={ganho:.2f}dB,alimiter=limit=0.89:level=disabled",
    "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", saida,
], check=True)
i2, pk2 = medir(saida)
print(f"depois: {i2:.1f} LUFS, pico {pk2} dBFS")
