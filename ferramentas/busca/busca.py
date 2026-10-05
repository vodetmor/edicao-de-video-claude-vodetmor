#!/usr/bin/env python3
"""busca.py — procura material REAL (vídeo, foto, notícia, referência, som) em várias fontes grátis de uma vez.

Uso rápido:
  python3 busca.py "chuva na cidade"                      # vídeos de estoque (padrão)
  python3 busca.py "favela rio de janeiro" -t foto -n 8
  python3 busca.py "enchente porto alegre" -t noticia     # manchetes + vídeos de telejornal (só referência)
  python3 busca.py "pessoa digitando celular" -t video --vertical --baixar
  python3 busca.py "porta rangendo" -t som
  python3 busca.py --fontes                               # lista fontes e se têm chave
  python3 busca.py --pegar URL [URL...] --saida pasta     # baixa um link solto (Dailymotion, mp4, jpg...)

Sem --baixar ele só busca: salva resultados.json, LICENCAS.md e folha.jpg (miniaturas numeradas) na pasta de saída.
Com --baixar baixa os arquivos e registra a licença de cada um em registro-licencas.csv (ao lado deste script).
Chaves: lidas de chaves.env (ao lado deste script) e de escola-consciencia-negra/edicao/.env. Nunca são impressas.
"""
import argparse, csv, datetime, html, io, json, os, re, subprocess, sys, time, unicodedata, urllib.parse, urllib.request
import urllib.error
import xml.etree.ElementTree as ET

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
ARQ_CHAVES = [os.path.join(AQUI, "chaves.env"), os.path.join(RAIZ, "escola-consciencia-negra", "edicao", ".env")]
NAVEGADOR = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
UA_WIKI = "EdicaoVideoIA-busca/1.0 (https://claude.ai/code; uso pessoal de edição) python-urllib"

# uso: livre = pode usar em anúncio sem crédito | atribuir = pode, com crédito | nao-comercial = NÃO usar em anúncio
#      referencia = só para estudar/inspirar (direitos do dono) | verificar = olhar a página antes de usar


def chaves():
    """Lê as chaves; aceita qualquer nome que contenha PEXELS / PIXABAY / FREESOUND / JAMENDO.
    Se houver vários (ex.: FREESOUND_CLIENT_ID e FREESOUND_API_KEY), prefere o nome com o termo certo."""
    preferido = {"PEXELS": "KEY", "PIXABAY": "KEY", "FREESOUND": "KEY", "JAMENDO": "CLIENT_ID"}
    pares = []
    for arq in ARQ_CHAVES:
        if os.path.exists(arq):
            for linha in open(arq, encoding="utf-8", errors="ignore"):
                if "=" in linha and not linha.lstrip().startswith("#"):
                    nome, valor = linha.split("=", 1)
                    pares.append((nome.strip().upper(), valor.strip().strip('"').strip("'")))
    pares += [(n.upper(), v) for n, v in os.environ.items()]
    achadas = {}
    for fonte, termo in preferido.items():
        cands = [(n, v) for n, v in pares if fonte in n and v]
        cands.sort(key=lambda nv: (termo not in nv[0], "SECRET" in nv[0]))
        if cands:
            achadas[fonte.lower()] = cands[0][1]
    return achadas


CH = chaves()


