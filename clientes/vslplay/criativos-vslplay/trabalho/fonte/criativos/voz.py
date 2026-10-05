"""Corta a locução dos criativos 2 e 3 do áudio do cliente, encurtando pausas longas.
Saída: out/audio/vo_c2.wav, out/audio/vo_c3.wav e src/data/words_c2.json / words_c3.json (palavras com tempo em s e quadro)."""
import json, os, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = '/mnt/project-files/criativos-vslplay/trabalho/brutos/audios-3-criativos.mp3'
TR = '/mnt/project-files/criativos-vslplay/trabalho/transcricao-audios.json'
SR = 48000; FPS = 30; LEAD = 0.12; CAP = 0.40; PAD = 0.10
raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', SRC, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
A = np.frombuffer(raw, np.float32).copy()
W = [w for s in json.load(open(TR)) for w in s['words']]
CUTS = {'c2': [(32.4, 43.9), (57.2, 82.7)], 'c3': [(85.8, 126.5)]}
os.makedirs(os.path.join(ROOT, 'out/audio'), exist_ok=True); os.makedirs(os.path.join(ROOT, 'src/data'), exist_ok=True)
for name, parts in CUTS.items():
    ws = [w for a, b in parts for w in W if w['s'] >= a - 0.05 and w['e'] <= b + 0.05]
    # trechos de áudio: cada palavra vira um intervalo; pausas maiores que CAP encolhem para CAP
    out = [np.zeros(int(LEAD * SR), np.float32)]; t = LEAD; words = []
    seg_start = ws[0]['s'] - PAD
    for i, w in enumerate(ws):
        nxt = ws[i + 1] if i + 1 < len(ws) else None
        gap = (nxt['s'] - w['e']) if nxt else None
        if nxt is None or gap > CAP:
            end = w['e'] + (min(PAD, gap / 2) if nxt else 0.25)
            seg = A[int(seg_start * SR):int(end * SR)].copy()
            f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
            # tempos das palavras deste trecho
            for ww in ws:
                if seg_start <= ww['s'] < end and not any(x['src'] == ww['s'] for x in words):
                    s = t + ww['s'] - seg_start; e = t + ww['e'] - seg_start
                    words.append({'w': ww['w'].strip(), 's': round(s, 3), 'e': round(e, 3), 'f': round(s * FPS), 'fe': round(e * FPS), 'src': ww['s']})
            out.append(seg); t += len(seg) / SR
            if nxt:
                sil = max(0.0, CAP - min(PAD, gap / 2) - PAD)
                out.append(np.zeros(int(sil * SR), np.float32)); t += sil
                seg_start = nxt['s'] - PAD
    y = np.concatenate(out)
    import wave
    with wave.open(os.path.join(ROOT, f'out/audio/vo_{name}.wav'), 'wb') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    for x in words: x.pop('src')
    json.dump({'dur': round(len(y) / SR, 3), 'frames': int(np.ceil(len(y) / SR * FPS)), 'words': words}, open(os.path.join(ROOT, f'src/data/words_{name}.json'), 'w'), ensure_ascii=False, indent=0)
    print(name, round(len(y) / SR, 2), 's', len(words), 'palavras')
    print(' '.join(f"{x['w']}@{x['f']}" for x in words))
