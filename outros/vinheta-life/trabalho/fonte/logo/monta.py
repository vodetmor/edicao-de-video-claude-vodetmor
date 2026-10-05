"""Monta a logo 'life' limpa a partir das medidas (geometria.py -> geo.json) com shapely.
Anel e letras retas = geometria exata; gancho do f e o e = contorno do PNG suavizado (potrace).
Saída: logo/logo.json (peças como caminhos SVG em px do PNG 480x299) e logo/life-limpa.svg."""
import json, numpy as np, potrace
from PIL import Image
from scipy import ndimage
from shapely.geometry import Polygon, box, Point, MultiPolygon
from shapely.ops import unary_union
from shapely import affinity
D = '/mnt/project-files/vinheta-life/trabalho/'
g = json.load(open(D + 'fonte/logo/geo.json'))
cx, cy, bx, by, r, w = g['cx'], g['cy'], g['bx'], g['by'], g['r'], g['w']
core = Polygon([(cx, cy - by), (cx + bx, cy), (cx, cy + by), (cx - bx, cy)])
ext = core.buffer(r, quad_segs=48)
inn = core.buffer(r - w, quad_segs=48)
anel = ext.difference(inn)
dentro = core.buffer(r - w + 3, quad_segs=48)   # letras entram 3 px por baixo do anel

# --- medidas (perfil subpixel no PNG)
L = (155.2, 177.55); I = (191.93, 213.33, 110.83); F = (230.12, 251.87); BAR = (222.42, 270.61, 116.03, 135.53)
PINGO = (202.24 + 0.4, 92.97, 10.6)
k = by / bx
l = box(L[0], 0, L[1], 299).intersection(dentro)
# haste do i: corte de baixo paralelo à aresta inferior esquerda do anel (y sobe 0,807 por px para a esquerda)
yb = 190.8
haste = Polygon([(I[0], I[2]), (I[1], I[2]), (I[1], yb), (I[0], yb - k * (I[1] - I[0]))])
haste = haste.buffer(-1.2, join_style=1).buffer(1.2, join_style=1)  # cantos levemente macios como no original
pingo = Point(PINGO[0], PINGO[1]).buffer(PINGO[2], quad_segs=32)

# --- contornos suavizados do PNG
im = np.asarray(Image.open(D + 'referencias/logo-life.png').convert('RGB')).astype(float)
a = np.clip((255 - im[..., 2]) / (255 - 35), 0, 1)
S = 8
big = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((480 * S, 299 * S), Image.BICUBIC)) / 255
big = ndimage.gaussian_filter(big, S * 0.9) > 0.5
def poligonos(mask):
    out = []
    for c in potrace.Bitmap(~mask).trace(turdsize=200, alphamax=1.2, opticurve=True, opttolerance=1.0):
        pts = [(c.start_point.x, c.start_point.y)]
        for s in c:
            if s.is_corner: pts += [(s.c.x, s.c.y), (s.end_point.x, s.end_point.y)]
            else:
                p0 = np.array(pts[-1]); p1 = np.array([s.c1.x, s.c1.y]); p2 = np.array([s.c2.x, s.c2.y]); p3 = np.array([s.end_point.x, s.end_point.y])
                for t in np.linspace(0, 1, 16)[1:]:
                    pts.append(tuple((1-t)**3*p0 + 3*(1-t)**2*t*p1 + 3*(1-t)*t*t*p2 + t**3*p3))
        out.append(Polygon([(x / S, y / S) for x, y in pts]))
    # nível par-ímpar: maior = contorno, contidos = buracos
    out.sort(key=lambda p: -p.area); res = None
    for p in out:
        res = p if res is None else (res.difference(p) if res.contains(p.representative_point()) and res.contains(p) else res.union(p))
    return res
lado = lambda x0, x1, y0, y1: box(x0, y0, x1, y1)
tudo = poligonos(big)
gancho = tudo.intersection(lado(F[0], 290, 70, 112)).intersection(inn.buffer(-0.5))
f = unary_union([box(F[0], BAR[2], F[1], 299).intersection(dentro), box(BAR[0], BAR[2], BAR[1], BAR[3]).buffer(-1.0, join_style=1).buffer(1.0, join_style=1), gancho, box(F[0], 111, F[1], BAR[2] + 1)])
f = f.buffer(3, join_style=1).buffer(-3, join_style=1)  # fecha os degraus da emenda gancho/haste
e0 = tudo.intersection(lado(274, 380, 100, 240)).intersection(inn.buffer(-0.3))
e0 = max(e0.geoms, key=lambda p: p.area) if hasattr(e0, 'geoms') else e0
e = e0.union(tudo.intersection(dentro).intersection(e0.buffer(4)))
e = MultiPolygon([p for p in (e.geoms if hasattr(e, 'geoms') else [e]) if p.area > 50]) if hasattr(e, 'geoms') else e

def svgd(geom):
    gs = geom.geoms if hasattr(geom, 'geoms') else [geom]
    d = ''
    for p in gs:
        for ring in [p.exterior] + list(p.interiors):
            cs = list(ring.coords)
            d += 'M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in cs[:-1]) + 'Z'
    return d
pecas = {'anel': anel, 'l': l, 'i': haste, 'pingo': pingo, 'f': f, 'e': e}
saida = {'cor': '#E85E23', 'vb': [480, 299], 'centro': [cx, cy], 'geo': g,
         'pecas': {n: {'d': svgd(p), 'bbox': list(p.bounds), 'c': list(p.centroid.coords[0])} for n, p in pecas.items()},
         'interior': svgd(inn), 'dentro': svgd(dentro)}
json.dump(saida, open(D + 'fonte/logo/logo.json', 'w'))
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 299"><g fill="#E85E23" fill-rule="evenodd">' + ''.join(f'<path d="{v["d"]}"/>' for v in saida['pecas'].values()) + '</g></svg>'
open(D + 'fonte/logo/life-limpa.svg', 'w').write(svg)
print({n: round(p.area, 1) for n, p in pecas.items()})
