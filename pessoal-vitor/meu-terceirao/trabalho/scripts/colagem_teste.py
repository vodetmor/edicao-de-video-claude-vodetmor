"""Quadros de teste da tipografia da "Aula da Saudade": letras de colagem (bilhete de resgate) e palavra com foto dentro.
Rodar: python -I trabalho/scripts/colagem_teste.py   -> grava trabalho/previa/saudade-teste/q1.png q2.png q3.png
"""
import glob
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE = "C:/dev/maquina-de-editar/pessoal-vitor/meu-terceirao/trabalho"
F = f"{BASE}/fontes-saudade"
OUT = f"{BASE}/previa/saudade-teste"
os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080

FONTES = ["AbrilFatface-Regular", "AlfaSlabOne-Regular", "Bevan-Regular", "Pacifico-Regular", "Shrikhand-Regular",
          "Rye-Regular", "DMSerifDisplay-Regular", "DMSerifDisplay-Italic", "Bungee-Regular", "Lobster-Regular", "PlayfairDisplay-Italic"]
# papéis e tintas medidos nas referências do Vítor (azul-marinho, laranja, verde-água, rosa, mostarda, creme, vinho)
PAPEL = [("#23263a", "#f3e9d2"), ("#e07a3c", "#fbf1dc"), ("#3aa6a0", "#fbf1dc"), ("#e8588a", "#fff6e6"),
         ("#f0c64a", "#2b2a3a"), ("#f3ead6", "#8c2f3a"), ("#8c2f3a", "#f3ead6"), ("#7a5aa6", "#f7efe0"),
         ("#bcd6e6", "#2b2a3a"), ("#f2b8a2", "#3a2230"), ("#2f5d8a", "#f6e9c8"), ("#f3ead6", "#23263a")]


def ruido(w, h, forca, rng):
    a = np.random.default_rng(rng.randrange(1 << 30)).normal(0, forca, (h, w)).astype("float32")
    return a


def recorte(ch, tam, rng):
    """uma letra num pedaço de papel rasgado, com sombra; devolve RGBA"""
    fonte = ImageFont.truetype(f"{F}/{rng.choice(FONTES)}.ttf", int(tam * rng.uniform(0.85, 1.05)))
    papel, tinta = rng.choice(PAPEL)
    x0, y0, x1, y1 = fonte.getbbox(ch)
    gw, gh = x1 - x0, y1 - y0
    pw, ph = int(gw + tam * rng.uniform(0.28, 0.5)), int(gh + tam * rng.uniform(0.3, 0.55))
    m = 22
    im = Image.new("RGBA", (pw + 2 * m, ph + 2 * m), (0, 0, 0, 0))
    # contorno rasgado: cada lado em 7 pontos com desvio
    pts = []
    j = tam * 0.045
    for k in range(8):
        pts.append((m + pw * k / 7 + rng.uniform(-j, j) * (0 < k < 7), m + rng.uniform(-j, j)))
    for k in range(1, 7):
        pts.append((m + pw + rng.uniform(-j, j), m + ph * k / 7 + rng.uniform(-j, j)))
    for k in range(7, -1, -1):
        pts.append((m + pw * k / 7 + rng.uniform(-j, j) * (0 < k < 7), m + ph + rng.uniform(-j, j)))
    for k in range(6, 0, -1):
        pts.append((m + rng.uniform(-j, j), m + ph * k / 7 + rng.uniform(-j, j)))
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    cor = Image.new("RGBA", im.size, papel)
    # grão de papel
    g = np.array(cor).astype("float32")
    g[..., :3] += ruido(im.size[0], im.size[1], 7, rng)[..., None]
    cor = Image.fromarray(np.clip(g, 0, 255).astype("uint8"))
    cor.putalpha(mask)
    ImageDraw.Draw(cor).text((m + (pw - gw) / 2 - x0, m + (ph - gh) / 2 - y0), ch, fill=tinta, font=fonte)
    # sombra
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sh.putalpha(mask.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * 0.45)))
    out = Image.new("RGBA", (im.size[0] + 14, im.size[1] + 14), (0, 0, 0, 0))
    out.alpha_composite(sh, (9, 11))
    out.alpha_composite(cor, (0, 0))
    return out.rotate(rng.uniform(-9, 9), expand=True, resample=Image.BICUBIC)


