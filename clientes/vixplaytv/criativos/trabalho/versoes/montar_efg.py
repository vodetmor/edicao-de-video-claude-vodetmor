# -*- coding: utf-8 -*-
"""Versões E, F e G (vídeos do CMD c1, c2, c3) com as mesmas regras da H aprovada.
Áudio: corta os trechos que saem (PDF aprovado), silencia o nome deles e põe "VixPlay TV" (edge-tts) no lugar.
Gera: estudio/motor/public/vix/{e,f,g}.mp3 e estudio/motor/src/vix/data/tl{e,f,g}.json (palavras no novo tempo).
Uso: python -I montar_efg.py"""
import json, subprocess, os
import numpy as np

RAIZ = 'C:/dev/maquina-de-editar'
WORK = f'{RAIZ}/clientes/vixplaytv/criativos/trabalho/versoes/work'
PUB = f'{RAIZ}/estudio/motor/public/vix'
DATA = f'{RAIZ}/estudio/motor/src/vix/data'
SR = 44100

V = {
    # manter: trechos do original (s); marca: trechos onde o nome deles é falado (fica mudo + "VixPlay TV")
    'e': {'src': 'c1', 'voz': 'pt-BR-AntonioNeural', 'manter': [(1.45, 25.8)], 'marca': [(6.55, 7.32), (19.18, 19.78)]},
    'f': {'src': 'c2', 'voz': 'pt-BR-FranciscaNeural', 'manter': [(0.0, 6.95), (9.55, 39.35), (43.55, 58.3)], 'marca': [(5.75, 6.95)]},
    'g': {'src': 'c3', 'voz': 'pt-BR-FranciscaNeural', 'manter': [(0.0, 49.15), (67.3, 68.15)], 'marca': [(33.15, 33.95)]},
}


def carrega(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def novo_t(o, manter):
    acc = 0.0
    for a, b in manter:
        if a <= o <= b:
            return acc + (o - a)
        acc += b - a
    return None


for k, cfg in V.items():
    src, manter = cfg['src'], cfg['manter']
    x = carrega(f'{WORK}/{src}.mp3')
    tts = f'{WORK}/marca_{k}.mp3'
    subprocess.run(['python', '-m', 'edge_tts', '--voice', cfg['voz'], '--rate', '+8%', '--text', 'VixPlay TV', '--write-media', tts], check=True, capture_output=True)
    m = carrega(tts)
    nz = np.where(np.abs(m) > 0.01)[0]
    m = m[max(0, nz[0] - 200): nz[-1] + 400] if len(nz) else m
    # silencia o nome deles (com rampas curtas) e soma "VixPlay TV" com o volume da fala ao redor
    for a, b in cfg['marca']:
        i0, i1 = int(a * SR), int(b * SR)
        f = int(0.015 * SR)
        x[i0:i0 + f] *= np.linspace(1, 0, f)
        x[i0 + f:i1 - f] = 0
        x[i1 - f:i1] *= np.linspace(0, 1, f)
        viz = np.concatenate([x[max(0, i0 - SR):i0], x[i1:i1 + SR]])
        alvo = np.sqrt(np.mean(viz ** 2)) + 1e-6
        mm = m * (alvo / (np.sqrt(np.mean(m ** 2)) + 1e-6))
        j1 = min(len(x), i0 + len(mm))
        x[i0:j1] += mm[:j1 - i0]
    # corta e junta os trechos mantidos (rampas de 10 ms nas emendas)
    partes = []
    for a, b in manter:
        p = x[int(a * SR):int(b * SR)].copy()
        f = int(0.01 * SR)
        p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
        partes.append(p)
    y = np.concatenate(partes)
    wav = f'{WORK}/{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', wav], input=y.tobytes(), check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', f'{PUB}/{k}.mp3'], check=True)
    # palavras no novo tempo; o nome deles vira "VixPlay TV"
    pal = json.load(open(f'{WORK}/{src}.palavras.json', encoding='utf8'))
    out = []
    marcados = set()
    for w in pal:
        s, e = w['s'], w['e']
        dentro = [(a, b) for a, b in cfg['marca'] if min(e, b) - max(s, a) > 0.5 * (e - s)]
        if dentro:
            a, b = dentro[0]
            if (a, b) in marcados:
                continue
            marcados.add((a, b))
            ns = novo_t(a, manter)
            if ns is None:
                continue
            fim = w['w'][-1] if w['w'][-1] in '.,?!' else ''
            out += [{'w': 'VixPlay', 's': round(ns, 2), 'e': round(ns + 0.35, 2)}, {'w': 'TV' + fim, 's': round(ns + 0.35, 2), 'e': round(ns + 0.7, 2)}]
            continue
        rg = [(a, b) for a, b in manter if a <= s <= b]
        ns = novo_t(s, manter)
        ne = novo_t(min(e, s + 2, rg[0][1]), manter) if rg else None
        if ns is None or ne is None:
            continue
        out.append({'w': w['w'], 's': round(ns, 2), 'e': round(ne, 2)})
    json.dump(out, open(f'{DATA}/tl{k}.json', 'w', encoding='utf8'), ensure_ascii=False)
    print(k, 'duração', round(len(y) / SR, 2), 's |', len(out), 'palavras |', ' '.join(p['w'] for p in out[:12]))
