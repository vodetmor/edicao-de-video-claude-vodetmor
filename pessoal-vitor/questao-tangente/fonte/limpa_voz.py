# Limpa a narração do Vítor: cortes (repetições e despedida), tratamento e nivelamento.
# Entrada: audio/narracao-bruta.ogg + audio/transcricao.json   Saída: audio/voz_limpa.wav + audio/palavras.json
import json, subprocess, numpy as np, wave
D = "/mnt/project-files/pessoal-vitor/questao-tangente"
SR = 48000
# (início, fim) em segundos do áudio bruto a remover, escolhidos nos silêncios do perfil de energia
CORTES = [
    (38.92, 50.45, "cubo: 'vamos pensar o seguinte... no mesmo ritmo' repete vazão constante"),
    (52.10, 55.72, "cubo: 'a medida que sobe vai indo no mesmo ritmo'"),
    (106.88, 108.42, "'e a de 90,' repetido"),
    (309.75, 999.0, "despedida cortada para manter o loop"),
]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{D}/audio/narracao-bruta.ogg", "-af",
    "volume=-5dB,highpass=f=70,adeclick,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,"
    "equalizer=f=3500:t=q:w=1.2:g=1.5,alimiter=limit=0.89:level=false",
    "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).copy()
env = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, mode="same"))
def vale(t, raio=0.02):  # cortes já escolhidos em silêncios medidos
    a, b = max(0, int((t - raio) * SR)), min(len(x) - 1, int((t + raio) * SR))
    return (a + int(np.argmin(env[a:b]))) / SR
# pausas de transição entre as etapas (progressão de raciocínio): (tempo bruto aproximado, segundos, etapa que abre)
PAUSAS = [
    (7.95, 1.0, "A questão"),
    (24.25, 1.2, "1 · O desenho"),
    (78.45, 1.2, "2 · O que é tangente"),
    (152.85, 1.2, "3 · Como mexer num gráfico"),
    (229.01, 1.2, "4 · Resolvendo"),
    (286.0, 1.0, "Resposta"),
]
cortes = []
for a, b, m in CORTES:
    a2 = vale(a); b2 = vale(b) if b < len(x) / SR else len(x) / SR
    cortes.append((a2, b2))
insercoes = [(vale(t, 0.3), d, m) for t, d, m in PAUSAS]
eventos = sorted([(a, "c", b) for a, b in cortes] + [(t, "i", d) for t, d, m in insercoes])
partes, t0, n = [], 0.0, int(0.012 * SR)
for t, tipo, v in eventos:
    tr = x[int(t0 * SR):int(t * SR)].copy()
    if t0 > 0: tr[:n] *= np.linspace(0, 1, n)
    tr[-n:] *= np.linspace(1, 0, n)
    partes.append(tr)
    if tipo == "c": t0 = v
    else: partes.append(np.zeros(int(v * SR), np.float32)); t0 = t
if t0 < len(x) / SR: partes.append(x[int(t0 * SR):])
y = np.concatenate(partes)
import os
if os.environ.get("RESTAURADA"):
    # mesma edição (cortes e pausas medidos no original) aplicada à voz restaurada pelo resemble-enhance
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{D}/audio/restaurada/narracao-restaurada-bruta.wav", "-af",
        "highpass=f=70,acompressor=threshold=-20dB:ratio=2:attack=8:release=120:makeup=1.5,alimiter=limit=0.89:level=false",
        "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).copy()
    partes, t0 = [], 0.0
    for t, tipo, v in eventos:
        tr = x[int(t0 * SR):int(t * SR)].copy()
        if t0 > 0: tr[:n] *= np.linspace(0, 1, n)
        tr[-n:] *= np.linspace(1, 0, n)
        partes.append(tr)
        if tipo == "c": t0 = v
        else: partes.append(np.zeros(int(v * SR), np.float32)); t0 = t
    if t0 < len(x) / SR: partes.append(x[int(t0 * SR):])
    y = np.concatenate(partes)
    with wave.open(f"{D}/audio/restaurada/voz_corte.wav", "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{D}/audio/restaurada/voz_corte.wav", "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", str(SR), f"{D}/audio/restaurada/voz_limpa.wav"], check=True)
    print("restaurada:", round(len(y) / SR, 2)); raise SystemExit
with wave.open(f"{D}/audio/voz_corte.wav", "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{D}/audio/voz_corte.wav", "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", str(SR), f"{D}/audio/voz_limpa.wav"], check=True)
# remapeia as palavras
T = json.load(open(f"{D}/audio/transcricao.json"))
def mapa(t, lado):
    # início dentro de um corte vai para o fim do corte; fim dentro de um corte vai para o início
    for a, b in cortes:
        if a < t < b: t = b if lado == "s" else a
    sh = sum(b - a for a, b in cortes if t >= b) - sum(d for ti, d, m in insercoes if t >= ti)
    return t - sh
out = []
for s in T:
    for w in s["w"]:
        s1, e1 = mapa(w["s"], "s"), mapa(w["e"], "e")
        if any(a <= w["s"] and w["e"] <= b for a, b in cortes): continue   # palavra inteira dentro de um corte
        e1 = max(e1, s1 + 0.02)
        out.append({"w": w["w"], "s": round(s1, 3), "e": round(e1, 3)})
json.dump(out, open(f"{D}/audio/palavras.json", "w"), ensure_ascii=False, indent=0)
json.dump([{"de": round(mapa(ti - 1e-4, "s"), 3), "ate": round(mapa(ti - 1e-4, "s") + d, 3), "etapa": m} for ti, d, m in insercoes],
          open(f"{D}/audio/pausas.json", "w"), ensure_ascii=False, indent=0)
print("cortes:", [(round(a, 2), round(b, 2)) for a, b in cortes], "duração", round(len(y) / SR, 2), "palavras", len(out))