def linha(base, texto, cx, cy, tam, rng, espaco=0.82):
    """escreve o texto com recortes, centrado em (cx, cy); espaço entre palavras maior"""
    pecas = []
    for c in texto:
        pecas.append(None if c == " " else recorte(c.upper() if rng.random() < 0.7 else c.lower(), tam, rng))
    larg = sum((p.size[0] * espaco if p else tam * 0.5) for p in pecas)
    x = cx - larg / 2
    for p in pecas:
        if p is None:
            x += tam * 0.5
            continue
        base.alpha_composite(p, (int(x), int(cy - p.size[1] / 2 + rng.uniform(-tam * 0.06, tam * 0.06))))
        x += p.size[0] * espaco


def fundo_papel(rng, cor=(232, 222, 202)):
    a = np.full((H, W, 3), cor, "float32")
    a += ruido(W, H, 5, rng)[..., None]
    y, x = np.mgrid[0:H, 0:W]
    v = 1 - 0.22 * (((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2) / 2
    a *= v[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype("uint8")).convert("RGBA")


def foto_crianca():
    fs = sorted(glob.glob(f"{BASE}/triagem/crianca/*.jpg"))
    return Image.open(fs[3]).convert("RGB"), fs[3]


rng = random.Random(7)

# q1: título em colagem sobre papel
q = fundo_papel(rng)
linha(q, "aula da", W / 2, 360, 150, rng)
linha(q, "saudade", W / 2, 650, 178, rng, 0.8)
q.convert("RGB").save(f"{OUT}/q1.png")

# q2: verso em colagem por cima de uma foto de infância escurecida e em P&B
foto, nome = foto_crianca()
foto = foto.resize((W, int(W * foto.size[1] / foto.size[0])))
foto = foto.crop((0, max(0, (foto.size[1] - H) // 2), W, max(0, (foto.size[1] - H) // 2) + H)).convert("L").convert("RGB")
fa = np.array(foto).astype("float32") * 0.55 + np.array([30, 22, 14])
q = Image.fromarray(np.clip(fa, 0, 255).astype("uint8")).convert("RGBA")
linha(q, "tudo em", W / 2, 400, 130, rng)
linha(q, "volta", W / 2, 640, 190, rng)
q.convert("RGB").save(f"{OUT}/q2.png")

# q3: palavra enorme em serifa itálica com a foto DENTRO das letras (outra família de tipografia, momento íntimo)
fonte = ImageFont.truetype(f"{F}/PlayfairDisplay-Italic.ttf", 420)
mk = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(mk)
x0, y0, x1, y1 = d.textbbox((0, 0), "solidão", font=fonte)
d.text(((W - (x1 - x0)) / 2 - x0, (H - (y1 - y0)) / 2 - y0), "solidão", fill=255, font=fonte)
import json
RO = json.load(open("C:/dev/maquina-de-editar/estudio/motor/src/obras/terceirao/rostos.json"))
idf = "a50"
foto2 = Image.open(f"C:/dev/maquina-de-editar/estudio/motor/public/final/p/{idf}.jpg").convert("RGB")
k = W / foto2.size[0] * 1.15
foto2 = foto2.resize((int(foto2.size[0] * k), int(foto2.size[1] * k)))
oy = int(H * 0.5 - RO[idf]["y"] * foto2.size[1])
oy = min(0, max(H - foto2.size[1], oy))
ox = (W - foto2.size[0]) // 2
f2 = Image.new("RGB", (W, H), (0, 0, 0))
f2.paste(foto2, (ox, oy))
from PIL import ImageEnhance
f2 = ImageEnhance.Contrast(ImageEnhance.Brightness(f2.convert("L").convert("RGB")).enhance(1.35)).enhance(1.1)
fundo = Image.new("RGB", (W, H), (20, 17, 14))
fundo.paste(f2, (0, 0), mk)
# contorno fino creme para a letra não sumir
borda = mk.filter(ImageFilter.MaxFilter(5))
ImageDraw.Draw(fundo)
contorno = Image.new("RGB", (W, H), (233, 223, 204))
fundo.paste(contorno, (0, 0), Image.composite(borda, Image.new("L", (W, H), 0), borda).point(lambda v: v if v < 255 else 0).filter(ImageFilter.GaussianBlur(0.6)))
fundo.save(f"{OUT}/q3.png")
print("ok", nome)
