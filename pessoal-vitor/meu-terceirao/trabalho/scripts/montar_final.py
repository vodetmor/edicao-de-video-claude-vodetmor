"""Monta a linha do tempo da FINAL do Meu Terceirão (5 min, Tempo Perdido inteira).

Lê  : estudio/motor/src/obras/terceirao/acervo.json  (gerado por prep_final.py)
      trabalho/musica/tempo-perdido.palavras.json     (tempo por palavra)
Grava: estudio/motor/src/obras/terceirao/plano.json    (lista de blocos + letra + textos)

Regras: todo corte cai numa batida (0,6472 s, fase -0,013 s). Toda foto e todo vídeo do acervo
precisa aparecer ao menos uma vez; o script FALHA se algo ficar de fora.
Rodar: python trabalho/scripts/montar_final.py
"""
import json
import os
import sys

BASE = "C:/dev/maquina-de-editar"
ACERVO = f"{BASE}/estudio/motor/src/obras/terceirao/acervo.json"
PLANO = f"{BASE}/estudio/motor/src/obras/terceirao/plano.json"
PALAVRAS = f"{BASE}/pessoal-vitor/meu-terceirao/trabalho/musica/tempo-perdido.palavras.json"
# --v2: mesma linha do tempo, mas foto e vídeo alternados dentro de cada trecho (pedido da Anna, 14/11)
V2 = "--v2" in sys.argv
PLANO_SAIDA = PLANO.replace("plano.json", "plano-v2.json") if V2 else PLANO

B = 0.6472          # uma batida (s), medida no áudio
OFF = -0.013        # fase
DURACAO = 302.2


def bt(k):
    return round(OFF + k * B, 3)


def snap(t):
    return bt(round((t - OFF) / B))


def nb(t0, n):
    """tempo n batidas depois de t0 (t0 já em batida)"""
    return round(t0 + n * B, 3)


ac = json.load(open(ACERVO, encoding="utf8"))
FOTOS = {f["id"]: f for f in ac["fotos"]}
VIDEOS = {v["id"]: v for v in ac["videos"]}
crianca = [f["id"] for f in ac["fotos"] if f["grupo"] == "crianca"]
jovem = [f["id"] for f in ac["fotos"] if f["grupo"] == "jovem"]

# ---------------------------------------------------------------- ordem da infância (do mais novo ao mais velho, por aparência)
ORDEM_CRIANCA = [
    "n04", "n09", "n19", "n20", "n13", "n06", "n16", "n30", "n31", "a49", "a50", "a47", "a48", "a51",
    "a58", "a57", "a61", "a53", "a54", "a56", "a59", "n02", "n03", "n07", "n18", "n21", "n28", "n32", "a55",
    "n10", "n11", "n12", "n14", "n15", "n17", "n27", "n23", "n05", "n08", "n22", "n24", "n25", "n26", "n29",
    "n33", "n34", "n01", "a60", "c06", "n35", "a62", "a63", "a64",
]
resto = [i for i in sorted(crianca) if i not in ORDEM_CRIANCA]
cr = [i for i in ORDEM_CRIANCA if i in crianca] + resto

# ---------------------------------------------------------------- pools da juventude
GRUPAO = ["c05", "c09", "c10", "c11", "c13", "c14", "c20", "c24", "c25", "c26", "c34", "c35", "c47", "c50", "c64", "c65", "c66", "c67",
          "a06", "a08", "a13", "a20", "a21", "a23", "a25", "a74", "a79", "a80", "a81", "a66", "a69", "a72", "a36", "a37", "a38", "a39", "a40"]
ABRACO = ["c07", "c15", "c17", "c18", "c19", "c21", "c27", "c28", "c37", "c38", "c39", "c46", "c48", "c49", "c51", "c52", "c53", "c55",
          "c56", "c58", "c59", "c60", "c61", "a12", "a19", "a24", "a27", "a28", "a42", "a43", "a44", "a46", "a82", "a76", "a77", "a78", "a85", "a86"]
