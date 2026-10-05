# Locução do vídeo GLSL, frase por frase, com respiros escolhidos (edge-tts, voz neural grátis).
# Uso: python3 voz.py -> voz.wav (48 kHz) + palavras.json (formato do motor: w, s, e, f, fe a 30 fps)
import asyncio, json, os, subprocess, certifi
import numpy as np
from scipy.io import wavfile
if os.path.exists("/root/.ccr/ca-bundle.crt"):
    certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts
VOZ, SR, FPS = "pt-BR-ThalitaMultilingualNeural", 48000, 30
PRE = 0.5
FRASES = [  # (texto, respiro depois em s)
    ("Isso não foi filmado.", 0.45),
    ("E também não foi modelado.", 0.7),
    ("É uma fórmula.", 1.5),
    ("O código calcula a luz, a sombra, e o reflexo.", 0.55),
    ("Pixel por pixel.", 1.3),
    ("A mesma matemática vira textura,", 0.35),
    ("transição,", 0.45),
    ("e acabamento de cinema.", 1.2),
    ("Agora, o nosso motor fala G L S L.", 2.6),
]
async def frase(txt, i):
    c = edge_tts.Communicate(txt, VOZ, rate="-6%", boundary="WordBoundary")
    ws = []
    with open(f"f{i}.mp3", "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                ws.append((ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"f{i}.mp3", "-ar", str(SR), "-ac", "1", f"f{i}.wav"], check=True)
    os.remove(f"f{i}.mp3")
    return ws
async def main():
    pedacos, palavras, t = [np.zeros(int(PRE * SR))], [], PRE
    for i, (txt, gap) in enumerate(FRASES):
        ws = await frase(txt, i)
        sr, x = wavfile.read(f"f{i}.wav"); x = x.astype(np.float32) / 32768
        # apara silêncio do fim do clipe (o TTS deixa ~0,1-0,4 s)
        nz = np.where(np.abs(x) > 0.004)[0]; x = x[: nz[-1] + int(0.06 * SR)]
        toks = txt.split()  # devolve a pontuação do roteiro às palavras (o TTS tira)
        if len(toks) == len(ws):
            ws = [(tk, s, e) for tk, (w, s, e) in zip(toks, ws)]
        for w, s, e in ws:
            palavras.append({"w": w, "s": round(t + s, 3), "e": round(t + e, 3), "f": round((t + s) * FPS), "fe": round((t + e) * FPS)})
        pedacos += [x, np.zeros(int(gap * SR))]
        t += len(x) / SR + gap
        os.remove(f"f{i}.wav")
    y = np.concatenate(pedacos)
    wavfile.write("voz.wav", SR, (y * 32767).astype(np.int16))
    json.dump({"dur": round(t, 3), "frames": round(t * FPS), "words": palavras}, open("palavras.json", "w"), ensure_ascii=False, indent=0)
    print(f"{len(palavras)} palavras, {t:.2f} s")
asyncio.run(main())
