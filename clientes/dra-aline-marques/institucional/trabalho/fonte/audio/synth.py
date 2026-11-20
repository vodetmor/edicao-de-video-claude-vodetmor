"""Instruments and sound effects for the VSLPLAY ad, 100% synthesized with numpy (no samples, no licensing).
Every function returns a mono float array at SR unless noted."""
import numpy as np
from scipy.signal import butter, sosfilt, stft, istft

SR = 48000
rng = np.random.default_rng(11)


def T(d):
    return np.arange(int(SR * d)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)


def noise(d):
    return rng.standard_normal(int(SR * d))


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def norm(x, peak=1.0):
    return x * (peak / (np.max(np.abs(x)) + 1e-12))


# ------------------------------------------------------------------ music
def mallet(freq, d=0.7, bright=1.0):
    """FM mallet: hollow bright attack that settles into an almost pure tone."""
    t = T(d)
    idx = bright * 2.0 * np.exp(-t / 0.045)
    x = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * 3.0 * t))
    body = 0.22 * np.sin(2 * np.pi * freq * 0.5 * t) * np.exp(-t / 0.10)
    env = (1 - np.exp(-t / 0.0012)) * np.exp(-t / 0.30)
    return (x * env + body * (1 - np.exp(-t / 0.002))) * 0.62


def ep(freq, d=1.6):
    """Electric-piano stab: FM 1:1 with a short tine."""
    t = T(d)
    idx = 1.5 * np.exp(-t / 0.35)
    x = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * t))
    tine = 0.12 * np.sin(2 * np.pi * freq * 14 * t) * np.exp(-t / 0.018)
    env = (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.85)
    return (x + tine) * env * 0.5


def bell(freq, d=2.8, decay=1.1):
    t = T(d)
    idx = 2.6 * np.exp(-t / 0.35)
    x = np.sin(2 * np.pi * freq * t + idx * np.sin(2 * np.pi * freq * 3.5 * t))
    return x * np.exp(-t / decay) * (1 - np.exp(-t / 0.0008)) * 0.45


def pad_voice(freq, d, att=0.45, rel=0.7, bright=2200):
    t = T(d + rel)
    x = np.zeros_like(t)
    for det, ph in ((-0.0038, 0.0), (0.0041, 1.7), (0.0, 0.6)):
        f = freq * (1 + det)
        for k, a in enumerate((1, 0.5, 0.3, 0.17, 0.09, 0.05), start=1):
            if f * k < 9000:
                x += a * np.sin(2 * np.pi * f * k * t + ph * k)
    x = lp(x, bright)
    env = np.clip(t / att, 0, 1) * np.clip((d + rel - t) / rel, 0, 1)
    env = env * env * (3 - 2 * env)  # smoothstep
    env *= 1 + 0.05 * np.sin(2 * np.pi * 0.21 * t + freq)
    return x * env / 9.0


def bass(freq, d=0.24, decay=0.15):
    t = T(d)
    env = (1 - np.exp(-t / 0.003)) * np.exp(-t / decay)
    x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) + 0.12 * np.sin(2 * np.pi * 3 * freq * t)
    return np.tanh(1.4 * x * env) / np.tanh(1.4)


# ------------------------------------------------------------------ drums
def kick(d=0.4, punch=1.0, tone=52.0):
    t = T(d)
    f = tone + 120 * np.exp(-t / 0.028) + 60 * np.exp(-t / 0.004)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
    knock = 0.28 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.014)  # reads on small speakers
    click = hp(noise(d), 1500) * np.exp(-t / 0.0022) * 0.25
    return np.tanh(1.7 * (body + knock + click) * punch) / np.tanh(1.7)


def clap(tail=0.09):
    d = 0.35
    t = T(d)
    x = bp(noise(d), 1000, 5200)
    e = np.zeros_like(t)
    for k, o in enumerate((0.0, 0.008, 0.016, 0.025)):
        i = int(o * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) / (0.010 if k < 3 else tail))
    body = 0.25 * np.sin(2 * np.pi * 1150 * t) * np.exp(-t / 0.02)
    return (x * e + body) * 0.55


def hat(open_=False):
    d = 0.35 if open_ else 0.07
    t = T(d)
    metal = np.zeros_like(t)
    for f in (3150, 4230, 5370, 6110, 7340):
        metal += np.sign(np.sin(2 * np.pi * f * t + f))
    x = hp(noise(d) + 0.35 * metal, 6500, 3)
    return x * np.exp(-t / (0.11 if open_ else 0.018)) * (1 - np.exp(-t / 0.0005)) * 0.35


def shaker():
    d = 0.08
    t = T(d)
    env = (1 - np.exp(-t / 0.006)) * np.exp(-t / 0.022)
    return bp(noise(d), 4500, 12000) * env * 0.35


