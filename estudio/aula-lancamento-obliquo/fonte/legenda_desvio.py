# Legenda x camada Manim: para cada legenda, mede se a derivação ocupa a faixa da legenda
# (y 830-990). Se ocupa só o lado direito, a legenda inteira vai para a metade esquerda.
# Saída: /root/aula/src/data/legenda_lado.json  {indice_da_legenda: "esq"}
import json, re, numpy as np
from PIL import Image
A = '/root/aula'
R = json.load(open(f'{A}/src/data/relogio.json')); W = R['palavras']
src = open(f'{A}/src/aula/legendas.ts').read()
cues = [(int(a), int(b)) for a, b, _ in re.findall(r"\[(\d+),\s*(\d+),\s*'((?:[^'\\]|\\.)*)'\]", src)]
m = json.load(open(f'{A}/src/data/manim.json'))
def faixa(q):
    for c, v in m.items():
        if v['ini'] <= q < v['ini'] + v['n']:
            a = np.asarray(Image.open(f"{A}/public/manim/{c}/{q - v['ini']:04d}.png"))[830:990, :, 3] > 40
            return a[:, :960].sum(), a[:, 960:].sum()
    return 0, 0
lado = {}
for k, (a, b) in enumerate(cues):
    ini = W[a]['f']; prox = W[cues[k + 1][0]]['f'] if k + 1 < len(cues) else 1e9
    fim = int(min(max(W[b]['fe'] + 10, ini + 20), prox - 2, ini + 210))
    e = d = 0
    for q in range(ini, fim, 2):
        x, y = faixa(q); e = max(e, x); d = max(d, y)
    if d > 150:
        lado[k] = 'esq'
        print(k, ini, fim, 'dir ocupado', d, 'esq', e, '<- ATENÇÃO: esquerda também' if e > 150 else '')
json.dump(lado, open(f'{A}/src/data/legenda_lado.json', 'w'))
print(len(lado), 'legendas desviadas')
