"""Plano da "Aula da Saudade" V3: álbum de verdade folheado em 3D sobre a mesa -> estudio/motor/src/obras/saudade/plano3.json

Unidades do álbum: página W=1.6 x H=2.0; lombada em x=0; página direita x 0..W, esquerda x -W..0; z de -H/2 (topo) a +H/2.
V5: todas as mídias da 232 (páginas densas em cresceu/hoje). Atos (s): capa 0-9 | antes (página preta) 9-83 | instrumental: a cor volta 83-102 | crescendo (kraft) 102-168
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

# V5 (24/11): TODAS as mídias da 232 (87 fotos jovens + 13 de infância + 29 vídeos), nada da 231 nem sem turma.
# infância = as 13 fotos que ele mandou (k01..k13), cada uma UMA vez só (o bebê k01 só no fecho, nada repetido)
import numpy as np
from PIL import Image

KIDS = json.load(open(f"{TRAB}/triagem/crianca-232.json", encoding="utf8"))
FOTOS = {f["id"]: f for f in AC["fotos"] + KIDS}
PUB = f"{BASE}/estudio/motor/public/final/p"
ASP = 1920 / 1080
FIM_CAPA = 3.2


def turma(i):
    q = MAN.get(i, {}).get("quem_aparece", "")
    return "232" if i.startswith("k") else "231" if "231" in q else "232" if "232" in q else None


TURMA_FOTO = "a40"  # a 232 de terno, na sala: foto do fecho
ANTES = ["k02", "k03", "k04", "k05", "k06", "k07", "k12", "k08", "k13", "k09"]  # do mais novo ao mais velho (12 e 13 por palpite de idade)
EXCLUIR = {"d36"}  # fotos que o Vítor mandou tirar (d36: gente que não está mais na turma)
jovem = [f["id"] for f in AC["fotos"] if f["grupo"] == "jovem" and turma(f["id"]) == "232" and f["id"] != TURMA_FOTO and f["id"] not in EXCLUIR]
# vídeos: TODOS os da 232 (horizontais entram tela cheia; verticais em trios lado a lado)
V232 = [v for v in AC["videos"] if turma(v["id"]) == "232"]
VCOR = "b07"  # o mais longo, na volta da cor
TREC = json.load(open(f"{TRAB}/triagem/videos-trecho.json"))  # melhor trecho de cada vídeo (nítido, com gente), de melhor_trecho.py
for v in V232:
    v["ini"] = TREC.get(v["id"], v.get("ini", 0))


def dh(i):
    a = np.asarray(Image.open(f"{PUB}/{i}.jpg").convert("L").resize((17, 16)), dtype=float)
    return (a[:, 1:] > a[:, :-1]).flatten()


HH = {i: dh(i) for i in jovem}
# cenas quase iguais (outro clique da mesma pose) nunca ficam na mesma página dupla nem em duplas vizinhas
pai = {i: i for i in jovem}


def raiz(i):
    while pai[i] != i:
        i = pai[i]
    return i


for ia in jovem:
    for ib in jovem:
        if ia < ib and int((HH[ia] != HH[ib]).sum()) <= 42:
            pai[raiz(ib)] = raiz(ia)
grupos = {}
for i in jovem:
    grupos.setdefault(raiz(i), []).append(i)
clusters = sorted(grupos.values(), key=lambda g: -len(g))

# 6 páginas duplas de "cresceu" + 4 de "hoje"
NS_C, NS_H = 6, 4
cota = [len(jovem) // 10 + (1 if i < len(jovem) % 10 else 0) for i in range(NS_C + NS_H)]
vaos = [[] for _ in cota]
carga = [0] * len(cota)
for g in clusters:
    rng.shuffle(g)
    ocupados = []
    for i in g:
        melhor = None
        for s in range(len(cota)):
            if carga[s] >= cota[s]:
                continue
            dist = min([abs(s - o) for o in ocupados] or [99])
            chave = (-min(dist, 3), carga[s], rng.random())
            if melhor is None or chave < melhor[0]:
                melhor = (chave, s)
        s = melhor[1]
        vaos[s].append(i)
        carga[s] += 1
        ocupados.append(s)
for s in vaos:
    s.sort(key=lambda i: -RO[i]["n"])  # (só para a ordem ficar estável)

# vídeos: horizontais sozinhos, verticais em trios (e 2 duplas) -> 18 mergulhos, distribuídos pelas 10 páginas duplas
hor = [v for v in V232 if v["w"] > v["h"] and v["id"] != VCOR]
ver = [v for v in V232 if v["w"] <= v["h"]]
rng.shuffle(hor)
rng.shuffle(ver)
blocos = [[v] for v in hor] + [ver[0:3], ver[3:6], ver[6:9], ver[9:12], ver[12:14], ver[14:16]]
rng.shuffle(blocos)
CF, HI = 181.0, 190.0  # fim do 'cresceu' e começo do 'hoje' (o vazio fica entre os dois)
DIVE = 1.0  # a câmera chega na foto do vídeo ANTES do fade (sem abrir o vídeo no meio do zoom)
DESTAQUE = "dv02"  # o vídeo da cadeira com o professor olhando: fica bem mais tempo


def durv(bl):  # tempo do vídeo na tela
    return 7.0 if bl[0]["id"] == DESTAQUE else 3.5 if len(bl) == 1 else 4.5 if len(bl) == 3 else 4.0


def extra(bl):  # segundos a mais na tela com a música em pausa (o vídeo toca com o próprio áudio)
    return 3.0 if len(bl) != 3 else 3.5


def durmerg(bl):  # duração do bloco inteiro (mergulho da câmera + vídeo)
    return DIVE + durv(bl)


# janelas (s) de cada página dupla densa: sobra para vídeo = janela - base; blocos grandes primeiro, sempre na página com mais folga
JAN = [(CF - 85.0) / NS_C] * NS_C + [(247.0 - HI) / NS_H] * NS_H
folga = [j - (2.9 + 1.1 * 4) for j in JAN]
mergulhos = [[] for _ in JAN]
for bl in sorted(blocos, key=lambda b: -durmerg(b)):
    k1 = max(range(len(JAN)), key=lambda i: folga[i])
    mergulhos[k1].append(bl)
    folga[k1] -= durmerg(bl)
for ml in mergulhos:
    rng.shuffle(ml)


# ---------------------------------------------------------------- páginas simples (infância, cor, vazio, fecho)
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


# ---------------------------------------------------------------- páginas densas (justified: linhas de fotos que preenchem a página)
def empacota(itens, lado, era, titulo):
    """itens (fotos e pôsteres de vídeo) -> linhas justificadas na página; devolve (itens posicionados, linhas)"""
    n = len(itens)
    if n == 0:
        return [], []
    pol = era == "hoje"
    px, py, bpx, bbx = (0.068, 0.144, 0.034, 0.110) if pol else (0.044, 0.044, 0.022, 0.022)  # espelha desenhaItem (borda e rodapé)
    gap = 0.045
    x0 = 0.0 if lado == "R" else -W
    xmin = x0 + (0.17 if lado == "R" else 0.09)
    xmax = x0 + W - (0.09 if lado == "R" else 0.17)
    uw = xmax - xmin
    top = 0.34 if (titulo and lado == "L") else 0.0
    zmin, zmax = -H / 2 + 0.09 + top, H / 2 - 0.09
    uh = zmax - zmin
    nl = 1 if n <= 2 else 2 if n <= 4 else 3 if n <= 6 else 4
    if n == 2:
        nl = 2
    base, resto = divmod(n, nl)
    cont = [base + (1 if r < resto else 0) for r in range(nl)]
    linhas, k = [], 0
    for c in cont:
        linhas.append(itens[k:k + c])
        k += c
    asp = [[dim(it)[0] / dim(it)[1] for it in ln] for ln in linhas]
    hr = [(uw - len(ln) * px - (len(ln) - 1) * gap) / sum(a) for ln, a in zip(linhas, asp)]
    tot = sum(hr)
    f = min(1.0, (uh - nl * py - (nl - 1) * gap) / tot)
    hr = [h * f for h in hr]
    # limite: foto em linha única não passa de 55% da altura útil
    bloco = sum(h + py for h in hr) + (nl - 1) * gap
    z = zmin + (uh - bloco) / 2
    out, rows = [], []
    for ln, a, h in zip(linhas, asp, hr):
        larg = sum(ai * h + px for ai in a) + (len(ln) - 1) * gap
        x = (xmin + xmax) / 2 - larg / 2
        zc_caixa = z + (h + py) / 2
        linha = []
        for it, ai in zip(ln, a):
            w = ai * h
            cx = x + (w + px) / 2
            cz = zc_caixa - (bbx - bpx) / 2  # o centro da foto sobe meia diferença (rodapé do polaroid)
            o = {**it, "x": round(cx + (rng.random() - 0.5) * 0.012, 3), "z": round(cz + (rng.random() - 0.5) * 0.012, 3), "w": round(w, 3), "h": round(h, 3),
                 "rot": round((rng.random() - 0.5) * 2 * (3.0 if pol else 1.8), 2)}
            out.append(o)
            linha.append(o)
            x += w + px + gap
        rows.append((linha, bpx, bbx))
        z += h + py + gap
    return out, rows


def caixa(lin, bpx, bbx):
    xs0 = min(o["x"] - o["w"] / 2 - bpx for o in lin)
    xs1 = max(o["x"] + o["w"] / 2 + bpx for o in lin)
    zs0 = min(o["z"] - o["h"] / 2 - bpx for o in lin)
    zs1 = max(o["z"] + o["h"] / 2 + bbx for o in lin)
    return {"x": round((xs0 + xs1) / 2, 3), "z": round((zs0 + zs1) / 2, 3), "w": round(xs1 - xs0, 3), "h": round(zs1 - zs0, 3)}


def grupos_de(rows):
    """metades da página para a câmera visitar (1 ou 2 grupos)"""
    if not rows:
        return []
    if len(rows) == 1:
        return [caixa(*rows[0])]
    m = (len(rows) + 1) // 2
    ga = [o for r in rows[:m] for o in r[0]]
    gb = [o for r in rows[m:] for o in r[0]]
    return [caixa(ga, rows[0][1], rows[0][2]), caixa(gb, rows[0][1], rows[0][2])]


spreads = []
PLANOS = {}  # índice do spread -> o que a câmera faz nele


def F(i):
    return {"k": "foto", "id": i}


def V(v):
    return {"k": "video", "id": v["id"], "ini": v.get("ini", 0), "vdur": v["dur"]}


def spread(a, b, era, L, R, tituloL=None):
    s = {"a": round(a, 2), "b": round(b, 2), "era": era, "L": pagina(L, "L", era, tituloL), "R": pagina(R, "R", era), "titulo": tituloL}
    spreads.append(s)
    return s


def spread_denso(a, b, era, fotos, blocos_v, tituloL=None):
    itens = [F(i) for i in fotos]
    for bl in blocos_v:
        for v in bl:
            itens.insert(rng.randrange(len(itens) + 1), V(v))
    m = (len(itens) + 1) // 2
    ls, rs = itens[:m], itens[m:]
    L, rowsL = empacota(ls, "L", era, tituloL)
    R, rowsR = empacota(rs, "R", era, None)
    s = {"a": round(a, 2), "b": round(b, 2), "era": era, "L": L, "R": R, "titulo": tituloL}
    spreads.append(s)
    PLANOS[len(spreads) - 1] = {"grupos": grupos_de(rowsL) + grupos_de(rowsR), "merg": blocos_v}
    return s


c = lambda: [F(tira(crianca))]  # noqa: E731
usados = set()
crianca = list(ANTES)


def tira(lista):
    for i in lista:
        if i not in usados:
            usados.add(i)
            return i
    raise SystemExit("faltou foto")


def secao(a, b, era, montagens, titulo=None):
    n = len(montagens)
    for k, (L, R) in enumerate(montagens):
        sa = a + (b - a) * k / n
        sb = a + (b - a) * (k + 1) / n
        spread(sa, sb, era, L(), R(), titulo if k == 0 else None)


nada = lambda: []  # noqa: E731
cc = lambda: [F(tira(crianca)), F(tira(crianca))]  # noqa: E731

# a capa abre entre 3 e 8,5 s; a primeira página dupla já está lá embaixo
# infância: 10 fotos; a primeira página da esquerda é só o título (página de abertura do álbum); o bebê k01 só aparece no fecho
secao(6.0, 66.0, "antes", [(nada, c), (c, c), (c, c), (c, c), (c, cc)], "lá no começo")
spread(66.0, 85.0, "cor", [F("k11")], [V(next(v for v in V232 if v["id"] == VCOR))])
usados.add("k11")
spread(CF, HI, "vazio", [], [F("k10")])  # (será reordenado abaixo)
VAZIO = spreads.pop()
# cresceu 102-186 (6 páginas duplas densas) e hoje 201-247 (4)
NEED = []
for s in range(NS_C + NS_H):
    NEED.append(2.9 + 1.1 * 4 + sum(durmerg(b) for b in mergulhos[s]))
tc = sum(NEED[:NS_C])
th = sum(NEED[NS_C:])
a0 = 85.0
for s in range(NS_C):
    d = NEED[s] / tc * (CF - 85.0)
    spread_denso(a0, a0 + d, "cresceu", vaos[s], mergulhos[s], "e a gente foi crescendo" if s == 0 else None)
    a0 += d
spreads.append(VAZIO)
a0 = HI
for s in range(NS_C, NS_C + NS_H):
    d = NEED[s] / th * (247.0 - HI)
    spread_denso(a0, a0 + d, "hoje", vaos[s], mergulhos[s], "hoje" if s == NS_C else None)
    a0 += d
print("escala cresceu", round((CF - 85) / tc, 2), "| hoje", round((247 - HI) / th, 2), "(1.0 = tempo ideal)")
# começo x hoje: a primeira foto do álbum (o bebê) ao lado da turma de agora
spread(247.0, 270.0, "final", [F("k01")], [F(TURMA_FOTO)])
usados.add("k01")
usados.add(TURMA_FOTO)

# ---- câmera
focos = []
imersoes = []


def rate_de(v, d):
    return round(max(0.5, min(1.0, (v["dur"] - v.get("ini", 0) - 0.2) / d)), 3)


HOLDS = []  # (m, E): em m (tempo da música) a música pausa E segundos enquanto o vídeo continua


def mergulho(a, b, bl):
    E = extra(bl)
    HOLDS.append((round(b, 2), E))
    imersoes.append({"a": round(a, 2), "b": round(b, 2), "E": E, "vs": [{"id": v["id"], "o": "h" if v["w"] > v["h"] else "v", "ini": v.get("ini", 0), "rate": rate_de(v, b - a + E)} for v in bl]})


for si, s in enumerate(spreads):
    itens = s["L"] + s["R"]
    ini = s["a"] + (TURN if si else FIM_CAPA)  # depois da página assentar
    fim = s["b"] - 1.1 if si + 1 < len(spreads) else 258.0
    if s["era"] == "vazio":
        focos.append({"a": ini, "b": fim, "s": si, "i": 0, "zoom": 1.25})
        continue
    if s["era"] == "final":
        focos.append({"a": 249.0, "b": 252.6, "s": si, "i": 0, "zoom": 1.25})
        focos.append({"a": 252.6, "b": 256.4, "s": si, "i": 1, "zoom": 1.25})
        continue
    if si in PLANOS:  # página densa: visita as metades das páginas e mergulha nos vídeos
        P = PLANOS[si]
        fim = s["b"] - 0.9
        gs = P["grupos"]
        ms = P["merg"]
        beats = []  # ("g", grupo) ou ("m", bloco)
        for k, g in enumerate(gs):
            beats.append(("g", g))
            if k % 2 == 1 and ms:
                beats.append(("m", ms.pop(0)))
        beats += [("m", b) for b in ms]
        dm = sum(durmerg(b[1]) for b in beats if b[0] == "m")
        ng = sum(1 for b in beats if b[0] == "g")
        disp = fim - ini
        esc = min(1.0, (disp - ng * 0.9) / dm) if dm else 1.0
        dg = (disp - dm * esc) / ng
        t = ini
        for tipo, x in beats:
            if tipo == "g":
                focos.append({"a": round(t, 2), "b": round(t + dg, 2), "s": si, "g": x, "zoom": 1.0})
                t += dg
            else:
                d = durmerg(x) * esc
                v0 = next(i for i, it in enumerate(itens) if it["k"] == "video" and it["id"] == x[0]["id"])
                focos.append({"a": round(t, 2), "b": round(t + d, 2), "s": si, "i": v0, "zoom": 1.0})
                mergulho(t + DIVE, t + d - 0.05, x)
                t += d
        continue
    tot = fim - ini
    pesos = [2.6 if it["k"] == "video" else 1.0 for it in itens]
    t = ini + 1.0
    for ii, (it, p) in enumerate(zip(itens, pesos)):
        d = (tot - 1.6) * p / sum(pesos)
        focos.append({"a": round(t, 2), "b": round(t + d, 2), "s": si, "i": ii, "zoom": 1.0 if it["k"] == "video" else 1.35})
        if it["k"] == "video":
            # entra no vídeo: 1,3 s de mergulho, vídeo em tela cheia, 1,1 s para voltar
            vv = VIDS[it["id"]]
            mergulho(t + 1.3, t + d - 1.1, [vv])
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

HOLDS.sort()


def S(m):  # tempo da música -> tempo do vídeo (cada pausa empurra o resto)
    return round(m + sum(e for b, e in HOLDS if b <= m), 2)


OUTRO = 15.0  # depois da música: o álbum fechado, violão de despedida
for f in focos + imersoes + spreads:
    f["a"], f["b"] = S(f["a"]), S(f["b"])
acum, holds_t = 0.0, []
for b, e in HOLDS:
    holds_t.append({"t": round(b + acum, 2), "d": e})
    acum += e
DUR = round(S(270.0) + OUTRO, 2)
plano = {"fps": 30, "duracao": DUR, "musicaFim": S(270.0), "holds": holds_t, "W": W, "H": H, "TURN": TURN, "spreads": spreads, "focos": focos, "imersoes": imersoes, "letras": limpo,
         "destaques": [{"a": S(224.5), "b": S(233.0), "t": "saudade"}], "capa": {"abre": [3.0, 8.5], "fecha": [S(258.6), S(264.6)]}}
json.dump(plano, open(f"{OBRA}/plano3.json", "w", encoding="utf8"), ensure_ascii=False, indent=0)
nf = sum(1 for s in spreads for it in s["L"] + s["R"] if it["k"] == "foto")
nc = sum(1 for s in spreads for it in s["L"] + s["R"] if it["k"] == "foto" and FOTOS[it["id"]]["grupo"] == "crianca")
print(f"páginas duplas {len(spreads)} | fotos {nf} (crianças {nc}) | vídeos {len(imersoes)} | versos {len(limpo)}")
print("turmas:", {t: sum(1 for s in spreads for it in s["L"] + s["R"] if it["k"] == "foto" and turma(it["id"]) == t) for t in ("231", "232")})
