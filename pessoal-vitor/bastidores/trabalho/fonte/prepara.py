# Corrige palavras, aplica o mapa de tempo (pausa inserida no 3D + cartão final) e gera os dados do Remotion.
import json, os
B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get("OUT", "/root/bast/src/data")
FPS = 30
GAP_AT, GAP, END_SRC, END_CARD = 68.98, 3.0, 108.45, 3.5
TOTAL = END_SRC + GAP + END_CARD
def o(s): return s if s < GAP_AT else s + GAP
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
           "w": [[x["src"], x["s"], x["e"]] for x in ws]}, open(f"{OUT}/tempo.json", "w"))
json.dump(leg, open(f"{OUT}/legenda.json", "w"), ensure_ascii=False)
print(len(ws), "palavras", len(leg), "páginas", round(TOTAL * FPS), "quadros")
