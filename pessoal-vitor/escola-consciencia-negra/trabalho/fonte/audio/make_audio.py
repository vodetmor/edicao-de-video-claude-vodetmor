"""Mix da parte 1 (Vítor): voz + trilha (drone Jesse Keller no gancho, piano GubinDmitry na história)
+ ambiência (chuva, água, projetor) + efeitos no quadro exato. Ducking guiado pelas palavras (DESIGN-SYSTEM §7)."""
import json, os, subprocess, numpy as np, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__)); PUB = os.path.join(HERE, "..", "public")
AC = "/mnt/project-files/escola-consciencia-negra/trabalho/acervo"
TOTAL = 82.3; N = int(TOTAL * SR)

def load(path, start=0.0, dur=None):
    a = [FF, "-v", "error", "-ss", str(start)] + (["-t", str(dur)] if dur else []) + ["-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).copy()
def db(x): return 10 ** (x / 20)
def lufs(x):
    p = subprocess.run([FF, "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float([l for l in p.splitlines() if l.strip().startswith("I:")][-1].split()[1])
def place(buf, x, t, g=0.0):
    i = int(t * SR); x = x[: max(0, N - i)]; buf[i:i + len(x)] += x * db(g)
def ramp(env, a, b, v0, v1):
    i, j = int(a * SR), int(b * SR); env[i:j] = np.linspace(v0, v1, j - i)
def fades(x, fi=0.01, fo=0.01):
    x = x.copy(); a, b = int(fi * SR), int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x

voz = load(f"{PUB}/voz.wav"); voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
words = json.load(open(f"{PUB}/words.json"))
# trechos de fala (junta pausas < 0,35 s)
fala = []
for w in words:
    if fala and w["s"] - fala[-1][1] < 0.35: fala[-1][1] = max(fala[-1][1], w["e"])
    else: fala.append([w["s"], w["e"]])
mask = np.zeros(N, bool)
for a, b in fala: mask[int(a * SR):int(b * SR)] = True
voz_lufs = lufs(voz[mask]); print("voz em fala:", voz_lufs)

# ducking: começa 250 ms antes, rampa 200 ms, solta 400 ms depois (DS §7.2)
duck = np.zeros(N)
for a, b in fala:
    i0, i1 = int((a - 0.25) * SR), int((b + 0.4) * SR)
    duck[max(0, i0):i1] = 1
k = int(0.2 * SR); duck = np.convolve(duck, np.ones(k) / k, mode="same")

# ---------------- trilha
mus = np.zeros(N)
drone = load(f"{AC}/musica/04-jesse-keller-bass-movement.wav", 10.0, 22)
drone = fades(drone, 2.2, 0.01); dr = np.zeros(N); place(dr, drone, 3.35)
dr[int(22.55 * SR):] = 0; dr[int(22.3 * SR):int(22.55 * SR)] *= np.linspace(1, 0, int(0.25 * SR))  # some antes de "e isso tem um nome"
piano = load(f"{AC}/musica/01-gubindmitry-sad-atmospheric-ambient-piano.wav", 0.0, 60)
pi = np.zeros(N)
a1 = piano[: int((72.9 - 25.7) * SR)]; a1 = fades(a1, 0.9, 0.12); place(pi, a1, 25.7)
a2 = piano[int((75.75 - 25.7) * SR):]; a2 = a2[: int((TOTAL - 75.75) * SR)]; a2 = fades(a2, 0.7, 1.0); place(pi, a2, 75.75)
# envelope macro: fundo sob "pobres... negras" mais baixo; sobe no recuo para a multidão de 1888
env = np.ones(N); ramp(env, 37.0, 37.4, 1, db(-3)); ramp(env, 37.4, 40.3, db(-3), db(-3)); ramp(env, 40.3, 41.0, db(-3), 1)
ramp(env, 68.2, 69.0, 1, db(2.5)); ramp(env, 69.0, 70.8, db(2.5), db(2.5)); ramp(env, 70.8, 71.4, db(2.5), 1)
pi *= env
# nível: nas pausas ~6 LU abaixo da voz; sob a fala mais 13 dB abaixo (≈ 19-20 LU abaixo da voz)
for tr, gap in ((dr, -7.0), (pi, -6.5)):
    nz = np.abs(tr) > 1e-6
    tr *= db(voz_lufs + gap - lufs(tr[nz]))
mus = (dr + pi) * (1 - duck * (1 - db(-15)))

# ---------------- ambiência
amb = np.zeros(N)
chuva = load(f"{AC}/sfx/chuva-forte.wav", 0, 20)
c = np.zeros(N); place(c, fades(chuva, 1.6, 0.6)[: int((18.45 - 0.8) * SR)], 0.8)
ce = np.ones(N); ramp(ce, 0.8, 3.35, db(-6), 1); ramp(ce, 3.35, 4.0, 1, db(-12)); ce[int(4.0 * SR):int(6.2 * SR)] = db(-12); ce[int(6.2 * SR):int(8.15 * SR)] = db(-14)
ramp(ce, 8.15, 8.6, db(-14), db(-11)); ce[int(8.6 * SR):] = db(-11); c *= ce
c *= db(voz_lufs - 4 - lufs(chuva))
agua = load(f"{AC}/sfx/agua-corrente.wav", 3, 9); place(amb, fades(agua, 0.5, 1.2), 8.4, 0)
amb *= db(voz_lufs - 26 - lufs(agua))
chuva2 = fades(load(f"{AC}/sfx/chuva-forte.wav", 30, 5.6), 0.3, 0.5) * db(voz_lufs - 20 - lufs(chuva))
place(amb, chuva2, 34.95)
proj = fades(load(f"{AC}/sfx/projetor.wav", 0, 26), 1.0, 0.3) * db(voz_lufs - 30 - lufs(load(f"{AC}/sfx/projetor.wav", 0, 26)))
place(amb, proj[: int((72.95 - 46.9) * SR)], 46.9)
amb += c
amb *= 1 - duck * (1 - db(-4))

# ---------------- efeitos
fx = np.zeros(N)
S = lambda n: load(f"{PUB}/sfx/{n}.wav")
A = lambda n: load(f"{AC}/sfx/{n}.wav")
teclas = [A(f"maquina-escrever-tecla-0{i}") for i in range(1, 6)]
def datilografa(t0, n, cps, g=-24):
    for i in range(n):
        place(fx, teclas[i % 5], t0 + i / cps + (np.sin(i * 7.3) * 0.008), g)
place(fx, fades(A("maquina-escrever-datilografia")[: int(2.2 * SR)], 0.05, 0.3), 0.9, -26)
tv = A("trovao-1")[: int(2.6 * SR)]; tv[int(0.9 * SR):] *= np.linspace(1, 0, len(tv) - int(0.9 * SR)) ** 2; place(fx, tv, 3.35, -6)
place(fx, S("boom-leve"), 3.36, -9)
w1 = fades(A("whoosh-1")[: int(1.25 * SR)], 0.02, 0.35); place(fx, w1, 8.4 - 1.25, -12)
for t0, txt in ((8.6, "ENCOSTA"), (11.2, "MARGEM DO RIO"), (13.4, "RUA SEM DRENAGEM")):
    datilografa(t0, len(txt.replace(" ", "")), 22, -27)
for tm in (11.07, 13.17, 15.25):
    place(fx, S("whoosh"), tm - 0.5, -20)
for tm in (16.24, 17.14, 17.6, 17.75):
    place(fx, S("lapis"), tm, -22)
place(fx, S("boom-leve"), 17.6, -8)
place(fx, fades(A("whoosh-reverso"), 0.01, 0.02)[-int(1.2 * SR):], 18.45 - 1.2, -16)
place(fx, S("thud"), 20.5, -12)
place(fx, S("boom-sub"), 23.06, -3)
place(fx, S("boom-sub"), 24.1, -1)
place(fx, S("boom-grande"), 25.0, -8)  # cauda no respiro depois do título
for tm in (27.6, 28.42, 29.04, 29.86):
    place(fx, teclas[int(tm * 10) % 5], tm, -14); place(fx, S("thud"), tm, -16)
place(fx, S("whoosh-longo"), 31.9 - 0.4, -18)
rb = A("rebobinar"); place(fx, rb, 46.0 - len(rb) / SR, -12)
rs = S("rebobina"); place(fx, rs, 46.0 - len(rs) / SR, -14)
place(fx, S("boom-sub"), 45.97, -2)
place(fx, A("papel-2"), 47.2, -14)
datilografa(48.0, 17, 22, -27)
place(fx, S("lapis"), wt := 55.8 + 0.25, -18)
place(fx, A("whoosh-2"), 56.35 - 0.6, -16); datilografa(57.55, 7, 22, -24)
place(fx, A("whoosh-2"), 58.05 - 0.6, -16); datilografa(59.9, 4, 22, -24)
place(fx, S("boom-sub"), 62.1, -2)
datilografa(63.1, 27, 24, -27)
for tm in (64.18, 65.18, 66.52, 67.7):
    place(fx, S("thud"), tm, -12)
place(fx, S("whoosh-longo"), 68.4 - 0.3, -16); datilografa(68.9, 29, 24, -27)
place(fx, A("papel-2"), 70.9, -14)
place(fx, S("boom-sub"), 75.1, -5)
place(fx, S("whoosh-longo"), 77.62 - 0.35, -14)
datilografa(76.0, 22, 24, -28); datilografa(78.5, 23, 24, -27)
fx *= db(voz_lufs - 2 - lufs(S("boom")))
fx_ref = None  # referência: o boom fica ~2 LU abaixo da voz

# silêncio total antes de "Na prática, não." (73,0-73,9)
for tr in (mus, amb, fx):
    tr[int(72.98 * SR):int(73.9 * SR)] *= 0
mix = voz + mus + amb + fx
fim = int((TOTAL - 0.25) * SR); mix[fim:] *= np.linspace(1, 0, N - fim)
# teste de inteligibilidade (DS §7.4): janelas de 400 ms com fala
from scipy.signal import butter, sosfilt
kw = lambda x: sosfilt(butter(2, 120, "high", fs=SR, output="sos"), x)  # aproxima a ponderação K (grave pesa pouco)
bg = kw(mus + amb + fx); vz = kw(voz); ruins = []
for a, b in fala:
    for t in np.arange(a, b - 0.4, 0.2):
        i, j = int(t * SR), int((t + 0.4) * SR)
        v = 10 * np.log10(np.mean(vz[i:j] ** 2) + 1e-12); o = 10 * np.log10(np.mean(bg[i:j] ** 2) + 1e-12)
        if v - o < 15: ruins.append((round(t, 1), round(v - o, 1)))
print("janelas < 15 dB:", len(ruins), "de", sum(int((b - a - 0.4) / 0.2) + 1 for a, b in fala if b - a > 0.4), ruins)
for name, tr in (("stem-voz", voz), ("stem-musica", mus), ("stem-amb", amb), ("stem-fx", fx), ("mix-bruto", mix)):
    subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_f32le", f"{PUB}/{name}.wav"],
                   input=tr.astype(np.float32).tobytes(), check=True)
# master: -14 LUFS, pico real ≤ -1 dBTP (dois passos do loudnorm)
m = subprocess.run([FF, "-v", "info", "-i", f"{PUB}/mix-bruto.wav", "-af", "loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True).stderr.decode()
js = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
flt = (f"loudnorm=I=-14:TP=-1.2:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
       f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run([FF, "-v", "error", "-y", "-i", f"{PUB}/mix-bruto.wav", "-af", flt + ",aresample=48000", "-ac", "2", "-c:a", "pcm_s24le", f"{PUB}/mix.wav"], check=True)
r = subprocess.run([FF, "-v", "info", "-i", f"{PUB}/mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True).stderr.decode()
print([l.strip() for l in r.splitlines() if l.strip().startswith(("I:", "LRA:", "Peak:"))][-3:])
