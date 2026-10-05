# Síntese de efeitos (copiada de pessoal-vitor/aula-otica/trabalho/fonte/sons.py)
import math, subprocess
import numpy as np
SR = 48000
rng = np.random.default_rng(7)

def ler(path):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    return x.reshape(-1, 2).copy()
def grava(path, x):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", path], input=np.ascontiguousarray(x, np.float32).tobytes(), check=True)

# ------------------------------------------------------------------ síntese
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def ruido(n): return rng.standard_normal(n).astype(np.float32)
def passa_banda(x, f0, q=1.0):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    h = 1 / (1 + ((f / max(f0, 1) - max(f0, 1) / np.maximum(f, 1)) * q) ** 2)
    return np.fft.irfft(X * h, len(x)).astype(np.float32)
def passa_baixa(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x)).astype(np.float32)

def pluck(freq, dur=0.9):  # marimba macia: fundamental + parcial 4x que morre rápido
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) * env_exp(n, 0.28) + 0.35 * np.sin(2 * np.pi * freq * 3.98 * t) * env_exp(n, 0.04)
    a = int(0.003 * SR); x[:a] *= np.linspace(0, 1, a)
    return x.astype(np.float32)
def thud(dur=0.45, f0=95, f1=48):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f1 + (f0 - f1) * np.exp(-t / 0.05)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n, 0.11)
    k = int(0.012 * SR); x[:k] += passa_banda(ruido(k), 1800, 1.5) * 0.5 * np.linspace(1, 0, k)
    x += 0.35 * np.sin(2 * np.pi * 180 * t) * env_exp(n, 0.03)  # "knock" para caixa pequena (LICOES)
    return x.astype(np.float32)
def whoosh(dur=0.7, f0=600, f1=2400, pico=0.6):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = ruido(n); out = np.zeros(n, np.float32); bl = 2048
    for i in range(0, n, bl // 2):  # filtro que varre (blocos sobrepostos)
        seg = x[i:i + bl]
        if len(seg) < 64: break
        fc = f0 + (f1 - f0) * t[min(i + bl // 2, n - 1)]
        y = passa_banda(seg, fc, 2.0) * np.hanning(len(seg))
        out[i:i + len(y)] += y
    e = np.where(t < pico, (t / pico) ** 2, ((1 - t) / (1 - pico)) ** 1.5)
    return (out * e / (np.abs(out).max() + 1e-9)).astype(np.float32)
def tick(f=3200, dur=0.03):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * env_exp(n, 0.006)).astype(np.float32)
def chime(freq=1046.5, dur=2.2):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * freq * r * t) * env_exp(n, d) for a, r, d in [(1, 1, 0.9), (0.45, 2.76, 0.35), (0.25, 5.4, 0.15), (0.3, 2.0, 0.6)])
    a = int(0.004 * SR); x[:a] *= np.linspace(0, 1, a)
    return (x / 1.6).astype(np.float32)
def boom(dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (42 + 30 * np.exp(-t / 0.15)) * t) * env_exp(n, 0.45)
    x += passa_baixa(ruido(n), 300) * 0.25 * env_exp(n, 0.25)
    return x.astype(np.float32)
def subida(dur=1.2):  # "swell" de ar que cresce até o impacto
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = passa_banda(ruido(n), 1500, 0.8) * t ** 3
    return (x / (np.abs(x).max() + 1e-9)).astype(np.float32)
def ar(dur):
    n = int(dur * SR); x = passa_baixa(ruido(n), 900) + 0.3 * passa_banda(ruido(n), 2500, 1.2)
    return (x / (np.abs(x).max() + 1e-9)).astype(np.float32)
def reverb(x, rt=0.9, mix=0.22):
    n = int(rt * SR); ir = ruido(n) * env_exp(n, rt / 6.9); ir = passa_baixa(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    y = np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n), len(x) + n)[:len(x)]
    return ((1 - mix) * x + mix * y).astype(np.float32)

PENTA = [0, 2, 4, 7, 9]
def nota(k, base=523.25):  # k-ésimo grau da pentatônica de Dó a partir de Dó5
    o, g = divmod(k, 5); return base * 2 ** (o + PENTA[g] / 12)

