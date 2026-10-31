"""Corta um trecho da BASE já montada (repetição, gaguejo, frase refeita) sem refazer o pipeline inteiro.
Corta o mesmo trecho em tudo que vive no tempo da base: base.mp4, pessoa.webm (com alfa), os vídeos derivados
(--extra, ex.: assets/base-estudio.mp4), rosto.json e base-palavras.json; atualiza a duração em projeto.json.
Guarda cópia de cada arquivo como <nome>.antes-corte na primeira vez.

Uso: python3 cortar_base.py <pasta-do-projeto> --de 19.05 --ate 20.32 [--extra assets/base-*.mp4 ...]
Ache o trecho pela forma de onda (energia) e confira transcrevendo a junção antes de cortar.
"""
import argparse, glob, json, shutil, subprocess
from pathlib import Path


def guarda(p: Path):
    c = p.with_name(p.name + ".antes-corte")
    if not c.exists():
        shutil.copy2(p, c)


def corta_video(p: Path, a: float, b: float, alfa=False):
    guarda(p)
    tmp = p.with_name("tmp-" + p.name)
    fc = (f"[0:v]trim=0:{a},setpts=PTS-STARTPTS[v0];[0:v]trim={b},setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0[v]")
    tem_audio = bool(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(p)],
                                    capture_output=True, text=True).stdout.strip())
    if tem_audio:
        # junção de áudio com 30 ms de cruzamento: sem estalo (padrão do video-use)
        fc += (f";[0:a]atrim=0:{a},asetpts=PTS-STARTPTS[a0];[0:a]atrim={b},asetpts=PTS-STARTPTS[a1];[a0][a1]acrossfade=d=0.03[a]")
    cmd = ["ffmpeg", "-v", "error", "-y"] + (["-c:v", "libvpx-vp9"] if alfa else []) + ["-i", str(p.with_name(p.name + ".antes-corte")), "-filter_complex", fc, "-map", "[v]"]
    if tem_audio:
        cmd += ["-map", "[a]", "-c:a", "aac", "-b:a", "192k"]
    if alfa:
        cmd += ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-auto-alt-ref", "0", "-metadata:s:v:0", "alpha_mode=1"]
    else:
        cmd += ["-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p"]
    subprocess.run(cmd + [str(tmp)], check=True)
    tmp.replace(p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pasta")
    ap.add_argument("--de", type=float, required=True)
    ap.add_argument("--ate", type=float, required=True)
    ap.add_argument("--extra", nargs="*", default=[])
    o = ap.parse_args()
    raiz = Path(o.pasta)
    pj = raiz / "projeto"
    a, b = o.de, o.ate
    d = b - a
    corta_video(pj / "base.mp4", a, b)
    corta_video(pj / "pessoa.webm", a, b, alfa=True)
    for padrao in o.extra:
        for x in glob.glob(str(raiz / padrao)):
            corta_video(Path(x), a, b)

    bp = pj / "base-palavras.json"
    guarda(bp)
    bj = json.loads(bp.read_text())
    novas = []
    for w in bj["palavras"]:
        if w["e"] <= a:
            novas.append(w)
        elif w["s"] >= b:
            novas.append({**w, "s": round(w["s"] - d, 3), "e": round(w["e"] - d, 3)})
        elif w["s"] < a:  # palavra que atravessa o corte termina nele
            novas.append({**w, "e": a})
    bj["palavras"] = novas
    bj["duracao"] = round(bj["duracao"] - d, 3)
    bp.write_text(json.dumps(bj, ensure_ascii=False, indent=1))

    rp = pj / "rosto.json"
    guarda(rp)
    r = json.loads(rp.read_text())
    fa, fb = round(a * r["fps"]), round(b * r["fps"])
    for k in ("cx", "cy", "tam"):
        r[k] = r[k][:fa] + r[k][fb:]
    r["n"] = len(r["cx"])
    rp.write_text(json.dumps(r))

    pp = pj / "projeto.json"
    guarda(pp)
    p = json.loads(pp.read_text())
    p["duracao_base"] = round(p["duracao_base"] - d, 3)
    if "pessoa" in p:
        p["pessoa"]["quadros"] = r["n"]
    pp.write_text(json.dumps(p, ensure_ascii=False, indent=1))
    print(f"cortado {a:.2f}–{b:.2f} s ({d:.2f} s). Nova duração da base: {p['duracao_base']} s")


if __name__ == "__main__":
    main()
