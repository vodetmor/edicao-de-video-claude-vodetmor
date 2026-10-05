"""The 4.5 s cut of the logo animation's sound: frames A..B of out/audio/vinheta.wav, with a short fade in and the
chord's tail faded over the last 0.35 s, at the same -14 LUFS as the sting (only turned down, never pushed past
its limiter). Run after make_sting.py:  python3 audio/cut_sting.py  ->  out/audio/vinheta_curta.wav"""
import os
import re
import subprocess

import numpy as np
from scipy.io import wavfile

A, B = 66, 200  # the cut: the triangle's outline closing, 4 frames before the SNAP, to the dot's last landing + 6
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out', 'audio')
sr, x = wavfile.read(os.path.join(OUT, 'vinheta.wav'))
y = x[int(A / 30 * sr) : int(B / 30 * sr)].astype(np.float64)
n = len(y)
t = np.arange(n) / sr
y *= np.clip(t / 0.02, 0, 1)[:, None] * np.clip((t[-1] - t) / 0.35, 0, 1)[:, None]
path = os.path.join(OUT, 'vinheta_curta.wav')


def measure(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'],
                       capture_output=True, text=True)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])


wavfile.write(path, sr, y.astype(np.float32))
I, tp = measure(path)
if I > -14.0:
    y *= 10 ** ((-14.0 - I) / 20)
    wavfile.write(path, sr, y.astype(np.float32))
    I, tp = measure(path)
print(f'{path}: {n / sr:.2f} s, I {I:.1f} LUFS, TP {tp:.1f} dBTP')
