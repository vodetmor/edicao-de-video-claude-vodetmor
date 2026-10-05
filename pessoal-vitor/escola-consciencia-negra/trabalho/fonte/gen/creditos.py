"""Gera src/p7/creditos.json (tela final) a partir do que o código REALMENTE usa:
fotos citadas em src/**/*.tsx, músicas e efeitos reais citados em audio/*.py, cruzados com os CREDITOS.json do acervo.
Rodar de novo sempre que trocar foto ou trilha:  python3 gen/creditos.py"""
import json, os, re, glob
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
AC = "/mnt/project-files/escola-consciencia-negra/trabalho/acervo"
CAND = "/mnt/project-files/escola-consciencia-negra/edicao/assets/fotos-candidatas/catalogo.json"

# public/fotos/<nome>.jpg -> arquivo de origem no acervo (parte 1 e provisórias ainda não trocadas)
ORIGEM = {
    "chuva-cidade": "fotos/chuva-cidade-b.jpg", "encosta": "fotos/encosta-b.jpg", "rio-margem": "fotos/rio-margem.jpg",
    "rua-alagada": "fotos/rua-alagada.jpg", "rua-alagada-b": "fotos/rua-alagada-c.jpg", "mesmas-casas": "fotos/mesmas-casas.jpg",
    "lixo": "fotos/lixo.jpg", "poluicao": "fotos/poluicao-b.jpg", "esgoto": "fotos/esgoto.jpg", "moradores-enchente": "fotos/moradores-enchente.jpg",
    "favela-hoje": "fotos/favela-hoje-b.jpg", "favela-hoje-aberta": "fotos/favela-hoje.jpg", "fazenda": "fotos/fazenda-b.jpg",
    "escravizados": "fotos/escravizados.jpg", "missa-1888": "fotos/missa-1888.jpg",
    "lei-aurea": "cand:01-lei-aurea/00.jpg", "lei-aurea-assinatura": "cand:01-lei-aurea/02.jpg", "providencia-1920": "cand:02-providencia-favela/00.jpg",
}

def carrega(p):
    try: return json.load(open(p))
    except Exception: return []

fotos1 = {x["file"]: x for x in carrega(f"{AC}/fotos/CREDITOS.json")}
fotos2 = carrega(f"{AC}/fotos2/CREDITOS.json")
f2_slot = {}
for x in fotos2:
    f2_slot.setdefault(x.get("slot"), x)
for x in fotos2:   # o nome exato do arquivo vence o slot (ex.: mapa-antigo × mapa-antigo-b)
    f2_slot[x.get("file", "").removesuffix(".jpg")] = x
cand = {}
for lst in (carrega(CAND) or {}).values():
    for x in lst: cand[x.get("arquivo")] = x

usadas = set()
usa_obra = any("obra/" in open(p).read() for p in glob.glob(f"{ROOT}/src/**/*.tsx", recursive=True))
for p in glob.glob(f"{ROOT}/src/**/*.tsx", recursive=True):
    usadas |= set(re.findall(r"fotos/([a-z0-9-]+)\.jpg", open(p).read()))
# se a foto provisória já foi trocada pela real de fotos2, vale a de fotos2
TROCADAS_FILE = f"{ROOT}/gen/fotos-trocadas.json"   # lista de nomes já substituídos pela versão de fotos2
trocadas = set(carrega(TROCADAS_FILE))
PROVISORIA = {"mapa-antigo": "lei-de-terras", "contraste-aereo": "favela-hoje-aberta", "bairro-rico": "chuva-cidade", "favela-aerea": "favela-hoje",
              "rio-poluido-casas": "rio-margem", "rua-de-terra": "esgoto", "deslizamento": "encosta", "industria-casas": "poluicao",
              "geracao-1": "escravizados", "geracao-2": "providencia-1920", "geracao-3": "favela-hoje", "predio-institucional": "missa-1888",
              "audiencia-publica": "missa-1888", "obra-asfalto": "chuva-cidade", "retrato-periferia": "moradores-enchente",
              "natureza-agua": "rio-margem", "natureza-espaco": "chuva-cidade", "natureza-solo": "encosta", "natureza-ar": "chuva-cidade",
              "criancas-vala": "esgoto", "enchente-familia": "moradores-enchente", "retrato-periferia-b": "moradores-enchente",
              "crianca-favela": "favela-hoje", "zumbi": "escravizados", "serra-da-barriga": "encosta", "marcha": "missa-1888", "cidade-amanhecer": "favela-hoje-aberta",
              "comunidade-reuniao": "missa-1888", "quilombolas": "escravizados", "movimento-moradia": "missa-1888", "protesto-saneamento": "esgoto", "coletivos-poluicao": "poluicao",
              "cortico-rio": "missa-1888", "corticos-demolicao": "providencia-1920", "warren-county": "lixo", "benjamin-chavis": "escravizados"}