def pega(url, json_=True, cab=None, ua=NAVEGADOR, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": ua, **(cab or {})})
    for tentativa in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                dados = r.read()
            break
        except urllib.error.HTTPError as e:
            if e.code != 429 or tentativa == 2:
                raise
            time.sleep(10 * (tentativa + 1))  # site pediu pausa: espera e tenta de novo
    return json.loads(dados) if json_ else dados


def q(d):
    return urllib.parse.urlencode(d, doseq=True)


def item(fonte, tipo, titulo, pagina, arquivo, miniatura, autor, licenca, uso, **extra):
    return {"fonte": fonte, "tipo": tipo, "titulo": (titulo or "").strip()[:140], "pagina": pagina, "arquivo": arquivo,
            "miniatura": miniatura, "autor": autor or "", "licenca": licenca, "uso": uso, **extra}


# ---------------------------------------------------------------- fontes de estoque (uso livre)

def pexels(consulta, tipo, n, vertical):
    if "pexels" not in CH:
        raise RuntimeError("sem chave (crie grátis em pexels.com/api e ponha PEXELS_API_KEY=... em chaves.env)")
    cab = {"Authorization": CH["pexels"]}
    orient = "portrait" if vertical else "landscape"
    if tipo == "video":
        r = pega("https://api.pexels.com/videos/search?" + q({"query": consulta, "per_page": n, "orientation": orient}), cab=cab)
        out = []
        for v in r.get("videos", []):
            fs = [f for f in v["video_files"] if f.get("file_type") == "video/mp4" and f.get("width")]
            limite = 1080 if vertical else 1920
            fs = sorted([f for f in fs if min(f["width"], f["height"]) <= 1080 and max(f["width"], f["height"]) <= 1920] or fs,
                        key=lambda f: -f["width"] * f["height"])
            if not fs:
                continue
            f = fs[0]
            out.append(item("pexels", "video", v.get("url", "").rstrip("/").split("/")[-1].replace("-", " "), v.get("url"), f["link"],
                            v.get("image"), v["user"]["name"], "Licença Pexels (pexels.com/license)", "livre",
                            largura=f["width"], altura=f["height"], duracao=v.get("duration")))
        return out
    r = pega("https://api.pexels.com/v1/search?" + q({"query": consulta, "per_page": n, "orientation": orient}), cab=cab)
    return [item("pexels", "foto", p.get("alt") or consulta, p["url"], p["src"]["original"], p["src"]["medium"], p["photographer"],
                 "Licença Pexels (pexels.com/license)", "livre", largura=p["width"], altura=p["height"]) for p in r.get("photos", [])]


def pixabay(consulta, tipo, n, vertical):
    if "pixabay" not in CH:
        raise RuntimeError("sem chave (crie grátis em pixabay.com/api/docs e ponha PIXABAY_API_KEY=... em chaves.env)")
    base = {"key": CH["pixabay"], "q": consulta[:100], "per_page": max(3, n), "safesearch": "true"}
    if tipo == "video":
        r = pega("https://pixabay.com/api/videos/?" + q(base))
        out = []
        for h in r.get("hits", []):
            vs = h["videos"]
            f = next((vs[k] for k in ("large", "medium", "small") if vs.get(k, {}).get("url")), None)
            if not f or (vertical and f["width"] > f["height"]):
                continue
            out.append(item("pixabay", "video", h.get("tags"), h["pageURL"], f["url"], f.get("thumbnail") or vs.get("tiny", {}).get("thumbnail"),
                            h.get("user"), "Licença Pixabay (pixabay.com/service/license-summary)", "livre",
                            largura=f["width"], altura=f["height"], duracao=h.get("duration")))
        return out[:n]
    r = pega("https://pixabay.com/api/?" + q({**base, "image_type": "photo", "orientation": "vertical" if vertical else "horizontal"}))
    return [item("pixabay", "foto", h.get("tags"), h["pageURL"], h.get("largeImageURL"), h.get("webformatURL"), h.get("user"),
                 "Licença Pixabay (pixabay.com/service/license-summary)", "livre", largura=h.get("imageWidth"), altura=h.get("imageHeight"))
            for h in r.get("hits", [])][:n]


def mixkit(consulta, tipo, n, vertical):
    if tipo != "video":
        return []
    slug = re.sub(r"[^a-z0-9]+", "-", sem_acento(consulta).lower()).strip("-")
    pagina = f"https://mixkit.co/free-stock-video/discover/{slug}/"
    try:
        h = pega(pagina, json_=False).decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        if e.code == 429:
            raise RuntimeError("Mixkit pediu pausa (429); tente de novo em alguns minutos")
        raise
    ids = list(dict.fromkeys(re.findall(r"assets\.mixkit\.co/videos/(\d+)/", h)))
    titulos = {i: t.replace("-", " ") for t, i in re.findall(r'/free-stock-video/([a-z0-9-]+)-(\d+)/', h)}
    out = []
    for i in ids[:n]:
        out.append(item("mixkit", "video", titulos.get(i, f"mixkit {i}"), f"https://mixkit.co/free-stock-video/{slug}-{i}/" if i not in titulos
                        else f"https://mixkit.co/free-stock-video/{titulos[i].replace(' ', '-')}-{i}/",
                        f"https://assets.mixkit.co/videos/{i}/{i}-1080.mp4", f"https://assets.mixkit.co/videos/{i}/{i}-thumb-360-0.jpg",
                        "Mixkit", "Mixkit Free License (mixkit.co/license)", "livre",
                        alternativas=[f"https://assets.mixkit.co/videos/{i}/{i}-720.mp4", f"https://assets.mixkit.co/videos/{i}/{i}-360.mp4"]))
    return out


# ---------------------------------------------------------------- acervos reais (domínio público / Creative Commons)

def _uso_cc(lic):
    lic = (lic or "").lower()
    if not lic:
        return "verificar"
    if "nc" in lic.split("-") or "-nc" in lic or "noncommercial" in lic:
        return "nao-comercial"
    if lic in ("cc0", "pdm", "publicdomain", "pd") or "publicdomain" in lic or "public domain" in lic or "zero" in lic:
        return "livre"
    return "atribuir"


def openverse(consulta, tipo, n, vertical):
    """Openverse junta Flickr, Wikimedia, museus etc. Só Creative Commons / domínio público."""
    if tipo == "foto":
        r = pega("https://api.openverse.org/v1/images/?" + q({"q": consulta, "page_size": n, "license_type": "commercial",
                                                               "aspect_ratio": "tall" if vertical else "wide", "mature": "false"}))
        return [item("openverse/" + (x.get("source") or ""), "foto", x.get("title"), x.get("foreign_landing_url"), x.get("url"),
                     x.get("thumbnail"), x.get("creator"), f"CC {x.get('license', '').upper()} {x.get('license_version') or ''}".strip(),
                     _uso_cc(x.get("license")), largura=x.get("width"), altura=x.get("height"), licenca_url=x.get("license_url"))
                for x in r.get("results", [])]
    if tipo == "som":
        r = pega("https://api.openverse.org/v1/audio/?" + q({"q": consulta, "page_size": n, "license_type": "commercial"}))
        return [item("openverse/" + (x.get("source") or ""), "som", x.get("title"), x.get("foreign_landing_url"), x.get("url"),
                     x.get("thumbnail"), x.get("creator"), f"CC {x.get('license', '').upper()} {x.get('license_version') or ''}".strip(),
                     _uso_cc(x.get("license")), duracao=(x.get("duration") or 0) / 1000, licenca_url=x.get("license_url"))
                for x in r.get("results", [])]
    return []


def wikimedia(consulta, tipo, n, vertical):
    filtro = "filetype:video" if tipo == "video" else "filetype:bitmap"
    r = pega("https://commons.wikimedia.org/w/api.php?" + q({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrlimit": n,
        "gsrsearch": f"{consulta} {filtro}", "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 330}), ua=UA_WIKI)
    out = []
    for p in sorted(r.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = (p.get("imageinfo") or [{}])[0]
        md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "")
        autor = re.sub("<[^>]+>", "", md.get("Artist", {}).get("value", ""))
        out.append(item("wikimedia", tipo, p.get("title", "").replace("File:", ""), ii.get("descriptionurl"), ii.get("url"),
                        ii.get("thumburl"), autor, lic or "ver página", _uso_cc(lic.replace(" ", "-")),
                        largura=ii.get("width"), altura=ii.get("height"), duracao=ii.get("duration")))
    return out


def archive(consulta, tipo, n, vertical):
    """Internet Archive: filmes antigos, cinejornais, gravações de TV, imagens de arquivo. Licença varia: olhe a página."""
    mt = {"video": "movies", "foto": "image", "som": "audio"}.get(tipo, "movies")
    r = pega("https://archive.org/advancedsearch.php?" + q({"q": f"(title:({consulta}) OR subject:({consulta})) AND mediatype:{mt}", "fl[]": ["identifier", "title", "licenseurl", "creator", "year"],
                                                           "rows": n, "output": "json"}))
    out = []
    for d in r.get("response", {}).get("docs", []):
        lic = d.get("licenseurl") or ""
        uso = "livre" if "publicdomain" in lic else (_uso_cc(lic.split("licenses/")[-1].split("/")[0]) if lic else "verificar")
        out.append(item("archive", tipo, d.get("title") if isinstance(d.get("title"), str) else str(d.get("title")),
                        f"https://archive.org/details/{d['identifier']}", f"archive:{d['identifier']}",
                        f"https://archive.org/services/img/{d['identifier']}", d.get("creator") if isinstance(d.get("creator"), str) else "",
                        lic or "não informada (ver página)", uso, ano=d.get("year")))
    return out


def nasa(consulta, tipo, n, vertical):
    mt = {"video": "video", "foto": "image", "som": "audio"}.get(tipo)
    if not mt:
        return []
    r = pega("https://images-api.nasa.gov/search?" + q({"q": consulta, "media_type": mt, "page_size": n}))
    out = []
    for it in r["collection"]["items"][:n]:
        d = it["data"][0]
        thumb = next((l["href"] for l in it.get("links", []) if l.get("rel") == "preview"), None)
        out.append(item("nasa", tipo, d.get("title"), f"https://images.nasa.gov/details/{d['nasa_id']}", "nasa:" + it["href"],
                        thumb, d.get("center"), "NASA (domínio público; não usar logo/insígnia da NASA como endosso)", "livre"))
    return out


def loc(consulta, tipo, n, vertical):
    """Biblioteca do Congresso dos EUA: fotos históricas (muitas em domínio público)."""
    if tipo != "foto":
        return []
    r = pega("https://www.loc.gov/photos/?" + q({"q": consulta, "fo": "json", "c": n, "fa": "online-format:image"}))
    out = []
    for x in r.get("results", [])[:n]:
        imgs = [u.split("#")[0] for u in x.get("image_url", [])]
        grande = next((u for u in reversed(imgs) if u.endswith(".jpg")), imgs[-1] if imgs else None)
        out.append(item("loc", "foto", x.get("title"), x.get("url"), grande, imgs[0] if imgs else None, "",
                        "ver 'Rights' na página (muitas sem restrição conhecida)", "verificar", ano=x.get("date")))
    return out


# ---------------------------------------------------------------- notícias e referências (SÓ estudo / inspiração)

def dailymotion(consulta, tipo, n, vertical):
    """Telejornais brasileiros publicam aqui (Band, Jovem Pan, SBT, Correio...). Baixa com yt-dlp."""
    r = pega("https://api.dailymotion.com/videos?" + q({"search": consulta, "limit": n, "sort": "relevance",
                                                         "fields": "id,title,url,duration,thumbnail_360_url,owner.screenname,created_time"}))
    return [item("dailymotion", "video", v["title"], v["url"], v["url"], v.get("thumbnail_360_url"), v.get("owner.screenname"),
                 "© do canal (sem licença de reuso)", "referencia", duracao=v.get("duration"),
                 data=datetime.datetime.utcfromtimestamp(v["created_time"]).strftime("%Y-%m-%d") if v.get("created_time") else "")
            for v in r.get("list", [])]


def youtube(consulta, tipo, n, vertical):
    """Só busca (o download do YouTube é bloqueado daqui). Serve para achar a referência e o link."""
    p = subprocess.run(["yt-dlp", "--no-warnings", "--flat-playlist", "-J", f"ytsearch{n}:{consulta}"], capture_output=True, text=True, timeout=90)
    if p.returncode:
        raise RuntimeError(p.stderr.strip()[-200:] or "yt-dlp falhou (instale: python3 -m pip install yt-dlp)")
    out = []
    for e in json.loads(p.stdout).get("entries", []):
        out.append(item("youtube", "video", e.get("title"), f"https://www.youtube.com/watch?v={e['id']}", None,
                        f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg", e.get("channel") or e.get("uploader"),
                        "© do canal (download bloqueado daqui; só referência)", "referencia", duracao=e.get("duration")))
    return out


def gnews(consulta, tipo, n, vertical):
    """Manchetes do Google Notícias (Brasil). Leva até o site do jornal; serve para pauta/checagem, não para baixar."""
    raw = pega("https://news.google.com/rss/search?" + q({"q": consulta, "hl": "pt-BR", "gl": "BR", "ceid": "BR:pt-419"}), json_=False)
    out = []
    for it in ET.fromstring(raw).iter("item"):
        src = it.find("source")
        out.append(item("gnews", "noticia", html.unescape(it.findtext("title", "")), it.findtext("link"), None, None,
                        src.text if src is not None else "", "© do veículo", "referencia", data=it.findtext("pubDate", "")[:16]))
        if len(out) >= n:
            break
    return out


# ---------------------------------------------------------------- som

def freesound(consulta, tipo, n, vertical):
    if "freesound" not in CH:
        raise RuntimeError("sem chave (freesound.org/apiv2/apply)")
    r = pega("https://freesound.org/apiv2/search/text/?" + q({"query": consulta, "page_size": n, "token": CH["freesound"],
                                                               "fields": "id,name,url,previews,license,username,duration,images"}))
    out = []
    for s in r.get("results", []):
        lic = s.get("license", "")
        uso = "livre" if "zero" in lic else ("nao-comercial" if "nc" in lic.lower() else "atribuir")
        out.append(item("freesound", "som", s["name"], s["url"], s["previews"].get("preview-hq-mp3"), (s.get("images") or {}).get("waveform_m"),
                        s.get("username"), lic, uso, duracao=s.get("duration")))
    return out


def jamendo(consulta, tipo, n, vertical):
    if "jamendo" not in CH:
        raise RuntimeError("sem chave (devportal.jamendo.com)")
    r = pega("https://api.jamendo.com/v3.0/tracks/?" + q({"client_id": CH["jamendo"], "format": "json", "limit": n, "search": consulta,
                                                           "audiodownload_allowed": "true", "include": "licenses"}))
    out = []
    for t in r.get("results", []):
        lic = t.get("license_ccurl", "")
        out.append(item("jamendo", "musica", f"{t['name']} — {t['artist_name']}", t.get("shareurl"), t.get("audiodownload") or t.get("audio"),
                        t.get("image"), t.get("artist_name"), lic, _uso_cc(lic.split("licenses/")[-1].split("/")[0]), duracao=t.get("duration")))
    return out


FONTES = {
    "pexels": pexels, "pixabay": pixabay, "mixkit": mixkit, "openverse": openverse, "wikimedia": wikimedia, "archive": archive,
    "nasa": nasa, "loc": loc, "dailymotion": dailymotion, "youtube": youtube, "gnews": gnews,
    "freesound": freesound, "jamendo": jamendo,
}
PADRAO = {
    "video": ["pexels", "pixabay", "mixkit", "wikimedia"],
    "foto": ["pexels", "pixabay", "openverse", "wikimedia", "loc"],
    "noticia": ["gnews", "dailymotion", "youtube"],
    "ref": ["youtube", "dailymotion", "openverse"],
    "som": ["freesound", "openverse"],
    "musica": ["jamendo"],
    "arquivo": ["archive", "wikimedia", "loc", "nasa"],
}
TIPO_REAL = {"noticia": "video", "ref": "foto", "arquivo": "video", "musica": "som"}


# ---------------------------------------------------------------- download, folha, licenças

def sem_acento(s):
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()


def slug(s, n=40):
    return re.sub(r"[^a-z0-9]+", "-", sem_acento(s).lower()).strip("-")[:n] or "busca"


def baixar_url(url, destino_sem_ext, fonte=""):
    """Baixa um resultado. Retorna o caminho final ou levanta erro."""
    if url.startswith("archive:"):
        ident = url.split(":", 1)[1]
        md = pega(f"https://archive.org/metadata/{ident}")
        arqs = [f for f in md.get("files", []) if f["name"].lower().endswith((".mp4", ".jpg", ".png", ".mp3", ".ogv", ".mpeg", ".avi"))]
        pref = sorted(arqs, key=lambda f: (not f["name"].lower().endswith(".mp4"), "thumb" in f["name"].lower(), -int(f.get("size", 0) or 0)))
        if not pref:
            raise RuntimeError("sem arquivo de mídia baixável")
        if int(pref[0].get("size", 0) or 0) > 1500 * 1024 * 1024:
            raise RuntimeError(f"arquivo grande demais ({int(pref[0]['size']) // 2**20} MB); baixe manualmente se quiser")
        url = f"https://archive.org/download/{ident}/" + urllib.parse.quote(pref[0]["name"])
    elif url.startswith("nasa:"):
        lista = pega(url[5:].replace(" ", "%20"))
        mp4 = [u for u in lista if u.endswith("~orig.mp4")] or [u for u in lista if u.endswith(".mp4")] or [u for u in lista if u.endswith("~orig.jpg")] or lista
        url = mp4[0].replace(" ", "%20").replace("http://", "https://")
    if fonte in ("dailymotion", "youtube") or re.search(r"dailymotion\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|vimeo\.com", url):
        p = subprocess.run(["yt-dlp", "--no-warnings", "--no-progress", "-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4",
                            "-o", destino_sem_ext + ".%(ext)s", "--print", "after_move:filepath", url], capture_output=True, text=True, timeout=900)
        if p.returncode:
            raise RuntimeError(p.stderr.strip().splitlines()[-1][:200] if p.stderr.strip() else "yt-dlp falhou")
        return p.stdout.strip().splitlines()[-1]
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower()
    if ext not in (".mp4", ".mov", ".webm", ".ogv", ".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".gif", ".mp3", ".wav", ".ogg", ".flac", ".mpeg", ".avi"):
        ext = ".bin"
    ua = UA_WIKI if "wikimedia.org" in url else NAVEGADOR
    dados = pega(url, json_=False, ua=ua, timeout=300)
    if ext == ".bin":
        ext = ".jpg" if dados[:3] == b"\xff\xd8\xff" else ".png" if dados[:4] == b"\x89PNG" else ".mp4" if dados[4:8] == b"ftyp" else ".bin"
    caminho = destino_sem_ext + ext
    open(caminho, "wb").write(dados)
    return caminho


def folha(resultados, saida):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("  (sem Pillow: pulando folha.jpg — instale com python3 -m pip install pillow)")
        return None
    W, H, cols = 320, 200, 4
    cel = [r for r in resultados if r.get("miniatura")]
    if not cel:
        return None
    linhas = (len(cel) + cols - 1) // cols
    img = Image.new("RGB", (W * cols, (H + 34) * linhas), (18, 18, 18))
    d = ImageDraw.Draw(img)
    for i, r in enumerate(cel):
        x, y = (i % cols) * W, (i // cols) * (H + 34)
        try:
            ua = UA_WIKI if "wikimedia.org" in r["miniatura"] else NAVEGADOR
            t = Image.open(io.BytesIO(pega(r["miniatura"], json_=False, ua=ua, timeout=30))).convert("RGB")
            if "wikimedia.org" in r["miniatura"]:
                time.sleep(1.5)
            t.thumbnail((W - 6, H - 6))
            img.paste(t, (x + (W - t.width) // 2, y + (H - t.height) // 2))
        except Exception:
            d.text((x + 10, y + H // 2), "(sem miniatura)", fill=(150, 150, 150))
        cor = {"livre": (90, 220, 120), "atribuir": (240, 200, 80), "nao-comercial": (240, 120, 80), "referencia": (120, 170, 255)}.get(r["uso"], (200, 200, 200))
        d.text((x + 6, y + H + 2), f"#{r['n']} {r['fonte']} [{r['uso']}]", fill=cor)
        d.text((x + 6, y + H + 17), sem_acento(r["titulo"])[:44], fill=(220, 220, 220))
    caminho = os.path.join(saida, "folha.jpg")
    img.save(caminho, quality=85)
    return caminho


def escrever_licencas(resultados, saida, consulta):
    linhas = [f"# Licenças — busca \"{consulta}\"", f"Gerado em {datetime.datetime.now():%Y-%m-%d %H:%M}.", "",
              "Legenda de uso: **livre** = pode usar em anúncio | **atribuir** = pode, com crédito | **nao-comercial** = NÃO usar em anúncio | "
              "**referencia** = só para estudar | **verificar** = abrir a página antes", "",
              "| # | fonte | uso | título | autor | licença | página | arquivo local |", "|---|---|---|---|---|---|---|---|"]
    for r in resultados:
        linhas.append("| {n} | {fonte} | {uso} | {t} | {autor} | {licenca} | {pagina} | {local} |".format(
            t=r["titulo"].replace("|", "/")[:70], local=os.path.basename(r.get("local") or "") or "—", **{k: (str(v).replace("|", "/") if v else "") for k, v in r.items() if k in ("n", "fonte", "uso", "autor", "licenca", "pagina")}))
    creditos = [f"- {r['titulo'][:60]} — {r['autor'] or 'autor na página'} ({r['licenca']}) {r['pagina']}" for r in resultados if r["uso"] == "atribuir" and r.get("local")]
    if creditos:
        linhas += ["", "## Créditos obrigatórios (coloque na descrição/legenda)", *creditos]
    open(os.path.join(saida, "LICENCAS.md"), "w", encoding="utf-8").write("\n".join(linhas) + "\n")


def registrar(resultados, consulta):
    arq = os.path.join(AQUI, "registro-licencas.csv")
    novo = not os.path.exists(arq)
    with open(arq, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if novo:
            w.writerow(["data", "consulta", "fonte", "uso", "titulo", "autor", "licenca", "pagina", "arquivo_local"])
        for r in resultados:
            if r.get("local"):
                w.writerow([f"{datetime.datetime.now():%Y-%m-%d %H:%M}", consulta, r["fonte"], r["uso"], r["titulo"], r["autor"], r["licenca"],
                            r["pagina"], os.path.relpath(r["local"], RAIZ)])


def main():
    ap = argparse.ArgumentParser(description="Busca material real em várias fontes grátis de uma vez.")
    ap.add_argument("consulta", nargs="?", help="o que procurar (inglês acha mais em estoque; português acha mais em notícia)")
    ap.add_argument("-t", "--tipo", default="video", choices=list(PADRAO), help="video | foto | noticia | ref | som | musica | arquivo")
    ap.add_argument("-f", "--fontes", nargs="?", const="__listar__", help="lista separada por vírgula (ex: pexels,archive). Sem valor: lista as fontes")
    ap.add_argument("-n", type=int, default=6, help="resultados por fonte (padrão 6)")
    ap.add_argument("--vertical", action="store_true", help="prefere material em pé (9:16)")
    ap.add_argument("--baixar", nargs="?", const="todos", help="baixa os resultados. Sem valor: todos; ou números: --baixar 1,4,7")
    ap.add_argument("--livre", action="store_true", help="mostra só o que pode ir em anúncio (livre/atribuir)")
    ap.add_argument("--saida", help="pasta de saída (padrão: ferramentas/busca/resultados/<data>-<consulta>)")
    ap.add_argument("--de", metavar="PASTA", help="reaproveita uma busca já feita (usa o resultados.json dela) — junto com --baixar 2,5")
    ap.add_argument("--pegar", nargs="+", metavar="URL", help="baixa link(s) solto(s) (Dailymotion, mp4, jpg, X/Twitter...)")
    a = ap.parse_args()

    if a.fontes == "__listar__" or (a.fontes is None and not a.consulta and not a.pegar and not a.de):
        print("Fontes (chave = precisa de chave grátis):")
        precisa = {"pexels", "pixabay", "freesound", "jamendo"}
        for nome, fn in FONTES.items():
            st = ("ok" if nome in CH else "SEM CHAVE") if nome in precisa else "ok (sem chave)"
            print(f"  {nome:12} {st:16} {(fn.__doc__ or '').strip().splitlines()[0] if fn.__doc__ else ''}")
        print("\nPadrões por tipo:", json.dumps(PADRAO, ensure_ascii=False))
        return

    if a.pegar:
        saida = a.saida or os.path.join(AQUI, "resultados", f"{datetime.date.today()}-links")
        os.makedirs(saida, exist_ok=True)
        for i, u in enumerate(a.pegar, 1):
            try:
                print("  ok ->", baixar_url(u, os.path.join(saida, f"link-{datetime.datetime.now():%H%M%S}-{i:02d}")))
            except Exception as e:
                print(f"  falhou {u}: {e}")
        return

    if a.de:
        saida = a.de
        resultados = json.load(open(os.path.join(saida, "resultados.json"), encoding="utf-8"))
        a.consulta = a.consulta or (resultados[0].get("consulta") if resultados else "") or os.path.basename(saida.rstrip("/"))
        fontes = []
    else:
        if not a.consulta:
            ap.error("diga o que procurar, ex.: busca.py \"chuva na cidade\"")
        fontes = a.fontes.split(",") if a.fontes else PADRAO[a.tipo]
        saida = a.saida or os.path.join(AQUI, "resultados", f"{datetime.date.today()}-{a.tipo}-{slug(a.consulta)}")
        resultados = []
    tipo_api = TIPO_REAL.get(a.tipo, a.tipo)
    os.makedirs(saida, exist_ok=True)

    for nome in fontes:
        fn = FONTES.get(nome.strip())
        if not fn:
            print(f"! fonte desconhecida: {nome}")
            continue
        try:
            achados = fn(a.consulta, tipo_api, a.n, a.vertical)
            if a.vertical:  # descarta o que sabidamente é deitado
                achados = [r for r in achados if not (r.get("largura") and r.get("altura") and r["largura"] > r["altura"])]
            print(f"- {nome}: {len(achados)}")
            resultados += achados
        except Exception as e:
            print(f"! {nome}: {str(e)[:160]}")
    if a.livre:
        resultados = [r for r in resultados if r["uso"] in ("livre", "atribuir")]
    if not a.de:
        for i, r in enumerate(resultados, 1):
            r["n"], r["consulta"] = i, a.consulta

    if a.baixar:
        escolha = None if a.baixar == "todos" else {int(x) for x in a.baixar.split(",") if x.strip().isdigit()}
        for r in resultados:
            if (escolha is not None and r["n"] not in escolha) or (r.get("local") and os.path.exists(r["local"])):
                continue
            alvo = r["arquivo"] or (r["pagina"] if r["fonte"] in ("dailymotion", "youtube") else None)
            if not alvo:
                continue
            nome = os.path.join(saida, f"{r['n']:02d}-{r['fonte'].split('/')[0]}-{slug(r['titulo'], 30)}")
            for tentativa in [alvo] + r.get("alternativas", []):
                try:
                    r["local"] = baixar_url(tentativa, nome, r["fonte"])
                    print(f"  baixado #{r['n']} -> {os.path.basename(r['local'])}")
                    break
                except Exception as e:
                    erro = str(e)[:160]
            else:
                print(f"  não baixou #{r['n']} ({r['fonte']}): {erro}")
            if r["fonte"] == "wikimedia":
                time.sleep(4)
        registrar([r for r in resultados if escolha is None or r["n"] in escolha], a.consulta)

    json.dump(resultados, open(os.path.join(saida, "resultados.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    escrever_licencas(resultados, saida, a.consulta)
    f = os.path.join(saida, "folha.jpg") if a.de else folha(resultados, saida)

    print(f"\n{len(resultados)} resultados em {saida}")
    for r in resultados:
        extra = f" {r.get('largura')}x{r.get('altura')}" if r.get("largura") else ""
        extra += f" {r['duracao']:.0f}s" if isinstance(r.get("duracao"), (int, float)) and r.get("duracao") else ""
        print(f"  #{r['n']:<3} [{r['uso']:<13}] {r['fonte']:<18} {r['titulo'][:60]}{extra}")
    if f:
        print(f"\nFolha de miniaturas: {f}")


if __name__ == "__main__":
    main()
