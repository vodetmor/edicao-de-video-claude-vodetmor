import sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel('large-v3', device='cpu', compute_type='int8')
for p in sys.argv[1:]:
    x, sr = sf.read(p, dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
    x16 = np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype('float32')
    segs, _ = m.transcribe(x16, language='pt', word_timestamps=True, temperature=0)
    print(p.split('/')[-1], '|', ' '.join(w.word.strip() for s in segs for w in s.words), flush=True)
