# Som da aula: efeitos sintetizados presos à imagem + trilha com ducking guiado pelas palavras + mix final.
# Saída: audio/stems/{voz,musica,sfx}.wav e audio/mix.wav (48 kHz estéreo, -14 LUFS, -1 dBTP)
# Trilha: "Inspired", Kevin MacLeod (incompetech.com), CC BY 4.0. Créditos na descrição do vídeo.
import json, math, subprocess, os
import numpy as np

D = "/mnt/project-files/estudio/aula-lancamento-obliquo"
SR = 48000
R = json.load(open("/root/aula/src/data/relogio.json"))
FPS = R["fps"]; W = R["palavras"]; N = R["quadros"]
DUR = N / FPS
PAUS = {p["i"]: (round(p["de"] * FPS), round(p["ate"] * FPS)) for p in R["pausas"]}
P = lambda i, d=0: W[i]["f"] + d
PAUSA = lambda i: PAUS[i]
s_ = lambda q: q / FPS  # quadro -> segundos
rng = np.random.default_rng(7)

# física (igual a src/aula/fisica.ts)
V0, G, TH = 20.0, 10.0, math.atan2(0.8, 0.6)
T = 2 * V0 * math.sin(TH) / G
def y_de(t, th=TH): return V0 * math.sin(th) * t - 0.5 * G * t * t

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

sfx = np.zeros((int(DUR * SR) + SR, 2), np.float32)
def poe(x, q, ganho_db=0.0, pan=0.0):
    i = int(s_(q) * SR)
    if i >= len(sfx): return
    g = 10 ** (ganho_db / 20); x = x[: len(sfx) - i]
    sfx[i:i + len(x), 0] += x * g * math.sqrt((1 - pan) / 2) * 1.414
    sfx[i:i + len(x), 1] += x * g * math.sqrt((1 + pan) / 2) * 1.414

# ------------------------------------------------------------------ partitura dos efeitos (presa à imagem)
def voo(q0, q1, th=TH, tf=None, ganho=-20, pan0=-0.5, pan1=0.5, hmax=None):
    tf = tf if tf is not None else 2 * V0 * math.sin(th) / G
    hm = hmax or (V0 * math.sin(th)) ** 2 / (2 * G)
    for k in range(int(tf / 0.2 + 1e-6) + 1):
        t = k * 0.2; q = q0 + (t / tf) * (q1 - q0)
        y = max(0.0, y_de(t, th)); g = int(round(y / hm * 7))
        poe(reverb(pluck(nota(g))), q, ganho, pan0 + (pan1 - pan0) * t / tf)

# gancho
poe(thud(0.35, 130, 60), 5, -8)
poe(whoosh(0.6, 500, 2600, 0.3), 6, -18)
POUSO = P(12) + 2
voo(6, POUSO, ganho=-21)
poe(thud(), POUSO, -6, 0.4)
poe(whoosh(1.1, 1800, 700, 0.5), P(15) - 4, -26)        # caneta desenhando a curva
for m in range(41):                                      # régua: um clique por metro
    poe(tick(2600 if m % 5 else 1800), P(24) + int(m * 40 / 40), -30 if m % 5 else -24, -0.6 + 1.2 * m / 40)
poe(subida(1.0), P(30) - 30, -20); poe(boom(), P(30), -10)  # título
poe(whoosh(1.2, 2400, 500, 0.45), PAUSA(31)[0] + 2, -20)    # 3D vira lousa
# rebobinar ("passo a passo"): plucks descendo ao contrário
for k in range(16, -1, -1):
    q = P(32) + (16 - k) * (P(36, 10) - P(32)) / 16
    poe(pluck(nota(int(round(max(0, y_de(k * 0.2)) / 12.8 * 7)))), q, -28, 0.5 - k / 16)
