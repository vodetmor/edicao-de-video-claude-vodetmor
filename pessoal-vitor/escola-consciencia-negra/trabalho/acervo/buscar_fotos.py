"""Busca candidatas no Wikimedia Commons por vaga (slot), só com licença livre (domínio público, CC0, CC BY, CC BY-SA).
Salva em acervo/fotos2/cand/<slot>/NN.jpg (≤2560 px) + cand/<slot>/meta.json, e uma folha de contato _folha.jpg por vaga.
Retoma de onde parou (pula vagas que já têm meta.json). Ritmo: 1 pedido a cada ~3 s (o Commons bloqueia se for rápido).
Uso: python3 buscar_fotos.py [slot ...]"""
import json, os, sys, time, re, io, urllib.parse, urllib.request
from PIL import Image, ImageDraw
BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "fotos2", "cand")
UA = "EscolaRacismoAmbiental/1.0 (school video project; python-urllib)"
API = "https://commons.wikimedia.org/w/api.php"
PAUSA = 3.2

VAGAS = {
    # parte 3
    "bairro-rico": ["Morumbi São Paulo aerial", "Leblon aerial view buildings", "Barra da Tijuca condominiums aerial"],
    "favela-aerea": ["Rocinha aerial view", "Complexo da Maré aerial", "Favela Rio de Janeiro aerial photograph"],
    "rio-poluido-casas": ["palafitas Recife", "palafitas rio poluído", "Arroio Dilúvio favela", "Rio Tietê poluição casas"],
    "rua-de-terra": ["rua de terra periferia Brasil", "rua sem asfalto bairro", "unpaved street favela Brazil"],
    "deslizamento": ["Petrópolis 2022 deslizamento", "deslizamento de terra casas Brasil", "landslide Petrópolis 2022"],
    "industria-casas": ["Cubatão indústria", "Cubatão Vila Parisi", "Polo industrial Cubatão"],
    # parte 4
    "geracao-1": ["Marc Ferrez escravizados retrato", "Christiano Junior fotografia", "Militão Augusto de Azevedo retrato"],
    "geracao-2": ["Correio da Manhã favela Arquivo Nacional", "favela 1960 Rio de Janeiro Arquivo Nacional", "Favela do Esqueleto"],
    "geracao-3": ["moradores favela Agência Brasil", "comunidade periferia moradores Agência Brasil"],
    "predio-institucional": ["Congresso Nacional Brasília fachada", "Palácio do Planalto fachada", "Palácio Tiradentes Rio de Janeiro"],
    "audiencia-publica": ["audiência pública câmara municipal", "Câmara Municipal sessão plenário", "audiência pública Agência Brasil"],
    "obra-asfalto": ["obra de pavimentação asfalto", "pavimentação asfáltica obra rua", "recapeamento asfáltico"],
    "retrato-periferia": ["moradora periferia retrato Agência Brasil", "morador comunidade retrato", "Marcha das Mulheres Negras 2015"],
    # parte 5
    "natureza-agua": ["cachoeira Chapada dos Veadeiros", "rio cristalino Bonito Mato Grosso do Sul", "Rio Sucuri Bonito"],
    "natureza-solo": ["terra roxa plantação", "solo vermelho cerrado estrada", "lavoura café terra"],
    "natureza-ar": ["Mata Atlântica copa das árvores", "Floresta Amazônica vista aérea", "céu nuvens cerrado"],
    "natureza-espaco": ["Chapada Diamantina paisagem", "Serra da Mantiqueira paisagem", "Lençóis Maranhenses"],
    "criancas-vala": ["crianças esgoto a céu aberto", "esgoto a céu aberto favela crianças", "valão comunidade crianças"],
    "enchente-familia": ["enchente Rio Grande do Sul 2024 moradores", "enchente Petrópolis 2022 moradores", "enchentes Recife 2022"],
    "retrato-periferia-b": ["moradores comunidade Agência Brasil retrato", "mulher negra comunidade retrato Agência Brasil"],
    "coleta-lixo": ["coleta de lixo gari caminhão", "garis coleta lixo"],
    "torneira-agua": ["torneira água", "água encanada torneira Brasil"],
    # parte 7
    "crianca-favela": ["criança favela", "crianças comunidade Rio de Janeiro", "criança janela favela"],
    "zumbi": ["Zumbi dos Palmares pintura", "Zumbi dos Palmares estátua", "Zumbi dos Palmares busto"],
    "serra-da-barriga": ["Serra da Barriga", "Parque Memorial Quilombo dos Palmares"],
    "dandara": ["Dandara dos Palmares", "Dandara estátua"],
    "marcha": ["Marcha das Mulheres Negras Brasília 2015", "Dia da Consciência Negra marcha", "Marcha Zumbi dos Palmares"],
    "cidade-amanhecer": ["amanhecer favela Rio de Janeiro", "pôr do sol favela", "sunrise Rio de Janeiro favela"],
    # parte 2 (Maria Eduarda, pelo roteiro)
    "corticos-demolicao": ["Augusto Malta demolição", "Morro do Castelo demolição", "Bota-abaixo Pereira Passos"],
    "cortico-rio": ["cortiço Rio de Janeiro 1906", "Augusto Malta cortiço", "Cabeça de Porco cortiço"],
    "benjamin-chavis": ["Benjamin Chavis"],
    "warren-county": ["Warren County PCB protest 1982", "Warren County PCB landfill"],
    # parte 6 (Maria Alice)
    "quilombolas": ["quilombolas Agência Brasil", "comunidade quilombola", "quilombo Kalunga"],
    "movimento-moradia": ["MTST ocupação", "movimento sem-teto marcha", "movimento por moradia manifestação"],
    "protesto-saneamento": ["protesto saneamento básico", "manifestação poluição moradores", "protesto moradores esgoto"],
    "coletivos-poluicao": ["protesto contra poluição Brasil", "manifestação ambiental comunidade", "ato contra lixão moradores"],
    "comunidade-reuniao": ["assembleia comunitária", "reunião associação de moradores", "assembleia ocupação"],
}
LIVRE = re.compile(r"(public domain|domínio público|pd|cc0|cc[- ]by(-sa)?[- ]?[0-9.]*( [a-z]{2})?$|cc by(-sa)? [0-9.]+( [a-z]{2,3})?)", re.I)