BAGUNCA = ["c01", "c02", "c22", "c31", "c32", "c33", "c36", "c62", "c63", "a03", "a04", "a05", "a07", "a11", "a14", "a15", "a17", "a18",
           "a30", "a31", "a32", "a45", "a75", "a83", "a84", "n36", "n37", "n38", "n39"]
usados = set()


def pega(pools, n, ori=None):
    """tira n fotos (na ordem dos pools); se ori for 'h'/'v' só dessa orientação."""
    out = []
    for pool in pools:
        for i in pool:
            if len(out) >= n:
                return out
            if i in usados or i not in FOTOS or FOTOS[i]["grupo"] != "jovem":
                continue
            if ori and FOTOS[i]["o"] != ori:
                continue
            usados.add(i)
            out.append(i)
    return out


outros = [i for i in jovem if i not in GRUPAO + ABRACO + BAGUNCA]

blocos = []  # cada bloco: {k, t0, t1, ...}


def add(k, t0, t1, **kw):
    blocos.append({"k": k, "t0": round(t0, 3), "t1": round(t1, 3), **kw})


def reparte(total, n):
    base, rem = divmod(total, n)
    return [base + (1 if j < rem else 0) for j in range(n)]


def fill(ids, t0, t1, tipo="foto", **kw):
    """Fotos uma atrás da outra ocupando EXATAMENTE de t0 a t1 (em batidas inteiras).
    Duas verticais seguidas viram uma dupla (um bloco só)."""
    slots, i = [], 0
    while i < len(ids):
        a = ids[i]
        if FOTOS[a]["o"] == "v" and i + 1 < len(ids) and FOTOS[ids[i + 1]]["o"] == "v":
            slots.append(("dupla", [a, ids[i + 1]]))
            i += 2
        else:
            slots.append((tipo, a))
            i += 1
    if not slots:
        return t0
    total = max(len(slots), round((t1 - t0) / B))
    t = t0
    for j, ((k, v), nbt) in enumerate(zip(slots, reparte(total, len(slots)))):
        fim_ = t1 if j == len(slots) - 1 else nb(t, nbt)
        add(k, t, fim_, **({"ids": v} if k == "dupla" else {"id": v}), **kw)
        t = fim_
    return t


# ================================================================ vídeos: escolhas
vlist = list(VIDEOS.values())
HUG = [v for v in ["vid-WA0196", "vid-WA0203", "vid-WA0211", "nv09"] if v in VIDEOS]
com_audio = [v for v in vlist if v["audio"] and v["id"] not in HUG and v["dur"] >= 3.2 and (v["lufs"] or -99) > -40]
com_audio.sort(key=lambda v: -(v["lufs"] if v["lufs"] is not None else -99))
SOLO_CODA = [v["id"] for v in com_audio[:10]]
resto_v = [v["id"] for v in vlist if v["id"] not in HUG + SOLO_CODA]
resto_v.sort(key=lambda i: (VIDEOS[i]["o"], i))  # horizontais juntas
mosaicos = [resto_v[i:i + 4] for i in range(0, len(resto_v), 4)]
mi = iter(mosaicos)


def mosaicos_ate(n, t0, t1):
    total = max(n, round((t1 - t0) / B))
    t = t0
    for j, nbt in enumerate(reparte(total, n)):
        fim_ = t1 if j == n - 1 else nb(t, nbt)
        add("mosaico", t, fim_, ids=next(mi))
        t = fim_
    return t1


# ================================================================ ATO 0: TV (0–8.76 s é o componente IntroTV) + VHS até o 1º verso
T_VERSO = bt(32)  # ~20,70 s: começa "Todos os dias quando acordo"
add("intro", 0, 8.76)
vhs = pega([outros, BAGUNCA], 9, ori="h")
# pedido do Vítor (13/11): abertura alterna 232 e 231, não começa só com a 232 (a67, a71 = 231)
vhs = [x for par in zip([i for i in vhs if i not in ("a67", "a71")], ["a67", "a71"]) for x in par] + [i for i in vhs if i not in ("a67", "a71")][2:] if {"a67", "a71"} <= set(vhs) else vhs
fill(vhs, 8.76, T_VERSO, tipo="vhs")

