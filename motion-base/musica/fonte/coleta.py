"""Coleta candidatas de música livre (só licenças que servem para TikTok/Instagram) em várias fontes.

Uso: python3 coleta.py            -> grava trabalho/candidatas.json e baixa os mp3 em trabalho/candidatas/
Fontes: Scott Buckley (CC BY 4.0), ccMixter (CC BY / CC0), Jamendo (só CC BY), Freesound (CC0 / CC BY).
Licenças NC (não comercial), ND (sem derivação) e SA ficam fora: a gente sincroniza com imagem (derivação)
e o perfil pode monetizar.
Chaves: lê JAMENDO_CLIENT_ID e FREESOUND_API_KEY de ferramentas/busca/chaves.env ou escola-consciencia-negra/edicao/.env.
"""
import json, os, re, sys, time, html, urllib.parse, urllib.request, http.client
http.client._MAXLINE = 1 << 20  # ccMixter manda cabeçalho gigante
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

AQUI = Path(__file__).resolve().parent.parent
TRAB = AQUI / "trabalho"; CAND = TRAB / "candidatas"; CAND.mkdir(parents=True, exist_ok=True)
P = Path("/mnt/project-files")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

def chaves():
    ch = {}
    for f in (P / "ferramentas/busca/chaves.env", P / "escola-consciencia-negra/edicao/.env"):
        if f.exists():
            for l in f.read_text().splitlines():
                if "=" in l and not l.startswith("#"):
                    k, v = l.split("=", 1); ch.setdefault(k.strip(), v.strip().strip('"\''))
    return ch
CH = chaves()

def pega(url, binario=False, tent=3):
    for i in range(tent):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA, **({"Referer": "https://ccmixter.org/"} if "ccmixter" in url else {})}), timeout=60).read()
            return r if binario else r.decode("utf-8", "replace")
        except Exception as e:
            if i == tent - 1: raise
            time.sleep(2 * (i + 1))

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]

# ---------- Scott Buckley ----------
def scott():
    itens = {}
    for n in range(1, 40):
        url = "https://www.scottbuckley.com.au/library/" + (f"page/{n}/" if n > 1 else "")
        try: h = pega(url)
        except Exception: break
        achou = re.findall(r'class="([^"]*hentry[^"]*)">\s*<h2 class="post-title pad">\s*<a href="([^"]+)" rel="bookmark" title="([^"]*)"', h)
        if not achou: break
        for cls, u, tit in achou:
            tags = [c.replace("genre-", "genero:").replace("mood-", "clima:").replace("instrumentation-", "instr:")
                    for c in cls.split() if c.startswith(("genre-", "mood-", "instrumentation-"))]
            itens[u] = (html.unescape(tit), tags)
    def um(par):
        u, (titulo, tags) = par
        try: h = pega(u)
        except Exception: return None
        mp3 = re.findall(r'(https://www.scottbuckley.com.au/library/wp-content/uploads/[^"\']+\.mp3)', h)
        if not mp3: return None
        return dict(fonte="scottbuckley", id="sb-" + slug(titulo), titulo=titulo, artista="Scott Buckley",
                    licenca="CC BY 4.0", licenca_url="https://creativecommons.org/licenses/by/4.0/",
                    pagina=u, audio=mp3[0], tags=tags, desc="")
    with ThreadPoolExecutor(6) as ex:
        return [r for r in ex.map(um, sorted(itens.items())) if r]

# ---------- ccMixter ----------
CCM_TAGS = ["piano", "ambient", "cinematic", "chill", "acoustic", "lofi", "electronica", "suspense", "soundtrack",
            "guitar", "downtempo", "uplifting", "film_score", "minimal", "classical"]
def ccmixter():
    vistos, out = set(), []
    for lic in ("by", "cc0"):
        for tg in CCM_TAGS:
            url = "https://ccmixter.org/api/query?" + urllib.parse.urlencode(
                dict(f="json", lic=lic, limit=25, tags=f"instrumental,{tg}", sort="rank"))
            try: d = json.loads(pega(url))
            except Exception as e: print("ccmixter", tg, e); continue
            for r in d:
                if r["upload_id"] in vistos: continue
                mp3 = [f["download_url"] for f in r.get("files", []) if f.get("download_url", "").lower().endswith(".mp3")]
                if not mp3: continue
                vistos.add(r["upload_id"])
                ln = r.get("license_name", "")
                out.append(dict(fonte="ccmixter", id=f"ccm-{r['upload_id']}", titulo=html.unescape(r["upload_name"]),
                                artista=r["user_name"], licenca=("CC0" if "zero" in ln.lower() or lic == "cc0" else "CC BY " + (re.search(r"\(([\d.]+)\)", ln) or [0, "3.0"])[1]),
                                licenca_url=r.get("license_url", ""), pagina=r.get("file_page_url", ""), audio=mp3[0],
                                tags=[x for x in (r.get("upload_tags") or "").split(",") if x], desc=""))
    return out

