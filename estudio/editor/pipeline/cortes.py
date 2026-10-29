"""Acha o que cortar no bruto: pausas longas, respiros, tomadas repetidas, repetições e pedidos de "corta".

Uso: python3 cortes.py <projeto> [--ritmo anuncio|conteudo|aula]

Não corta nada sozinho: escreve uma PROPOSTA que qualquer pessoa (ou o Claude) confere antes de montar.
  projeto/cortes.json  itens [{s, e, tipo, texto, aplicar}]  (mude "aplicar" ou acrescente itens "manual")
  projeto/cortes.md    a mesma proposta em tabela legível
Depois: montar.py aplica só os itens com aplicar=true.

Como decide:
- Pausa = trecho em que a ENERGIA do áudio fica perto do ruído de fundo (mais confiável que o tempo das
  palavras do Whisper, que costuma esticar a última palavra por cima do silêncio). Cada pausa longa vira um
  respiro curto do tamanho do ritmo escolhido; nunca some por completo, para a fala não ficar robótica.
- Tomada repetida = uma frase cujo começo é quase igual ao de uma das próximas três frases: fica a ÚLTIMA,
  que normalmente é a boa ("grave de novo e eu fico com a melhor").
- Repetição colada ("eu vou eu vou fazer") = fica a última ocorrência.
- Pedido de corte falado ("corta", "de novo", "deixa eu repetir", "errei") = sai a frase errada e o pedido.
- Vício de fala ("hã", "hum") sai; "né", "tipo" e um "é" solto entre pausas ficam como SUGESTÃO (aplicar=false),
  porque às vezes fazem parte do jeito de falar.
"""
from __future__ import annotations

import argparse
import difflib
import re
import unicodedata

import numpy as np

from comum import Projeto, audio_16k, escrever, ler, sair, tempo

