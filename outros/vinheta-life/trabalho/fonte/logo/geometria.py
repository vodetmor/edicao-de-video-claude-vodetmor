"""Reconstrói a logo 'life' como geometria limpa, medida dos pixels do PNG original.
Anel = losango de cantos redondos (SDF de losango + raio), ajustado por mínimos quadrados.
Saída: logo/geo.json (parâmetros em px do PNG 480x299)."""
import json, numpy as np
from PIL import Image
from scipy import ndimage, optimize
D = '/mnt/project-files/vinheta-life/trabalho/'
im = np.asarray(Image.open(D + 'referencias/logo-life.png').convert('RGB')).astype(float)
a = np.clip((255 - im[..., 2]) / (255 - 35), 0, 1)
S = 4
big = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((480 * S, 299 * S), Image.BICUBIC)) / 255
big = ndimage.gaussian_filter(big, S * 0.35)
m = big > 0.5
lab, n = ndimage.label(m)
sizes = ndimage.sum(m, lab, range(1, n + 1)); main = lab == (1 + np.argmax(sizes))
filled = ndimage.binary_fill_holes(main)
Y, X = (np.mgrid[0:299 * S, 0:480 * S] + 0.5) / S

def sdr(px, py, bx, by):
    px, py = np.abs(px), np.abs(py)
    h = np.clip(((bx - 2 * px) * bx - (by - 2 * py) * by) / (bx * bx + by * by), -1, 1)
    d = np.hypot(px - 0.5 * bx * (1 - h), py - 0.5 * by * (1 + h))
    return d * np.sign(px * by + py * bx - bx * by)

def perda_ext(q):
    cx, cy, bx, by, r = q
    f = 1 / (1 + np.exp(np.clip((sdr(X - cx, Y - cy, bx, by) - r) * 3, -50, 50)))
    return ((f - filled) ** 2).mean()
q0 = [249, 128.6, 110, 90, 28]
ext = optimize.minimize(perda_ext, q0, method='Nelder-Mead', options={'maxiter': 3000, 'xatol': 1e-3, 'fatol': 1e-9}).x
print('externo cx,cy,bx,by,r =', np.round(ext, 2))
cx, cy, bx, by, r = ext
# espessura: perfil perpendicular no meio da diagonal superior direita (sem letras)
sd = sdr(X - cx, Y - cy, bx, by) - r
ring = main & (sd > -40)
# interior branco ligado ao centro-alto (região acima das letras)
branco = ~main & filled
# raio interno: mede a distância sd na borda interna onde não há letra (y < 100 ou lado direito alto)
reg = (Y < 95) | ((X > 300) & (Y < 120))
borda = branco & reg & ndimage.binary_dilation(main)
ri = -np.median(sd[borda])
print('espessura do anel', round(ri, 2))
json.dump({'cx': cx, 'cy': cy, 'bx': bx, 'by': by, 'r': r, 'w': ri}, open(D + 'fonte/logo/geo.json', 'w'), indent=1)

# ---------------------------------------------------------------- peças
import potrace
def caminho_anel(off):
    V = [(cx, cy - by), (cx + bx, cy), (cx, cy + by), (cx - bx, cy)]  # T R B L (horário na tela)
    def nrm(p, q):
        dx, dy = q[0] - p[0], q[1] - p[1]; L = np.hypot(dx, dy)
        return (dy / L, -dx / L)  # normal para fora (horário em y-para-baixo)
    d = []
    for k in range(4):
        v, prv, nxt = V[k], V[k - 1], V[(k + 1) % 4]
        n1, n2 = nrm(prv, v), nrm(v, nxt)
        a = (v[0] + off * n1[0], v[1] + off * n1[1]); b = (v[0] + off * n2[0], v[1] + off * n2[1])
        d.append(('M' if k == 0 else 'L') + f'{a[0]:.3f},{a[1]:.3f}')
        d.append(f'A{off:.3f},{off:.3f} 0 0 1 {b[0]:.3f},{b[1]:.3f}')
    return ''.join(d) + 'Z'

def traca(comp, S, alphamax=1.0):
    path = potrace.Bitmap(~comp).trace(turdsize=20 * S * S, alphamax=alphamax, opticurve=True, opttolerance=0.3)
    d = []
    for c in path:
        d.append(f'M{c.start_point.x/S:.3f},{c.start_point.y/S:.3f}')
        for s in c:
            if s.is_corner: d.append(f'L{s.c.x/S:.3f},{s.c.y/S:.3f}L{s.end_point.x/S:.3f},{s.end_point.y/S:.3f}')
            else: d.append(f'C{s.c1.x/S:.3f},{s.c1.y/S:.3f} {s.c2.x/S:.3f},{s.c2.y/S:.3f} {s.end_point.x/S:.3f},{s.end_point.y/S:.3f}')
        d.append('Z')
    return ''.join(d)

S2 = 8
big2 = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((480 * S2, 299 * S2), Image.BICUBIC)) / 255
big2 = ndimage.gaussian_filter(big2, S2 * 0.6)
m2 = big2 > 0.5
Y2, X2 = (np.mgrid[0:299 * S2, 0:480 * S2] + 0.5) / S2
sd2 = sdr(X2 - cx, Y2 - cy, bx, by)
dentro = sd2 - (r - ri) < 3.0          # interior + 3 px por baixo do anel (emenda sem fresta)
nucleo = m2 & (sd2 - (r - ri) < -0.5)
labn, n2 = ndimage.label(nucleo)
dist, (iy, ix) = ndimage.distance_transform_edt(labn == 0, return_indices=True)
lab2 = np.where(m2 & dentro & (dist < 4 * S2), labn[iy, ix], 0)
pecas = {}
for i in range(1, n2 + 1):
    c = lab2 == i
    if c.sum() < 100 * S2 * S2: continue
    ys, xs = np.nonzero(c); x0 = xs.min() / S2
    print('comp', i, 'x', round(x0, 1), round(xs.max() / S2, 1), 'y', round(ys.min() / S2, 1), round(ys.max() / S2, 1), 'area', int(c.sum() / S2 / S2))
    pecas[i] = (x0, c)
# nomeia por posição
ordem = sorted(pecas.values(), key=lambda t: t[0])
saida = {'cor': '#E85E23', 'anel': caminho_anel(r) + caminho_anel(r - ri), 'pecas': {}}
for x0, c in ordem:
    ys, xs = np.nonzero(c); y0 = ys.min() / S2; x1 = xs.max() / S2
    if x0 < 180: nome = 'l'
    elif x1 < 216 and y0 < 105: nome = 'pingo'
    elif x1 < 216: nome = 'i'
    elif x0 < 260: nome = 'f'
    else: nome = 'e'
    bb = [x0, y0, x1, ys.max() / S2]
    saida['pecas'][nome] = {'d': traca(c, S2, 1.1), 'bbox': bb}
    print(nome, [round(v, 1) for v in bb])
json.dump(saida, open(D + 'fonte/logo/logo-geo.json', 'w'))
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 299"><g fill="#E85E23">'
svg += f'<path fill-rule="evenodd" d="{saida["anel"]}"/>' + ''.join(f'<path d="{p["d"]}"/>' for p in saida['pecas'].values()) + '</g></svg>'
open(D + 'fonte/logo/life-limpa.svg', 'w').write(svg)
