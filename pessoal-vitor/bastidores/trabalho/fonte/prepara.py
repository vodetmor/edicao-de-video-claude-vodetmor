# Corrige palavras, aplica o mapa de tempo (pausa inserida no 3D + cartão final) e gera os dados do Remotion.
import json, os
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get("OUT", "/root/bast/src/data")
FPS = 30
GAP_AT, GAP, END_SRC, END_CARD = 68.98, 3.0, 108.45, 3.5
# vitrine: depois do gancho, 6,4 s da própria aula (imagem e som) pra quem assiste ver o resultado
SHOW_AT, SHOW, SHOW_DE = 7.6, 6.4, 0.0
# cortes de silêncio, respiradas e hesitações: trechos quietos da voz limpa (>= 0,22 s) saem, sobrando 0,08 s de cada lado
import numpy as np, soundfile as sf
v, sr = sf.read(f"{B}/audio/voz_final.wav", dtype="float32")
if v.ndim > 1: v = v.mean(1)
hop = sr // 100; en = np.sqrt(np.convolve(v ** 2, np.ones(hop) / hop, "same"))[::hop]
db = 20 * np.log10(en + 1e-6); thr = np.percentile(db, 95) - 24
CUTS, a0 = [], None
for i, q in enumerate(list(db < thr) + [False]):
    if q and a0 is None: a0 = i
    if not q and a0 is not None:
        a, b = a0 / 100, i / 100; a0 = None
        if b - a < 0.22 or a >= END_SRC: continue
        a = 0.0 if a < 0.05 else a + 0.08; b = min(b, END_SRC) - 0.08
        # as inserções (vitrine e pausa 3D) ficam em pontos mantidos
        if b - a >= 0.08: CUTS.append((round(a, 3), round(b, 3)))
# inserção que cair dentro de um corte vai para o início do corte
def solta(x):
    for a, b in CUTS:
        if a < x < b: return a
    return x
SHOW_AT, GAP_AT = solta(SHOW_AT), solta(GAP_AT)
KEEP, cur = [], 0.0
for a, b in CUTS:
    if a > cur: KEEP.append((cur, a))
    cur = b
KEEP.append((cur, END_SRC))
# divide os trechos nos pontos de inserção e calcula onde cada um começa no vídeo final
segs, t = [], 0.0
for a, b in KEEP:
    pts = [a] + [x for x in (SHOW_AT, GAP_AT) if a < x < b] + [b]
    for s0, s1 in zip(pts, pts[1:]):
        if s0 == SHOW_AT: SHOW_OUT = t; t += SHOW
        if s0 == GAP_AT: GAP_OUT = t; t += GAP
        segs.append([round(s0, 3), round(s1, 3), round(t, 3)]); t += s1 - s0
    if b == SHOW_AT: SHOW_OUT = t; t += SHOW
    if b == GAP_AT: GAP_OUT = t; t += GAP
END_OUT = t
TOTAL = END_OUT + END_CARD
def o(s):
    for s0, s1, t0 in segs:
        if s < s1: return t0 + max(0.0, s - s0)
    return END_OUT
print("cortes", len(CUTS), "tirou", round(sum(b - a for a, b in CUTS), 2), "s")
p = json.load(open(f"{B}/audio/palavras.json"))
fix = {"Cloud.": "Claude.", "Cloud": "Claude", "Cloud,": "Claude,", "Cláudio,": "Claude,", "boa...": "boa", "...boa": "boa"}
ws = []
i = 0
while i < len(p):
    w = dict(p[i]); t = fix.get(w["w"], w["w"])
    if t == "manim" and i + 1 < len(p) and p[i+1]["w"] == ".py.":
        t = "manim.py."; w["e"] = p[i+1]["e"]; i += 1
    if t == "Eleven" and i + 1 < len(p) and p[i+1]["w"].startswith("Labs"):
        t = "ElevenLabs" + p[i+1]["w"][4:]; w["e"] = p[i+1]["e"]; i += 1
    w["w"] = t; w["src"] = i; ws.append(w); i += 1
# "uma boa boa ideia": a repetição sai da legenda (o áudio fica)
ws = [w for k, w in enumerate(ws) if not (w["w"] == "boa" and k + 1 < len(ws) and ws[k+1]["w"] == "boa")]
KEY = {"4","minutos","som,","música","3D,","IA","1","hora.","4","passos.","Claude.","Claude","Claude,","projeto.","nome","biblioteca,","API,","música,","lançamento","oblíquo","fórmulas","dica,","linguagens","programação","manim.py.","matemáticas.","3D,","composição","visual","incrível","voz","IA","ElevenLabs,","ElevenLabs","Juliano","Magalhães.","simples","ideia","inteligência","artificial","coordenador","subagentes","Comente","próxima","matéria","bastidores","Valeu!"}
for w in ws:
    w["s"] = round(o(w["s"]), 3); w["e"] = round(o(w["e"]), 3); w["k"] = w["w"] in KEY
# páginas de legenda: até 3 palavras e 16 letras, quebra em pontuação ou pausa
pages, cur = [], []
for k, w in enumerate(ws):
    cur.append(k)
    txt = " ".join(ws[j]["w"] for j in cur)
    nxt = ws[k+1] if k + 1 < len(ws) else None
    brk = nxt is None or len(cur) >= 3 or len(txt + " " + nxt["w"]) > 16 or w["w"][-1] in ".,?!" or nxt["s"] - w["e"] > 0.35
    if brk: pages.append(cur); cur = []
leg = []
for pg in pages:
    s = ws[pg[0]]["s"]; e = ws[pg[-1]]["e"]
    leg.append({"s": s, "e": e, "w": [{"t": ws[j]["w"], "s": ws[j]["s"], "k": ws[j]["k"]} for j in pg]})
for a, b in zip(leg, leg[1:]): a["e"] = min(max(a["e"] + 0.25, a["e"]), b["s"])
json.dump({"fps": FPS, "total": TOTAL, "frames": round(TOTAL * FPS), "gapAt": GAP_AT, "gap": GAP, "endSrc": END_SRC,
           "showAt": SHOW_OUT, "show": SHOW, "showDe": SHOW_DE, "gapOut": GAP_OUT, "endOut": END_OUT, "segs": segs,
           "w": [[x["src"], x["s"], x["e"]] for x in ws]}, open(f"{OUT}/tempo.json", "w"))
json.dump(leg, open(f"{OUT}/legenda.json", "w"), ensure_ascii=False)
print(len(ws), "palavras", len(leg), "páginas", round(TOTAL * FPS), "quadros")
