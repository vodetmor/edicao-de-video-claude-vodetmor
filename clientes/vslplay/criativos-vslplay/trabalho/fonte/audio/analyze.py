import numpy as np
from scipy.io import wavfile
from scipy.signal import spectrogram
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
sr, x = wavfile.read('out/audio/mix.wav')
m = x.astype(np.float64).mean(axis=1)
hop = sr // 30
win = int(0.4 * sr)
def st(sig):
    c = np.cumsum(np.concatenate([[0], sig ** 2]))
    out = []
    for i in range(0, len(sig), hop):
        a, b = max(0, i - win // 2), min(len(sig), i + win // 2)
        out.append(10 * np.log10((c[b] - c[a]) / max(1, b - a) + 1e-12))
    return np.array(out)
db = st(m)
fig, ax = plt.subplots(2, 1, figsize=(20, 9))
ax[0].plot(db, 'k', lw=1.2, label='mix')
for nme, col in zip(['music', 'drums', 'sfx', 'reverb'], ['tab:blue', 'tab:orange', 'tab:red', 'tab:gray']):
    _, s = wavfile.read(f'out/audio/stem-{nme}.wav')
    ax[0].plot(st(s.astype(np.float64).mean(axis=1)), color=col, lw=0.7, label=nme)
for f, l in [(14, 'b1'), (56, 'b4'), (70, 'SNAP'), (112, 'land'), (252, 'ATENÇÃO'), (336, 'clk'), (392, 'clk'), (462, 'clk'), (504, 'RETENÇÃO'), (606, 'data'), (644, 'knee'), (728, 'CONVERSÃO'), (798, 'hit'), (933, 'stretch'), (961, 'whip'), (1050, 'stamp'), (1078, 'mais'), (1162, 'integr'), (1246, 'dial'), (1288, 'silêncio'), (1302, 'release'), (1318, 'SNAP'), (1330, 'land')]:
    ax[0].axvline(f, color='g', lw=0.4)
    ax[0].text(f + 2, -12, l, fontsize=7, rotation=90)
ax[0].set_ylim(-70, -5)
ax[0].set_xlim(0, 1440)
ax[0].legend(loc='lower left', fontsize=8)
ax[0].grid(alpha=0.2)
f, t, S = spectrogram(m, sr, nperseg=2048, noverlap=1024)
ax[1].pcolormesh(t * 30, f, 10 * np.log10(S + 1e-14), shading='auto', vmin=-120, vmax=-35, cmap='magma')
ax[1].set_yscale('log')
ax[1].set_ylim(30, 20000)
ax[1].set_xlim(0, 1440)
plt.tight_layout()
plt.savefig('out/audio/analysis.png', dpi=72)
# spectral balance (whole mix): energy per octave band
spec = np.abs(np.fft.rfft(m)) ** 2
fq = np.fft.rfftfreq(len(m), 1 / sr)
bands = [(20, 60), (60, 120), (120, 250), (250, 500), (500, 1000), (1000, 2000), (2000, 4000), (4000, 8000), (8000, 16000)]
tot = spec.sum()
print('band energy %:', ' '.join(f'{a}-{b}:{100 * spec[(fq >= a) & (fq < b)].sum() / tot:.1f}' for a, b in bands))
