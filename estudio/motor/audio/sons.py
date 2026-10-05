"""Biblioteca de sons do motor (100% sintetizado, sem licença) + voz e cama do teste.
Uso: python3 audio/sons.py  ->  public/audio/*.wav
- sfx_*.wav: efeitos curtos, posicionados depois pela spec (ancorados em palavras).
- voz_gancho.wav: trecho do gancho do criativo 2 (voz do cliente).
- cama_gancho.wav: pulso 120 BPM que já abaixa sozinho sob a voz (ducking pelo envelope da voz)."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'audio'))
from synth import *  # noqa

OUT = os.path.join(ROOT, 'public/audio')
os.makedirs(OUT, exist_ok=True)
VO = '/mnt/project-files/criativos-vslplay/trabalho/audio/vo_c2.wav'
W = json.load(open(os.path.join(ROOT, 'src/data/words_c2.json')))['words']
FPS = 30


def save(name, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    wavfile.write(os.path.join(OUT, name), SR, (norm(x, peak) * 32767).astype(np.int16))


# ---- efeitos
save('sfx_whoosh.wav', whoosh(0.42, 300, 5200, peak=0.7, bw=0.8, tail=0.3))
save('sfx_swish.wav', swish(0.22))
save('sfx_pop.wav', pop(820, 0.2))
save('sfx_press.wav', button_press())
save('sfx_thud.wav', thud(0.55, 52))
save('sfx_riser.wav', riser(0.9, 300, 7000))
save('sfx_tick.wav', keytick())
save('sfx_impact.wav', impact(1.6))

# ---- voz do gancho: do início até o fim de "oferta." + respiro
sr, v = wavfile.read(VO)
v = v.astype(np.float64) / 32768.0
if v.ndim == 2:
    v = v.mean(1)
end_f = next(w for w in W if w['w'].lower().startswith('oferta'))['fe']
DUR_F = end_f + 22
v = v[: int(DUR_F / FPS * sr)]
fade = int(0.03 * sr)
v[-fade:] *= np.linspace(1, 0, fade)
save('voz_gancho.wav', v, peak=0.95)

# ---- cama: pulso discreto 120 BPM (15 quadros por tempo), em Lá menor
N = int(DUR_F / FPS * SR) + SR // 2
bed = np.zeros(N)


def put(sig, t, g):
    i = int(t * SR)
    s = sig[: max(0, N - i)]
    bed[i : i + len(s)] += s * g


beat = 0.5
for k in range(int(DUR_F / FPS / beat) + 1):
    t = k * beat
    put(kick(0.35, 0.8, 50), t, 0.9 if k % 2 == 0 else 0.55)
    put(hat(), t + beat / 2, 0.16)
    root = [45, 45, 41, 43][(k // 4) % 4]
    put(bass(midi(root), 0.42, 0.2), t, 0.5)
pad = sum(pad_voice(midi(m), N / SR - 0.4, att=0.3, rel=0.4, bright=1600) for m in (57, 60, 64))
bed += lp(pad, 2400)[:N] * 0.22
# ducking pelo envelope da voz: -9 dB sob a fala, ataque 120 ms, retorno 600 ms
env = uniform_filter1d(maximum_filter1d(np.abs(np.pad(v, (0, max(0, N - len(v))))[:N]), int(0.05 * SR)), int(0.05 * SR))
on = (env > 0.04).astype(float)
g = np.ones(N)
lvl = 1.0
duck = 10 ** (-9 / 20)
a, r = 1 - np.exp(-1 / (0.12 * SR)), 1 - np.exp(-1 / (0.6 * SR))
for i in range(0, N, 64):
    tgt = duck if on[i] else 1.0
    k = a if tgt < lvl else r
    lvl += (tgt - lvl) * (1 - (1 - k) ** 64)
    g[i : i + 64] = lvl
save('cama_gancho.wav', bed * g, peak=0.5)
json.dump({'durFrames': DUR_F}, open(os.path.join(ROOT, 'src/data/gancho_meta.json'), 'w'))
print('ok, duração', DUR_F, 'quadros')
