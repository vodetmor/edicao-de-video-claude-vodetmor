# Som da aula de ótica: efeitos sintetizados presos à imagem + trilha com ducking guiado pelas palavras + mix final.
# Ideia central: cada cor é uma nota (vermelho = grave, violeta = agudo, como a frequência da luz). O arco-íris vira arpejo.
# Saída: audio/stems/{voz,musica,sfx}.wav e audio/mix.wav (48 kHz estéreo, -14 LUFS, -1 dBTP)
# Trilha: "Inspired", Kevin MacLeod (incompetech.com), CC BY 4.0. Créditos na descrição do vídeo.
import json, math, subprocess, os
import numpy as np

D = "/mnt/project-files/pessoal-vitor/aula-otica/trabalho"
MUS = "/mnt/project-files/estudio/aula-lancamento-obliquo/audio/musica/Inspired.mp3"
SR = 48000
R = json.load(open(f"{D}/fonte/remotion/src/data/relogio.json"))
FPS = R["fps"]; W = R["palavras"]; N = R["quadros"]
DUR = N / FPS
PAUS = {p["i"]: (round(p["de"] * FPS), round(p["ate"] * FPS)) for p in R["pausas"]}
P = lambda i, d=0: W[i]["f"] + d
PAUSA = lambda i: PAUS[i]
s_ = lambda q: q / FPS  # quadro -> segundos
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

sfx = np.zeros((int(DUR * SR) + SR, 2), np.float32)
def poe(x, q, ganho_db=0.0, pan=0.0):
    i = int(s_(q) * SR)
    if i >= len(sfx): return
    g = 10 ** (ganho_db / 20); x = x[: len(sfx) - i]
    sfx[i:i + len(x), 0] += x * g * math.sqrt((1 - pan) / 2) * 1.414
    sfx[i:i + len(x), 1] += x * g * math.sqrt((1 + pan) / 2) * 1.414

