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
fill(vhs, 8.76, T_VERSO, tipo="vhs")

# ================================================================ ATO 1: infância (20,7 → 103,8)
t = T_VERSO
t1 = nb(t, 3)
add("portal", t, t1, id="c43")  # parede de polaroids de criança: a câmera entra
s1, s2, s3, s4 = cr[:8], cr[8:22], cr[22:35], cr[35:53]
fill(s1, t1, snap(42.0), bloom=0.9, grupo="crianca")
fill(s2, snap(42.0), snap(60.3), bloom=0.55, grupo="crianca")
fill(s3, snap(60.3), snap(77.0), bloom=0.4, grupo="crianca")
fill(s4, snap(77.0), snap(90.3), bloom=0.25, grupo="crianca", flash=True)  # rajada "selvagem"
T_PONTE = snap(90.3)
T_VEJA = snap(103.8)
mosaicos_ate(4, T_PONTE, T_VEJA)
add("ponte", T_PONTE, T_VEJA)  # contador de anos por cima

# ================================================================ ATO 2: abraço (103,8 → 139,6)
T_ABRACA = snap(123.3)
T_NOSSO = snap(139.6)
fim_m = mosaicos_ate(2, T_VEJA, nb(T_VEJA, 10))
fill(pega([ABRACO], 12), fim_m, T_ABRACA, bloom=0.5)
t = T_ABRACA
for v in HUG:  # "Então me abraça forte": vídeos de abraço com o som original
    add("solo", t, nb(t, 5), id=v, abraco=True)
    t = nb(t, 5)
fill(pega([ABRACO], 3), t, T_NOSSO, bloom=0.5)

# ================================================================ ATO 3: "Temos nosso próprio tempo" x3 (139,6 → 190,1): mural 3D
cortes = [T_NOSSO, snap(152.6), snap(165.5), snap(178.0)]
for k in range(3):
    add("mural", cortes[k], cortes[k + 1], ids=pega([BAGUNCA, outros, GRUPAO], 14), voo=k)
T_NEM = snap(187.6)
T_JOVENS = snap(190.1)
mosaicos_ate(3, cortes[3], T_NEM)
add("foto", T_NEM, T_JOVENS, id="c35", bloom=0.8, grupo="jovem")  # "Nem foi tempo perdido": a turma toda

# ================================================================ ATO 4: "Somos tão jovens" (190,1 → 228)
T_CODA = snap(228.0)
fill(pega([GRUPAO], 10), T_JOVENS, snap(204.0), bloom=0.55)
mosaicos_ate(4, snap(204.0), snap(216.8))
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

# ================================================================ FECHO (~260 → 302,2): parede de todas as fotos + textos
sobra = [i for i in jovem if i not in usados]
parede = cr + sobra
add("parede", T_FECHO, snap(282.0), ids=parede, foco="c66")
add("final", snap(282.0), DURACAO, id="a20")

# ---------------------------------------------------------------- letra (corrigida) com tempo por palavra
tok = json.load(open(PALAVRAS, encoding="utf8"))
LINHAS = [
    (20.8, 23.3, "Todos os dias quando acordo"),
    (26.6, 29.7, "Não tenho mais o tempo que passou"),
    (30.6, 33.8, "mas tenho muito tempo"),
    (35.9, 40.3, "Temos todo o tempo do mundo"),
    (42.0, 46.8, "Todos os dias antes de dormir"),
    (47.5, 52.5, "Lembro e esqueço como foi o dia"),
    (54.0, 57.5, "Sempre em frente"),
    (58.0, 60.4, "Não temos tempo a perder"),
    (61.6, 64.9, "Nosso suor sagrado"),
    (66.6, 70.5, "É bem mais belo que esse sangue amargo"),
    (72.0, 74.5, "E tão sério"),
    (77.0, 81.2, "E selvagem"),
    (82.4, 86.2, "Selvagem"),
    (87.5, 90.4, "Selvagem"),
    (103.8, 108.4, "Veja o sol dessa manhã tão cinza"),
    (110.4, 116.5, "A tempestade que chega"),
    (117.0, 122.2, "é da cor dos teus olhos castanhos"),
    (123.3, 126.4, "Então me abraça forte"),
    (129.2, 133.5, "Me diz mais uma vez"),
    (134.0, 138.2, "que já estamos distantes de tudo"),
]


