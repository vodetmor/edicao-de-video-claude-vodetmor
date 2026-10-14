"""Recorta os PNG 3D (preço A/B em 2160, caixa) até o conteúdo útil e limpa o véu do 'shadow catcher':
tira o alfa de fundo medido na borda e esfuma a sombra numa elipse, para não aparecer o quadrado no fundo.
Uso: python3 prepara.py <precoA.png> <precoB.png>"""
import sys, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))

def limpa(im):
    a = np.asarray(im).astype(np.float32).copy()
    al = a[..., 3]
    borda = np.concatenate([al[:8].ravel(), al[-8:].ravel(), al[:, :8].ravel(), al[:, -8:].ravel()])
    base = np.percentile(borda, 90)
    h, w = al.shape
    y, x = np.mgrid[0:h, 0:w]
    r = np.sqrt(((x - w / 2) / (w * .48)) ** 2 + ((y - h * .55) / (h * .48)) ** 2)
    fall = np.clip((1 - r) / .35, 0, 1) ** 1.5
    sombra = al < 250
    al2 = np.where(sombra, np.clip((al - base) / (255 - base) * 255, 0, 255) * fall, al)
    a[..., 3] = al2
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def corta(src, dst, lim=12, pad=24):
    im = limpa(Image.open(src).convert('RGBA'))
    x0, y0, x1, y1 = im.split()[3].point(lambda v: 255 if v > lim else 0).getbbox()
    im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))).save(dst)

corta(sys.argv[1], os.path.join(HERE, 'img/precoA.png'))
corta(sys.argv[2], os.path.join(HERE, 'img/precoB.png'))
corta(os.path.join(HERE, 'img/caixa_80.webp'), os.path.join(HERE, 'img/caixa.png'))
