import sys, json, glob, os
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8", cpu_threads=4)
for f in sorted(glob.glob(sys.argv[2] if len(sys.argv) > 2 else "audio/*.wav")):
    n = os.path.basename(f)[:-4]
    segs, info = m.transcribe(f, language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
    out = []
    for s in segs:
        out.append({"start":s.start,"end":s.end,"text":s.text.strip(),"avg_logprob":s.avg_logprob,"no_speech":s.no_speech_prob,
                    "words":[{"w":w.word,"s":w.start,"e":w.end,"p":w.probability} for w in s.words]})
    json.dump(out, open(f"transcricoes/{n}.json","w"), ensure_ascii=False, indent=1)
    with open(f"transcricoes/{n}.txt","w") as t:
        for s in out: t.write(f"[{s['start']:6.2f}-{s['end']:6.2f}] {s['text']}\n")
    print("done", n, flush=True)
