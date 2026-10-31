"""Autoavaliação do render antes de mostrar ao usuário (ideia do video-use, 31/10/2026).
Procura no vídeo FINAL: (1) saltos de imagem (diferença entre quadros vizinhos muito acima da mediana) e
(2) estalos de áudio (salto de amostra muito acima do normal). Para cada suspeito salva uma "vista de linha do tempo"
(tira de 6 quadros + forma de onda) em <saida>/, para o Claude olhar só esses pontos em vez do vídeo inteiro.

Uso: python3 verificar_render.py video.mp4 [--saida pasta] [--limiar-img 6] [--limiar-som 8]
Mudança de cena planejada também aparece como salto: confira a tira e ignore as que são de propósito.
"""
import argparse, json, subprocess
from pathlib import Path
import numpy as np


def quadros_cinza(v: Path, fps=25, w=96, h=170):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(v), "-vf", f"fps={fps},scale={w}:{h},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32), fps


def audio(v: Path, sr=48000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(v), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32), sr


def tira(v: Path, t: float, destino: Path):
    a = max(0.0, t - 0.3)
    fc = (f"[0:v]trim=start={a}:duration=0.6,setpts=PTS-STARTPTS,fps=10,scale=-2:240,tile=6x1[t];"
          f"[0:a]atrim=start={a}:duration=0.6,asetpts=PTS-STARTPTS,showwavespic=s=1600x120:colors=white[w];"
          f"[t]scale=1600:-2[t2];[t2][w]vstack")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(v), "-filter_complex", fc, "-frames:v", "1", str(destino)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--saida")
    ap.add_argument("--limiar-img", type=float, default=6.0)
    ap.add_argument("--limiar-som", type=float, default=8.0)
    o = ap.parse_args()
    v = Path(o.video)
    out = Path(o.saida) if o.saida else v.with_name(v.stem + "-verificacao")
    out.mkdir(parents=True, exist_ok=True)

    q, fps = quadros_cinza(v)
    d = np.abs(np.diff(q, axis=0)).mean(axis=(1, 2))
    base = np.median(d) + 1e-3
    img = [((i + 1) / fps, float(d[i] / base)) for i in range(len(d)) if d[i] / base > o.limiar_img]

    s, sr = audio(v)
    som = []
    if len(s):
        ds = np.abs(np.diff(s))
        bloco = int(sr * 0.01)
        n = len(ds) // bloco
        pico = ds[: n * bloco].reshape(n, bloco).max(axis=1)
        ref = np.percentile(pico, 90) + 1e-6
        som = [(i * 0.01, float(pico[i] / ref)) for i in range(n) if pico[i] / ref > o.limiar_som]

    def agrupa(xs):
        r = []
        for t, k in xs:
            if r and t - r[-1][0] < 0.25:
                if k > r[-1][1]:
                    r[-1] = (t, k)
            else:
                r.append((t, k))
        return r

    img, som = agrupa(img), agrupa(som)
    for nome, xs in (("img", img), ("som", som)):
        for t, _ in xs:
            tira(v, t, out / f"{nome}-{t:06.2f}.png")
    rel = {"video": str(v), "saltos_imagem": [{"t": round(t, 2), "x_mediana": round(k, 1)} for t, k in img],
           "estalos_audio": [{"t": round(t, 2), "x_p90": round(k, 1)} for t, k in som]}
    (out / "relatorio.json").write_text(json.dumps(rel, ensure_ascii=False, indent=1))
    print(f"{len(img)} saltos de imagem, {len(som)} estalos de áudio → {out}/relatorio.json")


if __name__ == "__main__":
    main()
