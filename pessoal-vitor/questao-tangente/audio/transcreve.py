# Transcreve a narração com tempo por palavra -> transcricao.json + transcricao.txt
import json, sys, pathlib
from faster_whisper import WhisperModel
A = pathlib.Path(__file__).parent
src = A / (sys.argv[1] if len(sys.argv) > 1 else "narracao-bruta.ogg")
m = WhisperModel("medium", device="cpu", compute_type="int8")
segs, info = m.transcribe(str(src), language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
out, txt = [], []
for s in segs:
    out.append({"s": round(s.start, 2), "e": round(s.end, 2), "t": s.text.strip(),
                "w": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2), "p": round(w.probability, 2)} for w in s.words]})
    txt.append(f"[{s.start:7.2f} - {s.end:7.2f}] {s.text.strip()}")
    print(txt[-1], flush=True)
(A / "transcricao.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
(A / "transcricao.txt").write_text("\n".join(txt))
