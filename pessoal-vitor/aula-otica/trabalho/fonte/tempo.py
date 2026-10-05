# Relógio da aula: aperta silêncios longos da locução, abre as pausas planejadas e grava o relógio por palavra.
# Entrada: audio/locucao.mp3 + audio/palavras_ok.json (índices = palavras do roteiro, alinha.py)
# Saída: audio/voz_final.wav e fonte/remotion/src/data/relogio.json
import json, subprocess, numpy as np, wave, os
D = "/mnt/project-files/pessoal-vitor/aula-otica/trabalho"
FPS = 30; SR = 48000
W = json.load(open(f"{D}/audio/palavras_ok.json"))
# índice da palavra depois da qual abre a pausa: segundos de silêncio extra
PAUSAS = {
    7: (0.6, "arco-íris pousa na tela + acorde"),
    21: (1.3, "título + câmera vai para cima e vira lousa 2D"),
    88: (1.5, "lei de Snell se monta"),
    150: (1.0, "37° desenhado no esquema"),
    198: (1.0, "L ≈ 49° no esquema"),
    230: (1.6, "fibra óptica em 3D, a luz quicando"),
    273: (1.0, "prisma 2D volta a ser 3D"),
}
# narração do Vítor (05/10): pausas mais longas para a música respirar nelas
PAUSAS = {k: (v + 0.5, m) for k, (v, m) in PAUSAS.items()}
MAX_SIL, ALVO_SIL = 1.2, 0.9    # voz do ElevenLabs: respeita o ritmo dele; só silêncio acima de 1,2 s encolhe para 0,9 s
CAUDA = 3.4                      # depois da última palavra: luz apaga e a câmera volta ao quadro 0 (loop)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{D}/audio/locucao.mp3", "-ar", str(SR), "-ac", "1", "-f", "f32le", "/tmp/voz.raw"], check=True)
x = np.fromfile("/tmp/voz.raw", dtype=np.float32)
env = np.sqrt(np.convolve(x ** 2, np.ones(480) / 480, mode="same"))
db = 20 * np.log10(env + 1e-9)
ajustes = []  # (corte em s, delta em s: + insere silêncio, - remove), por fronteira k
for k in range(len(W) - 1):
    a, b = W[k]["e"] - 0.3, W[k + 1]["s"] + 0.3
    ia, ib = max(0, int(a * SR)), min(len(x), int(b * SR))
    if ib <= ia: continue
    sil = db[ia:ib] < -50
    best, run, k0 = (0, None), 0, 0
    for j, v in enumerate(sil):
        if v:
            if run == 0: k0 = j
            run += 1
            if run > best[0]: best = (run, k0 + run // 2)
        else: run = 0
    if best[1] is None: continue
    c = (ia + best[1]) / SR; sl = best[0] / SR
    d = PAUSAS.get(k, (0.0, ""))[0]
    if sl > MAX_SIL: d -= sl - ALVO_SIL
    if k in PAUSAS or abs(d) > 1e-3: ajustes.append((k, c, d))
partes, t0 = [], 0.0
for k, c, d in ajustes:
    fim = c - (-d / 2 if d < 0 else 0); ini = c + (-d / 2 if d < 0 else 0)
    tr = x[int(t0 * SR):int(fim * SR)].copy(); n = int(0.008 * SR)
    if len(tr) > 2 * n:
        tr[-n:] *= np.linspace(1, 0, n)
        if t0 > 0: tr[:n] *= np.linspace(0, 1, n)
    partes.append(tr)
    if d > 0: partes.append(np.zeros(int(d * SR), np.float32))
    t0 = ini
partes.append(x[int(t0 * SR):]); partes.append(np.zeros(int(CAUDA * SR), np.float32))
y = np.concatenate(partes)
with wave.open(f"{D}/audio/voz_final.wav", "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
desl = lambda i: sum(d for (k, c, d) in ajustes if k < i)
corte = {k: (c, d) for (k, c, d) in ajustes}
out = []
for w in W:
    i = w["i"]; s0, e0 = w["s"], w["e"]
    if i in corte: e0 = min(e0, corte[i][0] - (-corte[i][1] / 2 if corte[i][1] < 0 else 0) - 1e-3)
    if i - 1 in corte: s0 = max(s0, corte[i - 1][0] + (-corte[i - 1][1] / 2 if corte[i - 1][1] < 0 else 0))
    s1, e1 = s0 + desl(i), max(s0, e0) + desl(i)
    out.append({"i": i, "w": w["w"], "s": round(s1, 3), "e": round(e1, 3), "f": round(s1 * FPS), "fe": round(e1 * FPS)})
dur = len(y) / SR
pausas = []
for k, (seg, m) in PAUSAS.items():
    ate = out[k + 1]["s"] - 0.12
    pausas.append({"i": k, "apos": W[k]["w"], "de": round(ate - seg, 3), "ate": round(ate, 3), "motivo": m})
os.makedirs(f"{D}/fonte/remotion/src/data", exist_ok=True)
json.dump({"fps": FPS, "duracao": round(dur, 3), "quadros": int(np.ceil(dur * FPS)), "palavras": out, "pausas": pausas},
          open(f"{D}/fonte/remotion/src/data/relogio.json", "w"), ensure_ascii=False, indent=0)
print(f"duração final {dur:.2f} s ({int(dur // 60)}:{dur % 60:04.1f}), {int(np.ceil(dur * FPS))} quadros; {sum(1 for a in ajustes if a[2] < 0)} silêncios apertados")
