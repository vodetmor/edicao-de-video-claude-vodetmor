"""Plano da "Aula da Saudade" V3: álbum de verdade folheado em 3D sobre a mesa -> estudio/motor/src/obras/saudade/plano3.json

Unidades do álbum: página W=1.6 x H=2.0; lombada em x=0; página direita x 0..W, esquerda x -W..0; z de -H/2 (topo) a +H/2.
Atos (s): capa 0-9 | antes (página preta) 9-83 | instrumental: a cor volta 83-102 | crescendo (kraft) 102-168
          | instrumental 168-186 | vazio (abajur) 186-201 | hoje (marfim) 201-247 | começo x hoje 247-259 | capa fecha 259-270
Rodar: python -I trabalho/scripts/montar_saudade3.py
"""
import csv
import json
import random

BASE = "C:/dev/maquina-de-editar"
TRAB = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho"
OBRA = f"{BASE}/estudio/motor/src/obras/saudade"
TER = f"{BASE}/estudio/motor/src/obras/terceirao"
W, H = 1.6, 2.0
TURN = 1.7  # segundos de uma página virando

AC = json.load(open(f"{TER}/acervo.json", encoding="utf8"))
RO = json.load(open(f"{TER}/rostos.json", encoding="utf8"))
MAN = {r["arquivo"].rsplit(".", 1)[0]: r for r in csv.DictReader(open(f"{TRAB}/triagem/manifest.csv", encoding="utf8"))}
VIDS = {v["id"]: v for v in AC["videos"]}
rng = random.Random(31)

# SÓ A 232 (pedido do Vítor, 24/11): infância = as 11 fotos que ele mandou (k01..k11, do mais novo ao mais velho,
# em triagem/crianca-232/); jovem e vídeos = só o que tem turma 232 registrada no manifest (nada da 231 nem sem turma)
KIDS = json.load(open(f"{TRAB}/triagem/crianca-232.json", encoding="utf8"))
FOTOS = {f["id"]: f for f in AC["fotos"] + KIDS}


def turma(i):
    q = MAN.get(i, {}).get("quem_aparece", "")
    return "232" if i.startswith("k") else "231" if "231" in q else "232" if "232" in q else None


crianca = [f["id"] for f in KIDS]
jovem = [f["id"] for f in AC["fotos"] if f["grupo"] == "jovem"]
TURMA_FOTO = "a40"  # a 232 de terno, na sala (escolhida a olho: limpa, deitada, todos de frente)
QUASE_IGUAIS = {"a23", "a37", "a38", "a39", "d26", "a02", "d15"}  # mesma cena de a21 / a40 / d25 / a34 / a45, de outro clique
y232 = sorted([i for i in jovem if turma(i) == "232" and i != TURMA_FOTO and i not in QUASE_IGUAIS],key=lambda i: (-RO[i]["n"], rng.random()))
# vídeos horizontais e com tempo útil (a câmera "entra" neles); verticais ficam de fora
videos = [v for v in AC["videos"] if turma(v["id"]) == "232" and v["dur"] - v.get("ini", 0) >= 6 and v["w"] > v["h"]]
rng.shuffle(videos)
usados = set()
alt = {"t": 0}


def tira(lista):
    for i in lista:
        if i not in usados:
            usados.add(i)
            return i
    raise SystemExit("faltou foto")


def jovem_alt():
    return tira(y232)


def video():
    for v in videos:
        if v["id"] not in usados:
            usados.add(v["id"])
            return v
    raise SystemExit("faltou vídeo")


def dim(it):
    if it["k"] == "video":
        v = VIDS[it["id"]]
        return v["w"], v["h"]
    f = FOTOS[it["id"]]
    return f["w"], f["h"]


def cabe(iw, ih, mw, mh):
    k = min(mw / iw, mh / ih)
    return iw * k, ih * k


