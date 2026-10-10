"""Fonte única de tempo dos 2 criativos: cortes e eventos presos às palavras faladas (transcricao.json).
Gera src/cues.json, lido pelo Remotion (cenas) e por audio.py (efeitos sonoros). Uso: python3 cues.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
# rodada 4: tempos da locução já com as pausas abertas por esticar.py
T = json.load(open(os.path.join(HERE, '..', 'transcricao-esticada.json')))
FPS = 30
LEAD = 2  # o corte entra 2 quadros antes da palavra: o olho chega junto com o ouvido

def w(key, i, off=0.0, lead=LEAD):
    return round(T[key]['words'][i]['s'] * FPS) - lead + round(off * FPS)

# ---------------------------------------------------------------- Criativo 01 (texto-1)
k = 'texto-1'
A = {
    'dur': round(T[k]['dur'] * FPS) + 40,  # voz + cauda do CTA
    'cenas': [  # [nome, início]  (rodada 4: A02 e A06 saíram; a caixa 3D segura 'fechando o pacote com dez criativos')
        ['A01', 0], ['A03', w(k, 1)], ['A04', w(k, 3)], ['A05', w(k, 7, -0.7)],  # a caixa entra na pausa antes de 'Fechando'
        ['A07', w(k, 13)], ['A08', w(k, 17)], ['A09', w(k, 22)], ['A10', w(k, 27)],  # rodada 4b: copy + locução + edição numa cena só (A11/A12 saíram)
        ['A13', w(k, 32)], ['A14', w(k, 42)], ['A15', w(k, 46)],
    ],
    'ev': {  # eventos internos (quadro absoluto)
        'odo': [28, 64],                   # pouso do '39' e do ',90' em 3D (preco3d.py LANDS): 'trinta e nove' / 'noventa'
        'sim': w(k, 3, lead=0), 'isso': w(k, 5, lead=0),
        'fechando': w(k, 7, lead=0), 'pacote': w(k, 9, lead=0), 'fita': w(k, 9, .25, lead=0), 'dez1': w(k, 11, lead=0),
        'trinta': w(k, 15, lead=0), 'segundos': w(k, 16, lead=0),
        'paga': w(k, 18, lead=0), 'p399': w(k, 19, lead=0), 'total': w(k, 21, lead=0),
        'incluso': w(k, 26, lead=0),
        'copy': w(k, 27, lead=0), 'locucao': w(k, 29, lead=0), 'edicao': w(k, 31, lead=0), 'dez2': w(k, 33, lead=0), 'prontos': w(k, 35, lead=0), 'usar': w(k, 38, lead=0), 'campanhas': w(k, 41, lead=0),
        'diferentes': w(k, 44, lead=0), 'abordagens': w(k, 45, lead=0),
        'saiba': w(k, 48, lead=0), 'fale': w(k, 51, lead=0),
    },
}
# ---------------------------------------------------------------- Criativo 02 (texto-2)
k = 'texto-2'
B = {
    'dur': round(T[k]['dur'] * FPS) + 90,  # cauda para o carrossel do portfólio
    'cenas': [
        ['B01', 0], ['B02', w(k, 2)], ['B03', w(k, 8)], ['B04', w(k, 12)], ['B05', w(k, 20)], ['B06', w(k, 21)],
        ['B07', w(k, 26)], ['B08', w(k, 31)], ['B09', w(k, 33)], ['B10', w(k, 42)],
    ],
    'ev': {
        'preco': 7, 'preco2': 50, 'criativo': w(k, 6, lead=0), 'completo': w(k, 7, lead=0),
        'locucao': w(k, 9, lead=0), 'edicao': w(k, 11, lead=0),
        'contratar': w(k, 15, lead=0), 'copywriter': w(k, 16, lead=0), 'locutor': w(k, 17, lead=0), 'editor': w(k, 19, lead=0),
        'tudo': w(k, 24, lead=0), 'pronto': w(k, 30, lead=0), 'anunciar': w(k, 32, lead=0),
        'vendo': w(k, 37, lead=0), 'exemplo': w(k, 41, lead=0),
        'saiba': w(k, 44, lead=0), 'peca': w(k, 47, lead=0),
    },
}
for X in (A, B):
    c = X['cenas']
    for i, (n, s) in enumerate(c):
        X.setdefault('ini', {})[n] = s
        X.setdefault('fim', {})[n] = c[i + 1][1] if i + 1 < len(c) else X['dur']
json.dump({'A': A, 'B': B}, open(os.path.join(HERE, 'src', 'cues.json'), 'w'), indent=1)
if __name__ == '__main__':
    for X in (A, B):
        print(' '.join(f'{n}@{s}' for n, s in X['cenas']))
        print(X['ev'])