# ================================================================ ATO 1: infância (20,7 → 103,8)
t = T_VERSO
t1 = nb(t, 3)
# abre numa foto deitada de criança com o rosto bem visível (não uma em que o chapéu toma o quadro)
RO = json.load(open(ACERVO.replace("acervo.json", "rostos.json"), encoding="utf8"))
abre = next(i for i in cr if FOTOS[i]["o"] == "h" and RO[i]["n"] >= 1 and 0.3 < RO[i]["y"] < 0.6 and RO[i]["y"] - RO[i]["topo"] > 0.07)
cr = [abre] + [i for i in cr if i != abre]
add("foto", t, t1, id=cr[0], bloom=0.9, grupo="crianca")  # antes era o zoom na parede de polaroids (c43): o Vítor achou o foco estranho (14/11)
s1, s2, s3, s4 = cr[1:8], cr[8:22], cr[22:35], cr[35:53]
fill(s1, t1, snap(42.0), bloom=0.9, grupo="crianca")
fill(s2, snap(42.0), snap(60.3), bloom=0.55, grupo="crianca")
fill(s3, snap(60.3), snap(77.0), bloom=0.4, grupo="crianca")
fill(s4, snap(77.0), snap(90.3), bloom=0.25, grupo="crianca", flash=True)  # rajada "selvagem"
T_PONTE = snap(90.3)
T_VEJA = snap(103.8)
mosaicos_ate(4, T_PONTE, T_VEJA)
add("ponte", T_PONTE, T_VEJA)  # passagem do tempo: escurece e clareia, sem anos (fotos sem data real)

# ================================================================ ATO 2: abraço (103,8 → 139,6)
T_ABRACA = snap(123.3)
T_NOSSO = snap(139.6)
fim_m = mosaicos_ate(3, T_VEJA, nb(T_VEJA, 10))  # 3 mosaicos (era 2) para caber os vídeos novos da 232
fill(pega([ABRACO], 12), fim_m, T_ABRACA, bloom=0.5)
t = T_ABRACA
for v in HUG:  # "Então me abraça forte": vídeos de abraço com o som original
    add("solo", t, nb(t, 5), id=v, abraco=True)
    t = nb(t, 5)
fill(pega([ABRACO], 3), t, T_NOSSO, bloom=0.5)

# ================================================================ ATO 3: "Temos nosso próprio tempo" x3 (139,6 → 190,1): mural 3D
T_MURAL_FIM = snap(176.2)
add("mural", T_NOSSO, T_MURAL_FIM, ids=pega([BAGUNCA, outros, GRUPAO], 45), voo=0)
T_NEM = snap(185.8)  # "Nem foi tempo perdido" é cantado em 185,8 (medido), não em 187,6
T_JOVENS = snap(190.1)
mosaicos_ate(3, T_MURAL_FIM, T_NEM)
add("foto", T_NEM, T_JOVENS, id="c35", bloom=0.8, grupo="jovem")  # "Nem foi tempo perdido": a turma toda

# ================================================================ ATO 4: "Somos tão jovens" (190,1 → 228)
T_CODA = snap(228.0)
fill(pega([GRUPAO], 10), T_JOVENS, snap(204.0), bloom=0.55)
mosaicos_ate(5, snap(204.0), snap(216.8))  # 5 mosaicos (era 4) para caber os vídeos novos da 232
for g in range(3):
    ids = pega([GRUPAO, outros, ABRACO, BAGUNCA], 12)
    a_ = snap(216.8 + g * (T_CODA - 216.8) / 3)
    b_ = T_CODA if g == 2 else snap(216.8 + (g + 1) * (T_CODA - 216.8) / 3)
    add("grade", a_, b_, ids=ids)

# ================================================================ CODA suave (228 → ~260): sons da turma (vídeos com som)
t = T_CODA
for v in SOLO_CODA:
    add("solo", t, nb(t, 5), id=v)  # ~3,2 s cada
    t = nb(t, 5)
T_FECHO = t

# ================================================================ FECHO (~260 → 302,2): TODAS as mídias; a câmera recua, elas formam um "3" e depois "231 e 232"
from PIL import Image, ImageDraw, ImageFont