def pagina(itens, lado, era, titulo=None):
    """posiciona 1 ou 2 itens numa página; devolve itens com x,z,w,h,rot (mundo)"""
    x0 = 0.0 if lado == "R" else -W
    topo = 0.32 if titulo else 0.0  # espaço do título colado
    out = []
    giro = 4.0 if era == "hoje" else 2.2
    if not itens:
        return []
    if len(itens) == 1:
        iw, ih = dim(itens[0])
        w, h = cabe(iw, ih, W - 0.42, H - 0.62 - topo)
        out.append({**itens[0], "x": x0 + W / 2, "z": topo / 2 + 0.02, "w": w, "h": h})
    else:
        (aw, ah), (bw, bh) = dim(itens[0]), dim(itens[1])
        if aw < ah and bw < bh:  # duas em pé: lado a lado
            for k, (iw, ih) in enumerate(((aw, ah), (bw, bh))):
                w, h = cabe(iw, ih, (W - 0.52) / 2, H - 0.7 - topo)
                out.append({**itens[k], "x": x0 + W * (0.27 + 0.46 * k), "z": topo / 2 + (0.05 if k else -0.05), "w": w, "h": h})
        else:  # empilhadas
            for k, (iw, ih) in enumerate(((aw, ah), (bw, bh))):
                w, h = cabe(iw, ih, W - 0.5, (H - 0.72 - topo) / 2)
                out.append({**itens[k], "x": x0 + W / 2 + (0.06 if k else -0.06), "z": topo / 2 + (-1 if k == 0 else 1) * ((H - topo) / 4 - 0.04), "w": w, "h": h})
    for it in out:
        it["rot"] = round((rng.random() - 0.5) * 2 * giro, 2)
        it["w"], it["h"] = round(it["w"], 3), round(it["h"], 3)
        it["x"], it["z"] = round(it["x"], 3), round(it["z"], 3)
    return out


spreads = []


def F(i):
    return {"k": "foto", "id": i}


def V(v):
    return {"k": "video", "id": v["id"], "ini": v.get("ini", 0), "vdur": v["dur"]}


def spread(a, b, era, L, R, tituloL=None):
    s = {"a": round(a, 2), "b": round(b, 2), "era": era, "L": pagina(L, "L", era, tituloL), "R": pagina(R, "R", era), "titulo": tituloL}
    spreads.append(s)
    return s


def secao(a, b, era, montagens, titulo=None):
    n = len(montagens)
    for k, (L, R) in enumerate(montagens):
        sa = a + (b - a) * k / n
        sb = a + (b - a) * (k + 1) / n
        spread(sa, sb, era, L(), R(), titulo if k == 0 else None)


c = lambda: [F(tira(crianca))]  # noqa: E731
y = lambda: [F(jovem_alt())]  # noqa: E731
yy = lambda: [F(jovem_alt()), F(jovem_alt())]  # noqa: E731
v = lambda: [V(video())]  # noqa: E731
nada = lambda: []  # noqa: E731
k = lambda i: (lambda: [F(i)])  # noqa: E731

# a capa abre entre 3 e 8,5 s; a primeira página dupla já está lá embaixo
# infância: 11 fotos, uma por página; a primeira página da esquerda é só o título (página de abertura do álbum)
secao(6.0, 83.0, "antes", [(nada, c), (c, c), (c, c), (c, c), (c, c)], "lá no começo")
secao(83.0, 102.0, "cor", [(k("k11"), v)])  # a cor volta na foto mais solar
usados.add("k11")
secao(102.0, 168.0, "cresceu", [(yy, y), (y, v), (yy, y), (y, v)], "e a gente foi crescendo")
secao(168.0, 186.0, "cresceu", [(yy, v)])
spread(186.0, 201.0, "vazio", [], [F("k10")])
usados.add("k10")
secao(201.0, 247.0, "hoje", [(yy, y), (y, yy), (yy, v)], "hoje")
# começo x hoje: a primeira foto do álbum (o bebê) ao lado da turma de agora
turma_foto = TURMA_FOTO
usados.add(turma_foto)
spread(247.0, 270.0, "final", [F("k01")], [F(turma_foto)])

