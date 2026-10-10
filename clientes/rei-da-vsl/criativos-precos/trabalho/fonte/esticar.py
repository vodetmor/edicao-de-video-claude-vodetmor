"""Rodada 4 (Vítor 09/10 20:35 BRT: "muito rápido, não dá para ler; alonga uns 10 s; a caixa aparece 1 segundo").
Abre pausas na locução entre frases (corta no meio do silêncio entre duas palavras e insere silêncio), sem mexer
na voz em si. Gera ../voz/texto-N-esticado.wav e ../transcricao-esticada.json (tempos deslocados), que cues.py e
audio.py passam a usar. Uso: python3 esticar.py"""
import json, os, subprocess
import numpy as np
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
TR = json.load(open(os.path.join(HERE, '..', 'transcricao.json')))
SR = 48000
OUT = os.path.join(HERE, '..', 'voz')
os.makedirs(OUT, exist_ok=True)

# pausa extra (s) DEPOIS da palavra de índice i. Rodada 4b (Vítor: "pausas estranhas", "'pacote' cortou"): só entre
# frases (ponto, dois-pontos, vírgula de oração), nunca dentro de lista ou de frase; o corte cai no ponto mais silencioso.
PAUSAS = {
    # rodada 4d (Vítor: 'aos 6-7 s e 11-12 s ficou sem falar e parado; cada fala pode ser minimamente encurtada'): ~metade
    'texto-1': {2: 0.55, 6: 0.7, 16: 0.45, 21: 0.55, 26: 0.45, 31: 0.5, 45: 0.45},
    'texto-2': {1: 0.5, 7: 0.6, 11: 0.5, 20: 0.55, 24: 0.3, 32: 0.5, 41: 0.45},
}


def silencio(v, a, b):
    """instante (s) de menor energia (janela 20 ms) entre a e b"""
    i0, i1 = int(a * SR), int(b * SR)
    e = np.convolve(v[i0:i1] ** 2, np.ones(960) / 960, 'same')
    return (i0 + int(np.argmin(e))) / SR


novo = {}
for k, mp3 in (('texto-1', 'texto-1.mp3'), ('texto-2', 'texto-2.mp3')):
    tmp = os.path.join(OUT, '_tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(HERE, '..', '..', 'brutos', mp3), '-ac', '1', '-ar', str(SR), tmp], check=True)
    _, v = wavfile.read(tmp)
    os.remove(tmp)
    v = v.astype(np.float32) / (32768.0 if v.dtype == np.int16 else 1.0)
    ws = TR[k]['words']
    cuts = []  # (cut time in original, pause)
    for i, p in sorted(PAUSAS[k].items()):
        t = silencio(v, ws[i]['e'] - 0.08, ws[i + 1]['s'] + 0.08)
        cuts.append((t, p))
    parts, last = [], 0
    for t, p in cuts:
        i = int(t * SR)
        parts.append(v[last:i])
        parts.append(np.zeros(int(p * SR), np.float32))
        last = i
    parts.append(v[last:])
    y = np.concatenate(parts)
    wavfile.write(os.path.join(OUT, f'{k}-esticado.wav'), SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))

    def sh(t):
        return t + sum(p for c, p in cuts if c <= t)
    novo[k] = {'text': TR[k]['text'], 'words': [{'w': w['w'], 's': round(sh(w['s']), 3), 'e': round(sh(w['e']), 3)} for w in ws],
               'dur': round(len(y) / SR, 3), 'extra': round(sum(PAUSAS[k].values()), 2)}
    print(k, f"{len(v) / SR:.1f} s -> {len(y) / SR:.1f} s (+{novo[k]['extra']} s)")
json.dump(novo, open(os.path.join(HERE, '..', 'transcricao-esticada.json'), 'w'), ensure_ascii=False, indent=1)