def forma(texto, n):
    """n posições (em células 4:3) que desenham o texto: amostra a máscara do texto numa grade e fica com as n células mais cheias."""
    fonte = ImageFont.truetype("C:/Windows/Fonts/ariblk.ttf", 400)
    x0, y0, x1, y1 = fonte.getbbox(texto)
    im = Image.new("L", (x1 - x0 + 40, y1 - y0 + 40), 0)
    ImageDraw.Draw(im).text((20 - x0, 20 - y0), texto, fill=255, font=fonte)
    W, H = im.size
    px = im.load()
    melhor = None
    for g in range(8, 220):
        cw_ = W / g
        ch_ = cw_ * 0.75
        linhas = int(H / ch_)
        cel = []
        for r in range(linhas):
            for c in range(g):
                xa, xb, ya, yb = int(c * cw_), int((c + 1) * cw_), int(r * ch_), int((r + 1) * ch_)
                tot = cheio = 0
                for yy in range(ya, yb, 2):
                    for xx in range(xa, xb, 2):
                        tot += 1
                        cheio += px[xx, yy] > 127
                cob = cheio / max(1, tot)
                if cob >= 0.5:
                    cel.append((cob, c, r))
        if len(cel) >= n:
            melhor = sorted(cel, reverse=True)[:n]
            break
    xs = [c for _, c, _ in melhor]
    ys = [r for _, _, r in melhor]
    mx, my = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    return [[round(c - mx, 2), round(r - my, 2)] for _, c, r in melhor]


T_TRES = T_FECHO
FOCO = "c66"
jov = [i for i in jovem if i != FOCO]
ordem_f = [FOCO]
for k in range(max(len(jov), len(cr))):  # intercala presente e infância
    if k < len(jov):
        ordem_f.append(jov[k])
    if k < len(cr):
        ordem_f.append(cr[k])
vids_todos = [v["id"] for v in vlist]
tiles, fi, vi = [], 0, 0
while fi < len(ordem_f) or vi < len(vids_todos):  # vídeos espalhados (1 a cada 4), nunca nas 25 primeiras (ficam grandes demais no começo)
    if vi < len(vids_todos) and (fi >= len(ordem_f) or (len(tiles) >= 25 and len(tiles) % 4 == 3)):
        tiles.append({"id": vids_todos[vi], "v": 1})
        vi += 1
    else:
        tiles.append({"id": ordem_f[fi]})
        fi += 1
