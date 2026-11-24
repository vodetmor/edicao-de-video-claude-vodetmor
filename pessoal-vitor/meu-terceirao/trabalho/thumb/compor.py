"""Thumb da Aula da Saudade: troca as fotos inventadas da imagem do Flow por fotos reais da 232, na perspectiva de cada moldura.
Rodar: python -I compor.py [--linhas]"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

P = "C:/dev/maquina-de-editar/estudio/motor/public/final/p"
base = Image.open("base.png").convert("RGB")
W, H = base.size
SS = 3  # supersample


def homog(src, dst):
    A = []
    for (x, y), (u, v) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array(dst).reshape(8)
    return np.linalg.solve(np.array(A, float), b)


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def inset(q, f):
    # ponto (u,v) bilinear dentro do quadrilátero TL TR BR BL
    def pt(u, v):
        return lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v)
    return [pt(f, f), pt(1 - f, f), pt(1 - f, 1 - f), pt(f, 1 - f)]


def dist(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def cola(out, q, foto, foco=(0.5, 0.5), sepia=False, blur=0.0, luz=1.0, evita=None):
    q = [(x * SS, y * SS) for x, y in q]
    asp = (dist(q[0], q[1]) + dist(q[3], q[2])) / (dist(q[0], q[3]) + dist(q[1], q[2]))
    im = ImageOps.exif_transpose(Image.open(f"{P}/{foto}.jpg")).convert("RGB")
    iw, ih = im.size
    if iw / ih > asp:
        cw, ch = ih * asp, ih
    else:
        cw, ch = iw, iw / asp
    cx = min(max(foco[0] * iw, cw / 2), iw - cw / 2); cy = min(max(foco[1] * ih, ch / 2), ih - ch / 2)
    im = im.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2)))
    if sepia:
        g = np.asarray(ImageOps.autocontrast(im.convert("L"), cutoff=1)).astype(float) / 255
        tom_esc, tom_cla = np.array([42, 24, 10]), np.array([242, 192, 132])
        im = Image.fromarray((tom_esc + (tom_cla - tom_esc) * (g ** 1.15)[..., None]).clip(0, 255).astype("uint8"))
    else:
        # luz quente do abajur: puxa para âmbar sem matar a cor
        a = np.asarray(im).astype(float)
        a = a * np.array([1.06, 0.97, 0.82]) * luz
        a = 255 * (a / 255) ** 1.05
        im = Image.fromarray(a.clip(0, 255).astype("uint8"))
    sw, sh = im.size
    src = [(0, 0), (sw, 0), (sw, sh), (0, sh)]
    coef = homog(q, src)  # saída -> entrada
    big = im.transform((W * SS, H * SS), Image.PERSPECTIVE, tuple(coef), Image.BICUBIC)
    m = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(m).polygon(q, fill=255)
    if evita:
        for e in evita:
            ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in e], fill=0)
    big = big.resize((W, H), Image.LANCZOS); m = m.resize((W, H), Image.LANCZOS)
    if blur:
        big = big.filter(ImageFilter.GaussianBlur(blur))
    # grão leve para casar com a textura da imagem
    a = np.asarray(big).astype(float) + np.random.default_rng(7).normal(0, 3.0, (H, W, 1))
    big = Image.fromarray(a.clip(0, 255).astype("uint8"))
    out.paste(big, (0, 0), m)


out = base.copy()
# fotos do fundo (desfocadas), primeiro a de trás
F_ext = [(322, 202), (558, 184), (633, 308), (365, 316)]
cola(out, [(228, 190), (374, 168), (408, 232), (248, 262)], "k04", (0.5, 0.4), blur=2.4, luz=0.9, evita=[F_ext, [(0, 0), (225, 0), (225, 341), (0, 341)]])
cola(out, [(352, 229), (557, 201), (602, 289), (395, 314)], "k01", (0.5, 0.35), blur=2.0, luz=0.95)
# página preta: duas antigas em sépia, redesenhadas inteiras (cartão creme + imagem) sobre a moldura medida pela máscara
P1 = [(93, 289), (415, 355), (349, 539), (3, 455)]
P2 = [(77, 516), (412, 582), (347, 747), (-4, 672)]


def cartao(out, q, cor):
    m = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in q], fill=255)
    m = m.resize((W, H), Image.LANCZOS)
    a = np.full((H, W, 3), cor, float) + np.random.default_rng(3).normal(0, 4.0, (H, W, 1))
    out.paste(Image.fromarray(a.clip(0, 255).astype("uint8")), (0, 0), m)


def interno(q, fu, fv):
    def pt(u, v):
        return lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v)
    return [pt(fu, fv), pt(1 - fu, fv), pt(1 - fu, 1 - fv), pt(fu, 1 - fv)]


cartao(out, P1, (246, 190, 126))
cola(out, interno(P1, 0.045, 0.07), "k03", (0.45, 0.42), sepia=True)
cartao(out, P2, (226, 164, 104))
cola(out, interno(P2, 0.045, 0.07), "k05", (0.5, 0.42), sepia=True)
# página marfim: polaroides de hoje
cola(out, [(655, 400), (887, 417), (865, 540), (622, 522)], "a40", (0.5, 0.56))
cola(out, [(917, 492), (1094, 552), (1052, 659), (870, 615)], "a45", (0.5, 0.5))
cola(out, [(582, 601), (821, 597), (828, 724), (581, 731)], "d25", (0.5, 0.45))
# soltas na mesa
cola(out, [(1335, 561), (1542, 617), (1497, 744), (1277, 685)], "a34", (0.5, 0.6))
cola(out, [(980, 732), (1200, 671), (1349, 837), (1100, 912)], "a21", (0.5, 0.5))

# devolve o que fica POR CIMA das fotos: fitas e cantoneiras
por_cima = [
    [(670, 375), (762, 375), (762, 398), (670, 402)],          # fita xadrez rosa
    [(1012, 483), (1120, 512), (1113, 545), (1008, 505)],       # fita verde de bolinhas
    [(582, 560), (680, 562), (678, 592), (585, 606)],           # fita amarela
]


def cantos(q, k=0.15):
    tri = []
    for i in range(4):
        c, a, b = q[i], q[(i + 1) % 4], q[(i - 1) % 4]
        tri.append([c, lerp(c, a, k), lerp(c, b, k)])
    return tri


por_cima += cantos(P1) + cantos(P2)
m = Image.new("L", (W, H), 0)
for p in por_cima:
    ImageDraw.Draw(m).polygon(p, fill=255)
out.paste(base, (0, 0), m)
if "--linhas" in sys.argv:
    d = ImageDraw.Draw(out)
    for p in por_cima:
        d.polygon(p, outline=(0, 255, 0))
out.save("thumb-aula-da-saudade.png")
out.convert("RGB").save("thumb-aula-da-saudade.jpg", quality=95)
print("ok", out.size)