def get(params):
    params = {**params, "format": "json"}
    url = API + "?" + urllib.parse.urlencode(params)
    for tent in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                data = json.load(r)
            time.sleep(PAUSA)
            return data
        except Exception as e:
            time.sleep(PAUSA * (2 ** (tent + 1)))
    return {}

def baixa(url):
    for tent in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read()
            time.sleep(PAUSA)
            return b
        except Exception:
            time.sleep(PAUSA * (2 ** (tent + 1)))
    return None

def limpa(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()

def vaga(slot, consultas, maxc=6):
    d = os.path.join(OUT, slot)
    if os.path.exists(os.path.join(d, "meta.json")):
        return
    os.makedirs(d, exist_ok=True)
    vistos, cands = set(), []
    for q in consultas:
        r = get({"action": "query", "generator": "search", "gsrsearch": f"{q} filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 12,
                 "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 2560})
        pages = sorted((r.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
        for p in pages:
            if p["title"] in vistos: continue
            vistos.add(p["title"])
            ii = (p.get("imageinfo") or [{}])[0]
            em = ii.get("extmetadata", {})
            lic = limpa(em.get("LicenseShortName", {}).get("value", ""))
            if not lic or re.search(r"\b(nc|nd)\b", lic, re.I) or not LIVRE.search(lic):
                continue
            if ii.get("width", 0) < 1400 or ii.get("width", 0) < ii.get("height", 0) * 0.9:
                continue
            cands.append({"title": p["title"], "page": ii.get("descriptionurl"), "thumb": ii.get("thumburl"), "w": ii.get("width"), "h": ii.get("height"),
                          "license": lic, "license_url": limpa(em.get("LicenseUrl", {}).get("value", "")),
                          "author": limpa(em.get("Artist", {}).get("value", ""))[:120], "desc": limpa(em.get("ImageDescription", {}).get("value", ""))[:200],
                          "date": limpa(em.get("DateTimeOriginal", {}).get("value", ""))[:40], "query": q})
        if len(cands) >= maxc * 2: break
    meta = []
    for c in cands[:maxc]:
        b = baixa(c["thumb"])
        if not b: continue
        try:
            im = Image.open(io.BytesIO(b)).convert("RGB")
        except Exception:
            continue
        im.thumbnail((2560, 2560))
        fn = f"{len(meta):02d}.jpg"; im.save(os.path.join(d, fn), quality=90)
        meta.append({**c, "file": fn, "width": im.width, "height": im.height})
    json.dump(meta, open(os.path.join(d, "meta.json"), "w"), ensure_ascii=False, indent=1)
    if meta:
        w, h = 480, 300
        sheet = Image.new("RGB", (w * 3, h * ((len(meta) + 2) // 3)), "black")
        for i, m in enumerate(meta):
            im = Image.open(os.path.join(d, m["file"])); im.thumbnail((w, h - 20))
            sheet.paste(im, ((i % 3) * w, (i // 3) * h))
            ImageDraw.Draw(sheet).text(((i % 3) * w + 4, (i // 3) * h + h - 18), f"{m['file']} {m['license'][:18]} {m['title'][5:45]}", fill="yellow")
        sheet.save(os.path.join(d, "_folha.jpg"), quality=80)
    print(slot, len(meta), flush=True)

if __name__ == "__main__":
    alvo = sys.argv[1:] or list(VAGAS)
    for s in alvo:
        vaga(s, VAGAS[s])
    print("fim", flush=True)
