"""Sound for the standalone logo animation (composition "Vinheta", 225 frames at 30 fps), all synthesized.

The same cues as the ad's opening (make_audio.py, section 1), then instead of the groove the landing of the dot
resolves on a D major chord that rings to the end, and the dot's last hop gets its own small sound.
Run: python3 audio/make_sting.py  ->  out/audio/vinheta.wav, -16 LUFS integrated, true peak <= -1 dBTP.
"""
import os
import re
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve, resample_poly

from synth import (SR, bass, bell, button_press, flap_air, flap_land, hop, hp, keytick, kick, lp, mallet, midi,
                   pad_voice, plip, snap, swish, tap, whoosh, rng, ep)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out', 'audio')
os.makedirs(OUT, exist_ok=True)

FPS = 30
NFR = 225
N = int(SR * NFR / FPS)
WINK = 182  # src/Vinheta.tsx WINK_STING; the dot lands 12 frames later


def ts(f):
    return f / FPS


def bus():
    return np.zeros((N, 2))


mus, sfx, rev = bus(), bus(), bus()


def place(dst, sig, f, gain=1.0, pan=0.0, send=0.0, sec=False):
    t = f if sec else ts(f)
    i = int(round(t * SR))
    if i >= N or gain == 0:
        return
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        st = np.stack([sig * l, sig * r], 1)
    else:
        st = sig
    dst[i : i + len(st)] += st * gain
    if send:
        rev[i : i + len(st)] += st * gain * send


# ---------------------------------------------------------------- score: a D pad that opens, then the chord
D_VOICING = [54, 57, 61, 64]
for k, m in enumerate(D_VOICING):
    place(mus, pad_voice(midi(m), ts(112), att=1.4, rel=0.5, bright=1500), 0, 0.22 * 0.8, pan=-0.35 + 0.23 * k, send=0.35)
    place(mus, pad_voice(midi(m), ts(NFR - 112) - 0.3, att=0.05, rel=1.6, bright=2400), 112, 0.22, pan=-0.35 + 0.23 * k, send=0.35)
for i, m in enumerate(D_VOICING):
    place(mus, ep(midi(m + 12), 2.4), 112, 0.16, pan=-0.3 + 0.2 * i, send=0.4)
place(mus, bass(midi(38), 2.6, decay=1.2), 112, 0.45)
place(mus, kick(), 112, 0.45)
for i, m in enumerate((74, 78, 81, 85, 88)):
    place(mus, bell(midi(m), 3.5, 1.4), ts(112) + 0.06 * i, 0.08, pan=-0.4 + 0.2 * i, send=0.45, sec=True)

# ---------------------------------------------------------------- sound design (same frames as the ad)
place(sfx, swish(0.4, 600, 3000), 0, 0.10, send=0.1)
for f, fq, g in ((14, 1040, 0.55), (28, 930, 0.5), (42, 830, 0.46)):
    place(sfx, tap(fq), f, g, pan=-0.25 + f / 140, send=0.12)
place(sfx, tap(740, weight=0.9), 56, 0.7, pan=0.15, send=0.12)
place(sfx, swish(0.3, 3000, 800), 56, 0.08)
place(sfx, whoosh(0.45, 400, 5200, peak=0.35), 57, 0.4, pan=0.2, send=0.1)
place(sfx, swish(0.4, 1500, 4200), 58, 0.07)
place(sfx, snap(), 70, 0.42)
for rel, fq, pn in ((74, midi(62), -0.45), (78, midi(66), 0.0), (81, midi(69), 0.1)):
    place(sfx, flap_air(10), rel, 0.16, pan=pn, send=0.08)
    place(sfx, flap_land(fq), rel + 10, 0.42, pan=pn, send=0.12)
    place(sfx, flap_land(fq * 2, 0.2, 0.2), rel + 16, 0.1, pan=pn, send=0.1)
place(sfx, button_press(), 98, 0.6, send=0.1)
place(sfx, plip(), 112, 0.9, send=0.15)
place(sfx, whoosh(1.2, 300, 1200, peak=0.4), 112, 0.10)
for f in (128, 130, 132):
    place(sfx, keytick(), f, 0.22)
for f, m in zip((136, 140, 144, 148), (74, 78, 81, 86)):
    place(sfx, mallet(midi(m), 0.9), f, 0.18, send=0.4)
# the dot's last hop, on the chord's tail
place(sfx, hop(), WINK, 0.12, pan=-0.2, send=0.15)
place(sfx, plip(), WINK + 12, 0.42, pan=-0.2, send=0.2)
place(sfx, bell(midi(93), 2.0), WINK + 12, 0.035, pan=-0.2, send=0.45)


# ---------------------------------------------------------------- mix and master
def make_ir(rt=1.7, pre=0.014):
    n = int(SR * rt * 1.1)
    t = np.arange(n) / SR
    env = np.exp(-6.91 * t / rt)
    ir = np.zeros((n + int(pre * SR), 2))
    for ch in range(2):
        ir[int(pre * SR):, ch] = lp(rng.standard_normal(n) * env, 6000)
    for dly, g in ((0.007, 0.5), (0.011, 0.4), (0.017, 0.3), (0.023, 0.25)):
        ir[int(dly * SR), 0] += g
        ir[int((dly + 0.003) * SR), 1] += g
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))


IR = make_ir()
wet = np.stack([fftconvolve(rev[:, c], IR[:, c])[:N] for c in range(2)], 1)
mus += 0.5 * np.stack([hp(mus[:, c], 300) for c in range(2)], 1)  # presence lift, as in the ad
mix = mus + sfx * 2.0 * 10 ** (-4 / 20) + wet * 0.6
mix = np.stack([hp(mix[:, c], 32) for c in range(2)], 1)
t = np.arange(N) / SR
mix *= np.clip((ts(NFR) - t) / 0.35, 0, 1)[:, None]  # the chord's tail is faded over the last 0.35 s


def limiter(x, ceiling=0.84, look=0.004, rel=0.09):
    up = np.stack([resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    pk = np.max(np.abs(up), axis=1)[: 4 * len(x)].reshape(-1, 4).max(axis=1)
    w = int(look * SR)
    pk = maximum_filter1d(pk, size=2 * w + 1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    a = np.exp(-16 / (rel * SR))
    pad = (16 - len(g) % 16) % 16
    gb = np.pad(g, (0, pad), constant_values=1).reshape(-1, 16).min(axis=1)
    out = np.empty_like(gb)
    cur = 1.0
    for i, v in enumerate(gb):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    gs = np.repeat(out, 16)[: len(g)]
    gs = np.minimum(uniform_filter1d(gs, size=int(0.002 * SR)), g)
    return x * gs[:, None]


PATH = os.path.join(OUT, 'vinheta.wav')


def measure(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'],
                       capture_output=True, text=True)
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
    return I, tp


TARGET = -14.0  # same master level as the ad
gain = 0.5 / (np.max(np.abs(mix)) + 1e-9)
for it in range(6):
    y = limiter(mix * gain)
    wavfile.write(PATH, SR, y.astype(np.float32))
    I, tp = measure(PATH)
    print(f'pass {it}: I {I:.2f} LUFS, TP {tp:.2f} dBTP')
    if abs(I - TARGET) < 0.15 and tp <= -1.0:
        break
    gain *= 10 ** ((TARGET - I) / 20)
print('written', PATH)
