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

# Rodada 5 (Deidson, cliente, 10/10: "muitas pausas em trechos desnecessários; fala mais dinâmica, direta; só pausar
# quando fala de exemplos, pra pessoa olhar"). Agora o script ENCURTA os respiros naturais da locução (silêncios > 0,25 s
# viram ALVO s) e só abre pausa extra onde o lead precisa olhar. Histórico: rodada 4 abria +10 s, 4b/4d +6 s / +3,5 s.
ALVO = 0.18
PAUSAS = {  # pausa extra (s) depois da palavra de índice i
    'texto-1': {26: 0.25},            # 'tudo incluso:' -> a lista copy/locução/edição se monta
    'texto-2': {32: 0.3, 41: 0.35},   # antes de 'esse que você tá vendo' e depois de 'é um exemplo' (carrossel)
}


def silencio(v, a, b):
    """(instante de menor energia, duração do silêncio < -45 dB ao redor) entre a e b"""
    i0, i1 = int(a * SR), int(b * SR)
    e = np.convolve(v[i0:i1] ** 2, np.ones(960) / 960, 'same')
    m = int(np.argmin(e))
    q = 10 * np.log10(e + 1e-12) < -45
    l = m
    while l > 0 and q[l - 1]:
        l -= 1
    r = m
    while r < len(q) - 1 and q[r + 1]:
        r += 1
    return (i0 + (l + r) // 2) / SR, (r - l) / SR


novo = {}
for k, mp3 in (('texto-1', 'texto-1.mp3'), ('texto-2', 'texto-2.mp3')):
    tmp = os.path.join(OUT, '_tmp.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(HERE, '..', '..', 'brutos', mp3), '-ac', '1', '-ar', str(SR), tmp], check=True)
    _, v = wavfile.read(tmp)
    os.remove(tmp)
    v = v.astype(np.float32) / (32768.0 if v.dtype == np.int16 else 1.0)
    ws = TR[k]['words']
    cuts = []  # (instante no original, delta s: > 0 insere silêncio, < 0 remove silêncio centrado ali)
    for i in range(len(ws) - 1):
        t, L = silencio(v, ws[i]['e'] - 0.08, ws[i + 1]['s'] + 0.08)
        d = (min(0.0, ALVO - L) if L > 0.25 else 0.0) + PAUSAS[k].get(i, 0.0)
        if abs(d) > 0.005:
            cuts.append((t, d))
    parts, last = [], 0
    for t, d in cuts:
        i = int(t * SR)
        if d > 0:
            parts.append(v[last:i]); parts.append(np.zeros(int(d * SR), np.float32)); last = i
        else:
            h = int(-d * SR / 2)
            parts.append(v[last:i - h]); last = i + h
    parts.append(v[last:])
    y = np.concatenate(parts)
    wavfile.write(os.path.join(OUT, f'{k}-esticado.wav'), SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))

    def sh(t):
        return t + sum(p for c, p in cuts if c <= t)
    novo[k] = {'text': TR[k]['text'], 'words': [{'w': w['w'], 's': round(sh(w['s']), 3), 'e': round(sh(w['e']), 3)} for w in ws],
               'dur': round(len(y) / SR, 3), 'extra': round(sum(d for _, d in cuts), 2)}
    print(k, f"{len(v) / SR:.1f} s -> {len(y) / SR:.1f} s (+{novo[k]['extra']} s)")
json.dump(novo, open(os.path.join(HERE, '..', 'transcricao-esticada.json'), 'w'), ensure_ascii=False, indent=1)