RITMOS = {
    # pausa mínima para mexer, respiro que sobra (DESIGN-SYSTEM §6: ~0,18 s em criativo narrado),
    # silêncio deixado no começo/fim do vídeo
    "anuncio": {"min": 0.24, "respiro": 0.18, "borda": (0.04, 0.20)},
    "conteudo": {"min": 0.30, "respiro": 0.24, "borda": (0.05, 0.30)},
    "aula": {"min": 0.55, "respiro": 0.40, "borda": (0.10, 0.50)},
}
VICIOS = {"hã", "hãa", "hum", "humm", "hmm", "ãh", "ã", "ah", "eh", "uh", "uhm", "éé", "ééé", "aham"}
TALVEZ = {"né", "tipo", "assim", "então"}
DEIXAS = ["deixa eu repetir", "deixa eu falar de novo", "vou repetir", "vou de novo", "de novo", "corta",
          "pera", "peraí", "errei", "vou refazer", "começar de novo", "vou começar de novo"]


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9 ]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def energia(a: np.ndarray, sr: int, hop=0.01, jan=0.03):
    h, j = int(sr * hop), int(sr * jan)
    n = max(1, (len(a) - j) // h + 1)
    idx = np.arange(j)[None, :] + h * np.arange(n)[:, None]
    rms = np.sqrt(np.mean(a[np.minimum(idx, len(a) - 1)] ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms), hop


def silencios(db: np.ndarray, hop: float, minimo: float):
    piso, fala = np.percentile(db, 10), np.percentile(db, 90)
    lim = max(piso + 8.0, fala - 30.0)
    mudo = db < lim
    # fala curta (estalo, clique) dentro de um silêncio não quebra o silêncio
    k = int(0.06 / hop)
    fala_ = ~mudo
    if k > 1:
        fala_ = np.convolve(fala_.astype(float), np.ones(k) / k, mode="same") > 0.5
    mudo = ~fala_
    out, i = [], 0
    while i < len(mudo):
        if mudo[i]:
            j = i
            while j < len(mudo) and mudo[j]:
                j += 1
            if (j - i) * hop >= minimo:
                out.append((i * hop, j * hop))
            i = j
        else:
            i += 1
    return out, lim


def frases(pal: list[dict], quebra=0.45):
    fr, cur = [], []
    for i, w in enumerate(pal):
        if cur and (w["s"] - pal[i - 1]["e"] > quebra):
            fr.append(cur)
            cur = []
        cur.append(i)
        if w["w"][-1:] in ".?!":
            fr.append(cur)
            cur = []
    if cur:
        fr.append(cur)
    return fr


def parecido(a: list[str], b: list[str]) -> float:
    if len(a) < 2 or len(b) < 2:
        return 0.0
    n = min(len(a), len(b), 8)
    return difflib.SequenceMatcher(None, a[:n], b[:n]).ratio()


def detectar(pal, sil, dur, r):
    itens = []
    txt = [norm(w["w"]) for w in pal]

    # 1. pausas (energia) -> respiro
    meio = r["respiro"] / 2
    for s, e in sil:
        if s <= 0.02:  # silêncio do começo
            a, b = 0.0, max(0.0, e - r["borda"][0])
            tipo = "inicio"
        elif e >= dur - 0.02:
            a, b = s + r["borda"][1], dur
            tipo = "fim"
        else:
            a, b = s + max(0.05, meio * 1.2), e - max(0.04, meio * 0.8)
            tipo = "pausa"
        if b - a >= 0.06:
            itens.append({"s": round(a, 3), "e": round(b, 3), "tipo": tipo, "texto": f"{e - s:.2f}s de silêncio",
                          "aplicar": True})

    # 2. tomadas repetidas (fica a última)
    fr = frases(pal)
    descartadas = set()
    for i, f in enumerate(fr):
        a = [txt[k] for k in f]
        for j in range(i + 1, min(i + 4, len(fr))):
            b = [txt[k] for k in fr[j]]
            if parecido(a, b) >= 0.7:
                descartadas.add(i)
                break
    for i in sorted(descartadas):
        f = fr[i]
        itens.append({"s": pal[f[0]]["s"], "e": pal[fr[i + 1][0]]["s"] if i + 1 < len(fr) else pal[f[-1]]["e"],
                      "tipo": "tomada", "texto": " ".join(pal[k]["w"] for k in f), "aplicar": True})

    # 3. pedidos de corte falados: sai a frase anterior (ou o começo desta) + o pedido
    junto = " ".join(txt)
    for d in DEIXAS:
        for m in re.finditer(rf"(?:^| ){re.escape(norm(d))}(?= |$)", junto):
            k0 = junto[: m.start() + 1].count(" ") if m.start() else 0
            k1 = k0 + len(d.split()) - 1
            if k1 >= len(pal):
                continue
            fi = next((i for i, f in enumerate(fr) if k0 in f), None)
            if fi is None:
                continue
            ini = fr[fi][0] if fr[fi][0] < k0 else (fr[fi - 1][0] if fi > 0 else k0)
            fim_t = pal[k1 + 1]["s"] if k1 + 1 < len(pal) else pal[k1]["e"]
            itens.append({"s": pal[ini]["s"], "e": fim_t, "tipo": "pedido",
                          "texto": " ".join(pal[k]["w"] for k in range(ini, k1 + 1)),
                          "aplicar": d not in ("de novo", "pera")})  # ambíguos: só sugestão

    # 4. repetição colada de 1 a 4 palavras
    for n in (4, 3, 2, 1):
        k = 0
        while k + 2 * n <= len(txt):
            a, b = txt[k:k + n], txt[k + n:k + 2 * n]
            curto = n > 1 or len(a[0]) <= 3
            if a == b and all(a) and curto and pal[k + n]["s"] - pal[k + n - 1]["e"] < 0.8:
                itens.append({"s": pal[k]["s"], "e": pal[k + n]["s"], "tipo": "repeticao",
                              "texto": " ".join(pal[x]["w"] for x in range(k, k + 2 * n)), "aplicar": True})
                k += n
            k += 1

    # 5. vícios
    for k, w in enumerate(pal):
        t = txt[k]
        bruto = re.sub(r"[^\wãáàâéêíóôõúç]", "", w["w"].lower())  # sem tirar acento: "ã" (vício) não é "a" (artigo)
        antes = w["s"] - (pal[k - 1]["e"] if k else 0)
        depois = (pal[k + 1]["s"] if k + 1 < len(pal) else dur) - w["e"]
        if bruto in VICIOS:
            itens.append({"s": w["s"], "e": w["e"], "tipo": "vicio", "texto": w["w"], "aplicar": True})
        elif bruto in TALVEZ or (bruto == "é" and antes > 0.3 and depois > 0.3):
            itens.append({"s": w["s"], "e": w["e"], "tipo": "vicio?", "texto": w["w"], "aplicar": False})
    return sorted(itens, key=lambda x: x["s"])


def manter(itens, dur, minimo=0.08):
    cortes = sorted((i["s"], i["e"]) for i in itens if i.get("aplicar"))
    unidos = []
    for s, e in cortes:
        if unidos and s <= unidos[-1][1] + 0.02:
            unidos[-1][1] = max(unidos[-1][1], e)
        else:
            unidos.append([s, e])
    seg, t = [], 0.0
    for s, e in unidos:
        if s - t >= minimo:
            seg.append([round(t, 3), round(s, 3)])
        t = max(t, e)
    if dur - t >= minimo:
        seg.append([round(t, 3), round(dur, 3)])
    return seg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projeto")
    ap.add_argument("--ritmo", default="conteudo", choices=list(RITMOS))
    a = ap.parse_args()
    pj = Projeto(a.projeto)
    if not pj.arq("transcricao.json").exists():
        sair("rode antes: transcrever.py")
    tr = ler(pj.arq("transcricao.json"))
    wav = pj.arq("audio16k.wav")
    from scipy.io import wavfile
    if wav.exists():
        sr, au = wavfile.read(wav)
        au = au.astype(np.float32) / 32768.0
    else:
        sr, au = audio_16k(pj.original(), wav)
    dur = len(au) / sr
    r = RITMOS[a.ritmo]
    db, hop = energia(au, sr)
    sil, lim = silencios(db, hop, r["min"])
    itens = detectar(tr["palavras"], sil, dur, r)
    seg = manter(itens, dur)
    final = sum(e - s for s, e in seg)
    escrever(pj.arq("cortes.json"), {"ritmo": a.ritmo, "limiar_db": round(float(lim), 1), "duracao_original": round(dur, 3),
                                     "duracao_final": round(final, 3), "itens": itens, "manter": seg})
    linhas = [f"# Proposta de cortes ({a.ritmo})", "",
              f"Original {dur:.1f} s → montado {final:.1f} s ({100 * (1 - final / dur):.0f}% mais curto).", "",
              "Para mudar: edite `cortes.json` (aplicar true/false ou acrescente um item com tipo \"manual\") e rode montar.py.",
              "", "| de | até | tipo | o quê | aplicar |", "|---|---|---|---|---|"]
    for i in itens:
        linhas.append(f"| {tempo(i['s'])} | {tempo(i['e'])} | {i['tipo']} | {i['texto']} | {'sim' if i['aplicar'] else 'sugestão'} |")
    pj.arq("cortes.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    por = {}
    for i in itens:
        if i["aplicar"]:
            por[i["tipo"]] = por.get(i["tipo"], 0) + 1
    print(f"{dur:.1f}s → {final:.1f}s; " + ", ".join(f"{v} {k}" for k, v in por.items())
          + f"; sugestões: {sum(1 for i in itens if not i['aplicar'])}")


if __name__ == "__main__":
    main()
