"""Monta a trilha de voz da parte 1 (Vítor) no relógio final e gera words.json para legendas e sincronia.
Fontes: trabalho/audio/01a-Vitor-video.wav (câmera) e 01b-Vitor-audio.wav (WhatsApp)."""
import json, subprocess, numpy as np, imageio_ffmpeg, os
FF = imageio_ffmpeg.get_ffmpeg_exe()
T = "/mnt/project-files/escola-consciencia-negra/trabalho"
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "public")
SR = 48000

# (fonte, início, fim, F de início) no relógio final
SEGS = [
    ("01a-Vitor-video", 0.00, 21.05, 3.80),
    ("01b-Vitor-audio", 1.55, 49.02, 25.65),
    ("01b-Vitor-audio", 49.02, 54.18, 49.02 + 24.10 + 0.70),   # 0,7 s de silêncio antes de "Na prática, não."
]
TOTAL = 82.0

def load(name, chain):
    raw = subprocess.run([FF, "-v", "error", "-i", f"{T}/audio/{name}.wav", "-af", chain,
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

COMMON = "highpass=f=80,afftdn=nf=-42:nr=10,deesser=i=0.35,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=2"
src = {
    "01a-Vitor-video": load("01a-Vitor-video", COMMON + ",equalizer=f=3200:t=q:w=1:g=2"),
    "01b-Vitor-audio": load("01b-Vitor-audio", "adeclip," + COMMON + ",equalizer=f=250:t=q:w=1:g=-1.5"),
}

def lufs(x):
    p = subprocess.run([FF, "-v", "info", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                       input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float([l for l in p.splitlines() if l.strip().startswith("I:")][-1].split()[1])

# normaliza cada fonte para -16 LUFS integrado
for k in src:
    g = 10 ** ((-16.0 - lufs(src[k])) / 20); src[k] *= g

out = np.zeros(int(TOTAL * SR), np.float32)
fade = int(0.012 * SR)
for name, a, b, F in SEGS:
    seg = src[name][int(a * SR):int(b * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    i = int(F * SR); out[i:i + len(seg)] += seg
peak = np.abs(out).max(); print("peak", 20 * np.log10(peak))
subprocess.run([FF, "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", "volume=-3dB,alimiter=limit=0.79:attack=4:release=60:level=disabled", "-c:a", "pcm_s24le", f"{OUT}/voz.wav"],
               input=out.tobytes(), check=True)

# palavras no relógio final
words = []
for name, a, b, F in SEGS:
    for s in json.load(open(f"{T}/transcricoes/{name}.json")):
        for w in s["words"]:
            if w["s"] >= a - 0.02 and w["e"] <= b + 0.05:
                words.append({"w": w["w"].strip(), "s": round(w["s"] - a + F, 3), "e": round(w["e"] - a + F, 3)})
# correções: o fim real é um "até os dias atuais" só (retranscrito em 51,0-55,3 s); o resto era alucinação
words = [w for w in words if w["s"] < 49.02 + 24.8 + 52.98 - 49.02 - 0.01]
for txt, t in [("até", 53.04), ("os", 53.34), ("dias", 53.54), ("atuais.", 53.80)]:
    words.append({"w": txt, "s": round(t + 24.8, 3), "e": round(t + 24.8 + (0.35 if txt == "atuais." else 0.2), 3)})
FIX = {"Victor": "Vítor", "esgotasso": "esgoto a céu", "pobre": "pobres,", "suas": "sua", "maiorias,": "maioria,"}
for w in words: w["w"] = FIX.get(w["w"], w["w"])
json.dump(words, open(f"{OUT}/words.json", "w"), ensure_ascii=False, indent=0)
print(len(words), "palavras; última termina em", words[-1]["e"])
