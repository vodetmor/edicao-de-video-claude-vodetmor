"""Áudio da Aula da Saudade V6: música (com pausas nos vídeos longos e abaixando enquanto o áudio do vídeo toca) + áudio de cada vídeo
+ violão de despedida depois que a música acaba.  Lê estudio/motor/src/obras/saudade/plano3.json -> previa/saudade6-audio.wav (master -14 LUFS)
Rodar: python -I trabalho/scripts/audio_saudade3.py
"""
import json
import subprocess

import numpy as np
from scipy.signal import fftconvolve

BASE = "C:/dev/maquina-de-editar"
MOTOR = f"{BASE}/estudio/motor"
OUT = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/previa/saudade6-audio.wav"
SR = 44100
P = json.load(open(f"{MOTOR}/src/obras/saudade/plano3.json", encoding="utf8"))
DUR = P["duracao"]
FIM_MUSICA = P["musicaFim"]
HOLDS = P["holds"]
DUCK = 0.3  # a música abaixa assim enquanto o áudio do vídeo toca


def decodifica(arq, ss=None, t=None, af=None):
    cmd = ["ffmpeg", "-v", "error"]
    if ss is not None:
        cmd += ["-ss", str(ss)]
    if t is not None:
        cmd += ["-t", str(t)]
    cmd += ["-i", arq, "-vn"]
    if af:
        cmd += ["-af", af]
    cmd += ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def rampa(n, a, b):
    return np.linspace(a, b, n, dtype=np.float32)


# ---------------------------------------------------------------- música: tempo do vídeo -> tempo da música (pausa nas "holds")
mus = decodifica(f"{MOTOR}/public/saudade/bem.mp3")
N = int(DUR * SR)
saida = np.zeros((N, 2), np.float32)

cortes = [0.0] + [h["t"] for h in HOLDS]  # começo de cada trecho em tempo de vídeo (o trecho acaba na pausa seguinte)
fins = [h["t"] for h in HOLDS] + [FIM_MUSICA]
retoma = [0.0] + [h["t"] + h["d"] for h in HOLDS]  # em T, onde a música volta
perdido = 0.0
for k, (ini_t, fim_t) in enumerate(zip(retoma, fins)):
    # trecho de música que toca de ini_t a fim_t (tempo de vídeo); em tempo de música: ini_t - perdido ...
    perdido = sum(h["d"] for h in HOLDS[:k])
    m0, m1 = ini_t - perdido, fim_t - perdido
    seg = mus[int(m0 * SR):int(m1 * SR)].copy()
    n = len(seg)
    if n == 0:
        continue
    g = np.ones(n, np.float32)
    if k > 0:  # volta da pausa: sobe de baixo
        f = min(n, int(0.9 * SR))
        g[:f] *= rampa(f, 0.0, 1.0)
    if k < len(HOLDS):  # vai para a pausa: some em 0,7 s
        f = min(n, int(0.7 * SR))
        g[-f:] *= rampa(f, 1.0, 0.0)
    seg *= g[:, None]
    a = int(ini_t * SR)
    saida[a:a + n] += seg[: max(0, min(n, N - a))]

# ---------------------------------------------------------------- abaixa a música enquanto o vídeo toca (o áudio dele entra por cima)
duck = np.ones(N, np.float32)
for m in P["imersoes"]:
    a, b = m["a"], m["b"]
    # a música toca abaixada até a pausa (início da "hold" que fecha este vídeo)
    h = next((x for x in HOLDS if abs(x["t"] + x["d"] - b) < 0.06), None)
    fim_duck = (h["t"] + 0.2) if h else b + 0.8  # sem pausa: a música sobe devagar quando o vídeo termina
    i0, i1 = int((a - 0.3) * SR), int(fim_duck * SR)
    rp = int(0.45 * SR)
    seg = np.full(i1 - i0, DUCK, np.float32)
    seg[:rp] = rampa(rp, 1.0, DUCK)
    if not h:
        ru = min(len(seg) - rp, int(1.1 * SR))
        seg[-ru:] = rampa(ru, DUCK, 1.0)
    duck[i0:i1] = np.minimum(duck[i0:i1], seg)
    # depois da pausa a música volta ao normal (rampa já feita no trecho); o duck não segura além do fim do vídeo
saida *= duck[:, None]

# ---------------------------------------------------------------- áudio de cada vídeo
for m in P["imersoes"]:
    a, b = m["a"], m["b"]
    dv = b - a
    for k, v in enumerate(m["vs"]):
        r = v["rate"]
        af = f"atempo={r}," if r < 0.999 else ""
        clip = decodifica(f"{MOTOR}/public/final/v/{v['id']}.mp4", ss=v["ini"], t=dv * r, af=af + "loudnorm=I=-19:TP=-2:LRA=9")
        if len(clip) == 0:
            continue
        clip = clip[: int((dv - 0.25) * SR)]
        n = len(clip)
        fi, fo = min(n, int(0.25 * SR)), min(n, int(0.5 * SR))
        clip[:fi] *= rampa(fi, 0, 1)[:, None]
        clip[-fo:] *= rampa(fo, 1, 0)[:, None]
        ganho = 1.0 if k == 0 else 0.38  # trio: o do meio/lados ficam de fundo
        i0 = int((a + 0.15) * SR)
        saida[i0:i0 + n] += clip[: max(0, min(n, N - i0))] * ganho

