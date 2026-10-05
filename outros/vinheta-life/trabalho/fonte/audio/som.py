"""Som da vinheta "life": 100% sintetizado (sem licença de terceiros), cada efeito no quadro da ação.
Lê ../src/data/tempo.json (quadros a 30 fps). Saída: trabalho/audio/vinheta-som.wav (estéreo 48 kHz, sem normalizar)."""
import json, numpy as np, os, sys
from scipy.io import wavfile
sys.path.insert(0, os.path.dirname(__file__))
from synth import *
D = os.path.dirname(os.path.abspath(__file__))
TP = json.load(open(os.path.join(D, '../src/data/tempo.json')))
s = lambda k: TP[k] / 30.0
DUR = TP['fim'] / 30.0 + 0.6
L = np.zeros(int(SR * DUR)); R = np.zeros_like(L)
rng2 = np.random.default_rng(7)

def put(x, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= len(L): return
    x = x[: len(L) - i] * g
    L[i:i + len(x)] += x * np.sqrt(0.5 * (1 - pan)) * 1.414
    R[i:i + len(x)] += x * np.sqrt(0.5 * (1 + pan)) * 1.414

def mix(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# ---------- instrumentos novos
def boing(f0, d=0.42):
    t = T(d)
    f = f0 * (1 + 0.55 * np.exp(-t / 0.03)) * (1 + 0.06 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.18))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) * np.exp(-t / 0.08)
    return x * (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.16) * 0.8

