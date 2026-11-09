#!/usr/bin/env python3
"""PDF de aprovação curto e objetivo: capa, quadros-chave de cada vídeo, som e checklist "para aprovar".

Uso:
    python gera_pdf.py caminho/plano.json            -> gera aprovacao.html e o PDF ao lado do plano.json
    python gera_pdf.py plano.json -o meu-plano.pdf   -> nome do PDF
    python gera_pdf.py plano.json --so-html          -> só o HTML (para olhar no navegador)

Sem dependências além do Python 3: o PDF sai do Chrome ou do Edge que já está instalado (modo headless).
Se o navegador não for achado sozinho, passe o caminho em CHROME=... (variável de ambiente).
As imagens no plano.json são caminhos relativos à pasta do plano.json.
Os textos aceitam <b> e <em> (em = cor de destaque nos títulos).
"""
import argparse, html, json, math, os, shutil, subprocess, sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent

TEMA_PADRAO = {  # direção Apple do DESIGN-SYSTEM: fundo claro, um azul, Inter
    "acento": "#0071E3", "acento_texto": "#0066CC", "sobre_acento": "#FFFFFF",
    "fundo": "#F5F5F7", "cartao": "#FFFFFF", "linha": "#E3E3E8",
    "tinta": "#1D1D1F", "tinta_2": "#3A3A3F", "cinza": "#86868B",
    "escuro": "#1D1D1F", "papel": "#F5F5F7", "papel_2": "#C9C9CE",
    "fonte_titulo": "Inter",          # "Inter" ou "Archivo" (condensada, títulos fortes)
    "titulo_caixa_alta": False,
    "capa_escura": True, "aprovar_escura": True,
}

PROPORCOES = {"9:16": 9 / 16, "4:5": 4 / 5, "1:1": 1.0, "16:9": 16 / 9}
POR_PAGINA = {"9:16": 16, "4:5": 10, "1:1": 10, "16:9": 8}


def e(t):
    """Texto do plano: escapa tudo menos <b>, <em> e <br>."""
    s = html.escape(str(t), quote=False)
    for tag in ("b", "em", "br"):
        s = s.replace(f"&lt;{tag}&gt;", f"<{tag}>").replace(f"&lt;/{tag}&gt;", f"</{tag}>")
    return s.replace("&lt;br/&gt;", "<br>")


def css_vars(t):
    archivo = t["fonte_titulo"].lower() == "archivo"
    v = {k.replace("_", "-"): t[k] for k in ("acento", "acento_texto", "sobre_acento", "fundo", "cartao", "linha",
                                             "tinta", "tinta_2", "cinza", "escuro", "papel", "papel_2")}
    v.update({
        "fonte-titulo": "Archivo, Inter, sans-serif" if archivo else "Inter, sans-serif",
        "titulo-largura": "62%" if archivo else "100%",
        "titulo-caixa": "uppercase" if (t["titulo_caixa_alta"] or archivo) else "none",
        "titulo-espaco": "0" if archivo else "-.025em",
        "h1": "64pt" if archivo else "46pt",
        "h2": "28pt" if archivo else "22pt",
    })
    return ":root{" + ";".join(f"--{k}:{val}" for k, val in v.items()) + "}"


def fontes_css():
    f = (AQUI / "fontes").as_uri()
    return (f"@font-face{{font-family:Inter;src:url({f}/inter-latin-opsz-normal.woff2) format('woff2');font-weight:100 900}}"
            f"@font-face{{font-family:Archivo;src:url({f}/archivo-latin-wdth-normal.woff2) format('woff2');"
            f"font-weight:100 900;font-stretch:62% 125%}}")


def melhor_grade(n, a, larg=267.0, alt=128.0, gap=3.4, legenda=7.5, maximo=60.0):
    """Escolhe linhas x colunas que deixam os quadros maiores na área livre da página (mm)."""
    melhor = (0, 1, n)
    for r in range(1, 5):
        c = math.ceil(n / r)
        w = min((larg - (c - 1) * gap) / c, ((alt - r * legenda - (r - 1) * 4) / r) * a, maximo)
        if w > melhor[0] * 1.05:  # quase empate: fica com menos linhas
            melhor = (w, r, c)
    return melhor


def pagina_quadros(v, quadros, a, prop, parte, total, rod):
    tem_jornada = bool(v.get("jornada")) and parte == 1
    alt = 128.0 if tem_jornada else 140.0
    w, _, c = melhor_grade(len(quadros), a, alt=alt, maximo=60.0 if a < 1 else 80.0)
    figs = "".join(
        f'<figure><img src="{e(q["img"])}" style="aspect-ratio:{prop.replace(":", "/")}">'
        f'<figcaption><span>{e(q.get("id", ""))}{" · " + e(q["t"]) if q.get("t") else ""}</span>{e(q.get("legenda", ""))}</figcaption></figure>'
        for q in quadros)
    jr = ""
    if tem_jornada:
        jr = '<div class="jrs">' + "".join(f'<div class="jr"><b>{e(j["titulo"])}</b>{e(j["texto"])}</div>' for j in v["jornada"]) + "</div>"
    etiqueta = e(v.get("etiqueta", ""))
    if total > 1:
        etiqueta += f" · {parte} de {total}"
    ideia = f'<p class="ideia">{e(v["ideia"])}</p>' if v.get("ideia") and parte == 1 else '<div style="height:5mm"></div>'
    return (f'<div class="pg"><div class="k">{etiqueta}</div><h2>{e(v["titulo"])}</h2>{ideia}{jr}'
            f'<div class="grid" style="grid-template-columns:repeat({c},{w:.1f}mm)">{figs}</div>{rod}</div>')


