# Som da questão da tangente: efeitos presos às palavras + trilha com ducking pela voz + mix final (-14 LUFS).
# Ideia: vazão constante = ritmo constante. Cada camada de água é uma nota no mesmo compasso; a altura da nota é a altura da água.
#   cubo: a nota sobe em degraus iguais (reta). vaso: salto grande, pequeno, grande (rápido, devagar, rápido).
# Trilha: "Inspired", Kevin MacLeod (incompetech.com), CC BY 4.0. Crédito na descrição.
# Uso: python3 fonte/sons.py [voz.wav]   (padrão: audio/restaurada/voz_hibrida.flac)
import json, re, sys, os, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from sintese import *
D = "/mnt/project-files/pessoal-vitor/questao-tangente"
MUS = "/mnt/project-files/estudio/aula-lancamento-obliquo/audio/musica/Inspired.mp3"
VOZ = sys.argv[1] if len(sys.argv) > 1 else f"{D}/audio/restaurada/voz_hibrida.flac"
PW = json.load(open(f"{D}/audio/palavras.json")); PA = json.load(open(f"{D}/audio/pausas.json"))
DUR = PW[-1]["e"] + 2.4
def _n(s): return re.sub(r"[^0-9a-zà-ú]", "", s.lower())
TOK = [_n(x["w"]) for x in PW]
def w(frase, apos=0.0, fim=False):
    alvo = [_n(x) for x in frase.split()]
    for i in range(len(TOK) - len(alvo) + 1):
        if PW[i]["s"] >= apos - 1e-6 and TOK[i:i + len(alvo)] == alvo:
            return PW[i + len(alvo) - 1]["e"] if fim else PW[i]["s"]
    raise ValueError(frase)
sfx = np.zeros((int(DUR * SR) + SR, 2), np.float32)
def poe(x, t, db=0.0, pan=0.0):
    i = int(t * SR)
    if i >= len(sfx) or i < 0: return
    g = 10 ** (db / 20); x = x[:len(sfx) - i]
    sfx[i:i + len(x), 0] += x * g * math.sqrt((1 - pan) / 2) * 1.414
    sfx[i:i + len(x), 1] += x * g * math.sqrt((1 + pan) / 2) * 1.414
PENTA = [0, 2, 4, 7, 9]
def nota(k, base=261.63):
    o, g = divmod(int(k), 5); return base * 2 ** (o + PENTA[g] / 12)
def gota(f, db=-22, t=0, pan=0): poe(reverb(pluck(f, 0.8), 1.0, 0.25), t, db, pan)
# ---------------------------------------------------------------- partitura
poe(whoosh(1.0, 300, 1500, 0.8), 0.0, -26)
gota(nota(7), -24, w("desenho já dá"))
for p in PA:   # virada de etapa: sino + baque suave no cartão
    poe(reverb(chime(1046.5, 1.8), 1.2, 0.3), p["de"], -24); poe(boom(1.4), p["de"], -24)
# 1 · a questão sendo desenhada
gota(nota(5), -24, w("um copo")); poe(ar(1.6) * np.linspace(0, 1, int(1.6 * SR)) ** 0.5, w("vasão constante") - 0.6, -34)
poe(tick(2600), w("vasão constante", fim=True), -24)
for k, frase in enumerate(["quanto vale"]): poe(thud(0.35, 120, 60), w(frase), -18)
# 2 · cubo e vaso: uma nota por camada, mesmo ritmo
t0 = w("toda a camada") + 0.4; t1 = w("então o gráfico é") - 0.1
for i in range(1, 9): gota(nota(4 + i), -23, t0 + (t1 - t0) * i / 8, -0.4 + 0.1 * i)
poe(thud(0.35, 120, 60), w("uma reta"), -18)
t0 = w("então onde é estreito"); t1 = w("então a ordem fica")
DS = [3 + 39 * 0] + [30 + 9 * np.tan(0.5 * (T - 2.5)) for T in np.linspace(0, 4, 9)][1:]
D0 = 30 + 9 * np.tan(-1.25)
for i in range(1, 9):
    alt = (DS[i] - D0) / (30 + 9 * np.tan(0.75) - D0)          # 0..1 da altura da água
    gota(nota(5 + 10 * alt), -23, t0 + (t1 - t0) * i / 8, -0.4 + 0.1 * i)