N = len(tiles)
# formação A: parede retangular, preenchida do centro para fora
cols = int((N * 1.9) ** 0.5) + 1
rows_ = -(-N // cols)
cel = sorted(((c - cols // 2, r - rows_ // 2) for r in range(rows_) for c in range(cols)), key=lambda q: (lambda d: d if d <= 2.6 else d + ((q[0] * 73856093) ^ (q[1] * 19349663)) % 1000 / 400)(abs(q[0]) + abs(q[1]) * 1.3))[:N]  # embaralha dentro do anel para os vídeos não ficarem juntos
A = [[float(x), float(y)] for x, y in cel]
# formação B: o "3"; o ladrilho que está mais ao centro na parede vai para o centro do 3
B0 = sorted(forma("3", N), key=lambda q: q[0] ** 2 + (q[1] * 0.75) ** 2)
ordA = sorted(range(N), key=lambda i: A[i][0] ** 2 + (A[i][1] * 0.75) ** 2)
Bf = [None] * N
for rank, i in enumerate(ordA):
    Bf[i] = B0[rank]
# formação C: "231 e 232"; quem está à esquerda no 3 vai para a esquerda do texto
C0 = sorted(forma("231 e 232", N), key=lambda q: (q[0], q[1]))
ordB = sorted(range(N), key=lambda i: (Bf[i][0], Bf[i][1]))
Cf = [None] * N
for rank, i in enumerate(ordB):
    Cf[i] = C0[rank]
usados.update(ordem_f)
add("tres", T_TRES, DURACAO, tiles=tiles, A=A, B=Bf, C=Cf)

# ---------------------------------------------------------------- letra (corrigida) com tempo por palavra
# (fim, texto, início de cada palavra): medido em musica/tempo-perdido.palavras.json e conferido com clipes curtos (14/11).
# As linhas digitadas à mão estavam até 5 s atrasadas em relação à voz.
LINHAS = [
    (23.4, "Todos os dias quando acordo", [20.8, 20.88, 21.38, 21.88, 22.46]),
    (30.6, "Não tenho mais o tempo que passou", [26.6, 27.04, 27.62, 28.46, 29.0, 29.48, 29.94]),
    (34.2, "mas tenho muito tempo", [30.76, 31.02, 31.68, 32.46]),
    (40.6, "Temos todo o tempo do mundo", [35.92, 36.74, 37.68, 38.04, 38.64, 39.1]),
    (46.6, "Todos os dias antes de dormir", [41.98, 42.92, 43.26, 43.82, 44.98, 45.52]),
    (51.4, "Lembro e esqueço como foi o dia", [46.98, 47.64, 48.12, 48.42, 48.94, 49.5, 49.76]),
    (56.0, "Sempre em frente", [52.4, 53.06, 53.74]),
    (60.8, "Não temos tempo a perder", [56.75, 57.22, 58.26, 59.06, 59.44]),
    (65.2, "Nosso suor sagrado", [61.56, 62.26, 62.98]),
    (71.4, "É bem mais belo que esse sangue amargo", [66.6, 67.16, 67.52, 67.9, 68.34, 68.7, 69.06, 69.98]),
    (74.9, "E tão sério", [72.04, 72.48, 72.84]),
    (81.4, "E selvagem", [76.97, 77.43]),
    (86.3, "Selvagem", [82.37]),
    (90.5, "Selvagem", [87.49]),
    (108.9, "Veja o sol dessa manhã tão cinza", [103.77, 104.41, 104.79, 105.27, 105.85, 106.61, 107.69]),
    (113.1, "A tempestade que chega", [110.37, 110.83, 112.05, 112.53]),
    (121.5, "é da cor dos teus olhos castanhos", [113.33, 113.65, 113.95, 114.51, 115.01, 115.41, 116.0]),
    (126.9, "Então me abraça forte", [123.35, 123.89, 124.17, 125.21]),
    (130.95, "Me diz mais uma vez", [129.21, 129.37, 129.89, 130.21, 130.59]),
    (138.6, "que já estamos distantes de tudo", [131.11, 131.37, 131.79, 133.01, 135.65, 137.03]),
    (144.3, "Temos nosso próprio tempo", [139.57, 140.45, 140.99, 142.07], 0),
    (149.5, "Temos nosso próprio tempo", [144.91, 145.57, 146.07, 147.29], 1),
    (154.3, "Temos nosso próprio tempo", [150.11, 150.79, 151.31, 152.5], 2),
    (160.6, "Não tenho medo do escuro", [154.84, 155.22, 156.42, 157.44, 159.32]),
    (171.0, "mas deixe as luzes acesas agora", [161.22, 161.82, 163.28, 164.46, 165.88, 168.34]),
    (180.4, "O que foi escondido é o que se escondeu", [175.36, 175.72, 176.02, 176.66, 177.98, 178.26, 178.5, 178.94, 179.54]),
    (185.5, "E o que foi prometido ninguém prometeu", [180.66, 180.9, 181.02, 181.2, 181.72, 183.0, 184.28]),
    (189.6, "Nem foi tempo perdido", [185.8, 186.1, 186.48, 187.2], 9),
    (195.0, "Somos tão jovens", [190.06, 191.08, 191.58], 9),
    (199.8, "tão jovens", [196.2, 196.76], 9),
    (205.0, "tão jovens", [201.24, 201.84], 9),
]
letra = []
for fim_, texto, ts, *g in LINHAS:
    assert len(texto.split()) == len(ts), texto
    d = {"a": ts[0], "b": fim_, "p": texto.split(), "t": ts}
    if g:
        d["grande"] = g[0]
    letra.append(d)

# ---------------------------------------------------------------- textos do fecho (aprovados pelo Vítor)
fecho = [
    {"a": 263.0, "b": 269.2, "l": ["que não seja imortal, posto que é chama,", "mas que seja infinito enquanto dure."], "fonte": "Vinicius de Moraes"},
    {"a": 270.0, "b": 276.0, "l": ["A gente achava que o tempo era lento.", "Era a gente que estava rápido demais para ver."]},
    {"a": 276.4, "b": 281.5, "l": ["Aos nossos professores:", "vocês não nos ensinaram só matéria.", "Ensinaram a gente a ficar."]},
    {"a": 287.4, "b": 292.6, "l": ["Nem foi tempo perdido."], "baixo": True},
    {"a": 297.6, "b": 301.4, "l": ["La Salle Sobradinho · 2026"], "pequeno": True, "baixo": True, "final": True},
]

def intercala(bl):
    """V2: dentro de cada trecho entre âncoras (portal, ponte, mural, parede, solos de abraço, foto da turma),
    alterna foto e vídeo. Só reordena os blocos: o trecho começa e termina no mesmo instante,
    cada bloco mantém a sua duração (são múltiplos de batida, então os cortes continuam na batida)."""
    ANCORAS = {"intro", "vhs", "portal", "ponte", "mural", "parede", "final", "tres"}

    def ancora(b):
        return b["k"] in ANCORAS or (b["k"] == "solo" and b.get("abraco")) or b.get("id") == "c35"

    out, trecho = [], []

    def fecha():
        if not trecho:
            return
        fotos = [b for b in trecho if b["k"] in ("foto", "dupla", "grade")]
        vids = [b for b in trecho if b["k"] in ("mosaico", "solo")]
        if not fotos or not vids:
            out.extend(trecho)
            trecho.clear()
            return
        ordem, i, j = [], 0, 0
        while i < len(fotos) or j < len(vids):  # espalha os vídeos entre as fotos (proporção de cada lado)
            if j >= len(vids) or (i < len(fotos) and i / len(fotos) <= j / len(vids)):
                ordem.append(fotos[i]); i += 1
            else:
                ordem.append(vids[j]); j += 1
        t, fim = trecho[0]["t0"], trecho[-1]["t1"]
        for b in ordem:
            d = round(b["t1"] - b["t0"], 3)
            out.append({**b, "t0": round(t, 3), "t1": round(t + d, 3)})
            t = t + d
        assert abs(t - fim) < 0.01, f"trecho não fecha: {t} != {fim}"
        trecho.clear()

    for b in bl:
        if ancora(b):
            fecha()
            out.append(b)
        else:
            trecho.append(b)
    fecha()
    return out


if V2:
    blocos = intercala(blocos)

# ---------------------------------------------------------------- ducking da música (janelas dos vídeos com som)
duck =[[b["t0"], b["t1"], 0.25 if b["k"] == "solo" else 0.5] for b in blocos if b["k"] in ("solo", "mosaico")]  # mosaico: música baixa de leve (−6 dB)

plano = {"duracao": DURACAO, "beat": B, "off": OFF, "blocos": blocos, "letra": letra, "fecho": fecho, "duck": duck}
json.dump(plano, open(PLANO_SAIDA, "w", encoding="utf8"), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- cobertura: toda mídia aparece?
vf, vv = set(), set()
for b in blocos:
    for key in ("id",):
        if key in b:
            (vv if b["k"] == "solo" else vf).add(b[key])
    for i in b.get("ids", []):
        (vv if b["k"] == "mosaico" else vf).add(i)
    for tl in b.get("tiles", []):
        (vv if tl.get("v") else vf).add(tl["id"])
falta_f = [i for i in FOTOS if i not in vf]
falta_v = [i for i in VIDEOS if i not in vv]
print("blocos", len(blocos), "| fotos", len(vf), "/", len(FOTOS), "| vídeos", len(vv), "/", len(VIDEOS))
if falta_f:
    print("FOTOS FALTANDO:", falta_f)
if falta_v:
    print("VÍDEOS FALTANDO:", falta_v)
if falta_f or falta_v:
    sys.exit("cobertura incompleta")
print("cobertura 100%")