# vento e corte do ar
poe(ar(s_(P(43) + 18 - (P(42) - 10))), P(42) - 10, -30)
poe(tick(5200, 0.05), P(43) + 2, -22)
poe(thud(0.6, 70, 40), P(55, 6), -10)                    # o peso
for i in range(5): poe(tick(2200), P(63) + i * 4, -24)
for q in [PAUSA(65)[0] + 4, PAUSA(65)[0] + 16]: poe(pluck(nota(4)), q, -20)
# vetor e componentes
poe(whoosh(0.5, 700, 2200, 0.7), P(71) - 2, -22)
poe(tick(1500), P(78), -26)
poe(pluck(nota(2)), P(93, 10), -22, -0.3); poe(pluck(nota(4)), P(93, 16), -22, 0.3)
# derivações nas pausas: um toque de vidro em cada passo silencioso
for i, ds in [(102, [2, 42]), (115, [2, 38]), (179, [0, 22, 49, 67, 85, 103, 121]), (215, [2, 40, 92, 140]), (249, [2, 32]), (329, [2, 17]), (341, [2, 32]), (360, [2]), (161, [-4, 17])]:
    for d in ds: poe(reverb(pluck(nota(7 + (d // 20) % 3), 0.6)), PAUSA(i)[0] + d, -24)
# independência: voo com as duas sombras
voo(P(129) + 2, PAUSA(138)[1] - 16, ganho=-22)
poe(thud(0.4, 90, 50), PAUSA(138)[1] - 16, -12)
# três perguntas
for k, q in enumerate([P(218), P(219) + 5, P(219) + 10]): poe(pluck(nota(5 + k * 2)), q, -22)
# pergunta 1: subida até o topo e dobra
poe(whoosh(0.9, 900, 2400, 0.8), P(233), -26); poe(chime(1568, 1.5), P(240), -30)
poe(whoosh(1.1, 600, 1600, 0.5), P(268), -26)
# topo
poe(tick(1200), P(304) + 6, -24)
# fórmula-herói
poe(subida(1.4), P(405) - 40, -24); poe(chime(1046.5, 3.0), P(405) + 2, -18); poe(boom(2.0), P(405) + 2, -16)
# varredura dos ângulos: um toque a cada 5° com a altura do alcance
pa = PAUS[462]
def th_at(q):
    if q < pa[0]: return 45.0
    r = (q - pa[0]) / (pa[1] - pa[0])
    e = lambda u: 0 if u <= 0 else 1 if u >= 1 else u * u * (3 - 2 * u)
    if r < 0.62: return 45 - 30 * e(r / 0.18) + 60 * e((r - 0.18) / 0.44)
    return 75 - 30 * e((r - 0.62) / 0.3)
ult = None
for q in range(pa[0], pa[1]):
    g = int(round(th_at(q) / 5))
    if g != ult:
        A_ = V0 * V0 * math.sin(2 * math.radians(g * 5)) / G
        poe(pluck(nota(int(round(A_ / 40 * 8)))), q, -22, (g * 5 - 45) / 45); ult = g
poe(chime(1318.5, 2.0), pa[1] - 8, -24)
# complementares: duas vozes, dois pousos no mesmo ponto
lanc = P(477) + 2
for th, gan, pan in [(math.pi / 6, -21, -0.3), (math.pi / 3, -23, 0.3)]:
    tf = 2 * V0 * math.sin(th) / G; q1 = lanc + tf / 0.75 * 30
    voo(lanc, q1, th, ganho=gan, pan0=-0.5, pan1=0.4, hmax=15.0)
    poe(thud(), q1, -8, 0.4)
poe(chime(1046.5, 2.0), P(491), -24)
# replay 3D (silêncio da voz)
poe(whoosh(2.4, 400, 1800, 0.5), PAUS[495][0] - 6, -20); poe(chime(784, 2.6), PAUS[495][0] + 30, -22)
# resumo: três cartões
for q in [P(510), P(513), P(516)]: poe(pluck(nota(6)), q, -24)
# final
L0, L1 = P(524) + 2, P(533) + 4
poe(thud(0.35, 130, 60), L0 - 1, -8); poe(whoosh(0.6, 500, 2600, 0.3), L0, -18)
voo(L0, L1, ganho=-21)
poe(tick(1600, 0.05), P(529), -22)
poe(thud(), L1, -4, 0.3); poe(chime(523.25, 4.0), L1 + 2, -16); poe(boom(2.4), L1, -14)

# ------------------------------------------------------------------ voz
os.makedirs(f"{D}/audio/stems", exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{D}/audio/voz_final.wav", "-af",
                "highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,loudnorm=I=-16:TP=-2:LRA=7",
                "-ar", str(SR), "-ac", "2", f"{D}/audio/stems/voz.wav"], check=True)
voz = ler(f"{D}/audio/stems/voz.wav")

# ------------------------------------------------------------------ música com ducking pelas palavras
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{D}/audio/musica/Inspired.mp3", "-af",
                "equalizer=f=2500:t=q:w=1.2:g=-3,loudnorm=I=-14:TP=-2", "-ar", str(SR), "-ac", "2", "/tmp/mus.wav"], check=True)
mus = ler("/tmp/mus.wav")
n = len(sfx); mus = mus[:n] if len(mus) >= n else np.vstack([mus, np.zeros((n - len(mus), 2), np.float32)])
fala = np.zeros(n, bool)
for w in W:
    a = int((w["s"] - 0.25) * SR); b = int((w["e"] + 0.40) * SR); fala[max(0, a):b] = True
alvo_db = np.where(fala, -21.0, -8.0)
# rampas de 200 ms (sem bombear): média móvel do alvo
k = int(0.2 * SR); ker = np.ones(k) / k
gdb = np.convolve(alvo_db, ker, mode="same")
t = np.arange(n) / SR
gdb += np.where(t < 1.2, 20 * np.log10(np.maximum(t / 1.2, 1e-3)), 0)          # entra junto com o chute
fim = DUR - 4.0; gdb += np.where(t > fim, 20 * np.log10(np.maximum(1 - (t - fim) / 4.0, 1e-3)), 0)
mus *= (10 ** (gdb / 20))[:, None]

# ------------------------------------------------------------------ mix e master
mix = voz[:n] if len(voz) >= n else np.vstack([voz, np.zeros((n - len(voz), 2), np.float32)])
mix = mix + mus + sfx
grava(f"{D}/audio/stems/musica.wav", mus); grava(f"{D}/audio/stems/sfx.wav", sfx); grava("/tmp/mix_bruto.wav", mix)
med = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "/tmp/mix_bruto.wav", "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(med[med.index("{"):med.rindex("}") + 1])
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "/tmp/mix_bruto.wav", "-af",
                f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true",
                "-ar", str(SR), "-t", f"{DUR:.3f}", f"{D}/audio/mix.wav"], check=True)
print("mix pronto:", f"{D}/audio/mix.wav", js["input_i"], "->", "-14")
