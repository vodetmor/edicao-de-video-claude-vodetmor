# Abre pausas na locução (silêncio para o espectador ver a cena) e gera o relógio final.
# Saída: audio/voz_final.wav (48 kHz mono) e fonte/remotion/src/data/palavras.json (tempos no vídeo final)
import json, subprocess, numpy as np, wave
D = "/mnt/project-files/estudio/aula-lancamento-obliquo"
FPS = 30
W = json.load(open(f"{D}/audio/palavras_ok.json"))
# (índice da palavra depois da qual abre a pausa, segundos de pausa, motivo)
PAUSAS = [
    (31, 1.0, "título + câmera 3D vira lousa 2D"),
    (65, 2.0, "setas do peso iguais ao longo da trajetória; a = g"),
    (102, 2.5, "triângulo: cosseno = adjacente/hipotenusa"),
    (115, 2.0, "triângulo: seno = oposto/hipotenusa"),
    (138, 3.0, "voo com as duas sombras independentes"),
    (161, 1.5, "x(t) reta"),
    (179, 5.5, "gráfico vy x t: área = deslocamento"),
    (205, 1.0, "respiro"),
    (215, 6.0, "elimina t: equação da trajetória"),
    (249, 2.0, "isola o tempo"),
    (279, 1.0, "dobra da simetria"),
    (290, 1.5, "T = 2,4 s"),
    (329, 2.0, "Torricelli geral"),
    (341, 2.0, "isola H"),
    (360, 1.5, "H = 7,2 m na trajetória"),
    (389, 1.0, "respiro"),
    (409, 1.0, "fórmula-herói"),
    (462, 5.0, "varredura interativa do ângulo"),
    (476, 1.0, "respiro"),
    (495, 3.0, "replay 3D: 30° e 60° caem no mesmo ponto"),
]
CAUDA = 3.5
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",f"{D}/audio/locucao.mp3","-ar","48000","-ac","1","-f","f32le","/tmp/voz.raw"],check=True)
x = np.fromfile("/tmp/voz.raw", dtype=np.float32); SR = 48000
env = np.sqrt(np.convolve(x**2, np.ones(480)/480, mode="same"))  # RMS de 10 ms
cortes = []
for i, seg, _ in PAUSAS:
    a = W[i]["e"] - 0.3; b = W[i+1]["s"] + 0.3
    ia, ib = int(a*SR), int(b*SR)
    db = 20*np.log10(env[ia:ib] + 1e-9)
    # o trecho silencioso (< -50 dB) mais longo entre as palavras; corta no meio dele
    best, run, k0 = (0, None), 0, 0
    for k, v in enumerate(db < -50):
        if v:
            if run == 0: k0 = k
            run += 1
            if run > best[0]: best = (run, k0 + run // 2)
        else: run = 0
    c = (ia + (best[1] if best[1] is not None else int(np.argmin(db)))) / SR
    cortes.append((c, seg))
partes, t0, desloc = [], 0.0, []
acum = 0.0
for c, seg in cortes:
    tr = x[int(t0*SR):int(c*SR)].copy(); n = int(0.008*SR); tr[-n:] *= np.linspace(1, 0, n)
    if t0 > 0: tr[:n] *= np.linspace(0, 1, n)
    partes.append(tr); partes.append(np.zeros(int(seg*SR), np.float32))
    acum += seg; desloc.append((c, acum)); t0 = c
partes.append(x[int(t0*SR):]); partes.append(np.zeros(int(CAUDA*SR), np.float32))
y = np.concatenate(partes)
with wave.open(f"{D}/audio/voz_final.wav", "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(y, -1, 1)*32767).astype(np.int16).tobytes())
def novo(t):
    d = 0.0
    for c, ac in desloc:
        if t >= c: d = ac
    return t + d
# deslocamento pelo ÍNDICE da palavra (o Whisper às vezes marca o início um pouco antes do silêncio)
def desl_i(k): return sum(seg for (i, seg, _) in PAUSAS if i < k)
def corte_de(k): return [c for (i, _, _), (c, _) in zip(PAUSAS, cortes) if i == k]
out = []
for w in W:
    k = w["i"]; s0 = w["s"]; e0 = w["e"]
    if corte_de(k): e0 = min(e0, corte_de(k)[0] - 1e-3)      # termina antes da pausa
    if corte_de(k - 1): s0 = max(s0, corte_de(k - 1)[0])      # começa depois da pausa
    s1, e1 = s0 + desl_i(k), max(s0, e0) + desl_i(k)
    out.append({"i": k, "w": w["w"], "s": round(s1, 3), "e": round(e1, 3), "f": round(s1*FPS), "fe": round(e1*FPS)})
dur = len(y)/SR
pausas = [{"apos": W[i]["w"], "i": i, "de": round(novo(c)-seg, 3), "ate": round(novo(c), 3), "motivo": m}
          for (i, seg, m), (c, _) in zip(PAUSAS, cortes)]
import os; os.makedirs(f"{D}/fonte/remotion/src/data", exist_ok=True)
json.dump({"fps": FPS, "duracao": round(dur, 3), "quadros": int(np.ceil(dur*FPS)), "palavras": out, "pausas": pausas},
          open(f"{D}/fonte/remotion/src/data/relogio.json", "w"), ensure_ascii=False, indent=0)
print(f"duração final {dur:.2f} s ({int(dur//60)}:{dur%60:04.1f}), {int(np.ceil(dur*FPS))} quadros")
for p in pausas: print(p)
# conferência: nível no ponto de corte (deve ser silêncio, < -45 dB)
for (i, seg, m), (c, _) in zip(PAUSAS, cortes):
    k = int(c*SR); lv = 20*np.log10(env[k]+1e-9)
    print(f"corte depois de '{W[i]['w']}' em {c:.3f}s: {lv:.1f} dB")
