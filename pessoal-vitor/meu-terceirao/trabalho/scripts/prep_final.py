"""Prepara os assets da FINAL do Meu Terceirão.

Entrada : trabalho/triagem/crianca/*.jpg, trabalho/triagem/jovem/*.jpg|*.mp4
Saída   : estudio/motor/public/final/p/<id>.jpg   (foto reduzida, EXIF aplicado, máx. 2400 px)
          estudio/motor/public/final/v/<id>.mp4   (vídeo 720p H.264 + AAC, 30 fps)
          estudio/motor/src/obras/terceirao/acervo.json  (catálogo: tamanho, grupo, trecho do vídeo)

Rodar: python trabalho/scripts/prep_final.py   (idempotente: pula o que já existe)
"""
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageOps

BASE = "C:/dev/maquina-de-editar"
TRI = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/triagem"
OUT = f"{BASE}/estudio/motor/public/final"
CAT = f"{BASE}/estudio/motor/src/obras/terceirao/acervo.json"
os.makedirs(f"{OUT}/p", exist_ok=True)
os.makedirs(f"{OUT}/v", exist_ok=True)


def fotos():
    out = []
    for grupo in ("crianca", "jovem"):
        d = f"{TRI}/{grupo}"
        for f in sorted(os.listdir(d)):
            if f.lower().endswith(".jpg"):
                out.append((grupo, f[:-4], f"{d}/{f}"))
    return out


def videos():
    d = f"{TRI}/jovem"
    return [(f[:-4], f"{d}/{f}") for f in sorted(os.listdir(d)) if f.lower().endswith(".mp4")]


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf8", errors="replace")


def prep_foto(grupo, id_, src):
    dst = f"{OUT}/p/{id_}.jpg"
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = im.size
    if not os.path.exists(dst):
        k = 2400 / max(w, h)
        if k < 1:
            im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
        im.save(dst, quality=86, optimize=True)
        w, h = im.size
    else:
        w, h = Image.open(dst).size
    return {"id": id_, "grupo": grupo, "w": w, "h": h, "o": "h" if w >= h else "v"}


def duracao(p):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p])
    try:
        return float(r.stdout.strip().split()[0])
    except Exception:
        return 0.0


def dimensoes(p):
    r = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_tags=rotate:stream_side_data=rotation", "-of", "json", p])
    j = json.loads(r.stdout)
    s = j["streams"][0]
    w, h = s["width"], s["height"]
    rot = 0
    for sd in s.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(sd["rotation"])
    if abs(rot) in (90, 270):
        w, h = h, w
    return w, h


def loudness(p):
    """LUFS integrado do áudio (None se não tiver áudio)."""
    r = run(["ffmpeg", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"])
    m = re.findall(r"I:\s+(-?\d+\.\d+) LUFS", r.stderr)
    return float(m[-1]) if m else None


def tem_audio(p):
    r = run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name", "-of", "csv=p=0", p])
    return bool(r.stdout.strip())


def janela_forte(p, dur, tam=3.0):
    """Início da janela de `tam` s com mais energia sonora (risada/fala). Sem áudio: 0.8 s."""
    if dur <= tam + 0.5 or not tem_audio(p):
        return 0.0 if dur <= tam + 0.5 else 0.8
    r = run(["ffmpeg", "-nostats", "-i", p, "-af", "astats=metadata=1:reset=1:length=0.25,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"])
    vals = [float(x) for x in re.findall(r"RMS_level=(-?\d+\.?\d*|-inf)".replace("|-inf", ""), r.stdout)]
    if not vals:
        return 0.8
    n = int(tam / 0.25)
    melhor, ini = -1e9, 0
    for i in range(0, max(1, len(vals) - n)):
        s = sum(vals[i:i + n]) / n
        if s > melhor:
            melhor, ini = s, i
    return round(min(ini * 0.25, dur - tam), 2)


def prep_video(id_, src):
    dst = f"{OUT}/v/{id_}.mp4"
    if not os.path.exists(dst):
        r = run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "scale='if(gt(iw,ih),min(1280,iw),min(720,iw))':-2,fps=30", "-c:v", "libx264", "-crf", "21", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", dst])
        if r.returncode:
            print("ERRO video", id_, r.stderr[:200])
    dur = duracao(dst)
    w, h = dimensoes(dst)
    audio = tem_audio(dst)
    lufs = loudness(dst) if audio else None
    return {
        "id": id_, "w": w, "h": h, "o": "h" if w >= h else "v", "dur": round(dur, 2),
        "audio": audio, "lufs": lufs,
        "ini": janela_forte(dst, dur),
    }


def main():
    cat = {"fotos": [], "videos": []}
    for g, id_, p in fotos():
        cat["fotos"].append(prep_foto(g, id_, p))
    print("fotos", len(cat["fotos"]))
    for id_, p in videos():
        cat["videos"].append(prep_video(id_, p))
    print("videos", len(cat["videos"]))
    json.dump(cat, open(CAT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    c = sum(1 for f in cat["fotos"] if f["grupo"] == "crianca")
    print("crianca", c, "jovem", len(cat["fotos"]) - c)


if __name__ == "__main__":
    sys.exit(main())