def alinha(a, b_, texto):
    ws = texto.split()
    ts = [x for x in tok if a - 0.4 <= x["s"] <= b_ + 0.2]
    if len(ts) == len(ws):
        return [round(x["s"], 2) for x in ts]
    n = len(ws)
    pesos = [max(2, len(w)) for w in ws]
    tot = sum(pesos)
    out, acc = [], 0
    for p in pesos:
        out.append(round(a + (b_ - a - 0.3) * acc / tot, 2))
        acc += p
    return out


letra = [{"a": a, "b": b_, "p": t_.split(), "t": alinha(a, b_, t_)} for a, b_, t_ in LINHAS]
# "Temos nosso próprio tempo" x3 e o final (tempos por palavra do próprio áudio)
temos = [x for x in tok if x["w"].lower() == "temos" and 139 <= x["s"] <= 190]
prox = [(139.6, 145.6), (146.3, 152.5), (153.2, 159.3)]
for k, (a, b_) in enumerate(prox):
    letra.append({"a": a, "b": b_, "p": ["Temos", "nosso", "próprio", "tempo"], "t": alinha(a, b_, "Temos nosso próprio tempo"), "grande": k})
letra += [
    {"a": 166.0, "b": 170.5, "p": "Não tenho medo do escuro".split(), "t": alinha(166.0, 170.5, "Não tenho medo do escuro")},
    {"a": 171.0, "b": 175.0, "p": "mas deixe as luzes acesas agora".split(), "t": alinha(171.0, 175.0, "mas deixe as luzes acesas agora")},
    {"a": 176.0, "b": 181.5, "p": "O que foi escondido é o que se escondeu".split(), "t": alinha(176.0, 181.5, "O que foi escondido é o que se escondeu")},
    {"a": 182.5, "b": 186.5, "p": "E o que foi prometido ninguém prometeu".split(), "t": alinha(182.5, 186.5, "E o que foi prometido ninguém prometeu")},
    {"a": 187.6, "b": 190.0, "p": ["Nem", "foi", "tempo", "perdido"], "t": alinha(187.6, 190.0, "Nem foi tempo perdido"), "grande": 9},
    {"a": 190.1, "b": 194.9, "p": ["Somos", "tão", "jovens"], "t": alinha(190.1, 194.9, "Somos tão jovens"), "grande": 9},
    {"a": 196.2, "b": 199.8, "p": ["tão", "jovens"], "t": alinha(196.2, 199.8, "tão jovens"), "grande": 9},
]

# ---------------------------------------------------------------- textos do fecho (aprovados pelo Vítor)
fecho = [
    {"a": 263.0, "b": 269.2, "l": ["que não seja imortal, posto que é chama,", "mas que seja infinito enquanto dure."], "fonte": "Vinicius de Moraes"},
    {"a": 270.0, "b": 276.0, "l": ["A gente achava que o tempo era lento.", "Era a gente que estava rápido demais para ver."]},
    {"a": 276.8, "b": 283.2, "l": ["Aos nossos professores:", "vocês não nos ensinaram só matéria.", "Ensinaram a gente a ficar."]},
    {"a": 284.0, "b": 288.0, "l": ["Nem foi tempo perdido."], "grande": True},
    {"a": 289.0, "b": 293.2, "l": ["La Salle Sobradinho · 2026"], "pequeno": True},
    {"a": 294.2, "b": 302.2, "l": ["231 e 232"], "grande": True, "final": True},
]

# ---------------------------------------------------------------- ducking da música (janelas dos vídeos com som)
duck = [[b["t0"], b["t1"]] for b in blocos if b["k"] == "solo"]

plano = {"duracao": DURACAO, "beat": B, "off": OFF, "blocos": blocos, "letra": letra, "fecho": fecho, "duck": duck}
json.dump(plano, open(PLANO, "w", encoding="utf8"), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- cobertura: toda mídia aparece?
vf, vv = set(), set()
for b in blocos:
    for key in ("id",):
        if key in b:
            (vv if b["k"] == "solo" else vf).add(b[key])
    for i in b.get("ids", []):
        (vv if b["k"] == "mosaico" else vf).add(i)
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
