"""Aplica os cortes aprovados e gera a BASE: o vídeo limpo que todos os estilos usam.

Uso: python3 montar.py <projeto> [--velocidade 1.0] [--amostra 8]

Lê projeto/cortes.json (só itens com aplicar=true) e escreve:
  projeto/base.mp4             vídeo cortado, fps constante, voz tratada (passa-alta, compressão leve, -14 LUFS)
  projeto/base-palavras.json   as palavras com o tempo JÁ no vídeo cortado (é isso que legendas e animações usam)
  projeto/mapa.json            pedaços mantidos [ini_original, fim_original, ini_base]
Com --amostra N gera só os primeiros N segundos da base (para aprovar antes do vídeo inteiro).
Cada junção tem um fade de 6 ms no áudio: sem estalo no corte.
"""
from __future__ import annotations

import argparse

from comum import Projeto, escrever, ff, ler, sair, sonda
from cortes import manter

VOZ = "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--velocidade", type=float, default=1.0)
    ap.add_argument("--amostra", type=float, default=0)
    ap.add_argument("--original")
    a = ap.parse_args()
    pj = Projeto(a.projeto)
    if not pj.arq("cortes.json").exists():
        sair("rode antes: cortes.py")
    cj = ler(pj.arq("cortes.json"))
    tr = ler(pj.arq("transcricao.json"))
    src = pj.original(a.original)
    info = sonda(src)
    fps = round(info["fps"]) if abs(info["fps"] - round(info["fps"])) < 0.05 else 30
    q = 1.0 / fps
    seg = manter(cj["itens"], cj["duracao_original"])
    # cada pedaço começa e termina num quadro: áudio e vídeo cortam no mesmo instante
    seg = [[round(s / q) * q, round(e / q) * q] for s, e in seg]
    seg = [x for x in seg if x[1] - x[0] >= q]
    if a.amostra:
        acc, out = 0.0, []
        for s, e in seg:
            if acc >= a.amostra:
                break
            e = min(e, s + a.amostra - acc)
            out.append([s, e])
            acc += e - s
        seg = out

    v = a.velocidade
    partes, rot = [], []
    for i, (s, e) in enumerate(seg):
        d = e - s
        fade = min(0.006, d / 4)
        partes.append(f"[0:v]trim={s:.4f}:{e:.4f},setpts=PTS-STARTPTS[v{i}];"
                      f"[0:a]atrim={s:.4f}:{e:.4f},asetpts=PTS-STARTPTS,"
                      f"afade=t=in:d={fade:.4f},afade=t=out:st={d - fade:.4f}:d={fade:.4f}[a{i}];")
        rot.append(f"[v{i}][a{i}]")
    grafo = "".join(partes) + "".join(rot) + f"concat=n={len(seg)}:v=1:a=1[vc][ac];"
    grafo += f"[vc]fps={fps},setpts=PTS/{v}[vo];" if v != 1 else f"[vc]fps={fps}[vo];"
    grafo += (f"[ac]atempo={v}," if v != 1 else "[ac]") + VOZ + ",aresample=48000[ao]"
    saida = pj.arq("base-amostra.mp4" if a.amostra else "base.mp4")
    roteiro = pj.arq("montar.filtro")
    roteiro.write_text(grafo, encoding="utf-8")
    ff("-i", str(src), "-filter_complex_script", str(roteiro), "-map", "[vo]", "-map", "[ao]",
       "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(saida))

    # palavras no tempo da base
    mapa, t = [], 0.0
    for s, e in seg:
        mapa.append([round(s, 4), round(e, 4), round(t / v, 4)])
        t += e - s
    pal = []
    for w in tr["palavras"]:
        for s, e, b in mapa:
            meio = (w["s"] + w["e"]) / 2
            if s - 0.02 <= meio <= e + 0.02:
                ns = b + (max(w["s"], s) - s) / v
                ne = b + (min(w["e"], e) - s) / v
                pal.append({**w, "s": round(ns, 3), "e": round(max(ne, ns + 0.05), 3)})
                break
    dur = round(t / v, 3)
    if not a.amostra:
        escrever(pj.arq("base-palavras.json"), {"fps": fps, "duracao": dur, "largura": info["w"],
                                                 "altura": info["h"], "palavras": pal})
        escrever(pj.arq("mapa.json"), {"velocidade": v, "pedacos": mapa})
        pj.salvar_config(fps=fps, duracao_base=dur, largura=info["w"], altura=info["h"])
    print(f"{saida.name}: {dur:.2f}s, {len(seg)} pedaços, {fps} fps")


if __name__ == "__main__":
    main()