poe(reverb(chime(1318.5, 1.8), 1.2, 0.3), w("é o ponto"), -24)
poe(subida(0.9), w("Mas por que isso") - 0.6, -30)
# 3 · rampa: cada ângulo uma nota mais alta; 90° vira parede (baque)
for k, frase in enumerate(["ângulo 0", "rampa de 45", "tangente de 60", "a de 80"]): gota(nota(5 + 2 * k), -22, w(frase), -0.3 + 0.2 * k)
poe(boom(1.6), w("vira uma parede"), -18); poe(thud(0.4, 90, 45), w("vira uma parede"), -16)
poe(whoosh(0.8, 900, 3000, 0.7), w("dispara para o infinito"), -26)
n_ = int(0.7 * SR); tt = np.arange(n_) / SR; fr = 880 * np.exp(-tt * 1.6)
poe(reverb((np.sin(2 * np.pi * np.cumsum(fr) / SR) * env_exp(n_, 0.3)).astype(np.float32)), w("a rampa descer"), -26)
poe(whoosh(1.2, 400, 1600, 0.6), w("joga tudo num gráfico"), -26)
poe(reverb(chime(1568, 2.0), 1.2, 0.35), w("graus é pi"), -24)
# 4 · os três movimentos
poe(subida(0.8), w("inteiro sobe") - 0.5, -28); gota(nota(12), -22, w("inteiro sobe") + 0.3)
poe(whoosh(0.7, 600, 1800, 0.5), w("isso acontece em t"), -26, 0.4)
poe(whoosh(0.7, 1800, 600, 0.5), w("mais dentro"), -26, -0.4)
poe(whoosh(0.6, 800, 2600, 0.5), w("p igual a 2"), -26)
poe(whoosh(1.0, 2200, 500, 0.5), w("p igual a 1 meio"), -26)
poe(thud(0.35, 130, 60), w("a regra é"), -16); poe(tick(2400), w("a regra é") + 0.03, -22)
# 5 · resolvendo: cada caixa preenchida é uma nota do acorde final
R = PA[4]["ate"]
poe(subida(1.2), w("copo está na altura", apos=R) - 0.2, -28)
for k, (frase, ap) in enumerate([("então k igual a 30", R), ("menos 5 sobre 2", R), ("igual a 1 meio", R + 50)]):
    t = w(frase, apos=ap); poe(reverb(chime(nota(10 + 2 * k, 523.25 / 2), 1.6), 1.2, 0.3), t, -22, -0.4 + 0.4 * k)
poe(whoosh(0.7, 600, 1800, 0.5), w("foi para 2", apos=R), -26)
poe(tick(2600), w("os dois pi", apos=R), -22)
poe(whoosh(1.2, 2200, 500, 0.6), w("o gráfico se esticou", apos=R), -24)
# resposta
F = PA[5]["ate"]
for frase in ["igual a 30", "1 meio vezes", "menos 5"]: poe(whoosh(0.4, 900, 2600, 0.6), w(frase, apos=F) - 0.1, -28)
t = w("alternativa é", apos=F, fim=True)
for k in range(3): poe(reverb(chime(nota(10 + 2 * k), 2.2), 1.4, 0.3), t + 0.06 * k, -20, -0.3 + 0.3 * k)
poe(boom(1.8), t, -18)
poe(thud(0.4, 110, 55), w("eliminar a", apos=F), -15); poe(thud(0.4, 100, 50), w("elimina d", apos=F), -15)
poe(whoosh(1.4, 400, 1500, 0.6), w("o copo desenhou", apos=F), -24)
poe(reverb(chime(1046.5, 2.6), 1.6, 0.4), w("deu a resposta", apos=F, fim=True), -22)
# ---------------------------------------------------------------- voz
os.makedirs("/root/stems", exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", VOZ, "-af", "loudnorm=I=-16:TP=-2:LRA=7", "-ar", str(SR), "-ac", "2", "/root/stems/voz.wav"], check=True)
voz = ler("/root/stems/voz.wav")
# ---------------------------------------------------------------- música (repete com cruzamento se for curta) e ducking
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", MUS, "-i", MUS, "-filter_complex",
                "[0][1]acrossfade=d=4:c1=tri:c2=tri,equalizer=f=2500:t=q:w=1.2:g=-3,loudnorm=I=-14:TP=-2",
                "-ar", str(SR), "-ac", "2", "/tmp/mus.wav"], check=True)
mus = ler("/tmp/mus.wav")
n = len(sfx); mus = mus[:n] if len(mus) >= n else np.vstack([mus, np.zeros((n - len(mus), 2), np.float32)])
fala = np.zeros(n, bool)
for x in PW:
    if x["e"] - x["s"] > 1.0: x = {"s": x["e"] - 0.25, "e": x["e"]}
    fala[max(0, int((x["s"] - 0.25) * SR)):int((x["e"] + 0.40) * SR)] = True
alvo_db = np.where(fala, -22.0, -9.0)
def suav(a, k):
    c = np.cumsum(np.concatenate([np.full(k // 2, a[0]), a, np.full(k - k // 2, a[-1])])); return ((c[k:] - c[:-k]) / k)[:len(a)]
sobe = suav(alvo_db, int(0.7 * SR)); desce = suav(alvo_db, int(0.15 * SR))
desce = np.concatenate([desce[int(0.075 * SR):], np.full(int(0.075 * SR), desce[-1])])
gdb = np.minimum(sobe, desce); t = np.arange(n) / SR
gdb += np.where(t < 1.0, 20 * np.log10(np.maximum(t / 1.0, 1e-3)), 0)
fim = DUR - 3.0; gdb += np.where(t > fim, 20 * np.log10(np.maximum(1 - (t - fim) / 3.0, 1e-3)), 0)
mus *= (10 ** (gdb / 20))[:, None]
# ---------------------------------------------------------------- mix e master
mix = (voz[:n] if len(voz) >= n else np.vstack([voz, np.zeros((n - len(voz), 2), np.float32)])) + mus + sfx
grava("/root/stems/musica.wav", mus); grava("/root/stems/sfx.wav", sfx); grava("/tmp/mix_bruto.wav", mix)
med = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "/tmp/mix_bruto.wav", "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(med[med.index("{"):med.rindex("}") + 1])
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "/tmp/mix_bruto.wav", "-af",
                f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true",
                "-ar", str(SR), "-t", f"{DUR:.3f}", f"{D}/audio/mix.flac"], check=True)
print("mix pronto", round(DUR, 2), js["input_i"])
