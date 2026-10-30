"""Monta a paleta de um vídeo a partir da cor do TEMA (marca ou objeto central), pelo círculo cromático.

Uso: python3 paleta.py "#D97757" [--acento "#10A37F"] [--saida pasta] [--nome claude]
Regra (estudo motion-base/estudos/thiago-a-recent-edits): 60% papel neutro, 30% cor do tema + cinzas quentes,
10% tinta; acento (2ª marca ou complementar dividida) em no máximo 2% da tela.
- papel: creme quente se o tema é quente, ou o matiz do tema quase sem saturação (nunca branco puro)
- texto sempre em tinta: a cor do tema tem pouco contraste com o papel e serve para forma, fundo de cena e sublinhado
- tinta: o mesmo matiz, quase preto
- cinza: entre papel e tinta, para sombra de recorte e texto de apoio
- acento: o informado, ou a complementar dividida (matiz + 150°)
Saída: <nome>.json (tokens para marca.json do editor) e <nome>.png (amostras com proporção e contraste).
"""
import argparse
import colorsys
import json
from pathlib import Path


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgbhex(c):
    return '#' + ''.join(f'{round(max(0, min(1, x)) * 255):02X}' for x in c)


def lum(c):
    f = lambda x: x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
    r, g, b = map(f, c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('tema')
    ap.add_argument('--acento')
    ap.add_argument('--saida', default='.')
    ap.add_argument('--nome', default='paleta')
    a = ap.parse_args()
    tema = hexrgb(a.tema)
    h, l, s = colorsys.rgb_to_hls(*tema)
    # papel: tema quente (vermelho a amarelo) -> papel creme (matiz ~42°, como na referência #DED9CF); tema frio -> o próprio matiz
    hp = 0.115 if (h < 60 / 360 or h > 330 / 360) else h
    papel = colorsys.hls_to_rgb(hp, 0.86, 0.16)
    papel2 = colorsys.hls_to_rgb(hp, 0.78, 0.11)
    cinza = colorsys.hls_to_rgb(h, 0.42, min(s, 0.06))
    tinta = colorsys.hls_to_rgb(h, 0.06, min(s, 0.12))
    acento = hexrgb(a.acento) if a.acento else colorsys.hls_to_rgb((h + 150 / 360) % 1, 0.38, min(0.65, s))
    tok = {'papel': rgbhex(papel), 'papel2': rgbhex(papel2), 'tema': rgbhex(tema), 'cinza': rgbhex(cinza),
           'tinta': rgbhex(tinta), 'acento': rgbhex(acento),
           'contraste': {'tinta/papel': round(contraste(tinta, papel), 1), 'tema/papel': round(contraste(tema, papel), 1),
                         'papel/tema': round(contraste(papel, tema), 1), 'acento/papel': round(contraste(acento, papel), 1)},
           'proporcao': '60% papel+papel2 · 30% tema+cinza · 10% tinta · acento ≤ 2%',
           'marca_json': {'fundo': rgbhex(papel), 'papel': rgbhex(papel2), 'tinta': rgbhex(tinta), 'suave': rgbhex(cinza),
                          'linha': rgbhex(papel2), 'destaque': rgbhex(tema), 'ok': rgbhex(acento)}}
    out = Path(a.saida)
    out.mkdir(parents=True, exist_ok=True)
    (out / f'{a.nome}.json').write_text(json.dumps(tok, ensure_ascii=False, indent=1), encoding='utf-8')
    try:
        from PIL import Image, ImageDraw
        W, H = 1200, 300
        im = Image.new('RGB', (W, H))
        d = ImageDraw.Draw(im)
        faixas = [(papel, .42), (papel2, .18), (tema, .2), (cinza, .1), (tinta, .08), (acento, .02)]
        x = 0
        for c, p in faixas:
            w = round(W * p)
            d.rectangle([x, 0, x + w, H], fill=tuple(round(v * 255) for v in c))
            x += w
        im.save(out / f'{a.nome}.png')
    except ImportError:
        pass
    print(json.dumps(tok, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
