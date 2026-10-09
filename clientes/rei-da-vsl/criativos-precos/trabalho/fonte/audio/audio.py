"""Trilha + efeitos + mix dos 2 criativos Rei da VSL. Tudo sintetizado (synth.py, mesmo kit do anúncio VSL Play v6):
trilha original a 128,57 BPM (14 quadros por tempo, compasso de 56 quadros) com a grade começando no quadro 7, então
os tempos fortes caem nos momentos-chave (A: 'Sim' f119, 'incluso' f399, botão f679; B: preço bate f7, 'A gente' f343).
Efeitos presos aos eventos de src/cues.json (mesmos tempos da animação). Voz na frente, música abaixada ~10 dB sob a
voz e volta suave nas pausas (0,7 s). Master -14 LUFS / -1 dBTP.
Uso: python3 audio/audio.py A|B  ->  ../render/audio-A.wav (+ stems)"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from synth import *  # noqa

QUAL = sys.argv[1] if len(sys.argv) > 1 else 'A'
CU = json.load(open(os.path.join(HERE, '..', 'src', 'cues.json')))[QUAL]
EV, INI = CU['ev'], CU['ini']
FPS = 30
NFR = CU['dur']
N = int(NFR / FPS * SR) + SR // 2
OUT = os.path.join(HERE, '..', '..', 'render')
os.makedirs(OUT, exist_ok=True)
VOZ = os.path.join(HERE, '..', '..', '..', 'brutos', 'texto-1.mp3' if QUAL == 'A' else 'texto-2.mp3')

G0, BEAT = 7, 14  # grid origin (frame) and frames per beat


def ts(f):
    return f / FPS


mus = np.zeros((N, 2))
drm = np.zeros((N, 2))
sfx = np.zeros((N, 2))
rev = np.zeros((N, 2))


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


# ---------------------------------------------------------------- harmony: A major, vi - IV - I - V (F#m D A E)
CH = {'F#m': [54, 57, 61], 'D': [50, 54, 57], 'A': [57, 61, 64], 'E': [52, 56, 59]}
ROOT = {'F#m': 42, 'D': 38, 'A': 45, 'E': 40}
CYC = ['F#m', 'D', 'A', 'E']

if QUAL == 'A':
    SECT = [(0, None), (G0, 'light'), (119, 'full'), (287, 'groove'), (399, 'full'), (623, 'build'), (679, 'full'), (735, 'outro'), (NFR, 'end')]
else:
    SECT = [(0, None), (G0, 'full'), (175, 'groove'), (231, 'break'), (343, 'full'), (455, 'groove'), (511, 'full'), (651, 'outro'), (NFR, 'end')]


def sect(f):
    s = None
    for a, n in SECT:
        if f >= a:
            s = n
    return s


nbars = (NFR - G0) // (4 * BEAT) + 2
for b in range(nbars):
    f0 = G0 + b * 4 * BEAT
    if f0 >= NFR:
        break
    sc = sect(f0)
    if sc in (None, 'end'):
        continue
    ch = CYC[b % 4]
    if sc == 'outro':
        ch = 'A'
    notes = CH[ch]
    bar_d = 4 * BEAT / FPS
    # pad (chord bed)
    padg = {'light': 0.9, 'full': 0.55, 'groove': 0.6, 'break': 0.85, 'build': 0.8, 'outro': 1.0}[sc]
    dd = bar_d * (2.6 if sc == 'outro' else 1.0)
    for k, m in enumerate(notes):
        place(mus, pad_voice(midi(m), dd), f0, 0.55 * padg, pan=(k - 1) * 0.4, send=0.25)
    # pluck arpeggio in 16ths: carries on phone speakers
    arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12, notes[0] + 24, notes[2] + 12, notes[1] + 12, notes[2]]
    pg = {'light': 0.5, 'full': 0.42, 'groove': 0.36, 'break': 0.3, 'build': 0.45, 'outro': 0.3}[sc]
    steps = 16 if sc != 'outro' else 4
    for s in range(steps):
        ff = f0 + s * BEAT / 4 * (4 if sc == 'outro' else 1)
        if sc == 'break' and s % 2:
            continue
        acc = 1.0 if s % 4 == 0 else 0.7
        place(mus, pluck(midi(arp[s % 8]), 0.4, bright=0.9 if sc == 'light' else 1.2), ff, pg * acc, pan=0.35 * np.sin(s * 1.3), send=0.18)
    # bass in 8ths
    if sc in ('full', 'groove', 'build'):
        r = ROOT[ch]
        for s in range(8):
            ff = f0 + s * BEAT / 2
            m = r + (12 if s % 2 else 0)
            place(mus, bass(midi(m), 0.2, 0.12), ff, 0.55 if s % 2 == 0 else 0.35)
    # drums
    for bt in range(4):
        fb = f0 + bt * BEAT
        if sect(fb) in ('outro', 'end') and sc != 'outro':
            continue  # the groove stops dead on the final hit
        if sc in ('full', 'groove'):
            place(drm, kick(), fb, 0.9)
            if bt in (1, 3):
                place(drm, clap(), fb, 0.5, send=0.15)
                if sc == 'full':
                    place(drm, snare(0.7), fb, 0.25)
            for h in range(2 if sc == 'groove' else 4):
                place(drm, hat(open_=(sc == 'full' and h == 2)), fb + h * BEAT / (2 if sc == 'groove' else 4), 0.28 if h % 2 else 0.18, pan=0.3)
        elif sc == 'light':
            place(drm, hat(), fb + BEAT / 2, 0.22, pan=0.3)
            place(drm, shaker(), fb, 0.2, pan=-0.3)
        elif sc == 'break':
            place(drm, rim(), fb + BEAT / 2, 0.22, pan=-0.2)
            place(drm, tick(2200, 0.03, 0.004), fb, 0.12)  # clock: the waiting of hiring 3 people
        elif sc == 'build':
            for q in range(4 if bt < 2 else 8):
                place(drm, snare(0.6), fb + q * BEAT / (4 if bt < 2 else 8), 0.12 + 0.05 * bt)
        elif sc == 'outro' and bt == 0:
            place(drm, kick(punch=1.2), fb, 1.0)
# final chord on the outro hit (it may fall mid-bar)
for a, n in SECT:
    if n == 'outro':
        for k, m in enumerate(CH['A'] + [45 + 12]):
            place(mus, pad_voice(midi(m), max(0.6, (NFR - a) / FPS)), a, 0.6, pan=(k - 1.5) * 0.3, send=0.3)
        place(mus, bass(midi(33), 0.9, 0.5), a, 0.8)
        place(mus, bell(midi(81), 2.0, 0.8), a, 0.18, send=0.4)
        place(drm, kick(punch=1.2), a, 1.0)
# section hits
for a, n in SECT:
    if n in ('full', 'outro') and a > 0:
        place(drm, crash(), a, 0.55, send=0.2)
        place(sfx, impact(1.6), a, 0.35)
    if n in ('full', 'outro') and a > 40:
        place(sfx, riser(0.9, 300, 7000), a - 27, 0.18)

# ---------------------------------------------------------------- sound effects on the picture's events
E = EV
whips = {'whipL': (0.22, 700, 5200), 'whipR': (0.22, 700, 5200), 'whipU': (0.24, 500, 6000), 'zoomOut': (0.35, 4000, 600), 'punch': None, 'cut': None}
ENTERS = {
    'A': {'A02': 'zoomOut', 'A03': 'whipU', 'A04': 'punch', 'A05': 'whipL', 'A06': 'whipU', 'A07': 'whipL', 'A08': 'punch', 'A09': 'punch', 'A10': 'whipU', 'A11': 'whipL', 'A12': 'whipL', 'A13': 'whipU', 'A14': 'punch', 'A15': 'zoomOut'},
    'B': {'B02': 'whipU', 'B03': 'cut', 'B04': 'whipL', 'B05': 'punch', 'B06': 'zoomOut', 'B07': 'whipU', 'B08': 'whipL'},
}[QUAL]
for n, e in ENTERS.items():
    w = whips[e]
    if w:
        place(sfx, whoosh(w[0], w[1], w[2], peak=0.35, bw=0.7, tail=0.4), INI[n] - 3, 0.32, pan=0.25 if e == 'whipL' else 0.0, send=0.1)
    elif e == 'punch':
        place(sfx, thud(0.3, 70), INI[n], 0.25)


def digit_ticks(land, start):
    """ratchet of an odometer digit: one tick per digit passing (0.6 per frame), slowing into the landing."""
    out = []
    v = 0.0
    for fr in range(start, land):
        d = land - fr
        pos = -2.2 - 0.6 * (d - 16) if d > 16 else -2.2 * (d / 16) ** 2
        if int(np.floor(pos)) != int(np.floor(v)) and fr > start:
            out.append(fr)
        v = pos
    return out


if QUAL == 'A':
    # A01-A02 odometer 39,90
    for k, L in enumerate(E['odo']):
        for fr in digit_ticks(L, 0):
            place(sfx, tick(2600 + 300 * k, 0.025, 0.003), fr, 0.10, pan=-0.3 + 0.2 * k)
        place(sfx, tap(420 - 40 * k, weight=0.8), L, 0.42, send=0.08)
    place(sfx, thud(0.5, 52), E['odo'][3], 0.5)
    place(sfx, swish(0.3, 1500, 400), 46, 0.12)  # tag swing
    place(sfx, swish(0.3, 400, 1500), 60, 0.08)
    # A03 tag swing on phone
    place(sfx, swish(0.25, 1200, 500), 80, 0.07)
    # A04 SIM echo + stamp
    for d in range(3):
        place(sfx, tap(300 + 60 * d), E['sim'] + d * 2.5, 0.15, pan=0.4 * (d - 1))
    place(sfx, flap_land(196, 0.35, 1.3), E['isso'], 0.6, send=0.15)
    place(sfx, thud(0.45, 60), E['isso'], 0.45)
    # A05 box flaps + tape
    i5 = INI['A05']
    place(sfx, flap_land(262, 0.3), i5 + 8, 0.35)
    place(sfx, flap_land(294, 0.3), i5 + 15, 0.4)
    place(sfx, whoosh(0.32, 1800, 5500, peak=0.85, bw=0.5, tail=0.1), i5 + 20, 0.3)  # tape pull
    place(sfx, snap(), i5 + 29, 0.45)
    place(sfx, flap_land(330, 0.3, 0.6), i5 + 27 + 3, 0.35)  # 10x sticker
    # A06 ten phones landing: rising taps
    order = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9]
    for j in range(10):
        place(sfx, tap(midi(69 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][j]) / 2, 0), INI['A06'] + j * 1.4 + 5, 0.22, pan=(order[j] - 4.5) / 6)
    # A07 timecode 00 -> 30
    t0 = E['trinta'] - 4
    last = -1
    for fr in range(t0, t0 + 22):
        u = min(1, max(0, (fr - t0) / 20))
        sec = round(30 * (1 - (1 - u) ** 2.2))
        if sec != last and fr > t0:
            place(sfx, tick(3400, 0.02, 0.003), fr, 0.09)
        last = sec
    place(sfx, blip(1760, 0.3, 0.12), t0 + 20, 0.22, send=0.15)
    # A08 receipt printing + total
    i8 = INI['A08']
    for k in range(10):
        place(sfx, bp(noise(0.05), 2500, 9000) * np.exp(-T(0.05) / 0.012), i8 + k * 1.8, 0.16, pan=0.1)
        place(sfx, keytick(), i8 + k * 1.8 + 0.6, 0.18)
    place(sfx, whoosh(0.5, 900, 2600, peak=0.5, bw=0.5, tail=0.4), i8 + 18, 0.1)  # paper feed
    p399 = E['p399'] - i8
    for k, d_ in enumerate([8, 24, 38]):
        L = E['p399'] + d_
        for fr in digit_ticks(L, i8 + 20):
            place(sfx, tick(2400 + 300 * k, 0.025, 0.003), fr, 0.07)
        place(sfx, tap(380 - 30 * k, weight=0.6), L, 0.35)
    L = E['p399'] + 38
    place(sfx, bell(midi(88), 1.2, 0.35), L, 0.16, send=0.25)
    place(sfx, bell(midi(93), 1.2, 0.35), L + 2, 0.12, send=0.25)
    # A09 checks + stamp
    for j in range(6):
        place(sfx, blip(midi(76 + [0, 2, 4, 7, 9, 12][j]), 0.12, 0.05), INI['A09'] + j * 3 + 2, 0.12, pan=0.3)
    place(sfx, flap_land(175, 0.4, 1.4), E['incluso'], 0.7, send=0.18)
    place(sfx, thud(0.6, 50), E['incluso'], 0.5)
    # A10 typing
    for fr in range(INI['A10'], INI['A10'] + 13, 2):
        place(sfx, keytick(), fr, 0.2, pan=0.2 * np.sin(fr))
    # A11 mic pop
    place(sfx, pop(700, 0.2), INI['A11'] + 2, 0.25)
    # A12 clips snapping
    for ri in range(2):
        for ci in range(4):
            place(sfx, snap(), INI['A12'] + ri * 2 + ci * 2.2 + 6, 0.13, pan=-0.4 + 0.25 * ci)
    # A13 ten videos fly in, checks, move, toggles
    for k in range(10):
        place(sfx, swish(0.12, 1500, 4500), E['dez2'] - 9 + k * 1.3, 0.05, pan=(k % 5 - 2) / 3)
        place(sfx, tap(midi(64 + k), 0), E['dez2'] - 2 + k * 1.3, 0.1, pan=(k % 5 - 2) / 3)
        place(sfx, blip(midi(81 + (k % 3) * 2), 0.1, 0.04), E['prontos'] + k, 0.08)
    place(sfx, whoosh(0.5, 400, 2500, peak=0.5, bw=0.6, tail=0.4), E['usar'] - 4, 0.18)
    for c in range(3):
        place(sfx, mouse_click(), E['campanhas'] + c * 3, 0.3, pan=-0.4 + 0.4 * c)
    # A14 split wipe + crown
    place(sfx, whoosh(0.3, 3000, 900, peak=0.4, bw=0.6, tail=0.5), E['diferentes'] - 4, 0.25)
    place(sfx, bell(midi(81), 1.6, 0.5), E['abordagens'], 0.2, send=0.3)
    place(sfx, bell(midi(88), 1.6, 0.5), E['abordagens'], 0.12, send=0.3)
    place(sfx, thud(0.5, 58), E['abordagens'], 0.4)
    # A15 button + click
    place(sfx, pop(520, 0.2), INI['A15'] + 8, 0.25)
    place(sfx, button_press(), E['saiba'], 0.55)
    place(sfx, mouse_click(), E['saiba'], 0.3)
else:
    # B01 fall + slam
    place(sfx, riser(0.25, 600, 4000, tone=False), 0, 0.25)
    place(sfx, impact(2.0), E['preco'], 0.6)
    place(sfx, thud(0.6, 46), E['preco'], 0.6)
    place(sfx, swish(0.2, 800, 4000), E['preco'] + 1, 0.12)
    place(sfx, riser(0.2, 700, 4500, tone=False), E['preco2'] - 6, 0.2)
    place(sfx, thud(0.5, 52), E['preco2'], 0.5)
    place(sfx, tap(330, weight=0.9), E['preco2'], 0.35)
    place(sfx, swish(0.2, 800, 4000), E['preco2'] + 1, 0.1)
    for k in range(0, 19, 2):
        place(sfx, keytick(), E['preco2'] + 8 + k * 0.8, 0.08)
    # B02 pieces + snap together
    i2 = INI['B02']
    for k, at in enumerate([2, 6, 10]):
        place(sfx, swish(0.18, 700, 3500), i2 + at, 0.12, pan=[-0.6, 0.6, 0.5][k])
        place(sfx, tap(midi(62 + 4 * k), 0), i2 + at + 5, 0.16, pan=[-0.6, 0.6, 0.5][k])
    place(sfx, suck(0.3), E['completo'] - 9, 0.22)
    place(sfx, plip(), E['completo'], 0.4)
    # B03 typing + bands + clips
    for fr in range(INI['B03'] + 2, INI['B03'] + 17, 2):
        place(sfx, keytick(), fr, 0.18, pan=0.2)
    place(sfx, whoosh(0.22, 3000, 700, peak=0.35, bw=0.7, tail=0.4), E['locucao'] - 4, 0.3, pan=0.4)
    place(sfx, whoosh(0.22, 3000, 700, peak=0.35, bw=0.7, tail=0.4), E['edicao'] - 4, 0.3, pan=-0.4)
    for k in range(5):
        place(sfx, snap(), E['edicao'] + 2 + k * 2 + 4, 0.12)
    # B04 headline swap + hiring cards
    place(sfx, swish(0.2, 3000, 800), E['contratar'] - 5, 0.15)
    for k, x in enumerate(['copywriter', 'locutor', 'editor']):
        place(sfx, swish(0.2, 3500, 900), E[x] - 5, 0.12, pan=0.5)
        place(sfx, flap_land(220 + 40 * k, 0.3, 0.6), E[x] + 1, 0.3)
    # B05 chat chaos
    for k in range(6):
        place(sfx, blip(midi([79, 84, 81, 86, 83, 88][k]), 0.14, 0.05), INI['B05'] + k * 3.2, 0.22, pan=[-0.5, 0.5, -0.4, 0.4, -0.5, 0.5][k])
        place(sfx, pop(1100, 0.12), INI['B05'] + k * 3.2 + 3, 0.08)
    buzz = lp(np.sign(np.sin(2 * np.pi * 150 * T(0.5))) * 0.3, 800) * np.clip(1 - T(0.5) / 0.5, 0, 1)
    place(sfx, buzz, INI['B05'] + 6, 0.12)
    # B06 squircle + crown + reply typing
    place(sfx, pop(600, 0.2), INI['B06'] + 2, 0.3)
    place(sfx, bell(midi(81), 1.6, 0.5), INI['B06'] + 6, 0.16, send=0.3)
    place(sfx, bell(midi(85), 1.6, 0.5), INI['B06'] + 6, 0.1, send=0.3)
    for fr in range(INI['B06'] + 10, INI['B06'] + 22, 2):
        place(sfx, keytick(), fr, 0.12)
    place(sfx, blip(1320, 0.15, 0.05), INI['B06'] + 25, 0.15)
    # B07 export progress + ding
    for fr in range(INI['B07'] + 2, E['pronto'] - 3, 3):
        place(sfx, tick(1800 + (fr - INI['B07']) * 25, 0.02, 0.003), fr, 0.05)
    place(sfx, bell(midi(84), 1.4, 0.45), E['pronto'] - 2, 0.22, send=0.25)
    place(sfx, bell(midi(91), 1.4, 0.45), E['pronto'], 0.14, send=0.25)
    place(sfx, pop(800, 0.18), E['pronto'] - 2, 0.25)
    # B08 phone + live pill
    place(sfx, pop(900, 0.16), E['anunciar'] + 4, 0.22)
    # B09 pull-back, carousel steps
    place(sfx, suck(0.45), INI['B09'] - 2, 0.25)
    place(sfx, whoosh(0.5, 4000, 500, peak=0.3, bw=0.7, tail=0.5), INI['B09'], 0.2)
    t0 = E['exemplo'] + 20
    for k in range(4):
        fr = t0 + k * 30 + 21
        if fr < NFR - 6:
            place(sfx, swish(0.22, 900, 4200), fr - 2, 0.16, pan=-0.3)
            place(sfx, tap(midi(57 + 2 * k), 0), fr + 8, 0.1)
    # B10 button + click
    place(sfx, pop(520, 0.2), INI['B10'] + 8, 0.25)
    place(sfx, button_press(), E['saiba'], 0.55)
    place(sfx, mouse_click(), E['saiba'], 0.3)

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
tmp = os.path.join(OUT, f'_voz-{QUAL}.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', VOZ, '-ac', '1', '-ar', str(SR), tmp], check=True)
_, v = wavfile.read(tmp)
os.remove(tmp)
v = v.astype(np.float64) / (32768.0 if v.dtype == np.int16 else 1.0)
v = hp(v, 90)
voice = np.zeros(N)
voice[: min(N, len(v))] = v[:N]
rms = np.sqrt(uniform_filter1d(voice ** 2, int(0.03 * SR)) + 1e-12)
act = maximum_filter1d((rms > 10 ** (-40 / 20)).astype(float), int(0.12 * SR))
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
DUCK_SFX = 10 ** (-4.0 * act_s / 20)
G = {'mus': 1.0, 'drm': 0.8, 'sfx': 1.6, 'wet': 0.55}
stems = {
    'music': mus * G['mus'] * DUCK[:, None],
    'drums': drm * G['drm'] * DUCK[:, None],
    'sfx': sfx * G['sfx'] * DUCK_SFX[:, None],
    'reverb': wet * G['wet'] * DUCK[:, None],
}
speaking = act_s > 0.9
bed = (stems['music'] + stems['drums'] + stems['reverb'])[speaking]  # CLAUDE.md: music 18-22 LU under the voice
bed_rms = np.sqrt(np.mean(bed ** 2))
v_rms = np.sqrt(np.mean(voice[speaking & (np.abs(voice) > 1e-4)] ** 2))
VOICE_OVER = 19.0
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


MIX = os.path.join(OUT, f'audio-{QUAL}.wav')
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
    write(os.path.join(OUT, f'stem-{QUAL}-{name}.wav'), st[: len(mix)] * gain)
print('written', MIX)
