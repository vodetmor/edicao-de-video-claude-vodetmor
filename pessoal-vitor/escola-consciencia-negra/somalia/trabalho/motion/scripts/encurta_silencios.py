"""Encurta silêncios longos DENTRO de cada fala (> MAX s viram ALVO s), com fade de 15 ms, e corrige os tempos das palavras.
Lê src/data/falas.json, grava áudio em audio/editado/<id>.wav e src/data/falas.json atualizado (arquivo -> editado)."""
import json, numpy as np, soundfile as sf, os
A = '/mnt/project-files/escola-consciencia-negra/somalia/audio'
MAX, ALVO = 0.85, 0.65
falas = json.load(open('src/data/falas.json'))
import sys
SO = sys.argv[1].split(',') if len(sys.argv) > 1 else None  # só estas falas (as outras já estão encurtadas)
os.makedirs(f'{A}/editado', exist_ok=True)
for f in falas:
    if SO and f['id'] not in SO: continue
    src = f.get('original', f['arquivo'])
    x, sr = sf.read(f'{A}/{src}', dtype='float32')
    ws = f['palavras']
    # silêncio medido pela energia (o fim de palavra do Whisper não presta): janelas de 20 ms abaixo de -38 dB do pico de fala
    L = int(0.02 * sr); e = np.array([np.sqrt(np.mean(x[i:i + L] ** 2) + 1e-12) for i in range(0, len(x) - L, L)])
    db = 20 * np.log10(e / np.percentile(e, 95)); quieto = db < -30
    t0f, t1f = ws[0]['s'], ws[-1]['e']
    cortes = []; i = 0
    while i < len(quieto):
        if quieto[i]:
            j = i
            while j < len(quieto) and quieto[j]: j += 1
            a_, b_ = i * 0.02, j * 0.02
            if a_ > t0f + 0.2 and b_ < t1f and b_ - a_ > MAX:
                meio = (a_ + b_) / 2; rem = (b_ - a_) - ALVO; cortes.append((meio - rem / 2, meio + rem / 2))
            i = j
        else: i += 1
    partes, pos, fad = [], 0, int(0.015 * sr)
    for c0, c1 in cortes:
        i0, i1 = int(c0 * sr), int(c1 * sr)
        p = x[pos:i0].copy(); p[-fad:] *= np.linspace(1, 0, fad); partes.append(p)
        pos = i1; nx = x[pos:pos + fad]; x[pos:pos + fad] = nx * np.linspace(0, 1, len(nx))
    partes.append(x[pos:]); y = np.concatenate(partes)
    def novo(t):
        return t - sum(min(max(t - c0, 0), c1 - c0) for c0, c1 in cortes)
    for w_ in ws: w_['s'] = round(novo(w_['s']), 2); w_['e'] = round(novo(w_['e']), 2)
    f['original'] = src; f['arquivo'] = f'editado/{f["id"]}.wav'
    f['ini'] = max(0, round(ws[0]['s'] - 0.15, 2)); f['dur'] = round(len(y) / sr, 2); f['fim'] = min(f['dur'], round(ws[-1]['e'] + 0.4, 2))
    sf.write(f'{A}/{f["arquivo"]}', y, sr, subtype='PCM_24')
    print(f['id'], f'{len(x)/sr:.1f} -> {len(y)/sr:.1f} s', len(cortes), 'cortes')
json.dump(falas, open('src/data/falas.json', 'w'), ensure_ascii=False, indent=1)
