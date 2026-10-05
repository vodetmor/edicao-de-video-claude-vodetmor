"""Junta as 7 partes no vídeo final (Racismo Ambiental). Cada parte mantém a própria trilha (pedido do Vítor);
as transições são: imagem mergulha no preto e volta (capítulos de documentário) + PONTE DE ÁUDIO: a cauda da música da parte
anterior ganha uma reverberação longa que atravessa o corte, e um impacto grave suave abre a parte seguinte.
Uso: python3 gen/final.py  →  escola-consciencia-negra/racismo-ambiental-FINAL.mp4"""
import json, os, subprocess
import numpy as np, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
D = "/mnt/project-files/escola-consciencia-negra"
AC = f"{D}/trabalho/acervo"
SR = 48000
PARTES = ["parte1-vitor-amostra", "parte2-maria-eduarda", "parte3-caina", "parte4-luisa", "parte5-anna-augusta", "parte6-maria-alice", "parte7-anna-julia"]
GAP = [0.35, 0.7, 0.7, 0.7, 0.7, 0.7]     # preto entre as partes (1→2 é curto: "O chão, não." / "Quem não tem chão")
FOUT, FIN = 0.55, 0.45

def dur(p):
    out = subprocess.run([FF, "-nostdin", "-i", p], capture_output=True).stderr.decode()
    h, m, s = out.split("Duration: ")[1].split(",")[0].split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)

def audio(p, extra=None):
    cmd = [FF, "-nostdin", "-v", "error", "-i", p] + (["-af", extra] if extra else []) + ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()

files = [f"{D}/{n}.mp4" for n in PARTES]
durs = [dur(p) for p in files]
offs, t = [], 0.0
for i, d in enumerate(durs):
    offs.append(t); t += d + (GAP[i] if i < len(GAP) else 0)
total = t
print("durações", [round(d, 2) for d in durs], "total", round(total, 2))

# ---------------- áudio
mix = np.zeros((int(total * SR) + SR, 2), np.float32)
for p, o in zip(files, offs):
    a = audio(p); i = int(o * SR); mix[i:i + len(a)] += a
imp = audio(f"{AC}/sfx/impacto-grave.wav")
imp *= 10 ** (-20 / 20) / (np.abs(imp).max() + 1e-9)
for k in range(len(files) - 1):
    fim = offs[k] + durs[k]
    # cauda reverberada: últimos 1,6 s da parte k → eco longo, só a parte que passa do corte
    tail = subprocess.run([FF, "-nostdin", "-v", "error", "-ss", str(durs[k] - 1.6), "-i", files[k], "-af",
                           "apad=pad_dur=3,aecho=0.8:0.75:90|170|290|430|610:0.55|0.45|0.35|0.27|0.2,lowpass=f=5000",
                           "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    tail = np.frombuffer(tail, np.float32).reshape(-1, 2).copy()[int(1.6 * SR):int(4.2 * SR)]
    n = len(tail); env = np.ones(n, np.float32)
    env[:int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR)); env[int(0.6 * SR):] = np.linspace(1, 0, n - int(0.6 * SR)) ** 2
    i = int(fim * SR); mix[i:i + n] += tail * env[:, None] * 10 ** (-7 / 20)
    j = int((offs[k + 1] - 0.02) * SR); mix[j:j + len(imp)] += imp[: len(mix) - j]
w = f"{D}/trabalho/renders/final-audio.wav"
subprocess.run([FF, "-nostdin", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "alimiter=limit=0.89:level=false",
                "-c:a", "pcm_s24le", w], input=mix[: int(total * SR)].astype(np.float32).tobytes(), check=True)

# ---------------- vídeo
fc = []
for k, d in enumerate(durs):
    f = []
    if k > 0: f.append(f"fade=t=in:st=0:d={FIN}")
    if k < len(durs) - 1: f += [f"fade=t=out:st={d - FOUT:.3f}:d={FOUT}", f"tpad=stop_mode=add:stop_duration={GAP[k]}:color=black"]
    fc.append(f"[{k}:v]fps=30,format=yuv420p,setsar=1{',' + ','.join(f) if f else ''}[v{k}]")
fc.append("".join(f"[v{k}]" for k in range(len(durs))) + f"concat=n={len(durs)}:v=1:a=0[v]")
cmd = [FF, "-nostdin", "-y", "-v", "error"]
for p in files: cmd += ["-i", p]
cmd += ["-i", w, "-filter_complex", ";".join(fc), "-map", "[v]", "-map", f"{len(durs)}:a", "-c:v", "libx264", "-crf", "21", "-preset", "slow",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", f"{D}/racismo-ambiental-FINAL.mp4"]
subprocess.run(cmd, check=True)
json.dump({"partes": PARTES, "inicio": [round(o, 2) for o in offs], "dur": [round(d, 2) for d in durs]}, open(f"{D}/trabalho/renders/final-mapa.json", "w"), indent=1)
print("pronto", f"{D}/racismo-ambiental-FINAL.mp4", "inícios:", [round(o, 2) for o in offs])
