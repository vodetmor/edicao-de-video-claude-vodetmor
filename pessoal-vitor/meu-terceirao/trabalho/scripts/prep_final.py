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


def janela_forte(p, dur, tam=3.5):
    """Início da janela de `tam` s com mais energia sonora (risada/fala). Sem áudio: 0.8 s.

    Correção 13/11: o astats devolve um valor por quadro de áudio (~21 ms), não por 0,25 s; o passo
    real é dur/len(vals). Antes o início caía sempre em dur-3 e o trecho acabava antes do corte (tela preta).
    `tam` é maior que o bloco (3,24 s) para sobrar vídeo até o fim.
    """
    if dur <= tam + 0.3:
        return 0.0
    if not tem_audio(p):
        return round(min(0.8, dur - tam), 2)
    r = run(["ffmpeg", "-nostats", "-i", p, "-af", "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"])
    vals = [max(-90.0, float(x)) for x in re.findall(r"RMS_level=(-?\d+\.?\d*)", r.stdout)]
    if len(vals) < 10:
        return round(min(0.8, dur - tam), 2)
    passo = dur / len(vals)
    n = max(1, int(tam / passo))
    pref = [0.0]
    for v in vals:
        pref.append(pref[-1] + v)
    melhor, ini = -1e18, 0
    for i in range(0, max(1, len(vals) - n)):
        sm = pref[i + n] - pref[i]
        if sm > melhor:
            melhor, ini = sm, i
    return round(max(0.0, min(ini * passo, dur - tam)), 2)


def subir_volume(dst, lufs):
    """Vídeo baixo (entre -45 e -19 LUFS): sobe para ~-18 LUFS com limitador, sem mexer na imagem."""
    if lufs is None or lufs > -19 or lufs < -45:
        return lufs
    tmp = dst[:-4] + ".tmp.mp4"
    r = run(["ffmpeg", "-v", "error", "-y", "-i", dst, "-c:v", "copy", "-af", f"volume={-18 - lufs:.1f}dB,alimiter=limit=0.89:level=disabled", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", tmp])
    if r.returncode == 0:
        os.replace(tmp, dst)
        return loudness(dst)
    return lufs


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
    lufs = subir_volume(dst, lufs)
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