# ------------------------------------------------------------------ partitura (presa à imagem; quadros = relogio.json)
PA = lambda i: PAUS[i]
GANCHO_FIM = PA(21)[1] + 4
FIBRA_INI, FIBRA_FIM = P(222) - 8, PA(230)[1] + 6
FINAL_INI = PA(273)[0]
ARCO = [nota(k) for k in range(7)]          # vermelho (grave) -> violeta (agudo)
def arpejo(q0, dur_q, n=7, ganho=-22, sobe=True, pan=(-0.6, 0.6), oit=0):
    for k in range(n):
        kk = k if sobe else n - 1 - k
        poe(reverb(pluck(nota(kk + oit * 5) if n <= 7 else nota(kk * 7 // n + oit * 5), 1.1)), q0 + k * dur_q / max(1, n - 1), ganho, pan[0] + (pan[1] - pan[0]) * kk / max(1, n - 1))
def acorde(q, ganho=-20, dur=3.0):
    for k in range(7): poe(reverb(chime(nota(k) , dur), 1.4, 0.3), q + k, ganho - 4, -0.6 + 1.2 * k / 6)
# gancho: a luz atravessa o estúdio, bate no vidro, sai em cores e pousa na tela
poe(whoosh(1.1, 300, 1800, 0.85), 0, -22, -0.7)
poe(reverb(chime(2093, 1.6), 1.2, 0.3), P(3), -26, -0.2)                 # bate no vidro
poe(whoosh(0.8, 900, 500, 0.6), P(3) + 2, -30)                              # anda devagar no vidro
arpejo(P(6) + 2, P(7) + 12 - (P(6) + 2), ganho=-21)                        # sai em cores
acorde(P(7) + 12, -22); poe(boom(1.8), P(7) + 12, -20)
poe(reverb(chime(1568, 2.0), 1.2, 0.35), P(9), -30, 0.4)                    # "em cores"
poe(subida(1.2), P(17) - 36, -26); poe(boom(1.6), P(17), -18)               # título
poe(whoosh(1.6, 1800, 400, 0.5), GANCHO_FIM - 46, -22)                      # câmera sobe e vira lousa
# ato 2
poe(whoosh(1.5, 400, 1400, 0.6), P(22) + 4, -28)                            # mergulho na face
poe(whoosh(0.5, 1200, 4200, 0.4), P(38), -24, -0.5)                         # 300 000: rápido
poe(whoosh(0.9, 700, 1500, 0.4), P(46), -24, 0.4)                           # 225 000: mais lento
n_ = int(0.7 * SR); tt = np.arange(n_) / SR; fr = 880 * np.exp(-tt * 1.6)    # "freio": nota que escorrega para baixo
poe(reverb((np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n_, 0.3)).astype(np.float32)), P(54), -26)
for k, i in enumerate([61, 62, 64]): poe(reverb(pluck(nota(5 + k), 0.7)), P(i), -24)
for k, i in enumerate([75, 77, 81, 83, 85]): poe(reverb(pluck(nota(4 + k), 0.7)), P(i), -24, -0.4 + 0.2 * k)
poe(chime(1046.5, 2.4), PA(88)[0], -22); poe(boom(1.6), PA(88)[0], -22)
poe(thud(0.4, 110, 55), P(89), -14); poe(thud(0.4, 90, 45), P(89) + 5, -16)    # pegadinha
poe(tick(1400, 0.06), P(97) + 2, -20); poe(thud(0.35, 80, 40), P(98), -18)
# ato 3
poe(thud(0.35, 130, 60), P(99), -12); poe(tick(2400), P(99) + 1, -20)       # selo
for k, i in enumerate([105, 109, 113]): poe(reverb(pluck(nota(3 + k), 0.7)), P(i), -24)
for k, i in enumerate([117, 125, 127, 130, 132, 134, 139, 144]): poe(reverb(pluck(nota(4 + k % 5), 0.6)), P(i), -25, -0.3 + 0.08 * k)
poe(whoosh(0.6, 600, 2200, 0.7), P(147) - 4, -24); poe(chime(1318.5, 2.2), P(147) + 10, -22)
poe(chime(1046.5, 2.0), PA(150)[0], -24)
# ato 4
poe(whoosh(0.9, 2200, 600, 0.4), P(156), -26)                                # caminho contrário
q0, q1 = P(168), P(172) + 14                                                 # varredura até o limite
for k in range(7): poe(pluck(nota(3 + k), 0.5), int(q0 + k * (q1 - q0) / 7), -25, -0.3 + 0.1 * k)
n_ = int(1.6 * SR); poe((np.sin(2 * np.pi * nota(10) * np.arange(n_) / SR) * env_exp(n_, 0.6) * 0.5).astype(np.float32), q1, -28)
poe(chime(1568, 2.4), P(193), -22); poe(boom(1.4), PA(198)[0], -22)
q0, q1 = P(199) + 6, P(206)
for k in range(5): poe(pluck(nota(10 + k), 0.5), int(q0 + k * (q1 - q0) / 5), -25)
poe(reverb(chime(2637, 2.6), 1.6, 0.45), q1, -20)                             # luz presa
poe(thud(0.35, 130, 60), P(209), -14)
# fibra: cada quique é uma nota, alternando esquerda e direita
PER = 4 * 0.16 * 0.93 / math.tan(math.radians(22)); half = PER / 2
poe(whoosh(1.0, 500, 2600, 0.7), FIBRA_INI, -22)
for k in range(-2, 12):
    xb = (k + 0.5) * half
    t = (xb + 1.4) / 7.6
    if 0 <= t <= 1:
        q = FIBRA_INI + t * (FIBRA_FIM - FIBRA_INI)
        poe(reverb(pluck(nota(7 + (k % 2) * 2 + k // 4), 0.6), 1.0, 0.3), q, -21, -0.6 if k % 2 else 0.6)
# ato 5: cada cor tem sua nota
poe(subida(1.0), P(231) - 20, -28)
poe(reverb(pluck(nota(0), 1.4)), P(244), -19, -0.3)                          # vermelho: grave
poe(reverb(pluck(nota(6), 1.4)), P(252), -19, 0.3)                           # violeta: agudo
poe(whoosh(0.6, 900, 2600, 0.5), P(263) - 4, -26)
arpejo(P(267), 26, n=14, ganho=-22)                                          # a luz branca se abre
acorde(P(273), -20); poe(boom(2.0), P(273), -18)
poe(whoosh(1.4, 400, 1600, 0.6), FINAL_INI, -24)                             # volta ao 3D
acorde(P(283), -18, 4.0); poe(boom(2.4), P(283), -16)                        # arco-íris
APAGA = P(285) + 30
arpejo(APAGA, 40, ganho=-26, sobe=False)                                     # a luz apaga e as cores saem
# pílula "Seguir" (motion-base/componentes/pilula-seguir): entra, clique no botão, sino curto
FALA = R["insercoes"][0]  # fala de seguir gravada à parte
SEGUIR = FALA["f"] + round(1.62 * FPS) - 34
poe(whoosh(0.35, 1200, 2800, 0.5), SEGUIR, -30, 0.5)
poe(tick(2600, 0.035), SEGUIR + 34, -16, 0.5)
poe(reverb(chime(1568.0, 0.9), 0.6, 0.25), SEGUIR + 37, -24, 0.5)
# ------------------------------------------------------------------ voz
os.makedirs(f"{D}/audio/stems", exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{D}/audio/voz_final.wav", "-af",
                "highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,loudnorm=I=-16:TP=-2:LRA=7",
                "-ar", str(SR), "-ac", "2", f"{D}/audio/stems/voz.wav"], check=True)
voz = ler(f"{D}/audio/stems/voz.wav")

# ------------------------------------------------------------------ música com ducking pelas palavras
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", MUS, "-af",
                "equalizer=f=2500:t=q:w=1.2:g=-3,loudnorm=I=-14:TP=-2", "-ar", str(SR), "-ac", "2", "/tmp/mus.wav"], check=True)
mus = ler("/tmp/mus.wav")
n = len(sfx); mus = mus[:n] if len(mus) >= n else np.vstack([mus, np.zeros((n - len(mus), 2), np.float32)])
fala = np.zeros(n, bool)
for w in W:
    a = int((w["s"] - 0.25) * SR); b = int((w["e"] + 0.40) * SR); fala[max(0, a):b] = True
for x in R.get("insercoes", []):
    fala[int((x["s"] - 0.25) * SR):int((x["fe"] / FPS + 0.40) * SR)] = True
alvo_db = np.where(fala, -21.0, -8.0)
# a música sobe devagar nas pausas (rampa de 700 ms) e desce rápido antes da voz (150 ms): suave, sem bombear
def uniform_filter1d(a, k):
    c = np.cumsum(np.concatenate([np.full(k // 2, a[0]), a, np.full(k - k // 2, a[-1])]))
    return ((c[k:] - c[:-k]) / k)[:len(a)]
sobe = uniform_filter1d(alvo_db, int(0.7 * SR)); desce = uniform_filter1d(alvo_db, int(0.15 * SR))
desce = np.concatenate([desce[int(0.075 * SR):], np.full(int(0.075 * SR), desce[-1])])  # adianta a descida
gdb = np.minimum(sobe, desce)
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
