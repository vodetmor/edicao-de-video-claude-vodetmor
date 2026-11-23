"""Monta o plano da "Aula da Saudade" (música "Bem", Chapéu de Palha, 270 s) -> estudio/motor/src/obras/saudade/plano.json

Lê : acervo.json (fotos/vídeos do terceirão), manifest.csv (turma), musica/chapeu-de-palha.palavras.json (tempo por palavra)
Roda: python -I trabalho/scripts/montar_saudade.py
Atos (s): capa abre 0-6,5 | Antes (infância) 6,5-83 | instrumental 83-102 | Crescendo 102-168 | instrumental 168-186
          | Vazio 186-201 | Hoje 201-245 | álbum fecha 245-270
"""
import csv
import json
import os
import random

BASE = "C:/dev/maquina-de-editar"
TRAB = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho"
OBRA = f"{BASE}/estudio/motor/src/obras/saudade"
TER = f"{BASE}/estudio/motor/src/obras/terceirao"
DUR = 270.0
os.makedirs(OBRA, exist_ok=True)

AC = json.load(open(f"{TER}/acervo.json", encoding="utf8"))
RO = json.load(open(f"{TER}/rostos.json", encoding="utf8"))
MAN = {r["arquivo"].rsplit(".", 1)[0]: r for r in csv.DictReader(open(f"{TRAB}/triagem/manifest.csv", encoding="utf8"))}
FOTOS = {f["id"]: f for f in AC["fotos"]}
rng = random.Random(23)


def turma(i):
    q = MAN.get(i, {}).get("quem_aparece", "")
    return "231" if "231" in q else "232" if "232" in q else None


crianca = [f["id"] for f in AC["fotos"] if f["grupo"] == "crianca"]
jovem = [f["id"] for f in AC["fotos"] if f["grupo"] == "jovem"]
# crianças: com rosto detectado primeiro (a foto aparece inteira, mas o rosto tem que estar lá)
crianca.sort(key=lambda i: (RO[i]["n"] == 0, rng.random()))
cv = [i for i in crianca if FOTOS[i]["o"] == "v"]
ch = [i for i in crianca if FOTOS[i]["o"] == "h"]
# jovens atuais: as duas turmas alternadas; grupos (mais rostos) primeiro
y231 = sorted([i for i in jovem if turma(i) == "231"], key=lambda i: -RO[i]["n"])
y232 = sorted([i for i in jovem if turma(i) == "232"], key=lambda i: -RO[i]["n"])
yv = [i for i in jovem if FOTOS[i]["o"] == "v" and RO[i]["n"] >= 1]
rng.shuffle(yv)
videos = [v for v in AC["videos"] if v["dur"] - v.get("ini", 0) >= 3.2]
rng.shuffle(videos)

usados = set()
alt = {"t": 0}


def tira(lista, quer=None):
    for i in lista:
        if i not in usados and (quer is None or quer(i)):
            usados.add(i)
            return i
    raise SystemExit("faltou foto")


def pega_crianca(vertical_a_vertical=False):
    return tira(cv if vertical_a_vertical else crianca)


def pega_jovem(grupo=False):
    alt["t"] ^= 1
    pool = y231 if alt["t"] else y232
    return tira(pool, (lambda i: RO[i]["n"] >= 2) if grupo else None)


def video():
    for v in videos:
        if v["id"] not in usados:
            usados.add(v["id"])
            return v
    raise SystemExit("faltaram vídeos")


slides = []


def slot(a, b, tipo, era):
    if tipo == "c":
        i = tira(crianca)
        slides.append({"k": "foto", "a": a, "b": b, "ids": [i], "era": era})
    elif tipo == "C":  # dupla de verticais de criança
        i, j = tira(cv), tira(cv)
        slides.append({"k": "dupla", "a": a, "b": b, "ids": [i, j], "era": era})
    elif tipo == "y":
        i = pega_jovem()
        slides.append({"k": "foto", "a": a, "b": b, "ids": [i], "era": era})
    elif tipo == "Y":
        i, j = tira(y231, lambda k: FOTOS[k]["o"] == "v"), tira(y232, lambda k: FOTOS[k]["o"] == "v")
        slides.append({"k": "dupla", "a": a, "b": b, "ids": [i, j], "era": era})
    elif tipo == "g":  # foto de grupo
        i = pega_jovem(True)
        slides.append({"k": "foto", "a": a, "b": b, "ids": [i], "era": era})
    elif tipo == "v":
        v = video()
        slides.append({"k": "video", "a": a, "b": b, "ids": [v["id"]], "ini": v.get("ini", 0), "vdur": v["dur"], "w": v["w"], "h": v["h"], "era": era})