def apito(f0, f1, d, vib=6.0):
    """apito de êmbolo (slide whistle): seno com vibrato e um pouco de ar."""
    t = T(d)
    f = f0 * (f1 / f0) ** (t / d) * (1 + 0.012 * np.sin(2 * np.pi * vib * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.08 * bp(noise(d), 1500, 6000)
    env = np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.05)
    return lp(x, 6000) * env * 0.5

def uke(freq, d=1.2, bright=0.6):
    """ukulele por Karplus-Strong."""
    n = int(SR / freq); buf = rng2.uniform(-1, 1, n); buf = lp(buf, 2500 + 4000 * bright)
    out = np.zeros(int(SR * d)); dec = 0.998
    for i in range(len(out)):
        out[i] = buf[i % n]
        buf[i % n] = dec * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return hp(out, 150) * np.exp(-T(d) / 0.9)

def strum(notas, d=1.2, down=True, gap=0.012, g=1.0):
    seq = notas if down else notas[::-1]
    x = np.zeros(int(SR * (d + gap * len(seq))))
    for k, m in enumerate(seq):
        u = uke(midi(m), d); i = int(k * gap * SR); x[i:i + len(u)] += u * (0.9 - 0.08 * k)
    return x * g

def glock(m, d=1.0):
    return bell(midi(m), d, 0.5) * 0.7

def borbulha(d=0.09, f0=380, f1=1500):
    t = T(d); f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.6 * 0.9

MUSICA = '--sem-musica' not in sys.argv  # --sem-musica: só efeitos sonoros
C = [60, 64, 67, 72]; F = [60, 65, 69, 72]; G = [62, 67, 71, 74]; Am = [60, 64, 69, 72]
b = 0.5  # tempo a 120 BPM

# ---------- cama: ukulele + estalos até o pouso, banda cheia depois
for k in range(int(s('pousa') / b) if MUSICA else 0):
    t = k * b
    put(strum([C, G, Am, F][k // 2 % 4], 1.0, down=True, g=0.40), t, pan=-0.25)
    put(strum([C, G, Am, F][k // 2 % 4], 0.7, down=False, g=0.24), t + b / 2, pan=-0.25)
    if k % 2: put(snap(), t, 0.35, pan=0.3)
# ---------- bolinha
put(apito(1500, 700, s('q1') + 0.02), 0.0, 0.35, pan=-0.5)
put(boing(midi(72)), s('q1'), 0.55, pan=-0.45)
put(boing(midi(76)), s('q2'), 0.5, pan=-0.2)
put(mix(thud(0.25, 90) * 0.6, tap(400) * 0.4), s('q3'), 0.6)
put(borbulha(0.1, 260, 900), s('q3') + 0.02, 0.25)
put(mix(pop(700, 0.2), borbulha(0.07, 500, 2200)), s('pop'), 0.8)
put(whoosh(0.35, 300, 3000, 0.25), s('pop') - 0.05, 0.4)
put(borbulha(0.14, 900, 250), s('furo'), 0.55)  # bloop do furo
# ---------- letras: marimba subindo
for k, (nome, m) in enumerate(zip('lif', [72, 76, 79])):
    put(mallet(midi(m), 0.6), s(nome) + 0.12, 0.6, pan=-0.3 + 0.2 * k)
put(mallet(midi(84), 0.7), s('e') + 0.12, 0.6, pan=0.3)
# ---------- "cadê o pingo?": dois apitinhos curiosos
put(apito(midi(79) * 1.0, midi(83), 0.16), s('procura') + 0.18, 0.22, pan=-0.4)
put(apito(midi(81), midi(86), 0.18), s('procura') + 0.42, 0.22, pan=0.4)
# ---------- o pingo cai: apito descendo até o pouso
put(apito(2400, 900, s('pousa') - s('cai')), s('cai'), 0.42)
# ---------- TCHARAM
tp = s('pousa')
put(glock(96, 1.2), tp, 0.45)
put(kick(0.5, 1.0, 55), tp, 0.9)
put(crash(2.2), tp, 0.18)
if MUSICA:
    put(strum([48 + 12, 64, 67, 72, 76], 2.4, g=0.5), tp, pan=-0.2)
    put(mix(*[ep(midi(m), 2.2) for m in (60, 64, 67, 72)]), tp, 0.22, pan=0.2)
    put(bass(midi(36), 1.4, 0.6), tp, 0.7)
else:
    # sem música: estouros dos confetes (um pop por forma) e whoosh das ondas
    for k in range(18):
        put(pop(rng2.uniform(900, 2200), 0.12), tp + (2 + (k % 2) * 5 + k % 3) / 30 + rng2.uniform(0, 0.04), 0.18, pan=rng2.uniform(-0.8, 0.8))
    put(whoosh(0.45, 400, 4000, 0.3), tp + 1 / 30, 0.35)
    put(whoosh(0.4, 600, 5000, 0.3), tp + 7 / 30, 0.25, pan=0.2)
    put(whoosh(0.35, 800, 5000, 0.3), s('hop1'), 0.15)
for k in range(3): put(clap(0.12), tp + k * 0.018, 0.45, pan=(-0.5, 0.5, 0)[k])
for k, m in enumerate([84, 88, 91, 96, 100]):  # brilho dos confetes
    put(glock(m, 0.6), tp + 0.07 + 0.045 * k, 0.16, pan=-0.6 + 0.3 * k)
# ---------- groove depois do pouso
n = int((s('fim') - tp) / b)
for k in range(1, n + 1 if MUSICA else 1):
    t = tp + k * b
    acorde = [C, F, G, C][min(3, (k - 1) // 2)]
    put(strum(acorde, 1.0, g=0.45), t, pan=-0.25); put(strum(acorde, 0.7, down=False, g=0.26), t + b / 2, pan=-0.25)
    if k % 2: put(clap(), t, 0.35, pan=0.15)
    else: put(kick(0.35, 0.8, 55), t, 0.55)
    for q in range(4): put(shaker(), t + q * b / 4, 0.12 if q % 2 else 0.2, pan=0.45)
    put(bass(midi([36, 41, 43, 36][min(3, (k - 1) // 2)]), 0.3), t, 0.45)
for k, ac in enumerate([C, F, G] if MUSICA else []):  # pad sustentando a festa
    for m in ac: put(pad_voice(midi(m), 1.1 if k < 2 else 1.6, 0.05, 0.5, 2600), tp + 0.5 + k, 0.05, pan=0.1)
# ---------- pulinho final do pingo
put(boing(midi(84), 0.25), s('hop0'), 0.35)
put(mix(glock(91, 0.8), tap(1200) * 0.3), s('hop1'), 0.4)
if MUSICA: put(strum([60, 64, 67, 72, 76], 1.6, g=0.35), s('hop1'), pan=-0.1)
# saída suave nos últimos 0,35 s
fim = int(s('fim') * SR); env = np.ones(len(L)); env[fim - int(0.35 * SR):fim] = np.linspace(1, 0, int(0.35 * SR)) ** 2; env[fim:] = 0
st = np.stack([L * env, R * env], 1)[:fim]
st = st / (np.abs(st).max() + 1e-9) * 0.89
out = os.path.join(D, '../../audio/' + ('vinheta-som.wav' if MUSICA else 'vinheta-sfx.wav'))
wavfile.write(out, SR, (st * 32767).astype(np.int16))
print('ok', out, st.shape[0] / SR)
