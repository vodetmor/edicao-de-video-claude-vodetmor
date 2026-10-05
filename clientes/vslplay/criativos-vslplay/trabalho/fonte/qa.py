"""Frame QA for a rendered cut: frozen runs, one-frame dropouts, paper drift.
usage: python3 qa.py video.mp4"""
import subprocess
import sys

import numpy as np

path = sys.argv[1]
W, H = 320, 180
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}:flags=area,format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(fr)
print('frames', n)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))  # d[k] = |F(k+1) - F(k)|

# 1) frozen runs (identical neighbours) longer than 8 frames, outside the final lockup hold
runs, start = [], None
for k in range(n - 1):
    if d[k] < 0.05:
        start = k if start is None else start
    else:
        if start is not None and k - start >= 8:
            runs.append((start, k))
        start = None
if start is not None and n - 1 - start >= 8:
    runs.append((start, n - 1))
print('frozen runs > 8 frames:', runs if runs else 'none')

# 2) one-frame dropouts: k differs from both neighbours while the neighbours agree with each other
flags = []
for k in range(1, n - 1):
    a, b = d[k - 1], d[k]
    skip = np.abs(fr[k + 1] - fr[k - 1]).mean()
    if a > 3 and b > 3 and skip < 0.5 * min(a, b):
        flags.append((k, round(float(a), 1), round(float(b), 1), round(float(skip), 1)))
print('dropout candidates:', flags if flags else 'none')

# 3) paper drift: on paper stages the top-left patch must read (242, 241, 238). h.264 rounding moves a flat patch
# by 1-2 levels, so only a uniform patch (nothing passing through it) more than 2.5 levels off is reported
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', 'crop=48:48:24:120,format=rgb24', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
px = np.frombuffer(raw, np.uint8).reshape(-1, 48, 48, 3).astype(np.float32)
pc = px.mean(axis=(1, 2))
sd = px.std(axis=(1, 2)).max(axis=1)
paper = np.array([242, 241, 238], np.float32)
near = np.abs(pc - paper).max(axis=1)
drift = [(k, tuple(float(v) for v in np.round(pc[k], 1))) for k in range(len(pc)) if 2.5 < near[k] < 8 and sd[k] < 1.5]
print('paper drift frames (uniform patch 2.5..8 levels off):', len(drift), drift[:40])
np.save(path + '.d.npy', d)
