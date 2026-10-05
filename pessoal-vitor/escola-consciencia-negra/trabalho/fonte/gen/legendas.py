"""Gera src/pN/captions.ts a partir de public/pN/words.json (DESIGN-SYSTEM §3: ≤42 caracteres por linha,
no máximo 2 linhas, quebra em fim de frase ou vírgula). Trechos em SEM_LEGENDA não recebem legenda porque
as mesmas palavras já estão na tela (texto cinético, título).
Uso: python3 gen/legendas.py 3 4 5 7"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..")
SEM_LEGENDA = {
    3: [(0.0, 3.2), (28.6, 30.35), (63.6, 65.5)],
    4: [(0.0, 4.9), (14.0, 15.8)],
    5: [(0.0, 7.2), (39.4, 44.5)],
    2: [(0.0, 3.5), (75.3, 99.0)],
    6: [(0.0, 3.7), (10.4, 11.9), (14.0, 17.46), (22.0, 25.4)],
    7: [(10.1, 12.9), (47.3, 99.0)],
}
MAXL, MAXC = 42, 84
FRACAS = {"a", "o", "e", "de", "da", "do", "em", "cada", "que", "por", "um", "uma", "na", "no", "as", "os", "é", "se", "para", "dos", "das", "sua", "seu", "ao", "à", "às", "aos"}

def wrap(txt):
    if len(txt) <= MAXL: return txt
    ws = txt.split(" "); best = None
    for i in range(1, len(ws)):
        a, b = " ".join(ws[:i]), " ".join(ws[i:])
        if len(a) <= MAXL and len(b) <= MAXL:
            fraca = a.split(" ")[-1].lower() in {"a", "o", "e", "de", "da", "do", "em", "cada", "que", "por", "um", "uma", "na", "no", "as", "os", "é", "se", "para", "dos", "das"}
            score = abs(len(a) - len(b)) - (24 if a[-1] in ",;:" else 0) + (30 if fraca else 0)
            if best is None or score < best[0]: best = (score, a + "\n" + b)
    return best[1] if best else txt

def gera(n):
    words = json.load(open(f"{ROOT}/public/p{n}/words.json"))
    excl = SEM_LEGENDA.get(n, [])
    livre = lambda w: not any(a <= w["s"] < b for a, b in excl)
    cues, cur = [], []
    def fecha():
        if cur: cues.append(cur.copy()); cur.clear()
    for i, w in enumerate(words):
        if not livre(w):
            fecha(); continue
        txt = " ".join(x["w"] for x in cur + [w])
        if cur and w["s"] - cur[-1]["e"] > 0.55:
            fecha()
        elif len(txt) > MAXC:
            # volta até um ponto natural (vírgula ou antes de "e/ou/mas") para não cortar a frase no meio
            cut = None
            for k in range(len(cur) - 1, 0, -1):
                antes = " ".join(x["w"] for x in cur[:k])
                if len(antes) >= 20 and (cur[k - 1]["w"][-1] in ",;:" or cur[k]["w"] in ("e", "ou", "mas")):
                    cut = k; break
            if not cut:  # sem ponto natural: corta perto do meio, fora de palavra fraca
                alvo = len(txt) / 2
                cands = [k for k in range(1, len(cur)) if cur[k - 1]["w"].lower() not in FRACAS]
                cut = min(cands or range(1, len(cur)), key=lambda k: abs(len(" ".join(x["w"] for x in cur[:k])) - alvo))
            resto = cur[cut:]; del cur[cut:]; fecha(); cur.extend(resto)
        cur.append(w)
        t = " ".join(x["w"] for x in cur)
        fim_frase = w["w"][-1] in ".?!"
        virgula = w["w"][-1] in ",;:" and len(t) > 30
        if fim_frase or virgula:
            fecha()
    fecha()
    out = []
    for k, c in enumerate(cues):
        s = c[0]["s"] - 0.05
        e = c[-1]["e"] + 0.25
        if k + 1 < len(cues): e = min(e, cues[k + 1][0]["s"] - 0.05)
        out.append({"s": round(s, 2), "e": round(max(e, s + 0.7), 2), "t": wrap(" ".join(x["w"] for x in c))})
    os.makedirs(f"{ROOT}/src/p{n}", exist_ok=True)
    with open(f"{ROOT}/src/p{n}/captions.ts", "w") as fh:
        fh.write("// Gerado por gen/legendas.py a partir de public/p%d/words.json. Não editar à mão.\n" % n)
        fh.write("import type {Cue} from '../captions';\nexport const CUES: Cue[] = [\n")
        for c in out:
            fh.write("  {s: %.2f, e: %.2f, t: %s},\n" % (c["s"], c["e"], json.dumps(c["t"], ensure_ascii=False)))
        fh.write("];\n")
    print(f"parte {n}: {len(out)} legendas")

for n in [int(a) for a in sys.argv[1:]] or [2, 3, 4, 5, 6, 7]:
    gera(n)