# ---------------------------------------------------------------- violão de despedida (Karplus-Strong, tom da própria música)
fin = mus[-int(40 * SR):, :].mean(axis=1)
nfft = 16384
cro = np.zeros(12)
for i in range(0, len(fin) - nfft, nfft):
    sp = np.abs(np.fft.rfft(fin[i:i + nfft] * np.hanning(nfft)))
    fr = np.fft.rfftfreq(nfft, 1 / SR)
    ok = (fr > 80) & (fr < 1500)
    pc = np.round(12 * np.log2(fr[ok] / 440.0) + 9).astype(int) % 12  # 0 = dó
    np.add.at(cro, pc, sp[ok])
maj = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
mnr = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
melhor = max(((np.corrcoef(np.roll(maj if modo == 0 else mnr, t), cro)[0, 1], t, modo) for t in range(12) for modo in (0, 1)))
_, tom, modo = melhor
print("tom da música: tônica", ["dó", "dó#", "ré", "ré#", "mi", "fá", "fá#", "sol", "sol#", "lá", "lá#", "si"][tom], "maior" if modo == 0 else "menor")
graus = [0, 9, 5, 7] if modo == 0 else [0, 8, 3, 10]  # I vi IV V  |  i VI III VII (semitons acima da tônica)
terca = 4 if modo == 0 else 3
acordes = []
for gr in graus:
    r = (tom + gr) % 12
    menor = (modo == 0 and gr == 9) or (modo == 1 and gr in (0,))
    t3 = 3 if menor else 4
    if modo == 1 and gr in (8, 3, 10):
        t3 = 4
    acordes.append((r, t3))


def nota(f0, dur, amp):
    n = int(dur * SR)
    per = int(round(SR / f0))
    y = np.zeros(n + per, np.float32)
    rng = np.random.default_rng(int(f0 * 10))
    y[:per] = (rng.random(per) * 2 - 1).astype(np.float32)
    y[:per] = np.convolve(y[:per], [0.5, 0.5], mode="same")  # pontas suaves: som de nylon
    for b0 in range(per, n + per - per + 1, per):
        prev = y[b0 - per:b0]
        y[b0:b0 + per] = 0.9965 * 0.5 * (prev + np.roll(prev, 1))
    return y[:n] * amp * np.linspace(1, 0.55, n, dtype=np.float32) ** 2


def freq(pc, oit):
    return 440.0 * 2 ** (((pc - 9) % 12 + 12 * (oit - 4)) / 12)


OITAVA = 0.62  # um oitavo de tempo
fio = np.zeros(int((len(acordes) * 8 * OITAVA + 4) * SR), np.float32)
pos = 0
for rz, t3 in acordes:
    nots = [(rz, 2), ((rz + 7) % 12, 2), (rz, 3), ((rz + t3) % 12, 3), ((rz + 7) % 12, 3), ((rz + t3) % 12, 3), ((rz + 7) % 12, 3), ((rz + 12) % 12, 4)]
    # dedilhado: grave, 5ª, tônica, 3ª, 5ª, 3ª, 5ª, oitava
    for j, (pc, oit) in enumerate(nots):
        amp = 0.55 if j == 0 else 0.34 if j % 2 == 0 else 0.27
        y = nota(freq(pc, oit), 3.2, amp)
        a = int(pos * SR)
        fio[a:a + len(y)] += y[: len(fio) - a]
        pos += OITAVA
fio = fio[: int(pos * SR) + int(2.5 * SR)]
# reverb de sala pequena
ir = (np.random.default_rng(7).standard_normal(int(1.7 * SR)) * np.exp(-np.linspace(0, 6.5, int(1.7 * SR)))).astype(np.float32)
molhado = fftconvolve(fio, ir)[: len(fio)].astype(np.float32)
fio = 0.78 * fio + 0.34 * molhado / (np.abs(molhado).max() + 1e-6) * np.abs(fio).max()
fio /= np.abs(fio).max() + 1e-6
ini_g = FIM_MUSICA - 4.5  # entra por baixo do final da música
n_g = min(len(fio), N - int(ini_g * SR))
fio = fio[:n_g]
ent = int(4.5 * SR)
sai = int(5.5 * SR)
fio[:ent] *= rampa(ent, 0, 1) ** 2
fio[-sai:] *= rampa(sai, 1, 0) ** 1.5
est = np.stack([fio, np.roll(fio, 90)], axis=1) * 0.85  # leve abertura estéreo
i0 = int(ini_g * SR)
saida[i0:i0 + n_g] += est
print("violão:", round(n_g / SR, 1), "s a partir de", round(ini_g, 1), "s; vídeo total", DUR, "s")

# ---------------------------------------------------------------- master
saida[: int(1.5 * SR)] *= rampa(int(1.5 * SR), 0, 1)[:, None]
saida[-int(1.8 * SR):] *= rampa(int(1.8 * SR), 1, 0)[:, None]
tmp = OUT.replace(".wav", "-bruto.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", tmp], input=saida.tobytes(), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", "48000", OUT], check=True)
print("PRONTO", OUT)
