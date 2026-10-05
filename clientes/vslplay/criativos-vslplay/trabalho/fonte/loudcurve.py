"""Short-term loudness (EBU S, 3 s window) of a wav, printed every second: python3 loudcurve.py file.wav"""
import re, subprocess, sys
import numpy as np
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-v', 'verbose', '-i', sys.argv[1], '-af', 'ebur128=framelog=verbose', '-f', 'null', '-'],
                   capture_output=True, text=True)
rows = re.findall(r't:\s*([\d.]+)\s+TARGET:.*?M:\s*(-?[\d.]+)\s+S:\s*(-?[\d.]+)', r.stderr)
d = np.array(rows, float)
t, M, S = d[:, 0], d[:, 1], d[:, 2]
for sec in np.arange(1, t[-1] + 0.01, 1.0):
    i = np.argmin(abs(t - sec))
    print(f"{sec:5.1f}s f{int(sec*30):5d}  M {M[i]:6.1f}  S {S[i]:6.1f}")
print('LRA line:', re.findall(r'LRA:\s+(-?[\d.]+) LU', r.stderr)[-1], 'I:', re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
