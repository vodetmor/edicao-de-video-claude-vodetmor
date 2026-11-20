"""Trilha + efeitos + mix do vídeo institucional da Dra. Aline Marques. Tudo sintetizado (synth.py), sem amostras e sem licença.
Música original calma em Fá maior (84 BPM): pad + marimba suave + baixo; efeitos presos às mesmas palavras da animação (tempos em segundos
da locução Ana Dias). Voz na frente: a música abaixa ~20 dB enquanto ela fala e volta nas pausas. Master -14 LUFS / -1 dBTP.
Uso: python audio/audio.py  ->  ../../render/audio.wav"""
import os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from synth import *  # noqa

W = os.path.abspath(os.path.join(HERE, '..', '..'))
VOZ = os.path.join(W, 'voz', 'locucao-ana-dias.mp3')
OUT = os.path.join(W, 'render')
os.makedirs(OUT, exist_ok=True)
DUR = 117.0
N = int((DUR + 0.5) * SR)
PRE = 5 / 30  # a imagem chega 5 quadros antes da fala

# ---- voz (mp3 -> mono 48 kHz)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', VOZ, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
voice = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]

mus = np.zeros((N, 2)); sfx = np.zeros((N, 2)); rev = np.zeros((N, 2))


def place(dst, sig, t, gain=1.0, pan=0.0, send=0.0):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s = sig
    if i < 0:
        s, i = s[-i:], 0
    s = s[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dst[i : i + len(s), 0] += s * gain * l * 1.4142
    dst[i : i + len(s), 1] += s * gain * r * 1.4142
    if send:
        rev[i : i + len(s), 0] += s * gain * send
        rev[i : i + len(s), 1] += s * gain * send


# ------------------------------------------------------------------ música
BPM = 84.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
CH = [([53, 57, 60, 64], 41), ([50, 53, 57, 60], 38), ([46, 50, 53, 57], 34), ([48, 52, 55, 60], 36)]  # Fmaj7 Dm7 Bbmaj7 C6


def inten(t):  # 0..1: quanto a música "abre" em cada parte do vídeo
    pts = [(0, 0.55), (9.5, 0.5), (10.0, 0.32), (14.4, 0.42), (24.4, 0.5), (28.9, 0.85), (33.0, 0.95), (55.0, 1.0), (83.5, 0.95), (92.0, 0.9), (103.0, 1.0), (109.5, 0.85), (117.0, 0.2)]
    xs, ys = zip(*pts)
    return float(np.interp(t, xs, ys))


nb = int(DUR / BAR) + 2
for b in range(nb):
    t0 = b * BAR
    tones, root = CH[b % 4]
    k = inten(t0 + BAR / 2)
    for j, m in enumerate(tones):
        place(mus, pad_voice(midi(m), BAR + 0.2, att=0.7, rel=1.0, bright=1700), t0 - 0.05, 0.9 * k * (0.9 - 0.08 * j), pan=(j - 1.5) * 0.25, send=0.35)
    if t0 >= 28.5 and t0 < 109.5:  # marimba suave em colcheias
        pat = [0, 2, 1, 3, 2, 1, 3, 2]
        for s8 in range(8):
            tt = t0 + s8 * BEAT / 2
            if s8 in (0, 3, 5, 6) or inten(tt) > 0.95:
                m = tones[pat[s8] % 4] + 12
                place(mus, mallet(midi(m), 0.9, 0.7), tt, 0.28 * k, pan=-0.4 + 0.8 * ((s8 % 4) / 3), send=0.45)
    if t0 >= 32.5 and t0 < 109.5:
        place(mus, bass(midi(root), 0.9, 0.55), t0, 0.55 * k)
        place(mus, bass(midi(root + 7 if b % 2 else root), 0.6, 0.4), t0 + 2 * BEAT, 0.35 * k)
    if t0 >= 46 and t0 < 103:  # respiro de shaker, quase imperceptível
        for s4 in range(4):
            place(mus, shaker(), t0 + s4 * BEAT + BEAT / 2, 0.07 * k, pan=0.3)
# sustenta o final
place(mus, pad_voice(midi(53), 6.0, att=0.8, rel=2.5, bright=1500), 111.0, 0.5, send=0.5)
place(mus, pad_voice(midi(60), 6.0, att=0.8, rel=2.5, bright=1500), 111.0, 0.4, send=0.5)
place(mus, pad_voice(midi(64), 6.0, att=0.8, rel=2.5, bright=1500), 111.0, 0.35, send=0.5)

# ------------------------------------------------------------------ efeitos (segundos da locução; a animação chega PRE antes)
SC = [10.0, 14.4, 24.5, 29.0, 33.0, 46.6, 55.3, 65.8, 71.1, 83.7, 92.3, 103.3, 109.8]
for s in SC:
    place(sfx, swish(0.28, 600, 3800), s - PRE - 0.12, 0.30, pan=0.2)
S = {'pop': (pop, 0.30), 'plip': (plip, 0.30)}


def pp(t, f=900, g=0.30, pan=0.0):
    place(sfx, pop(f), t - PRE * 0 - 0.02, g, pan=pan, send=0.12)


def pl(t, g=0.28, pan=0.0):
    place(sfx, plip(), t - 0.02, g, pan=pan, send=0.15)


def bl(t, note=88, g=0.22, pan=0.0):
    place(sfx, bell(midi(note), 1.8, 0.7), t, g, pan=pan, send=0.5)


def keys(a, b, g=0.16):
    t = a
    while t < b:
        place(sfx, keytick(), t, g * (0.7 + 0.6 * rng.random()), pan=0.15)
        t += 0.075 + 0.04 * rng.random()


# K01
pl(2.6); pp(4.4, 1500, 0.34); bl(4.45, 93, 0.18)
place(sfx, whoosh(0.5, 400, 2500, 0.5), 5.4, 0.22)
keys(8.1, 9.6); pp(9.75, 1700, 0.26)
# K02
pp(10.1, 1300, 0.2)
for k in range(8):
    place(sfx, tick(2400, 0.03, 0.006), 10.2 + k * 0.5, 0.10 * (1 if k % 2 == 0 else 0.7), pan=-0.3)
# K03
pl(14.5); pl(18.9, 0.30); bl(18.95, 91, 0.2)
pp(20.15, 800, 0.25); pp(21.45, 900, 0.25); pp(22.85, 1100, 0.3); bl(23.6, 96, 0.14)
# K04
for k in range(33):
    place(sfx, tick(2200 + 40 * k, 0.03, 0.005), 25.0 + k * 0.1, 0.10)
for i in range(9):
    pp(25.2 + i * 11 / 30, 700 + 60 * i, 0.20, pan=-0.4 + 0.1 * i)
# K05
pp(29.2, 800); pl(30.7); pl(31.2); bl(31.6, 84, 0.25); bl(31.9, 91, 0.2)
# K06
pp(33.6, 700, 0.22); keys(35.0, 36.0); pp(36.0, 1100, 0.24); pl(37.3, 0.22)
for t in (39.8, 41.7, 42.8, 44.9):
    pp(t, 1500, 0.26); bl(t, 84 + [0, 2, 4, 5][(39.8, 41.7, 42.8, 44.9).index(t)], 0.12)
pp(41.0, 700, 0.2); keys(41.8, 42.6); pp(42.6, 1100, 0.24); pp(44.8, 1100, 0.24)
# K07
place(sfx, swish(0.3, 800, 3500), 47.5, 0.24); pl(49.0); bl(49.05, 88, 0.2); bl(52.8, 84, 0.22); bl(52.85, 91, 0.16)
# K08
pl(60.6, 0.34); pp(62.6, 1300, 0.2); pp(63.5, 1300, 0.2); pp(64.4, 1300, 0.2)
place(sfx, swish(0.25, 700, 3000), 64.3, 0.2); place(sfx, swish(0.25, 700, 3000), 65.0, 0.2)
# K09
for t, n in zip((65.9, 66.8, 67.9, 68.7), (79, 83, 86, 91)):
    pl(t, 0.26); bl(t, n, 0.13)
place(sfx, whoosh(0.4, 500, 2200, 0.5), 69.6, 0.24); bl(69.75, 88, 0.22); bl(69.8, 95, 0.16)
# K10
for t in (73.1, 73.6, 74.5, 75.6):
    place(sfx, bp(noise(0.16), 2500, 8000) * np.exp(-T(0.16) / 0.06) * 0.5, t, 0.20, pan=-0.2)
place(sfx, whoosh(0.5, 300, 2000, 0.5), 79.0, 0.26)
for t, n in zip((79.9, 81.2, 82.8), (81, 85, 88)):
    pp(t, 1400, 0.24); bl(t, n, 0.14)
# K11
pl(83.9, 0.2); pl(86.0, 0.28)
for i in range(4):
    pp(86.6 + i * 12 / 30, 1200 + 90 * i, 0.20)
pp(89.3, 1300, 0.28); bl(89.35, 84, 0.2); pl(91.3, 0.26)
# K12
pl(92.5, 0.2)
for t, n in zip((94.0, 96.0, 98.2, 100.2), (79, 83, 86, 91)):
    pl(t, 0.32); bl(t + 0.02, n, 0.16)
# K13
place(sfx, swish(0.3, 3500, 800), 103.4 + 0.5, 0.2); place(sfx, swish(0.3, 3500, 800), 104.5 + 0.5, 0.2)
pp(103.4, 900, 0.22); pp(104.5, 900, 0.22); pl(106.5, 0.28); bl(106.5, 88, 0.24)
# K14
bl(109.9, 77, 0.28); bl(110.0, 84, 0.2); bl(112.0, 88, 0.2); bl(113.3, 91, 0.26); bl(113.35, 96, 0.18)

# ------------------------------------------------------------------ reverb simples (bus de envio)
def make_ir(rt=1.5):
    t = T(rt)
    ir = rng.standard_normal((len(t), 2)) * np.exp(-t / (rt / 5))[:, None]
    ir[:, 0] = lp(ir[:, 0], 5500); ir[:, 1] = lp(ir[:, 1], 5500)
    return ir * 0.05


IR = make_ir()
wet = np.stack([fftconvolve(rev[:, c], IR[:, c])[:N] for c in range(2)], 1)

# ------------------------------------------------------------------ ducking guiado pela voz
env = uniform_filter1d(np.abs(voice), size=int(0.18 * SR))
act = np.clip(env / (0.35 * np.percentile(env, 95) + 1e-9), 0, 1)
act = uniform_filter1d(maximum_filter1d(act, size=int(0.25 * SR)), size=int(0.35 * SR))
duck_m = 1.0 - 0.78 * act          # música: ~ -13 dB quando a voz fala (depois da escala abaixo ~ -20 LU)
duck_s = 1.0 - 0.35 * act          # efeitos: um pouco menos

music = (mus + wet * 0.8) * duck_m[:, None]
fx = sfx * duck_s[:, None]

# nível: música (com ducking) ~ 20 LU abaixo da voz falada
vr = np.sqrt(np.mean(voice[act[: len(voice)] > 0.5] ** 2) + 1e-12)
mr = np.sqrt(np.mean(music[act > 0.5] ** 2) + 1e-12)
music *= (0.105 * vr) / (mr + 1e-12)
fr = np.sqrt(np.mean(fx ** 2) + 1e-12)
fx *= (0.55 * vr * 0.5) / (fr + 1e-12) * 1.0

vo = np.stack([voice, voice], 1) * 1.0
mix = vo + music + fx
mix = np.pad(mix, ((0, 0), (0, 0)))
# fade de saída suave
nfo = int(1.2 * SR)
mix[-nfo:] *= np.linspace(1, 0, nfo)[:, None]


def limiter(x, ceiling=0.80, look=0.004, rel=0.09):
    up = np.stack([resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    pk = np.max(np.abs(up), axis=1)[: 4 * len(x)].reshape(-1, 4).max(axis=1)
    w = int(look * SR)
    pk = maximum_filter1d(pk, size=2 * w + 1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    a = np.exp(-16 / (rel * SR))
    gp = np.pad(g, (0, (16 - len(g) % 16) % 16), constant_values=1).reshape(-1, 16).min(axis=1)
    out = np.empty_like(gp); c = 1.0
    for i, vv in enumerate(gp):
        c = vv if vv < c else a * c + (1 - a) * vv
        out[i] = c
    gs = np.repeat(out, 16)[: len(g)]
    gs = np.minimum(uniform_filter1d(gs, size=int(0.002 * SR)), g)
    return x * gs[:, None]


def measure(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True)
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1]); LRA = float(re.findall(r'LRA:\s+(-?[\d.]+) LU', r.stderr)[-1]); tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
    return I, LRA, tp


MIXP = os.path.join(OUT, 'audio.wav')
gain = 0.5 / (np.max(np.abs(mix)) + 1e-9)
for it in range(7):
    y = limiter(mix * gain)
    wavfile.write(MIXP, SR, y.astype(np.float32))
    I, LRA, tp = measure(MIXP)
    print(f'pass {it}: I {I:.2f} LUFS, LRA {LRA:.1f} LU, TP {tp:.2f} dBTP')
    if abs(I + 14.0) < 0.15 and tp <= -1.0:
        break
    gain *= 10 ** ((-14.0 - I) / 20)
print('written', MIXP, '| voz ~', round(20 * np.log10(vr * gain + 1e-9), 1), 'dBFS rms; musica rel. voz:', round(20 * np.log10((0.105)), 1), 'dB (alvo ~-20)')
