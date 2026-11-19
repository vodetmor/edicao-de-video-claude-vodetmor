import json, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
A = '/mnt/project-files/escola-consciencia-negra/somalia/audio'
novos = {'maria-1': 'limpo/maria-WA0059-limpo.wav', 'maria-2': 'limpo/maria-WA0060-limpo.wav', 'yago-1': 'limpo/yago-WA0063-limpo.wav', 'yago-2': 'limpo/yago-WA0064-limpo.wav'}
fix = {'somares.': 'somalis.', '-Sabab,': '-Shabaab,', '-Sabab': '-Shabaab', 'Oceano': 'oceano', 'chifre': 'Chifre', 'um': 'um'}
m = WhisperModel('large-v3', device='cpu', compute_type='int8')
F = json.load(open('src/data/falas.json'))
for f in F:
    if f['id'] not in novos: continue
    rel = novos[f['id']]; x, sr = sf.read(f'{A}/{rel}', dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
    x16 = np.interp(np.arange(0, len(x), sr / 16000), np.arange(len(x)), x).astype('float32')
    segs, _ = m.transcribe(x16, language='pt', word_timestamps=True, temperature=0)
    ws = [{'w': fix.get(w.word.strip(), w.word.strip()), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
    if f['id'] == 'maria-2':  # "como um arma" -> "como uma arma" (legenda)
        for i, w in enumerate(ws):
            if w['w'] == 'um' and i + 1 < len(ws) and ws[i + 1]['w'].startswith('arma'): w['w'] = 'uma'
    dur = len(x) / sr
    f.update({'arquivo': rel, 'dur': round(dur, 2), 'ini': max(0, round(ws[0]['s'] - 0.15, 2)), 'fim': min(round(dur, 2), round(ws[-1]['e'] + 0.4, 2)), 'palavras': ws})
    f.pop('original', None)
    print(f['id'], [(i, w['w']) for i, w in enumerate(ws)])
json.dump(F, open('src/data/falas.json', 'w'), ensure_ascii=False, indent=1)