def secao(a, b, padrao, era):
    n = len(padrao)
    for k, t in enumerate(padrao):
        slot(round(a + (b - a) * k / n, 2), round(a + (b - a) * (k + 1) / n, 2), t, era)


# ---- atos
secao(6.5, 83.0, "ccCcccCcccCc", "antes")  # infância, ~6,4 s por página
slides[0]["a"] = 8.4  # a capa 3D leva 8,4 s para abrir; a primeira foto entra depois
secao(83.0, 102.0, "vv", "antes")  # instrumental: a cor volta
secao(102.0, 168.0, "cvycvYcvgcy", "cresceu")
secao(168.0, 186.0, "vvv", "cresceu")
# 186-201: vazio (uma foto quase parada; é preciso ser uma foto de criança)
i = tira(ch)
slides.append({"k": "vazio", "a": 186.0, "b": 201.0, "ids": [i], "era": "vazio"})
secao(201.0, 245.0, "gvyYgvyg", "hoje")
# 245-259: duas últimas páginas; a última é a foto da turma (grupo com mais rostos)
i = tira(crianca)
slides.append({"k": "foto", "a": 245.0, "b": 252.0, "ids": [i], "era": "hoje"})
turma_foto = max([f for f in jovem if FOTOS[f]["o"] == "h" and f not in usados], key=lambda f: RO[f]["n"])
usados.add(turma_foto)
slides.append({"k": "foto", "a": 252.0, "b": 263.0, "ids": [turma_foto], "era": "hoje", "final": True})

for s in slides:
    s["a"], s["b"] = float(s["a"]), float(s["b"])
for s in slides:
    for i in s["ids"]:
        if s["k"] != "video":
            f = FOTOS[i]
            s.setdefault("dim", []).append([f["w"], f["h"]])

# ---- letra em pedaços (≤3 palavras), com o início de cada palavra medido
pal = json.load(open(f"{TRAB}/musica/chapeu-de-palha.palavras.json", encoding="utf8"))
pal = pal if isinstance(pal, list) else pal.get("words", pal)
pal = [p for p in pal if p["s"] < 254]
pedacos, cur = [], []
for p in pal:
    nova = cur and (p["s"] - cur[-1]["e"] > 0.45 or len(cur) >= 3 or len(" ".join(x["w"] for x in cur + [p])) > 20)
    if nova:
        pedacos.append(cur)
        cur = []
    cur.append(p)
if cur:
    pedacos.append(cur)


def estilo(t):
    if t < 102:
        return "colagem"
    if t < 131:
        return "serif"
    if t < 170:
        return "colagem"
    if t < 186:
        return "serif"
    if t < 201:
        return "vazio"
    if t < 244:
        return "limpa"
    return "serif"


letras = []
for k, pc in enumerate(pedacos):
    a = pc[0]["s"]
    prox = pedacos[k + 1][0]["s"] if k + 1 < len(pedacos) else pc[-1]["e"] + 3
    b = min(prox + 0.15, pc[-1]["e"] + 2.6, a + 5.5)  # sai antes do próximo verso aparecer (mesma área da tela)
    b = max(b, pc[-1]["e"] + 0.3)
    texto = " ".join(x["w"].strip(",.") for x in pc)
    letras.append({"a": round(a, 2), "b": round(b, 2), "t": [x["w"].strip(",.") for x in pc], "ts": [round(x["s"], 2) for x in pc], "estilo": estilo(a)})

# palavra "saudade" no refrão final (a única vez), lenta e grande
destaques = [{"a": 224.5, "b": 233.0, "t": "saudade", "estilo": "colagem"}]
eras = [{"a": 9.6, "t": "lá no começo"}, {"a": 84.0, "t": "e a gente foi crescendo"}, {"a": 203.0, "t": "hoje"}]

plano = {"fps": 30, "duracao": DUR, "slides": slides, "letras": letras, "destaques": destaques, "eras": eras}
json.dump(plano, open(f"{OBRA}/plano.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
nf = sum(len(s["ids"]) for s in slides if s["k"] != "video")
nc = sum(1 for s in slides for i in s["ids"] if s["k"] != "video" and FOTOS[i]["grupo"] == "crianca")
print(f"slides {len(slides)} | fotos {nf} (crianças {nc}) | vídeos {sum(1 for s in slides if s['k']=='video')} | pedaços de letra {len(letras)}")
print("turmas nas fotos de jovens:", {t: sum(1 for s in slides for i in s["ids"] if s["k"] != "video" and turma(i) == t) for t in ("231", "232")})
print("foto da turma:", turma_foto, RO[turma_foto])
