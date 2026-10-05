# Confere inteligibilidade PT-BR: transcreve cada amostra com faster-whisper (small) e mostra o texto.
import glob, sys
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=2)
for f in sorted(glob.glob("testes/*anuncio*.*")):
    segs, _ = m.transcribe(f, language="pt")
    print(f.split("/")[-1], "|", " ".join(s.text.strip() for s in segs), flush=True)
