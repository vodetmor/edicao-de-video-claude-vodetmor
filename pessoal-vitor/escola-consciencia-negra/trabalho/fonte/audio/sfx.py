"""Efeitos sintetizados (sem licença) para a parte 1: impactos graves, whoosh escuro, riser reverso,
batida surda, risco de lápis, tique. Tudo mono 48 kHz em public/sfx/."""
import numpy as np, os, wave
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000
rng = np.random.default_rng(3)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)
T = lambda d: np.arange(int(SR * d)) / SR
def filt(x, kind, fc, o=2): return sosfilt(butter(o, fc, kind, fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(SR * d))
def ir(d=2.2, damp=3000):
    t = T(d); x = noise(d) * np.exp(-t / (d / 6.5)); return filt(x, 'low', damp) * 0.08
def reverb(x, wet=0.35, d=2.2, damp=3000):
    y = fftconvolve(x, ir(d, damp))[: len(x) + int(SR * d)]
    out = np.zeros(len(y)); out[: len(x)] += x * (1 - wet); return out + y * wet
def save(name, x, peak=0.89):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

def sub_boom(d=3.2, f0=62, f1=31, bright=1.0):
    t = T(d)
    fr = f1 + (f0 - f1) * np.exp(-t / 0.35)
    body = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 1.1) * (1 - np.exp(-t / 0.004))
    knock = 0.35 * np.sin(2 * np.pi * 110 * t) * np.exp(-t / 0.05)  # aparece em caixa pequena
    trans = filt(noise(d), 'band', [120, 2400]) * np.exp(-t / 0.012) * 0.5 * bright
    rumble = filt(noise(d), 'low', 180) * np.exp(-t / 0.9) * 0.6
    x = np.tanh(1.3 * (body + knock + trans + rumble))
    return reverb(x, 0.3, 2.8, 1800)

def thud(d=0.9):  # batida surda, como um tambor abafado (pilha "SEM")
    t = T(d)
    fr = 48 + 70 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.22) + 0.2 * filt(noise(d), 'low', 600) * np.exp(-t / 0.03)
    return reverb(np.tanh(1.5 * x), 0.22, 1.6, 1500)

def whoosh(d=0.9, lo=180, hi=1400, peak_at=0.55):
    t = T(d)
    env = np.exp(-((t - peak_at * d) ** 2) / (2 * (d * 0.2) ** 2))
    x = noise(d)
    # banda que sobe e desce com a velocidade (brilho limitado: nada de whoosh "sci-fi")
    out = np.zeros_like(x); n = 12; L = len(x) // n
    for k in range(n):
        c = lo + (hi - lo) * np.exp(-((k / n - peak_at) ** 2) / 0.05)
        seg = filt(x, 'band', [c * 0.6, c * 1.6])[k * L:(k + 1) * L]
        out[k * L:(k + 1) * L] = seg
    return reverb(out * env, 0.25, 1.2, 2500)

def riser_rev(d=2.9):  # "rebobinar": ruído + tom que sobem acelerando e terminam secos
    t = T(d)
    env = (t / d) ** 2.2
    x = filt(noise(d), 'band', [300, 3000]) * env
    fr = 90 + 900 * (t / d) ** 2
    tone = 0.25 * np.sin(2 * np.pi * np.cumsum(fr) / SR) * env
    y = x + tone
    y[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return y

def scribble(d=0.5):  # traço de lápis/caneta no papel
    t = T(d)
    g = (rng.random(int(SR * d)) < 0.5).astype(float)
    g = filt(g, 'low', 40)
    x = filt(noise(d), 'band', [1800, 7000]) * (0.4 + g) * np.sin(np.pi * t / d) ** 0.6
    return x * 0.5

def tick(d=0.06):
    t = T(d)
    return filt(noise(d), 'band', [2000, 6000]) * np.exp(-t / 0.004) + 0.5 * np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.01)

def thunder(d=6.0):  # reserva, caso o Freesound não traga um bom
    t = T(d)
    crack = filt(noise(d), 'band', [300, 6000]) * np.exp(-t / 0.08)
    roll = filt(noise(d), 'low', 220) * (np.exp(-t / 1.8)) * (1 + 0.6 * np.sin(2 * np.pi * 1.3 * t + np.sin(7 * t)))
    return reverb(np.tanh(crack * 1.4 + roll * 2.0), 0.5, 3.5, 1200)

save("boom", sub_boom())
save("boom-grande", sub_boom(4.2, 70, 28, 1.3))
save("boom-leve", sub_boom(2.2, 58, 36, 0.4), 0.7)
save("thud", thud())
save("boom-sub", sub_boom(3.6, 64, 30, 0.0))
save("whoosh", whoosh())
save("whoosh-longo", whoosh(1.4, 150, 1100, 0.6))
save("rebobina", riser_rev())
save("lapis", scribble())
save("tick", tick(), 0.6)
save("trovao-sint", thunder())
print("ok", sorted(os.listdir(OUT)))