# ---------- Jamendo (só CC BY) ----------
JAM_TAGS = ["piano", "ambient", "cinematic", "chillout", "acoustic", "lounge", "electronic+ambient", "soundtrack",
            "corporate", "inspirational", "suspense", "dark+ambient", "lofi", "minimal", "documentary", "emotional", "epic"]
def jamendo():
    cid = CH.get("JAMENDO_CLIENT_ID")
    if not cid: print("sem chave Jamendo"); return []
    vistos, out = set(), []
    for tg in JAM_TAGS:
        url = (f"https://api.jamendo.com/v3.0/tracks/?client_id={cid}&format=json&limit=200&include=licenses+musicinfo"
               f"&order=popularity_total&vocalinstrumental=instrumental&audioformat=mp32&fuzzytags={tg}")
        try: d = json.loads(pega(url))["results"]
        except Exception as e: print("jamendo", tg, e); continue
        n = 0
        for t in d:
            lu = t.get("license_ccurl", "")
            if not re.search(r"/licenses/by/", lu) and "publicdomain/zero" not in lu: continue
            if t["id"] in vistos or not t.get("audiodownload_allowed"): continue
            if not (60 <= int(t.get("duration") or 0) <= 420): continue
            vistos.add(t["id"]); n += 1
            mi = t.get("musicinfo") or {}
            out.append(dict(fonte="jamendo", id=f"jam-{t['id']}", titulo=t["name"], artista=t["artist_name"],
                            licenca="CC BY " + (re.search(r"by/([\d.]+)", lu).group(1) if "by/" in lu else ""), licenca_url=lu,
                            pagina=t.get("shareurl", ""), audio=t.get("audiodownload") or t.get("audio"),
                            tags=sum([(mi.get("tags") or {}).get(k, []) for k in ("genres", "instruments", "vartags")], []), desc=""))
            if n >= 25: break
    return out

# ---------- Freesound (CC0 / CC BY, faixas inteiras) ----------
def freesound():
    key = CH.get("FREESOUND_API_KEY")
    if not key: print("sem chave Freesound"); return []
    out, vistos = [], set()
    for q in ["piano music", "ambient music", "cinematic music", "chill music", "acoustic guitar music", "lofi", "soundtrack", "suspense music", "uplifting music"]:
        url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode(dict(
            query=q, page_size=40, sort="rating_desc", token=key,
            filter='duration:[60 TO 400] (license:"Creative Commons 0" OR license:"Attribution") tag:music',
            fields="id,name,username,license,url,previews,tags,duration,description"))
        try: d = json.loads(pega(url))["results"]
        except Exception as e: print("freesound", q, e); continue
        for s in d:
            if s["id"] in vistos: continue
            vistos.add(s["id"])
            lic = "CC0" if "zero" in s["license"] else "CC BY 4.0" if "4.0" in s["license"] else "CC BY 3.0"
            out.append(dict(fonte="freesound", id=f"fs-{s['id']}", titulo=s["name"].rsplit(".", 1)[0], artista=s["username"],
                            licenca=lic, licenca_url=s["license"], pagina=s["url"], audio=s["previews"]["preview-hq-mp3"],
                            tags=s.get("tags", []), desc=re.sub(r"\s+", " ", s.get("description", ""))[:300]))
    return out

def baixa(c):
    f = CAND / f"{c['id']}.mp3"
    if f.exists() and f.stat().st_size > 50000: return str(f)
    try:
        f.write_bytes(pega(c["audio"], binario=True)); return str(f)
    except Exception as e:
        print("falhou", c["id"], e); return None

if __name__ == "__main__":
    todas = []
    for nome, fn in [("scott", scott), ("ccmixter", ccmixter), ("jamendo", jamendo), ("freesound", freesound)]:
        r = fn(); print(nome, len(r)); todas += r
    with ThreadPoolExecutor(8) as ex:
        arqs = list(ex.map(baixa, todas))
    for c, a in zip(todas, arqs): c["arquivo"] = a
    todas = [c for c in todas if c["arquivo"]]
    (TRAB / "candidatas.json").write_text(json.dumps(todas, ensure_ascii=False, indent=1))
    print("total baixadas", len(todas))