# ---- câmera: em cada página dupla, abre geral, visita cada item, volta geral antes de virar
focos = []
imersoes = []
for si, s in enumerate(spreads):
    itens = s["L"] + s["R"]
    ini = s["a"] + (TURN if si else 3.2)  # depois da página assentar
    fim = s["b"] - 1.1 if si + 1 < len(spreads) else 258.0
    if s["era"] == "vazio":
        focos.append({"a": ini, "b": fim, "s": si, "i": 0, "zoom": 1.25})
        continue
    if s["era"] == "final":
        focos.append({"a": 249.0, "b": 252.6, "s": si, "i": 0, "zoom": 1.25})
        focos.append({"a": 252.6, "b": 256.4, "s": si, "i": 1, "zoom": 1.25})
        continue
    tot = fim - ini
    pesos = [2.6 if it["k"] == "video" else 1.0 for it in itens]
    t = ini + 1.0
    for ii, (it, p) in enumerate(zip(itens, pesos)):
        d = (tot - 1.6) * p / sum(pesos)
        focos.append({"a": round(t, 2), "b": round(t + d, 2), "s": si, "i": ii, "zoom": 1.0 if it["k"] == "video" else 1.35})
        if it["k"] == "video":
            # entra no vídeo: 1,3 s de mergulho, vídeo em tela cheia, 1,1 s para voltar
            va, vb = t + 1.3, t + d - 1.1
            rate = max(0.35, min(0.75, (it["vdur"] - it["ini"] - 0.3) / (vb - va)))
            imersoes.append({"a": round(va, 2), "b": round(vb, 2), "id": it["id"], "ini": it["ini"], "rate": round(rate, 3)})
        t += d
for f in focos:
    f["a"], f["b"] = round(f["a"], 2), round(f["b"], 2)

# ---- letra: versos inteiros (quebra em pausa > 0,6 s ou > 34 caracteres), sempre no mesmo lugar
pal = json.load(open(f"{TRAB}/musica/chapeu-de-palha.palavras.json", encoding="utf8"))
pal = pal if isinstance(pal, list) else pal.get("words", pal)
pal = [p for p in pal if p["s"] < 254]
versos, cur = [], []
for p in pal:
    # quebra na pausa, no começo de frase (o Whisper põe maiúscula no início de cada verso) ou se ficar comprido
    if cur and (p["s"] - cur[-1]["e"] > 0.6 or (p["w"][:1].isupper() and len(cur) >= 3) or len(" ".join(x["w"] for x in cur + [p])) > 70):
        versos.append(cur)
        cur = []
    cur.append(p)
if cur:
    versos.append(cur)
# palavra solta (ex.: "E") vai junto com o verso seguinte
k = 0
while k < len(versos) - 1:
    if len(versos[k]) == 1 and versos[k + 1][0]["s"] - versos[k][-1]["e"] < 2.2:
        versos[k + 1] = versos[k] + versos[k + 1]
        del versos[k]
    else:
        k += 1
letras = []
for k, vs in enumerate(versos):
    a = vs[0]["s"]
    prox = versos[k + 1][0]["s"] if k + 1 < len(versos) else vs[-1]["e"] + 3
    b = min(prox - 0.05, vs[-1]["e"] + 2.2)
    letras.append({"a": round(a, 2), "b": round(min(prox - 0.05, max(b, vs[-1]["e"] + 0.4)), 2), "t": [x["w"].strip(",.") for x in vs], "ts": [round(x["s"], 2) for x in vs]})
# repetições seguidas iguais (ex.: "No meu quarto" duas vezes) viram um verso só que fica mais tempo
limpo = []
for l in letras:
    if limpo and " ".join(limpo[-1]["t"]).lower() == " ".join(l["t"]).lower() and l["a"] - limpo[-1]["b"] < 1.5:
        limpo[-1]["b"] = l["b"]
        continue
    limpo.append(l)

plano = {"fps": 30, "duracao": 270.0, "W": W, "H": H, "TURN": TURN, "spreads": spreads, "focos": focos, "imersoes": imersoes, "letras": limpo,
         "destaques": [{"a": 224.5, "b": 233.0, "t": "saudade"}], "capa": {"abre": [3.0, 8.5], "fecha": [258.6, 264.6]}}
json.dump(plano, open(f"{OBRA}/plano3.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
nf = sum(1 for s in spreads for it in s["L"] + s["R"] if it["k"] == "foto")
nc = sum(1 for s in spreads for it in s["L"] + s["R"] if it["k"] == "foto" and FOTOS[it["id"]]["grupo"] == "crianca")
print(f"páginas duplas {len(spreads)} | fotos {nf} (crianças {nc}) | vídeos {len(imersoes)} | versos {len(limpo)}")
print("turmas:", {t: sum(1 for s in spreads for it in s["L"] + s["R"] if it["k"] == "foto" and turma(it["id"]) == t) for t in ("231", "232")})