def pagina_roteiro(v, rod):
    """Página opcional de roteiro: narração inteira + tabela cena a cena (tempo, fala, direção)."""
    r = v["roteiro"]
    linhas = "".join(f"<tr><td>{e(c.get('t', ''))}</td><td>{e(c.get('fala', ''))}</td><td>{e(c.get('direcao', ''))}</td></tr>"
                     for c in r.get("cenas", []))
    tab = f'<table class="rot"><tr><th>tempo</th><th>fala</th><th>direção da cena</th></tr>{linhas}</table>' if linhas else ""
    nar = f'<div class="card"><h3>Narração completa</h3><p>{e(r["narracao"])}</p></div>' if r.get("narracao") else ""
    nar += "".join(f'<div class="card"><h3>{e(c["titulo"])}</h3><p>{e(c["texto"])}</p></div>' for c in r.get("cartoes", []))
    return (f'<div class="pg"><div class="k">{e(v.get("etiqueta", ""))} · Roteiro</div><h2>{e(v["titulo"])}</h2>'
            f'{nar}{tab}{rod}</div>')


def monta(plano, tema):
    prop = plano.get("formato", "9:16")
    a = PROPORCOES.get(prop)
    if a is None:
        sys.exit(f"formato '{prop}' não reconhecido; use um de {list(PROPORCOES)}")
    rodape = e(plano.get("rodape", "Para aprovação"))
    paginas = []

    # capa
    c = plano.get("capa", {})
    esc = " escuro" if tema["capa_escura"] else ""
    logo = f'<img src="{e(c["logo"])}" style="height:{c.get("logo_altura_mm", 17)}mm;margin-top:3mm">' if c.get("logo") else ""
    titulo = e(c.get("titulo", plano.get("titulo", "")))
    if c.get("titulo_destaque"):
        titulo += f'<br><em>{e(c["titulo_destaque"])}</em>'
    imgs = c.get("imagens", [])[:3]
    iw = {1: 70, 2: 52, 3: 36}.get(len(imgs), 52) if a < 1 else {1: 110, 2: 80, 3: 60}.get(len(imgs), 80)
    if a >= 1:  # quadros deitados: empilha
        bloco = "".join(f'<img src="{e(p)}" style="width:{iw}mm;margin-left:{i*10}mm">' for i, p in enumerate(imgs))
        imgs_html = f'<div class="capa-imgs" style="flex-direction:column">{bloco}</div>' if imgs else ""
    else:
        bloco = "".join(f'<img src="{e(p)}" style="width:{iw}mm;margin-top:{(i % 2) * 16}mm">' for i, p in enumerate(imgs))
        imgs_html = f'<div class="capa-imgs">{bloco}</div>' if imgs else ""
    nums = ""
    if c.get("numeros"):
        nums = '<div class="capa-nums">' + "".join(
            f'<div><div class="big">{e(n["n"])}</div><p>{e(n["texto"])}</p></div>' for n in c["numeros"]) + "</div>"
    atos = ""
    if c.get("atos"):
        n = len(c["atos"])
        atos = (f'<div class="atos" style="grid-template-columns:repeat({n},1fr)">'
                + "".join(f'<div class="ato"><div class="k">{e(x["titulo"])}</div><div>{e(x["texto"])}</div></div>' for x in c["atos"]) + "</div>")
    texto = f'<p>{e(c["texto"])}</p>' if c.get("texto") else ""
    paginas.append(f'<div class="pg capa{esc}">{logo}<div class="capa-txt"><div class="k">{e(c.get("chamada", "Para aprovação"))}</div>'
                   f'<h1 style="margin-top:4mm">{titulo}</h1>{texto}</div>{imgs_html}{nums}{atos}{{ROD}}</div>')

    # quadros-chave de cada vídeo (quebra sozinho em mais páginas se tiver muitos)
    lim = plano.get("quadros_por_pagina", POR_PAGINA[prop])
    for v in plano.get("videos", []):
        qs = v["quadros"]
        partes = max(1, math.ceil(len(qs) / lim))
        tam = math.ceil(len(qs) / partes)
        for i in range(partes):
            paginas.append(pagina_quadros(v, qs[i * tam:(i + 1) * tam], a, prop, i + 1, partes, "{ROD}"))
        if v.get("roteiro"):
            paginas.append(pagina_roteiro(v, "{ROD}"))

    # som
    s = plano.get("som")
    if s:
        cards = "".join(f'<div class="card"><h3>{e(x["titulo"])}</h3><p>{e(x["texto"])}</p></div>' for x in s.get("cartoes", []))
        linhas = "".join(f"<tr><td>{e(m)}</td><td>{e(f)}</td></tr>" for m, f in s.get("efeitos", []))
        tabela = f'<table><tr><th>momento</th><th>efeito sonoro</th></tr>{linhas}</table>' if linhas else ""
        corpo = f'<div class="cols"><div>{cards}</div>{tabela}</div>' if tabela else f'<div style="width:150mm">{cards}</div>'
        paginas.append(f'<div class="pg"><div class="k">Som</div><h2>{e(s.get("titulo", "Composição audiovisual"))}</h2>'
                       f'<p class="ideia">{e(s.get("texto", ""))}</p>{corpo}{{ROD}}</div>')

    # aprovar
    ap = plano.get("aprovar")
    if ap:
        esc = " escuro" if tema["aprovar_escura"] else ""
        itens = "".join(f'<div class="ok"><i></i><div>{e(x["texto"])}{"<small>" + e(x["nota"]) + "</small>" if x.get("nota") else ""}</div></div>'
                        for x in ap.get("itens", []))
        fim = f'<p class="nota-fim">{e(ap["nota_final"])}</p>' if ap.get("nota_final") else ""
        paginas.append(f'<div class="pg{esc}"><div class="k">Aprovação</div><h2>{e(ap.get("titulo", "Para aprovar"))}</h2>'
                       f'<div class="oks">{itens}</div>{fim}{{ROD}}</div>')

    total = len(paginas)
    paginas = [p.replace("{ROD}", f'<div class="rod"><span>{rodape}</span><span>{i}/{total}</span></div>') for i, p in enumerate(paginas, 1)]
    estilo = (AQUI / "template" / "estilo.css").read_text(encoding="utf-8")
    return (f'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>{e(plano.get("titulo", "Aprovação"))}</title>'
            f'<style>{fontes_css()}{css_vars(tema)}{estilo}</style><body>{"".join(paginas)}</body></html>'), total