ORIGEM["lei-de-terras"] = "fotos/lei-de-terras.jpg"

imgs = {}
for nome in sorted(usadas):
    reg = None
    if nome in trocadas and nome in f2_slot:
        reg = f2_slot[nome]
    else:
        base = PROVISORIA.get(nome, nome) if nome not in trocadas else nome
        o = ORIGEM.get(base)
        if o and o.startswith("cand:"): reg = cand.get(o[5:])
        elif o: reg = fotos1.get(o.split("/")[1])
        elif nome in f2_slot: reg = f2_slot[nome]
    if not reg:
        print("sem crédito:", nome); continue
    autor = re.sub(r"\s+", " ", str(reg.get("author") or "")).strip()
    autor = re.sub(r"<[^>]+>", "", autor)
    h = len(autor) // 2
    if len(autor) % 2 == 0 and autor[:h] == autor[h:]: autor = autor[:h]          # "UnknownUnknown"
    autor = re.sub(r"^(Unknown author|Unknown|Desconhecido)+$", "Autor desconhecido", autor.strip(), flags=re.I)
    autor = re.split(r"\s*(?:\(|[.;]\s*(?:Auteur|dessinateur))", autor)[0].strip() or autor   # corta anotações de catálogo
    if len(autor) > 60: autor = autor[:57].rsplit(" ", 1)[0] + "…"
    imgs[f"{autor} · {reg.get('license', '')}"] = 1

mus_all = {x["file"]: x for x in carrega(f"{AC}/musica/CREDITOS.json")}
sfx_all = {x["file"]: x for x in carrega(f"{AC}/sfx/CREDITOS.json")}
mus, sfx = {}, {}
for p in glob.glob(f"{ROOT}/audio/*.py"):
    t = open(p).read()
    for m in re.findall(r"([0-9]{2}-[a-z0-9-]+\.wav)", t):
        if m in mus_all: x = mus_all[m]; mus[f"{x['artist']}, “{x['title']}” · {x['license']}"] = 1
    for m in set(re.findall(r"sfx/([a-z0-9-]+)\.wav", t)) | set(re.findall(r'A\("([a-z0-9-]+)"\)', t)) | set(re.findall(r'"([a-z0-9-]+)", [^)]*real=True', t)) \
             | set(re.findall(r'maquina-escrever-tecla', t)):
        fn = m if m.endswith(".wav") else f"{m}.wav"
        if m == "maquina-escrever-tecla": fn = "maquina-escrever-tecla-01.wav"
        if fn in sfx_all:
            x = sfx_all[fn]; sfx[f"{x.get('username') or x.get('author')} · {x['license']}"] = 1

out = {
    "nomes": ["Vítor Machado", "Maria Eduarda", "Cainã Farias", "Luísa Brasil", "Anna Augusta", "Maria Alice", "Anna Júlia Dias"],
    "obra": "Racismo Ambiental: Entenda essa Luta (Canal Preto, 2021)",
    "dados": ["IBGE, Censo Demográfico 2022: Favelas e Comunidades Urbanas", "SINISA 2024 (Ministério das Cidades) · Instituto Trata Brasil"],
    "musica": sorted(mus) + ["via Jamendo"],
    "efeitos": sorted(sfx) + ["via Freesound · efeitos sintetizados para este vídeo"],
    "imagens": (["Cenas de “Racismo Ambiental: Entenda essa Luta” (Canal Preto, 2021)"] if usa_obra else []) + sorted(imgs) + ["via Wikimedia Commons"],
}
os.makedirs(f"{ROOT}/src/p7", exist_ok=True)
json.dump(out, open(f"{ROOT}/src/p7/creditos.json", "w"), ensure_ascii=False, indent=1)
print(f"créditos: {len(mus)} músicas, {len(sfx)} efeitos, {len(imgs)} imagens")
