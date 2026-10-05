"""Mede e classifica as candidatas por clima com o CLAP (IA que compara áudio com texto) + âncoras aprovadas.

Uso: python3 analise.py  -> trabalho/analise.json (medidas + notas por clima de cada faixa)
Precisa: pip install torch (cpu) "transformers==4.46.3" librosa pyloudnorm
(no transformers 5 e no modelo larger_clap_music as notas saem todas ~0: modelo quebrado)
"""
import json, sys, numpy as np, librosa, pyloudnorm as pyln, torch
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from transformers import ClapModel, ClapProcessor

AQUI = Path(__file__).resolve().parent.parent; TRAB = AQUI / "trabalho"
P = Path("/mnt/project-files")
ANCORAS = {  # trilhas que o Vítor já julgou
    "inspired": P / "estudio/aula-lancamento-obliquo/audio/musica/Inspired.mp3",            # aula: "perfeita"
    "deliberate": P / "pessoal-vitor/bastidores/trabalho/audio/musica/Deliberate_Thought.mp3",  # fala calma: aprovada
    "wallpaper": P / "estudio/aula-lancamento-obliquo/audio/musica/Wallpaper.mp3",          # "de piada" para aula
}
TEXTOS = {
    "aula": ["calm thoughtful piano and soft synth background music for an educational science explainer video",
             "gentle curious hopeful instrumental with a light steady pulse, focused and clear"],
    "fala": ["warm relaxed lo-fi beat background music for a talking vlog",
             "soft warm acoustic guitar and light percussion, easy going background for speech"],
    "gancho": ["suspenseful tense cinematic pulse with ticking and a building rhythm",
               "mysterious dark synth with a driving low pulse, intrigue and anticipation"],
    "final": ["uplifting hopeful cinematic piano and strings building to an emotional resolution",
              "bright inspiring triumphant swell, sense of achievement and ending"],
    "leve": ["playful upbeat cheerful light music with claps and plucks",
             "happy bouncy energetic pop instrumental, fun and bright"],
}
NEG = {"vocal": "a person singing vocals with lyrics", "piada": "comedic quirky cartoon music, silly and funny",
       "triste": "very sad melancholic depressing slow music", "barulho": "noisy harsh distorted experimental noise"}
SR = 48000

def carrega(f):
    try:
        y, _ = librosa.load(str(f), sr=SR, mono=True)
    except Exception as e:
        print("erro", f, e); return None
    return y

def medidas(y):
    d = len(y) / SR
    meter = pyln.Meter(SR)
    try: lufs = float(meter.integrated_loudness(y))
    except Exception: lufs = None
    # loudness de curto prazo (3 s) para dinâmica e introdução
    win = 3 * SR; st = []
    for i in range(0, max(1, len(y) - win), SR):
        seg = y[i:i + win]; rms = np.sqrt(np.mean(seg ** 2) + 1e-12); st.append(20 * np.log10(rms))
    st = np.array(st) if st else np.array([-60.0])
    lra = float(np.percentile(st, 95) - np.percentile(st, 10))
    med = np.median(st); intro = float(np.argmax(st > med - 6)) if (st > med - 6).any() else 0.0
    y22 = librosa.resample(y[: SR * 90], orig_sr=SR, target_sr=22050)
    tempo = float(np.atleast_1d(librosa.beat.beat_track(y=y22, sr=22050)[0])[0])
    brilho = float(np.mean(librosa.feature.spectral_centroid(y=y22, sr=22050)))
    onset = float(np.mean(librosa.onset.onset_strength(y=y22, sr=22050)))
    return dict(duracao=round(d, 1), lufs=None if lufs is None or not np.isfinite(lufs) else round(lufs, 1),
                dinamica_db=round(lra, 1), intro_s=round(intro, 1), bpm=round(tempo), brilho_hz=round(brilho), atividade=round(onset, 2))

def janelas(y, n=4, s=10):
    d = len(y) / SR; out = []
    for fr in np.linspace(0.15, 0.8, n):
        a = int(max(0, min(d - s, d * fr)) * SR); out.append(y[a:a + s * SR])
    return out

if __name__ == "__main__":
    torch.set_num_threads(4)
    M = ClapModel.from_pretrained("laion/larger_clap_music_and_speech").eval(); PR = ClapProcessor.from_pretrained("laion/larger_clap_music_and_speech")
    def emb_audio(ws):
        with torch.no_grad():
            x = PR(audios=ws, sampling_rate=SR, return_tensors="pt")
            e = M.get_audio_features(**x)
            e = getattr(e, "pooler_output", e)
        e = torch.nn.functional.normalize(e, dim=-1).mean(0)
        return torch.nn.functional.normalize(e, dim=0).numpy()
    def emb_texto(ts):
        with torch.no_grad():
            x = PR(text=ts, return_tensors="pt", padding=True)
            e = M.get_text_features(**x)
            e = getattr(e, "pooler_output", e)
        return torch.nn.functional.normalize(e, dim=-1).numpy()
    cand = json.loads((TRAB / "candidatas.json").read_text())
    ant = TRAB / "analise.json"; feito = {c["id"]: c for c in json.loads(ant.read_text())} if ant.exists() else {}
    anc = {}
    for k, f in ANCORAS.items():
        y = carrega(f); anc[k] = emb_audio(janelas(y)); print("âncora", k)
    tx = {k: emb_texto(v) for k, v in TEXTOS.items()}; ng = dict(zip(NEG, emb_texto(list(NEG.values()))))
    out = []
    for i, c in enumerate(cand):
        if c["id"] in feito and "emb" in feito[c["id"]]: out.append(feito[c["id"]]); continue
        y = carrega(c["arquivo"])
        if y is None or len(y) < SR * 30: continue
        e = emb_audio(janelas(y)); m = medidas(y)
        c = dict(c, **m)
        c["sim"] = {k: round(float((v @ e).mean()), 4) for k, v in tx.items()}
        c["neg"] = {k: round(float(v @ e), 4) for k, v in ng.items()}
        c["anc"] = {k: round(float(v @ e), 4) for k, v in anc.items()}
        c["emb"] = [round(float(x), 5) for x in e]
        out.append(c)
        if i % 20 == 0:
            print(i, len(cand), c["id"], c["sim"], flush=True)
            ant.write_text(json.dumps(out, ensure_ascii=False))
    ant.write_text(json.dumps(out, ensure_ascii=False))
    (TRAB / "ancoras.json").write_text(json.dumps({k: v.tolist() for k, v in anc.items()}))
    print("ok", len(out))
