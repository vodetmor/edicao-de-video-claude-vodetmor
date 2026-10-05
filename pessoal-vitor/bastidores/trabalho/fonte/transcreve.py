import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(sys.argv[1], language="pt", word_timestamps=True, vad_filter=False, beam_size=5,
    initial_prompt="Claude, Manim, GLSL, Remotion, ElevenLabs, TikTok, ENEM, lançamento oblíquo, IA, Kevin MacLeod.")
out = []
for s in segs:
    for w in s.words:
        out.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 2)})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False, indent=0)