def rim():
    d = 0.08
    t = T(d)
    x = bp(noise(d), 1500, 5000) * np.exp(-t / 0.004)
    x += 0.5 * np.sin(2 * np.pi * 1750 * t) * np.exp(-t / 0.012)
    return x * 0.5


def crash(d=2.4):
    t = T(d)
    metal = np.zeros_like(t)
    for f in (3150, 4230, 5370, 6110, 7340, 8230):
        metal += np.sign(np.sin(2 * np.pi * f * t + f * 0.3))
    x = hp(noise(d) + 0.25 * metal, 4000, 2)
    return x * np.exp(-t / 0.75) * (1 - np.exp(-t / 0.001)) * 0.3


def snare(bright=1.0):
    d = 0.25
    t = T(d)
    x = bp(noise(d), 1200, 8000) * np.exp(-t / 0.06) * 0.6
    x += 0.6 * np.sin(2 * np.pi * np.cumsum(190 + 60 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    return x * 0.5 * bright


# ------------------------------------------------------------------ sound effects
def whoosh(d, f0, f1, peak=0.6, bw=0.8, tail=0.25):
    """Noise through a moving log-frequency band (STFT shaped). Envelope peaks at `peak` (0..1)."""
    n = int(SR * d)
    x = rng.standard_normal(n + 4096)
    fq, tt, Z = stft(x, SR, nperseg=1024, noverlap=896)
    u = np.clip(tt / d, 0, 1)
    fc = f0 * (f1 / f0) ** u
    lf = np.log2(np.maximum(fq, 20))[:, None]
    W = np.exp(-0.5 * ((lf - np.log2(fc)[None, :]) / bw) ** 2)
    _, y = istft(Z * W, SR, nperseg=1024, noverlap=896)
    y = y[:n]
    s = np.arange(n) / n
    env = np.where(s < peak, (s / peak) ** 2.2, np.exp(-np.maximum(s - peak, 0) / max(tail * (1 - peak), 1e-3)))
    return norm(y * env)


def swish(d=0.2, f0=900, f1=5000):
    return whoosh(d, f0, f1, peak=0.45, bw=0.6, tail=0.35)


def snap():
    t = T(0.08)
    x = hp(noise(0.08), 2200) * np.exp(-t / 0.0016) * 0.9
    x += np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.010) * 0.35
    x += np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.018) * 0.35
    return x


def click_part(p=1.0, d=0.045):
    t = T(d)
    x = bp(noise(d), 1800, 9000) * np.exp(-t / 0.0020)
    x += 0.5 * np.sin(2 * np.pi * 3400 * p * t) * np.exp(-t / 0.005)
    x += 0.3 * np.sin(2 * np.pi * 1150 * p * t) * np.exp(-t / 0.009)
    return x


def mouse_click():
    a = click_part(1.0)
    b = click_part(1.13) * 0.55
    out = np.zeros(int(SR * 0.14))
    out[: len(a)] += a
    i = int(0.075 * SR)
    out[i : i + len(b)] += b
    return out


def button_press():
    """Soft tactile press (the play triangle pressed like a button)."""
    t = T(0.18)
    x = 0.8 * np.sin(2 * np.pi * np.cumsum(140 + 90 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.05)
    x += 0.5 * click_part(0.8, 0.18)
    return x


def tick(freq=3000, d=0.03, decay=0.005):
    t = T(d)
    return np.sin(2 * np.pi * freq * t) * np.exp(-t / decay) * (1 - np.exp(-t / 0.0003))


def keytick():
    t = T(0.03)
    return bp(noise(0.03), 1800, 7000) * np.exp(-t / 0.004) * 0.8


def pop(freq=900, d=0.18):
    t = T(d)
    f = freq * (1 + 0.55 * np.exp(-t / 0.009))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.0006))


def plip():
    """The dot's signature landing: a round pop plus a tiny click."""
    x = pop(1250, 0.22) * 0.9
    c = click_part(1.2, 0.03) * 0.35
    x[: len(c)] += c
    t = T(0.22)
    x += 0.35 * np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.05)
    return x


def tap(freq, weight=0.0):
    t = T(0.3)
    f = freq * (1 + 0.22 * np.exp(-t / 0.004))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    x += 0.35 * np.sin(2 * np.pi * np.cumsum(f * 2.71) / SR) * np.exp(-t / 0.014)
    x += bp(noise(0.3), freq * 1.5, freq * 7) * np.exp(-t / 0.0025) * 0.45
    if weight:
        x += weight * np.sin(2 * np.pi * np.cumsum(62 + 70 * np.exp(-t / 0.018)) / SR) * np.exp(-t / 0.12)
    return x * 0.8


