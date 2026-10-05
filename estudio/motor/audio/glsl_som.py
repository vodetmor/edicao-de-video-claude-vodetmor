"""Som da vitrine GLSL ("Isso não foi filmado"): cama musical + efeitos no quadro de cada ação + voz.
100% sintetizado (synth.py). Uso: python3 audio/glsl_som.py -> public/audio/glsl/mix.wav
Os tempos vêm das mesmas âncoras de palavra do vídeo (src/data/glsl_palavras.json)."""
import json, os, re, sys, unicodedata
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'audio'))
from synth import *  # noqa

FPS = 30
D = json.load(open(os.path.join(ROOT, 'src/data/glsl_palavras.json')))
W = D['words']
DUR = round(D['dur'] * FPS) / FPS
N = int(DUR * SR) + SR


def nz(s):
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in s if unicodedata.category(c) != 'Mn'))


def q(a):
    """mesma sintaxe de âncora do motor: 'palavra#2:fim+6' -> segundos"""
    m = re.match(r'^(.+?)(?:#(\d+))?(:fim)?([+-]\d+)?$', a)
    alvo, n, fim, desl = m.groups()
    d = int(desl or 0) / FPS
    if alvo == 'fim':
        return DUR + d
    if alvo.startswith('@'):
        return int(alvo[1:]) / FPS + d
    hits = [w for w in W if nz(w['w']) == nz(alvo)]
    w = hits[int(n or 1) - 1]
    return (w['fe'] if fim else w['f']) / FPS + d


def put(buf, sig, t, g=1.0):
    i = int(max(t, 0) * SR)
    s = sig[: max(0, len(buf) - i)]
    buf[i: i + len(s)] += s * g


# ---------------- cama: pad em Ré, um acorde por ato + pulso suave de pluck a 96 BPM
cama = np.zeros(N)
atos = [(0.0, q('uma-8'), (50, 57, 62, 66, 69)),        # D maj9 (provocação)
        (q('uma-8'), q('mesma-6'), (47, 54, 62, 66, 69)),  # Bm add (revelação)
        (q('mesma-6'), q('transição+30'), (43, 55, 62, 67, 71)),  # G maj7 (expansão)
        (q('transição+30'), q('Agora'), (38, 50, 57, 62)),  # drone escuro (palco)
        (q('Agora'), DUR + 0.5, (50, 57, 62, 66, 69, 74))]  # D maj9 aberto (assinatura)
for a, b, notas in atos:
    seg = sum(pad_voice(midi(m), b - a + 0.3, att=0.6, rel=1.2, bright=1900) for m in notas)
    put(cama, seg, a - 0.15, 0.55)
beat = 60 / 96
arp = {0: [62, 66, 69, 74], 1: [59, 62, 66, 71], 2: [55, 59, 62, 67]}
k = 0
t = q('@0')
while t < q('transição+30') - 0.2:
    ato = 0 if t < q('uma-8') else 1 if t < q('mesma-6') else 2
    nota = arp[ato][k % 4] + (12 if k % 8 == 7 else 0)
    put(cama, pluck(midi(nota), 0.5, 0.6, 0.18), t, 0.16 if k % 2 == 0 else 0.1)
    if k % 2 == 0:
        put(cama, kick(0.3, 0.35, 48), t, 0.12)
    k += 1
    t = k * beat / 2
t = q('Agora+4')
k = 0
while t < DUR - 1.2:  # pulso volta, mais brilhante
    put(cama, pluck(midi([74, 78, 81, 86][k % 4]), 0.5, 0.8, 0.2), t, 0.12 if k % 2 == 0 else 0.08)
    k += 1
    t = q('Agora+4') + k * beat / 2
cama[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR)) ** 2

# ---------------- efeitos (cada um no quadro da ação visível)
fx = np.zeros(N)
put(fx, tick(2600, 0.04, 0.008), q('filmado:fim'), 0.5)            # traço risca "filmado"
put(fx, whoosh(0.55, 250, 4800, peak=0.7, bw=0.7, tail=0.2), q('modelado-3') + 0.05, 0.3)  # meia volta
put(fx, tick(2200, 0.04, 0.008), q('modelado:fim'), 0.45)
put(fx, swish(1.4, 400, 3600), q('uma-8'), 0.35)                    # varredura raio X
for i in range(0, 27, 3):                                             # fórmula digitada
    put(fx, keytick(), q('uma') + i * 1.1 / FPS, 0.1)
for a, f0 in (('luz-2', 880), ('sombra-2', 740), ('reflexo-2', 988)):  # cada rótulo da lista
    put(fx, tick(f0 * 3.4, 0.03, 0.006), q(a), 0.2)
put(fx, snap(), q('pixel-1'), 0.3)                                    # vira pixel
put(fx, tick(3400, 0.03, 0.006), q('pixel+5'), 0.3)                  # bloco marcado
put(fx, snap(), q('pixel#2'), 0.3)                                   # volta nítido
put(fx, suck(0.5), q('mesma-6'), 0.45)                                # afunda
put(fx, riser(1.6, 300, 2600, tone=False), q('mesma+12'), 0.18)       # tinta se espalha
put(fx, swish(0.9, 500, 4200), q('transição-4'), 0.4)                 # papel engole
put(fx, thud(0.6, 46), q('transição+30'), 0.55)                       # luzes apagam
put(fx, swish(0.9, 600, 3800), q('acabamento-6'), 0.3)                # papel recua
put(fx, thud(0.45, 70), q('Agora+4'), 0.35)                           # luzes acendem
put(fx, bell(midi(86), 2.2, 0.9), q('Agora+4'), 0.08)
for a, m in (('G', 74), ('L', 78), ('S', 81), ('L#2', 86)):           # letras G L S L
    put(fx, mallet(midi(m), 0.9, 1.0), q(a), 0.3)
put(fx, impact(1.8), q('L#2'), 0.18)

# ---------------- voz e mixagem (voz na frente; cama abaixa sob a fala e volta nos respiros)
sr, v = wavfile.read(os.path.join(ROOT, 'public/audio/glsl/voz.wav'))
v = v.astype(np.float64) / 32768.0
voz = np.zeros(N)
voz[: len(v)] = v[:N]
env = uniform_filter1d(maximum_filter1d(np.abs(voz), int(0.05 * SR)), int(0.06 * SR))
on = (env > 0.03).astype(float)
g = np.ones(N)
lvl, duck = 1.0, 10 ** (-10 / 20)
a, r = 1 - np.exp(-1 / (0.1 * SR)), 1 - np.exp(-1 / (0.55 * SR))
for i in range(0, N, 64):
    tgt = duck if on[i] else 1.0
    kk = a if tgt < lvl else r
    lvl += (tgt - lvl) * (1 - (1 - kk) ** 64)
    g[i: i + 64] = lvl
mix = voz * 1.0 + lp(cama, 6000) * g * 0.16 + fx * 0.9
mix = mix[: int(DUR * SR)]
st = np.stack([mix, mix], 1)
os.makedirs(os.path.join(ROOT, 'public/audio/glsl'), exist_ok=True)
for nome, x in (('mix.wav', mix), ('so_musica.wav', lp(cama, 6000)[: len(mix)] * 0.16)):
    y = np.stack([x, x], 1) * (0.89 / (np.max(np.abs(mix)) + 1e-9))
    wavfile.write(os.path.join(ROOT, 'public/audio/glsl', nome), SR, (np.clip(y, -1, 1) * 32767).astype(np.int16))
print('ok', round(DUR, 2), 's')
