"""Vetoriza a logo 'life' (PNG 480x299) em SVG fiel: máscara suave -> 8x -> potrace.
Saída: logo/life.svg e logo/pecas.json (caminhos por componente, em coordenadas do PNG)."""
import json, numpy as np, potrace
from PIL import Image
from scipy import ndimage
D = '/mnt/project-files/vinheta-life/trabalho/'
im = np.asarray(Image.open(D + 'referencias/logo-life.png').convert('RGB')).astype(float)
# cor da marca: pixels bem saturados
sat = im.max(2) - im.min(2)
cor = np.median(im[sat > 150], axis=0)
print('laranja', cor, '#%02X%02X%02X' % tuple(int(c) for c in cor))
# fração de laranja por pixel (mistura linear branco->laranja, pelo canal azul que mais varia)
a = np.clip((255 - im[..., 2]) / (255 - cor[2]), 0, 1)
S = 8
big = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((im.shape[1] * S, im.shape[0] * S), Image.BICUBIC)) / 255
big = ndimage.gaussian_filter(big, S * 0.35)
m = big > 0.5
lab, n = ndimage.label(m)
print('componentes', n, [int((lab == i).sum() / S / S) for i in range(1, n + 1)])
pecas = []
for i in range(1, n + 1):
    comp = lab == i
    if comp.sum() / S / S < 20: continue
    bmp = potrace.Bitmap(~comp)  # potracer: False = tinta
    path = bmp.trace(turdsize=50, alphamax=1.0, opticurve=True, opttolerance=0.4)
    d = []
    for c in path:
        sx, sy = c.start_point.x, c.start_point.y
        d.append(f'M{sx/S:.2f},{sy/S:.2f}')
        for seg in c:
            if seg.is_corner:
                d.append(f'L{seg.c.x/S:.2f},{seg.c.y/S:.2f}L{seg.end_point.x/S:.2f},{seg.end_point.y/S:.2f}')
            else:
                d.append(f'C{seg.c1.x/S:.2f},{seg.c1.y/S:.2f} {seg.c2.x/S:.2f},{seg.c2.y/S:.2f} {seg.end_point.x/S:.2f},{seg.end_point.y/S:.2f}')
        d.append('Z')
    ys, xs = np.nonzero(comp)
    pecas.append({'d': ''.join(d), 'bbox': [xs.min()/S, ys.min()/S, xs.max()/S, ys.max()/S], 'area': int(comp.sum()/S/S)})
pecas.sort(key=lambda p: -p['area'])
json.dump({'cor': '#%02X%02X%02X' % tuple(int(c) for c in cor), 'pecas': pecas}, open(D + 'fonte/logo/pecas.json', 'w'), indent=1)
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 299"><g fill="#%02X%02X%02X" fill-rule="evenodd">' % tuple(int(c) for c in cor)
svg += ''.join(f'<path d="{p["d"]}"/>' for p in pecas) + '</g></svg>'
open(D + 'fonte/logo/life.svg', 'w').write(svg)
for p in pecas: print(p['area'], p['bbox'])