def blip(freq, d=0.16, decay=0.07):
    t = T(d)
    x = np.sin(2 * np.pi * freq * t) + 0.18 * np.sin(2 * np.pi * 2 * freq * t)
    return x * np.exp(-t / decay) * (1 - np.exp(-t / 0.0015)) * 0.7


def thud(d=0.5, tone=55.0):
    t = T(d)
    x = np.sin(2 * np.pi * np.cumsum(tone + 70 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.16)
    x += lp(noise(d), 900) * np.exp(-t / 0.012) * 0.35
    return x


def riser(d, f0=250, f1=6000, tone=True):
    t = T(d)
    k = t / d
    y = whoosh(d, f0, f1, peak=0.98, bw=0.7, tail=0.05)
    y = y * (k ** 1.6)
    if tone:
        y += 0.25 * np.sin(2 * np.pi * np.cumsum(110 + 330 * k ** 2) / SR) * k ** 2.5
    return y


def impact(d=2.4):
    t = T(d)
    sub = np.sin(2 * np.pi * np.cumsum(36 + 70 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.65)
    nz = lp(noise(d), 2400) * np.exp(-t / 0.10) * 0.35
    return sub + nz


def suck(d=0.36):
    """A reversed crash and low tone: swells into the moment of arrival and stops dead."""
    c = crash(d + 0.2)[: int(SR * d)][::-1]
    t = T(d)
    low = np.sin(2 * np.pi * np.cumsum(90 + 140 * (t / d) ** 2) / SR) * (t / d) ** 3
    w = whoosh(d, 5000, 300, peak=0.97, bw=0.7, tail=0.02)
    return norm(0.8 * c / (np.max(np.abs(c)) + 1e-9) + 0.4 * low + 0.6 * w)


def pluck(freq, d=0.5, bright=1.0, decay=0.22):
    """Synth pluck: saw-like partials, the upper ones dying first. Lives in the 200 Hz-3 kHz band, so it
    carries on phone speakers where the pad and the bass disappear."""
    t = T(d)
    x = np.zeros_like(t)
    for k in range(1, 16):
        fk = freq * k
        if fk > 9000:
            break
        x += (1.0 / k) * np.sin(2 * np.pi * fk * t + 0.37 * k) * np.exp(-t * (1.0 / decay + (k - 1) * 16.0 / bright))
    return x * (1 - np.exp(-t / 0.0012)) * 0.5


def shimmer(freq, d, att=0.6, rel=0.9):
    """Airy octave pad: a few detuned sines with a slow tremolo, high and quiet (chapter 2's layer)."""
    t = T(d + rel)
    x = np.zeros_like(t)
    for det, ph in ((-0.003, 0.0), (0.0035, 1.1), (0.0, 2.3)):
        x += np.sin(2 * np.pi * freq * (1 + det) * t + ph) + 0.25 * np.sin(2 * np.pi * 2 * freq * (1 + det) * t + ph)
    env = np.clip(t / att, 0, 1) * np.clip((d + rel - t) / rel, 0, 1)
    env = env * env * (3 - 2 * env)
    trem = 0.8 + 0.2 * np.sin(2 * np.pi * 3.2 * t + freq)
    return x * env * trem / 4.0


def flap_land(freq=294.0, d=0.3, weight=1.0):
    """A paper flap landing flat on the icon: a dry paper slap, a short pitched body (card on wood) and a soft
    low thump. The body is tuned, so a run of landings plays a figure."""
    t = T(d)
    slap = bp(noise(d), 700, 5500) * np.exp(-t / 0.011) * (1 - np.exp(-t / 0.0004))
    body = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2.02 * freq * t)) * np.exp(-t / 0.06) * (1 - np.exp(-t / 0.001))
    low = np.sin(2 * np.pi * np.cumsum(70 + 50 * np.exp(-t / 0.015)) / SR) * np.exp(-t / 0.07)
    return 0.7 * slap + 0.5 * body + 0.5 * weight * low


def flap_air(frames, fps=30):
    """The air of a flap falling: a band that rises as it speeds up and peaks on the landing."""
    return whoosh(frames / fps + 0.06, 250, 2600, peak=0.85, bw=0.7, tail=0.12)


def hop():
    """The dot's small hop off the icon: a soft upward glide."""
    t = T(0.09)
    x = np.sin(2 * np.pi * np.cumsum(620 + 380 * (t / t[-1]) ** 1.5) / SR) * np.exp(-t / 0.03) * (1 - np.exp(-t / 0.002))
    return x * 0.6


def tom(freq=150.0, d=0.35):
    """A tuned tom for the fills: a pitched thump that bends down a little, with a soft stick attack."""
    t = T(d)
    f = freq * (1 + 0.35 * np.exp(-t / 0.02))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    stick = bp(noise(d), 1500, 6000) * np.exp(-t / 0.006) * 0.35
    return np.tanh(1.4 * (body + stick)) / np.tanh(1.4) * 0.8
