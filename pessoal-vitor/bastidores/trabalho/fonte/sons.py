# Mix final: voz limpa (com a pausa do 3D e o cartão final), música Kevin MacLeod com ducking pela voz, efeitos nos cortes e animações.
import json, os, sys, subprocess
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
import synth as S
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000; FPS = 30
tempo = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "/root/bast/src/data/tempo.json"))
GAP_AT, GAP, END_SRC, TOTAL = tempo["gapAt"], tempo["gap"], tempo["endSrc"], tempo["total"]
W = {i: (s, e) for i, s, e in tempo["w"]}
def F(i, d=0):
    k = i
    while k not in W: k -= 1
    return W[k][0] + d / FPS
def FE(i, d=0):
    k = i
    while k not in W: k -= 1
    return W[k][1] + d / FPS
N = int(TOTAL * SR) + SR
# ---- voz
v, sr = sf.read(f"{B}/audio/voz_final.wav", dtype="float32"); assert sr == SR
if v.ndim > 1: v = v.mean(1)
def fade(x, n=480):
    x = x.copy(); r = np.linspace(0, 1, n); x[:n] *= r; x[-n:] *= r[::-1]; return x
a = fade(v[: int(GAP_AT * SR)]); b = v[int(GAP_AT * SR): int(END_SRC * SR)]
b = b.copy(); fo = int(0.15 * SR); b[-fo:] *= np.linspace(1, 0, fo); b[:480] *= np.linspace(0, 1, 480)
voz = np.zeros(N, np.float32)
voz[: len(a)] = a; o2 = int((GAP_AT + GAP) * SR); voz[o2: o2 + len(b)] = b
# ---- música
mp = f"{B}/audio/musica/Wallpaper.wav"
if not os.path.exists(mp):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{B}/audio/musica/Wallpaper.mp3", "-ac", "2", "-ar", str(SR), mp], check=True)
m, _ = sf.read(mp, dtype="float32"); m = m[:N] if len(m) >= N else np.pad(m, ((0, N - len(m)), (0, 0)))
# envelope da voz -> ducking (ataque rápido, volta lenta)
hop = 480; env = np.sqrt(np.convolve(voz ** 2, np.ones(hop) / hop, "same"))[::hop]
ativo = (env > 0.02).astype(float)
# mantém "ativo" nas micro pausas (< 0,45 s) para a música não ficar bombeando entre palavras
k = int(0.45 * SR / hop); act = np.convolve(ativo, np.ones(k), "same") > 0
alvo = np.where(act, 10 ** (-24 / 20), 10 ** (-13 / 20))
g = np.zeros_like(alvo); cur = alvo[0]
for i, t in enumerate(alvo):
    c = 0.25 if t < cur else 0.03
    cur += (t - cur) * c; g[i] = cur
gain = np.interp(np.arange(N), np.arange(len(g)) * hop, g)
# abre a música na pausa 3D e no cartão final, e fecha no fim
t = np.arange(N) / SR
gain = np.where((t > GAP_AT) & (t < GAP_AT + GAP), np.maximum(gain, 10 ** (-9 / 20)), gain)
gain = np.where(t > END_SRC + GAP, np.maximum(gain, 10 ** (-9 / 20)), gain)
gain *= np.clip((TOTAL - t) / 1.2, 0, 1)
gain *= np.clip(t / 0.4, 0, 1)
mus = m * gain[:, None]
# ---- efeitos
def ld(n):
    x, _ = sf.read(f"{B}/audio/sfx/sfx_{n}.wav", dtype="float32"); return x.mean(1) if x.ndim > 1 else x
SFX = {n: ld(n) for n in ["whoosh", "pop", "press", "swish", "riser", "impact", "thud", "tick"]}
SFX["click"] = S.mouse_click().astype(np.float32); SFX["key"] = S.keytick().astype(np.float32)
SFX["bell"] = (S.bell(S.midi(84), 1.4) * 0.6).astype(np.float32)
fx = np.zeros(N, np.float32)
def put(n, s, db=0.0):
    x = SFX[n] * 10 ** (db / 20); i = int(s * SR)
    if i < 0 or i >= N: return
    fx[i: i + len(x)] += x[: N - i]
rng = np.random.default_rng(7)
def digita(a, b, db=-17):
    s = a
    while s < b:
        put("key", s, db + rng.uniform(-3, 2)); s += rng.uniform(0.055, 0.11)
END = END_SRC + GAP
for i in [3, 6, 7, 9]: put("pop", F(i, -2), -10)
put("pop", F(11, -2), -8); put("thud", F(13, -2), -6)
for s in [F(18), F(30), F(47), F(121), F(131), F(147), F(162), F(193), F(205), F(237), F(280), F(297)]: put("whoosh", s - 0.12, -12)
put("pop", F(28), -12); put("pop", F(46, -4), -9)
put("click", F(55), -6); put("swish", F(56, 4), -12)
digita(F(68), FE(72)); 
for i in [81, 82, 83]: put("pop", F(i), -12)
put("click", F(88), -6)
digita(F(98), FE(120), -19); put("swish", FE(120, 4), -9)
digita(F(134), F(147, -6), -21); digita(F(166), F(182, 10), -21)
for k in range(3): put("pop", F(127, k * 5), -14)
put("pop", F(141, -3), -10); put("pop", F(165, -3), -8); put("pop", F(174), -12)
put("riser", GAP_AT - 0.85, -8); put("impact", GAP_AT, -9)
put("whoosh", F(198), -10); put("pop", F(226, -3), -12)
put("pop", F(261, -2), -11); put("pop", F(271, -2), -11)
for k in range(5): put("tick", F(289, k * 5 + 6), -8)
for k in range(5): put("pop", F(303, -4 + k * 6), -13)
put("pop", F(321, -4), -10)
put("whoosh", END - 0.1, -10); put("click", END + 30 / FPS, -5); put("bell", END + 33 / FPS, -10)
# ---- mix e master
mix = np.stack([voz, voz], 1) * 1.0 + mus + np.stack([fx, fx], 1)
mix = mix[: int(TOTAL * SR)]
os.makedirs(f"{B}/audio/stems", exist_ok=True)
sf.write(f"{B}/audio/stems/voz.wav", voz[: len(mix)], SR); sf.write(f"{B}/audio/stems/musica.wav", mus[: len(mix)], SR); sf.write(f"{B}/audio/stems/sfx.wav", fx[: len(mix)], SR)
sf.write(f"{B}/audio/mix_pre.wav", mix, SR, subtype="FLOAT")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", f"{B}/audio/mix_pre.wav", "-af", "loudnorm=I=-14:TP=-1.0:LRA=9", "-ar", str(SR), f"{B}/audio/mix.wav"], check=True)
print("ok", len(mix) / SR)