def acha_navegador():
    if os.environ.get("CHROME"):
        return os.environ["CHROME"]
    cands = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/opt/pw-browsers/chromium",
    ]
    for c in cands:
        if os.path.isfile(c):
            return c
    for nome in ("google-chrome", "chromium", "chromium-browser", "chrome", "msedge", "microsoft-edge"):
        p = shutil.which(nome)
        if p:
            return p
    # Chromium do Playwright, se existir
    for base in ("/opt/pw-browsers", os.path.expanduser("~/.cache/ms-playwright"), os.path.expandvars(r"%LOCALAPPDATA%\ms-playwright")):
        for p in sorted(Path(base).glob("chromium-*/chrome-*/chrome*"), reverse=True) if os.path.isdir(base) else []:
            if p.name in ("chrome", "chrome.exe"):
                return str(p)
    return None


def imprime(html_path, pdf_path):
    nav = acha_navegador()
    if not nav:
        sys.exit("Não achei Chrome nem Edge. Abra o aprovacao.html no navegador e use Imprimir > Salvar como PDF "
                 "(margens: nenhuma, gráficos de fundo: ligado), ou defina CHROME=caminho/do/chrome.")
    cmd = [nav, "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--no-pdf-header-footer",
           "--allow-file-access-from-files", "--virtual-time-budget=15000",
           f"--print-to-pdf={pdf_path}", Path(html_path).resolve().as_uri()]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if not Path(pdf_path).is_file():
        sys.exit(f"O navegador não gerou o PDF.\n{r.stderr[-1500:]}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("plano", help="plano.json")
    ap.add_argument("-o", "--saida", help="nome do PDF (padrão: o 'arquivo' do plano ou aprovacao.pdf)")
    ap.add_argument("--so-html", action="store_true")
    a = ap.parse_args()
    plano_path = Path(a.plano).resolve()
    plano = json.loads(plano_path.read_text(encoding="utf-8"))
    tema = {**TEMA_PADRAO, **plano.get("tema", {})}
    pasta = plano_path.parent
    faltando = [q["img"] for v in plano.get("videos", []) for q in v["quadros"] if not (pasta / q["img"]).is_file()]
    if faltando:
        print("AVISO, imagens não encontradas:", ", ".join(faltando[:8]), file=sys.stderr)
    doc, n = monta(plano, tema)
    html_path = pasta / "aprovacao.html"
    html_path.write_text(doc, encoding="utf-8")
    print(f"HTML: {html_path} ({n} páginas)")
    if a.so_html:
        return
    pdf = Path(a.saida) if a.saida else pasta / plano.get("arquivo", "aprovacao.pdf")
    if not pdf.is_absolute():
        pdf = (Path.cwd() / pdf) if a.saida else pdf
    imprime(html_path, pdf.resolve())
    print(f"PDF:  {pdf.resolve()}")


if __name__ == "__main__":
    main()
