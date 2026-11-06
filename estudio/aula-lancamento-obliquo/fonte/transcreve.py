# Transcreve audio/locucao.mp3 -> audio/palavras.json (timestamps por palavra)
import json, sys
from faster_whisper import WhisperModel
D = "/mnt/project-files/estudio/aula-lancamento-obliquo"
roteiro = open(f"{D}/roteiro/ROTEIRO-ELEVENLABS.txt").read()
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(f"{D}/audio/locucao.mp3", language="pt", word_timestamps=True,
                          initial_prompt=roteiro[:800], vad_filter=False)
out = []
for s in segs:
    for w in s.words:
        out.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
    print(f"{s.start:7.2f} {s.text}", flush=True)
json.dump(out, open(f"{D}/audio/palavras.json", "w"), ensure_ascii=False, indent=0)
print(len(out), "palavras")
