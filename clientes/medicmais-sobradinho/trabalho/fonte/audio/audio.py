"""Trilha + efeitos + mix do vídeo de venda do site MedicMais. Tudo sintetizado (synth.py, kit do VSL Play v6 / Rei da VSL):
trilha original ~94,7 BPM (19 quadros por tempo), calma e confiante; seções seguem as cenas de src/cues.json
(gancho leve, a clínica com groove, o problema mais seco, as 4 frentes cheias, chamada com virada no "no ar").
Efeitos presos aos mesmos eventos da animação. Voz na frente: música ~19 dB abaixo enquanto ela fala, volta suave nas pausas.
Master -14 LUFS / -1 dBTP.  Uso: python3 audio/audio.py  ->  ../render/audio.wav (STEMS=1 grava os stems)"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from synth import *  # noqa

CU = json.load(open(os.path.join(HERE, '..', 'src', 'cues.json')))
EV, INI = CU['ev'], CU['ini']
FPS = 30
NFR = CU['dur']
N = int(NFR / FPS * SR) + SR // 2
OUT = os.path.join(HERE, '..', '..', 'render')
os.makedirs(OUT, exist_ok=True)
VOZ = os.path.join(HERE, '..', '..', '..', 'brutos', 'voz', 'locucao-v2-ana-dias.mp3')  # v2: site + Google Meu Negócio

G0, BEAT = 0, 19


def grade(f):
    return G0 + round((f - G0) / (4 * BEAT)) * 4 * BEAT  # seções começam no início de um compasso


def ts(f):
    return f / FPS


mus = np.zeros((N, 2))
drm = np.zeros((N, 2))
sfx = np.zeros((N, 2))
rev = np.zeros((N, 2))
hero = np.zeros((N, 2))  # o "tim" do NFC: momento-herói, quase sem ducking


def place(dst, sig, f, gain=1.0, pan=0.0, send=0.0):
    i = int(round(ts(f) * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s = sig
    if i < 0:
        s, i = s[-i:], 0
    s = s[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dst[i : i + len(s), 0] += s * gain * l * 1.4142
    dst[i : i + len(s), 1] += s * gain * r * 1.4142
    if send:
        rev[i : i + len(s), 0] += s * gain * send
        rev[i : i + len(s), 1] += s * gain * send


# ---------------------------------------------------------------- harmonia: Ré maior, I - V - vi - IV (D A Bm G), calorosa
CH = {'D': [50, 54, 57], 'A': [49, 52, 57], 'Bm': [50, 54, 59], 'G': [50, 55, 59]}
ROOT = {'D': 38, 'A': 33, 'Bm': 35, 'G': 31}
CYC = ['D', 'A', 'Bm', 'G']
SECT = [(0, 'light'), (grade(INI['K02']), 'groove'), (grade(INI['K05']), 'break'), (grade(INI['K09']), 'light'), (grade(EV['frentes']), 'full'),
        (grade(INI['K16']), 'groove'), (grade(INI['K18']), 'break'), (grade(INI['K19']), 'full'), (grade(INI['K20']), 'groove'),
        (grade(INI['K22']), 'light'), (grade(EV['noar']) - 4 * BEAT, 'build'), (EV['noar'], 'outro'), (NFR, 'end')]


def sect(f):
    s = None
    for a, n in SECT:
        if f >= a:
            s = n
    return s


nbars = NFR // (4 * BEAT) + 2
for b in range(nbars):
    f0 = G0 + b * 4 * BEAT
    if f0 >= NFR:
        break
    sc = sect(f0)
    if sc in (None, 'end', 'outro'):
        continue
    ch = CYC[b % 4]
    notes = CH[ch]
    bar_d = 4 * BEAT / FPS
    padg = {'light': 0.9, 'full': 0.6, 'groove': 0.65, 'break': 0.8, 'build': 0.8}[sc]
    for k, m in enumerate(notes):
        place(mus, pad_voice(midi(m), bar_d), f0, 0.5 * padg, pan=(k - 1) * 0.4, send=0.25)
    # piano elétrico nos tempos 1 e 3 (calor), arpejo de pluck em colcheias (aparece no alto-falante do celular)
    if sc != 'break':
        place(mus, ep(midi(notes[0] + 12), 1.4), f0, 0.22, pan=-0.2, send=0.2)
        place(mus, ep(midi(notes[2] + 12), 1.2), f0 + 2 * BEAT, 0.18, pan=0.2, send=0.2)
    arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12, notes[0] + 24, notes[2] + 12, notes[1] + 12, notes[2]]
    pg = {'light': 0.4, 'full': 0.36, 'groove': 0.32, 'break': 0.26, 'build': 0.4}[sc]
    for s in range(8):
        if sc == 'break' and s % 2:
            continue
        place(mus, pluck(midi(arp[s]), 0.45, bright=0.9), f0 + s * BEAT / 2, pg * (1.0 if s % 2 == 0 else 0.7), pan=0.35 * np.sin(s * 1.3), send=0.2)
    if sc in ('full', 'groove', 'build'):
        r = ROOT[ch]
        for s in range(4):
            place(mus, bass(midi(r + (12 if s == 3 else 0)), 0.32, 0.2), f0 + s * BEAT, 0.6 if s % 2 == 0 else 0.4)
    for bt in range(4):
        fb = f0 + bt * BEAT
        if sect(fb) in ('outro', 'end'):
            continue
        if sc in ('full', 'groove'):
            if bt in (0, 2) or sc == 'full':
                place(drm, kick(), fb, 0.75)
            if bt in (1, 3):
                place(drm, clap(), fb, 0.38, send=0.15)
            for h in range(2):
                place(drm, hat(), fb + h * BEAT / 2, 0.2 if h else 0.13, pan=0.3)
        elif sc == 'light':
            place(drm, shaker(), fb + BEAT / 2, 0.14, pan=-0.3)
        elif sc == 'break':
            place(drm, rim(), fb + BEAT / 2, 0.16, pan=-0.2)
        elif sc == 'build':
            for q in range(2 if bt < 2 else 4):
                place(drm, snare(0.6), fb + q * BEAT / (2 if bt < 2 else 4), 0.1 + 0.04 * bt)
# acorde final no "no ar"
a = EV['noar']
for k, m in enumerate(CH['D'] + [62]):
    place(mus, pad_voice(midi(m), max(0.8, (NFR - a) / FPS)), a, 0.6, pan=(k - 1.5) * 0.3, send=0.3)
place(mus, bass(midi(26), 1.2, 0.6), a, 0.8)
place(mus, bell(midi(86), 2.0, 0.8), a, 0.18, send=0.4)
place(drm, kick(punch=1.1), a, 0.9)
place(drm, crash(), a, 0.4, send=0.2)
# (sem prato/riser na entrada da seção cheia: caía em cima do "Um:", crítica v1)

# ---------------------------------------------------------------- efeitos nos eventos da imagem
I = INI
for k in [k for k in I if k not in ('K01', 'K03')]:
    place(sfx, whoosh(0.28, 600, 4200, peak=0.4, bw=0.7, tail=0.4), I[k] - 4, 0.10, send=0.08)
place(sfx, swish(0.22, 900, 4000), I['K03'], 0.12, pan=-0.5)
place(sfx, swish(0.22, 900, 4000), EV['dentista'] - 8, 0.12, pan=0.5)
place(sfx, pop(700, 0.2), EV['dentista'] + 2, 0.25)


def contador(start, dur, n, freq):
    last = -1
    for fr in range(start, start + dur + 1):
        v = round(n * (1 - (1 - min(1, (fr - start) / dur)) ** 2))
        if v != last and fr > start and (fr - start) % 2 == 0:
            place(sfx, tick(freq, 0.02, 0.003), fr, 0.06)
        last = v
    place(sfx, tap(380, weight=0.6), start + dur, 0.3)


def digita(start, n):
    for c in range(n):
        place(sfx, keytick(), start + c * 2, 0.13, pan=0.15)


def nfc_tim():
    """O "tim" do pagamento por aproximação: bipe limpo ~2,4 kHz, ataque seco, 150 ms."""
    t = T(0.16)
    env = np.minimum(1, t / 0.004) * np.exp(-t / 0.09) * (t < 0.15)
    x = np.sin(2 * np.pi * 2400 * t) + 0.18 * np.sin(2 * np.pi * 4800 * t) + 0.06 * np.sin(2 * np.pi * 7200 * t)
    return norm(x * env, 0.9)


def ding(f1, f2):
    """confirmação do celular: duas notas de sino curtas"""
    a = bell(f1, 0.6, 0.25)
    b = bell(f2, 0.8, 0.3)
    out = np.zeros(len(a) + int(0.09 * SR) + len(b))
    out[: len(a)] += a
    out[int(0.09 * SR): int(0.09 * SR) + len(b)] += b
    return norm(out, 0.8)


contador(EV['quinhentos'] - 4, 20, 550, 3200)
place(sfx, thud(0.4, 60), EV['quinhentos'] + 16, 0.25)
contador(EV['trinta'] - 8, 16, 30, 3000)
place(sfx, thud(0.45, 55), EV['trinta'] + 8, 0.3)
for i in range(6):
    place(sfx, tap(midi(67 + [0, 2, 4, 7, 9, 12][i]), 0), EV['saudeday'] - 12 + i * 3, 0.1, pan=-0.3 + 0.12 * i)
# K05 Instagram: o celular sobe, os posts voam do feed
place(sfx, whoosh(0.5, 500, 2500, peak=0.4, bw=0.7, tail=0.3), I['K05'] + 2, 0.12)
for i in range(9):
    place(sfx, swish(0.14, 1300, 4800), EV['espalhado'] - 2 + i * 2, 0.06, pan=(i % 3 - 1) * 0.6)
place(sfx, whoosh(0.5, 3500, 600, peak=0.3, bw=0.7, tail=0.5), EV['espalhado'] - 2, 0.16)
# K06/K07 Google
place(sfx, pop(880, 0.18), I['K06'] + 2, 0.18)
digita(I['K06'] + 10, len('implante dentário sobradinho'))
for k in ['implante', 'protese', 'lentes']:
    place(sfx, pop(820, 0.16), EV[k] - 2, 0.2)
digita(EV['buscando'] - 2, len('medicmais sobradinho'))
for k, d in [('catalogos', 0), ('outras', 0), ('outras', 8)]:
    place(sfx, tap(300, weight=0.5), EV[k] - 2 + d, 0.18)
place(sfx, thud(0.3, 80), EV['clinicas'] + 6, 0.2)
place(sfx, blip(330, 0.2, 0.08), EV['clinicas'] + 6, 0.12)
# K08 gráfico
place(sfx, riser(0.8, 300, 2500, tone=True), EV['terco'] - 4, 0.12)
place(sfx, tap(420, weight=0.7), EV['terco'] + 20, 0.3)
place(sfx, tap(300, weight=0.5), EV['treze'] + 10, 0.22)
# K09 não é só um site: risco, a peça central, as marcas em volta
place(sfx, swish(0.3, 2500, 600), EV['site0'] + 2, 0.16)
place(sfx, suck(0.3), EV['colocar'] - 8, 0.14)
place(sfx, pluck(midi(74), 0.5, bright=1.1), EV['colocar'] - 4, 0.28, send=0.2)
for i, (k, d) in enumerate([('colocar', 10), ('colocar', 16), ('certo', 2), ('internet2', 2)]):
    place(sfx, pop(700 + 90 * i, 0.16), EV[k] + d, 0.18, pan=[-0.5, 0.5, -0.5, 0.5][i])
# K10 duas partes
place(sfx, whoosh(0.35, 700, 3000, peak=0.4, bw=0.7, tail=0.3), EV['duas'] - 2, 0.14, pan=-0.4)
place(sfx, whoosh(0.35, 700, 3000, peak=0.4, bw=0.7, tail=0.3), EV['gmn1'] - 6, 0.14, pan=0.4)
place(sfx, pluck(midi(79), 0.4, bright=1.1), EV['gmn1'] - 2, 0.26, send=0.2)
for i in range(5):
    place(sfx, tick(2600 + 200 * i, 0.03, 0.006), EV['gmn1'] + 10 + i * 3, 0.08)
# K11 4 frentes: um "+" de cada vez
for i in range(4):
    place(sfx, pluck(midi(74 + [0, 4, 7, 12][i]), 0.4, bright=1.1), EV['quatro'] + 2 + i * 3, 0.25, send=0.2)
# frente 1: rolagem + digitação + anel
place(sfx, whoosh(0.9, 400, 1800, peak=0.5, bw=0.8, tail=0.3), I['K12'] + 16, 0.1)
digita(EV['tratamento'] - 6, len('implante dentário'))
place(sfx, bell(midi(81), 1.2, 0.4), EV['digita'] - 2, 0.16, send=0.25)
# frente 2: rolagem pela página, toque, WhatsApp abre
place(sfx, whoosh(1.2, 400, 1600, peak=0.5, bw=0.8, tail=0.3), EV['qualquer'] - 6, 0.1)
place(sfx, mouse_click(), EV['toque'], 0.4)
place(sfx, button_press(), EV['toque'], 0.35)
place(sfx, plip(), EV['abre'] - 2, 0.35)
place(sfx, bell(midi(88), 1.0, 0.3), EV['abre'] + 2, 0.12, send=0.25)
# frente 3
place(sfx, swish(0.25, 900, 3500), EV['prova'] - 6, 0.12)
place(sfx, pop(640, 0.18), EV['depoimentos'] + 4, 0.2)
for k, d in [('estrutura', 0), ('estrutura', 6), ('saudeday2', 0)]:
    place(sfx, tap(midi(69 + 3 * (d > 0)), 0), EV[k] - 4 + d, 0.14)
# frente 4: fontes, linhas, porta
for i, k in enumerate(['anuncio', 'google', 'instagram']):
    place(sfx, pop(700 + 100 * i, 0.16), EV[k] - 4, 0.2, pan=-0.5 + 0.5 * i)
place(sfx, whoosh(0.6, 3000, 700, peak=0.4, bw=0.6, tail=0.4), EV['levam'] - 2, 0.12)
place(sfx, whoosh(0.4, 600, 2500, peak=0.4, bw=0.7, tail=0.4), EV['endereco'] - 6, 0.14)
place(sfx, pop(560, 0.2), EV['vinte'] - 4, 0.2)
# K16 parte 2: Google Meu Negócio, Google e Maps
place(sfx, pluck(midi(81), 0.5, bright=1.1), EV['gmn2'] - 8, 0.3, send=0.25)
place(sfx, thud(0.35, 70), EV['gmn2'] - 4, 0.18)
place(sfx, pop(760, 0.18), EV['google2'] - 6, 0.2, pan=-0.4)
place(sfx, pop(860, 0.18), EV['maps'] - 6, 0.2, pan=0.4)
place(sfx, tap(260, weight=0.7), EV['maps'] + 4, 0.22, pan=0.4)
# K17 o perfil se completa
place(sfx, swish(0.3, 900, 3800), EV['fotos'] - 6, 0.12)
for k in ['end', 'telefone', 'avaliacoes']:
    place(sfx, tap(midi(72), 0), EV[k] - 4, 0.14)
    place(sfx, blip(midi(84), 0.1, 0.04), EV[k] - 2, 0.06)
place(sfx, pop(620, 0.2), EV['completo'] - 4, 0.24)
place(sfx, bell(midi(86), 0.8, 0.3), EV['completo'] - 2, 0.1, send=0.25)
place(sfx, button_press(), EV['ligado'] - 2, 0.3)
# K18 plaquinha 3D: estrelas vazias, a peça sobe girando e pousa, o celular chega, "tim", a tela abre, estrelas
for i in range(5):
    place(sfx, tap(midi(76), 0), I['K18'] + 2 + i * 3, 0.06, pan=-0.4 + 0.2 * i)
place(sfx, whoosh(1.0, 300, 3200, peak=0.75, bw=0.8, tail=0.2), EV['plaquinha'] - 32, 0.2, send=0.1)
place(sfx, thud(0.45, 65), EV['plaquinha'] - 2, 0.3)
place(sfx, tap(500, weight=0.8), EV['plaquinha'] - 2, 0.25)
place(sfx, whoosh(1.4, 1200, 400, peak=0.5, bw=0.8, tail=0.4), EV['balcao'] - 10, 0.08)
place(sfx, whoosh(1.2, 500, 2200, peak=0.85, bw=0.8, tail=0.15), EV['aproxima'] - 12, 0.16, pan=0.5)
place(hero, nfc_tim(), EV['toca'], 0.75)
place(hero, ding(midi(84), midi(91)), EV['toca'] + 3, 0.36, send=0.2)
for i in range(5):
    place(sfx, pluck(midi(76 + [0, 2, 4, 7, 9][i]), 0.35, bright=1.2), EV['avaliacao'] + i * 5, 0.22, pan=-0.4 + 0.2 * i, send=0.15)
place(sfx, pop(600, 0.18), EV['sembaixar'] - 4, 0.2)
place(sfx, pop(680, 0.18), EV['semprocurar'] - 4, 0.2)
# K19 cada paciente vira uma estrela
for i in range(3):
    place(sfx, pop(560 + 60 * i, 0.16), I['K19'] + 4 + i * 5, 0.16, pan=-0.4 + 0.4 * i)
for i in range(5):
    place(sfx, suck(0.2) if i < 3 else swish(0.12, 1500, 4000), EV['estrela'] - 6 + i * 4, 0.06)
    place(sfx, pluck(midi(79 + [0, 2, 4, 7, 12][i]), 0.4, bright=1.2), EV['estrela'] + i * 4, 0.24, pan=-0.5 + 0.25 * i, send=0.2)
place(sfx, shimmer(midi(91), 1.2), EV['estrela'] + 18, 0.08)
place(sfx, whoosh(0.5, 600, 2600, peak=0.5, bw=0.7, tail=0.3), EV['proximo'] - 8, 0.14)
for i in range(5):
    place(sfx, tick(3000 + 150 * i, 0.03, 0.006), EV['proximo'] + 4 + i * 3, 0.07)
# K20 identidade
for i in range(4):
    place(sfx, tap(midi(72 + 2 * i), 0), EV['vermelho'] - 4 + i * 3, 0.12)
place(sfx, pluck(midi(79), 0.4), EV['sinal'] - 2, 0.25, send=0.2)
place(sfx, pop(520, 0.2), EV['servicos'] - 4, 0.2)
place(sfx, swish(0.25, 800, 3000), EV['celular'] - 4, 0.1)
# K21 o sistema
for i, k in enumerate(['site4', 'google4', 'plaquinha2']):
    place(sfx, pluck(midi(74 + [0, 4, 7][i]), 0.45, bright=1.1), EV[k] - 6, 0.24, send=0.2)
place(sfx, whoosh(0.7, 800, 3000, peak=0.5, bw=0.7, tail=0.3), EV['prova2'] - 8, 0.12)
place(sfx, bell(midi(86), 1.4, 0.5), EV['prova2'] + 4, 0.12, send=0.3)
# checklist
for k in ['horario', 'cnpj', 'responsaveis', 'logo']:
    place(sfx, tap(360, weight=0.4), EV[k] - 4, 0.18)
    place(sfx, blip(midi(79), 0.1, 0.04), EV[k] - 2, 0.07)
# chamada: no ar e no mapa (o pino cai)
place(sfx, pop(520, 0.2), EV['noar'] - 12, 0.25)
place(sfx, button_press(), EV['noar'] + 2, 0.4)
place(sfx, whoosh(0.3, 3000, 900, peak=0.6, bw=0.6, tail=0.2), EV['mapa'] - 8, 0.12)
place(sfx, tap(300, weight=0.8), EV['mapa'] + 2, 0.3)

# ---------------------------------------------------------------- reverb


def make_ir(rt=1.4, pre=0.012):
    n = int(SR * rt * 1.1)
    t = np.arange(n) / SR
    env = np.exp(-6.91 * t / rt)
    ir = np.zeros((n + int(pre * SR), 2))
    for ch in range(2):
        ir[int(pre * SR):, ch] = lp(rng.standard_normal(n) * env, 6000)
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))


IR = make_ir()
wet = np.stack([fftconvolve(rev[:, c], IR[:, c])[:N] for c in range(2)], 1)
mus += 0.5 * np.stack([hp(mus[:, c], 300) for c in range(2)], 1)  # presence for phone speakers

# sidechain: the bed breathes with the kick
side = np.ones(N)
for b in range(nbars * 4):
    fb = G0 + b * BEAT
    if sect(fb) in ('full', 'groove'):
        i = int(ts(fb) * SR)
        L = min(int(0.22 * SR), N - i)
        if L > 0:
            side[i : i + L] = np.minimum(side[i : i + L], 1 - 0.35 * np.exp(-np.arange(L) / SR / 0.08))
mus *= side[:, None]

# ---------------------------------------------------------------- voice + ducking
tmp = os.path.join(OUT, '_voz.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', VOZ, '-ac', '1', '-ar', str(SR), tmp], check=True)
_, v = wavfile.read(tmp)
os.remove(tmp)
v = v.astype(np.float64) / (32768.0 if v.dtype == np.int16 else 1.0)
v = hp(v, 90)
voice = np.zeros(N)
voice[: min(N, len(v))] = v[:N]
rms = np.sqrt(uniform_filter1d(voice ** 2, int(0.03 * SR)) + 1e-12)
act = maximum_filter1d((rms > 10 ** (-40 / 20)).astype(float), int(0.12 * SR))
act = np.concatenate([act[int(0.1 * SR):], np.zeros(int(0.1 * SR))]) + act  # adianta 100 ms
act = np.clip(act, 0, 1)
DS = SR // 1000
a_ = act[: len(act) // DS * DS].reshape(-1, DS).max(1)
ka, kr = np.exp(-1 / (0.08 * 1000)), np.exp(-1 / (0.3 * 1000))
e, cur = np.empty_like(a_), 0.0
for i, x in enumerate(a_):
    k_ = ka if x > cur else kr
    cur = k_ * cur + (1 - k_) * x
    e[i] = cur
act_s = np.interp(np.arange(N), np.arange(len(e)) * DS, e)
DUCK = 10 ** (-10.0 * act_s / 20)
DUCK_SFX = 10 ** (-9.0 * act_s / 20)  # efeitos >= 12 LU abaixo da voz quando ela fala (DESIGN-SYSTEM §7.3)
G = {'mus': 1.0, 'drm': 0.8, 'sfx': 1.6, 'wet': 0.55}
stems = {
    'music': mus * G['mus'] * DUCK[:, None],
    'drums': drm * G['drm'] * (DUCK * 10 ** (-3.0 * act_s / 20))[:, None],  # bateria 3 dB a mais sob a voz (crítica v2)
    'sfx': sfx * G['sfx'] * DUCK_SFX[:, None],
    'reverb': wet * G['wet'] * DUCK[:, None],
    'hero': hero * G['sfx'] * (10 ** (-3.0 * act_s / 20))[:, None],
}
speaking = act_s > 0.9
bed = (stems['music'] + stems['drums'] + stems['reverb'])[speaking]  # CLAUDE.md: music 18-22 LU under the voice
bed_rms = np.sqrt(np.mean(bed ** 2))
v_rms = np.sqrt(np.mean(voice[speaking & (np.abs(voice) > 1e-4)] ** 2))
VOICE_OVER = 21.0
vg = bed_rms * 10 ** (VOICE_OVER / 20) / (v_rms + 1e-12)
# gentle voice compression (2:1 above -24 dBFS short-term) so every syllable reads over the bed
env_v = np.sqrt(uniform_filter1d(voice ** 2, int(0.05 * SR)) + 1e-12)
thr = 10 ** (-24 / 20) * np.max(env_v) / 0.5
gr = np.where(env_v > thr, (thr / env_v) ** 0.5, 1.0)
voice_c = voice * uniform_filter1d(gr, int(0.01 * SR))
stems['voice'] = np.stack([voice_c, voice_c], 1) * vg * 0.7071 * (v_rms / (np.sqrt(np.mean(voice_c[speaking & (np.abs(voice_c) > 1e-4)] ** 2)) + 1e-12))
print(f'voice gain {20 * np.log10(vg):.1f} dB, speaking {speaking.mean() * 100:.0f}%')
mix = sum(stems.values())
mix = np.stack([hp(mix[:, c], 32) for c in range(2)], 1)
t = np.arange(N) / SR
mix *= np.clip((ts(NFR) - t) / 0.25, 0, 1)[:, None]
mix = mix[: int(ts(NFR) * SR)]


def limiter(x, ceiling=0.80, look=0.004, rel=0.09):
    up = np.stack([resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    pk = np.max(np.abs(up), axis=1)[: 4 * len(x)].reshape(-1, 4).max(axis=1)
    w = int(look * SR)
    pk = maximum_filter1d(pk, size=2 * w + 1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    a = np.exp(-16 / (rel * SR))
    gp = np.pad(g, (0, (16 - len(g) % 16) % 16), constant_values=1).reshape(-1, 16).min(axis=1)
    out = np.empty_like(gp)
    c = 1.0
    for i, vv in enumerate(gp):
        c = vv if vv < c else a * c + (1 - a) * vv
        out[i] = c
    gs = np.repeat(out, 16)[: len(g)]
    gs = np.minimum(uniform_filter1d(gs, size=int(0.002 * SR)), g)
    return x * gs[:, None]


def write(path, x):
    wavfile.write(path, SR, x.astype(np.float32))


def measure(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True)
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
    LRA = float(re.findall(r'LRA:\s+(-?[\d.]+) LU', r.stderr)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
    return I, LRA, tp


MIX = os.path.join(OUT, 'audio.wav')
gain = 0.5 / (np.max(np.abs(mix)) + 1e-9)
for it in range(7):
    y = limiter(mix * gain)
    write(MIX, y)
    I, LRA, tp = measure(MIX)
    print(f'pass {it}: I {I:.2f} LUFS, LRA {LRA:.1f} LU, TP {tp:.2f} dBTP')
    if abs(I + 14.0) < 0.15 and tp <= -1.0:
        break
    gain *= 10 ** ((-14.0 - I) / 20)
for name, st in (stems.items() if os.environ.get('STEMS') else []):
    write(os.path.join(OUT, f'stem-{name}.wav'), st[: len(mix)] * gain)
print('written', MIX)
