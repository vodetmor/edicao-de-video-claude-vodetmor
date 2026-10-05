"""Score + sound design for the VSLPLAY ad (48 s, 30 fps), all synthesized.

128.57 BPM = 14 frames per beat, so every hit in the picture sits on the grid. Each sound effect is placed on
the exact frame of its visible action (frame numbers mirror src/timeline.ts and the scene files).
Run: python3 audio/make_audio.py  ->  out/audio/mix.wav (+ stems), master -14 LUFS, true peak <= -1 dBTP.
"""
import json
import os
import re
import subprocess

import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve, resample_poly

from synth import (SR, bass, bell, blip, bp, button_press, click_part, clap, crash, ep, hat, hp, impact, keytick, kick,
                   lp, mallet, midi, mouse_click, noise, norm, pad_voice, plip, pluck, pop, rim, riser, shaker, shimmer,
                   snap, snare, suck, swish, tap, thud, tick, tom, whoosh, rng, flap_land, flap_air, hop)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
OUT = os.path.join(ROOT, 'out', 'audio')
os.makedirs(OUT, exist_ok=True)

FPS = 30
NFR = 1440
N = int(SR * NFR / FPS)
BEAT = 14  # frames


def ts(f):
    return f / FPS


def bus():
    return np.zeros((N, 2))


mus, bas, drm, sfx, rev, ant = bus(), bus(), bus(), bus(), bus(), bus()
KICKS = []


def place(dst, sig, f, gain=1.0, pan=0.0, send=0.0, sec=False):
    """Add a mono (or stereo) signal at frame f (or seconds if sec)."""
    t = f if sec else ts(f)
    i = int(round(t * SR))
    if i >= N or gain == 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        st = np.stack([sig * l, sig * r], 1)
    else:
        st = sig
    dst[i : i + len(st)] += st * gain
    if send:
        rev[i : i + len(st)] += st * gain * send


def pan_ramp(sig, p0, p1):
    p = np.linspace(p0, p1, len(sig))
    return np.stack([sig * np.cos((p + 1) * np.pi / 4) * 1.414, sig * np.sin((p + 1) * np.pi / 4) * 1.414], 1)


# ---------------------------------------------------------------- easing mirrors of src/kit.tsx
def bez(x1, y1, x2, y2):
    def f(t):
        t = np.clip(np.asarray(t, float), 0, 1)
        lo, hi = np.zeros_like(t), np.ones_like(t)
        for _ in range(40):
            u = (lo + hi) / 2
            x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3
            m = x < t
            lo, hi = np.where(m, u, lo), np.where(m, hi, u)
        u = (lo + hi) / 2
        return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3
    return f


E_prod, E_expr, E_cam = bez(0.2, 0, 0.38, 0.9), bez(0.4, 0.14, 0.3, 1), bez(0.45, 0, 0.55, 1)


def prog(f, a, d):
    return np.clip((np.asarray(f, float) - a) / d, 0, 1)


def spring(f, start, w=0.35, z=0.75):
    t = np.maximum(np.asarray(f, float) - start, 0)
    wd = w * np.sqrt(1 - z * z)
    return np.where(t <= 0, 0.0, 1 - np.exp(-z * w * t) * (np.cos(wd * t) + (z * w / wd) * np.sin(wd * t)))


def crossings(fn, a, b, levels):
    """Frames where fn (a function of fractional frame) first reaches each level."""
    fr = np.arange(a, b + 0.01, 0.01)
    v = fn(fr)
    out = []
    for L in levels:
        idx = np.nonzero(v >= L - 1e-9)[0]
        if len(idx):
            out.append(fr[idx[0]])
    return out


# ---------------------------------------------------------------- harmony
VOICING = {'D': ([54, 57, 61, 64], 38), 'Bm': ([50, 54, 57, 61], 35), 'G': ([50, 54, 57, 59], 43), 'A': ([52, 54, 57, 61], 45)}
CYCLE = ['D', 'Bm', 'G', 'A']


def chord_at(f):
    if f < 112:
        return 'D'
    if 1260 <= f < 1316:
        return 'G'
    if 1316 <= f < 1344:
        return 'A'
    if f >= 1344:
        return 'D'
    return CYCLE[((f - 112) // 56) % 4]


# section of the music (what plays) by frame
MUSIC = [(0, 'intro'), (112, 'grooveA'), (224, 'break'), (252, 'card'), (280, 'groove'), (488, 'break'), (504, 'card'),
         (532, 'groove'), (588, 'chart'), (658, 'groove'), (712, 'break'), (728, 'card'), (756, 'groove'),
         (961, 'breakdown'), (1022, 'groove'), (1078, 'full'), (1162, 'groove'), (1260, 'build'), (1302, 'silence'),
         (1316, 'release'), (1344, 'outro'), (NFR, 'end')]
# each chapter has its own kit (the v4 critique measured one loop repeating at 0.97 correlation f252-959):
# Atenção B (four on the floor, shaker), Retenção R (sixteenth hats, syncopated kick), Conversão C (open hats,
# clap + snare on 2 and 4, a pickup kick into every bar)
DRUMS = [(0, None), (112, 'A'), (224, None), (280, 'B'), (488, None), (532, 'R'), (588, 'H'), (658, 'R'), (712, None),
         (756, 'C'), (961, 'T'), (1022, 'A'), (1078, 'F'), (1162, 'B'), (1260, 'C'), (1302, None), (NFR, None)]
END_DECAY = 1390  # the last chord lets go here and decays to the end (about 1.6 s)


def sect(table, f):
    s = table[0][1]
    for a, name in table:
        if f >= a:
            s = name
    return s


# ---------------------------------------------------------------- pad (chord bed)
PAD_LEVEL = {'intro': 0.8, 'grooveA': 0.6, 'break': 0.8, 'card': 0.75, 'groove': 0.5, 'chart': 0.75, 'breakdown': 0.9,
             'full': 0.55, 'build': 0.7, 'silence': 0.0, 'release': 0.85, 'outro': 1.0}
PAD_BRIGHT = {'breakdown': 1000, 'chart': 1600, 'intro': 1500}
bounds = sorted(set([a for a, _ in MUSIC] + list(range(112, NFR, 56)) + [1260, 1316, 1344]))
segs = []
for a, b in zip(bounds[:-1], bounds[1:]):
    name = sect(MUSIC, a)
    ch = chord_at(a)
    if segs and segs[-1][2] == ch and segs[-1][3] == name:
        segs[-1][1] = b
    else:
        segs.append([a, b, ch, name])
for a, b, ch, name in segs:
    lvl = PAD_LEVEL.get(name, 0)
    if lvl <= 0:
        continue
    d = ts(b - a)
    att = 1.4 if name == 'intro' else (0.05 if name in ('release', 'outro') else 0.35)
    rel = 1.6 if name == 'outro' else 0.5
    if name == 'outro':
        d = ts(END_DECAY - a)
    for k, m in enumerate(VOICING[ch][0]):
        place(mus, pad_voice(midi(m), d, att=att, rel=rel, bright=PAD_BRIGHT.get(name, 2400)), a, 0.22 * lvl, pan=-0.35 + 0.23 * k, send=0.35)

# ---------------------------------------------------------------- arp (FM mallet) and bass
ARP = {'grooveA': (7, 0.13), 'break': (7, 0.09), 'card': (7, 0.10), 'groove': (7, 0.11), 'full': (3.5, 0.13),
       'build': (3.5, 0.12), 'release': (3.5, 0.12), 'outro': (7, 0.10)}
PAT8 = [3, 1, 2, 4, 3, 1, 2, 0]
PAT16 = [3, 1, 2, 4, 3, 1, 2, 0, 3, 2, 4, 1, 3, 2, 1, 0]
step_f = 112.0
k = 0
while step_f < NFR:
    f = step_f
    name = sect(MUSIC, int(f))
    if name in ARP:
        stp, g = ARP[name]
        ch = chord_at(int(f))
        vo, root = VOICING[ch]
        tones = sorted(set([root + 36] + [v + 12 for v in vo]))
        pat = PAT16 if stp < 7 else PAT8
        idx = int(round((f - 112) / stp)) % len(pat)
        note = tones[min(pat[idx], len(tones) - 1)]
        acc = 1.0 if abs((f - 112) % 14) < 0.01 else 0.72
        if name == 'outro':
            acc *= max(0.0, 1 - (f - 1344) / 56) ** 1.3
        place(mus, mallet(midi(note), 0.6, bright=0.9 if name != 'break' else 0.5), f, g * acc, pan=(-0.3 if k % 2 else 0.3), send=0.3)
        step_f += stp
    else:
        step_f += 3.5
    k += 1

BASS = {'grooveA': 'eighths', 'groove': 'eighths', 'full': 'eighths', 'build': 'eighths', 'chart': 'halves'}
for b in range(0, NFR // 7 + 1):
    f = b * 7
    name = sect(MUSIC, f)
    mode = BASS.get(name)
    if not mode or f < 112:
        continue
    root = VOICING[chord_at(f)][1]
    on_beat = f % 14 == 0
    if mode == 'halves':
        if f % 28 == 0:
            place(bas, bass(midi(root), 0.9, decay=0.45), f, 0.36)
        continue
    place(bas, bass(midi(root), 0.24), f, 0.26 if on_beat else 0.16)

# ---------------------------------------------------------------- drums
for b in range(0, NFR // BEAT + 1):
    f = b * BEAT
    pat = sect(DRUMS, f)
    if pat is None:
        continue
    bar_beat = ((f - 112) // BEAT) % 4 if f >= 112 else b % 4
    off = f + 7
    if pat in ('A', 'H'):
        if bar_beat in (0, 2):
            place(drm, kick(), f, 0.55 if pat == 'A' else 0.45)
            KICKS.append(f)
        place(drm, hat(), off, 0.35 if pat == 'A' else 0.22, pan=0.25)
        if pat == 'A' and bar_beat == 3:
            place(drm, rim(), f, 0.25, pan=-0.2, send=0.15)
    elif pat == 'R':
        # Retenção: kick on 1 and 3 and on the last sixteenth of 2, clap on 2 and 4, closed sixteenth hats
        if bar_beat in (0, 2):
            place(drm, kick(), f, 0.55)
            KICKS.append(f)
        if bar_beat == 1:
            place(drm, kick(), f + 10.5, 0.38)
        if bar_beat in (1, 3):
            place(drm, clap(), f, 0.4, pan=-0.05, send=0.2)
        for s, g in ((0, 0.12), (3.5, 0.2), (7, 0.3), (10.5, 0.2)):
            place(drm, hat(), f + s, g, pan=0.3 if s in (3.5, 10.5) else 0.2)
    elif pat in ('B', 'C', 'F'):
        place(drm, kick(), f, 0.55 if pat != 'F' else 0.62)
        KICKS.append(f)
        if pat == 'C' and bar_beat == 3:
            place(drm, kick(), f + 10.5, 0.34)  # pickup into the next bar
        if bar_beat in (1, 3):
            place(drm, clap(), f, 0.42 if pat != 'F' else 0.5, pan=-0.05, send=0.2)
            if pat == 'C':
                place(drm, snare(0.8), f, 0.3, pan=0.05, send=0.15)
        place(drm, hat(open_=(pat in ('C', 'F'))), off, 0.3 if pat == 'B' else 0.26, pan=0.25, send=0.05)
        if pat == 'C':
            for s in (3.5, 10.5):
                place(drm, hat(), f + s, 0.1, pan=0.35)
        else:
            for s in (0, 3.5, 7, 10.5):
                place(drm, shaker(), f + s, (0.10 if pat == 'B' else 0.16) * (1.0 if s in (3.5, 10.5) else 0.6), pan=-0.3)
    elif pat == 'T':
        for s in (0, 3.5, 7, 10.5):
            place(drm, hat(), f + s, 0.16 if s == 7 else 0.09, pan=0.2)

# fills into the two wipes (Coral to Cyan at 490, Cyan to Violet at 714): sixteenths over the last beat and a
# half, snare ghosts then toms falling high to low, the last one on the sixteenth before the wipe
def fill(end):
    for j, (s, kind, g) in enumerate(((21, 'sn', 0.1), (17.5, 'sn', 0.14), (14, 'hi', 0.3), (10.5, 'hi', 0.3),
                                        (7, 'mid', 0.34), (3.5, 'low', 0.4))):
        f = end - s
        if kind == 'sn':
            place(drm, snare(0.7), f, g, pan=0.1, send=0.1)
        else:
            place(drm, tom({'hi': 196, 'mid': 147, 'low': 110}[kind]), f, g, pan={'hi': 0.35, 'mid': 0.0, 'low': -0.35}[kind], send=0.15)


fill(490)
fill(714)

# build into the silence: accelerating snare roll 1274 -> 1302
roll = 1274.0
gap = 7.0
while roll < 1302:
    u = (roll - 1274) / 28
    place(drm, snare(), roll, 0.12 + 0.3 * u ** 1.5, pan=0.1, send=0.15)
    gap = max(1.75, gap * 0.8)
    roll += gap
place(sfx, riser(ts(1302 - 1260)), 1260, 0.3, send=0.1)

# ---------------------------------------------------------------- hits (chapter cards, cuts, release)
def hit(f, strength=1.0, chord=None, crash_g=0.45):
    strength *= 10 ** (-3 / 20)  # pre-attenuated: the limiter took 4-7 dB off these in v4
    place(drm, kick(punch=1.2), f, 0.7 * strength)
    KICKS.append(f)
    place(drm, crash(), f, crash_g * strength, pan=0.1, send=0.3)
    place(sfx, impact(), f, 0.16 * strength)
    ch = chord or chord_at(f)
    for i, m in enumerate(VOICING[ch][0]):
        place(mus, ep(midi(m + 12)), f, 0.16 * strength, pan=-0.3 + 0.2 * i, send=0.35)
    place(bas, bass(midi(VOICING[ch][1]), 0.9, decay=0.5), f, 0.4 * strength)


for f in (252, 504, 728):
    hit(f, 1.0)
hit(1078, 1.05)
place(drm, kick(), 1162, 0.4)
KICKS.append(1162)
place(drm, crash(), 1162, 0.16, send=0.3)

# ---------------------------------------------------------------- chapter layers (one per chapter)
# Each chapter adds its own voice to the loop, in the 200 Hz-3 kHz band that phone speakers keep.
def bars(a, b):
    f = 112 + ((a - 112 + 55) // 56) * 56
    while f < b:
        yield f
        f += 56


# ATENÇÃO (coral): off-beat pluck chords, a pop comp that lifts the groove
for b0 in bars(280, 488):
    for pos, acc in ((7, 0.8), (21, 1.0), (35, 0.8), (49, 1.0), (52.5, 0.6)):
        f = b0 + pos
        if f >= 486:
            continue
        vo, _ = VOICING[chord_at(int(f))]
        for i, m in enumerate(vo[1:]):
            place(mus, pluck(midi(m + 12), 0.35, bright=0.8, decay=0.12), f, 0.05 * acc, pan=-0.25 + 0.25 * i, send=0.12)

# RETENÇÃO (cyan): an airy octave shimmer over the chapter
for a0, b0 in ((532, 588), (588, 644), (644, 700)):
    vo, _ = VOICING[chord_at(a0)]
    for i, m in enumerate(vo[1:3]):
        place(mus, shimmer(midi(m + 24), ts(b0 - a0)), a0, 0.035, pan=-0.3 + 0.6 * i, send=0.5)


# the retention curve, played: one pluck per sixteenth while the head draws, its pitch the curve's value
# on the D major pentatonic (100% = D6, 0% = D4), panned with the head from left to right
def tau_chart(fr):
    fr = np.asarray(fr, float)
    return np.where(fr < 600, 0.0,
                    np.where(fr < 630, 5.69 * E_prod(prog(fr, 600, 30)),
                             np.where(fr < 640, 5.69 + (6.5 - 5.69) * (fr - 630) / 10, 6.5 + (184 - 6.5) * E_cam(prog(fr, 640, 22)))))


def curve_fn():
    d = json.load(open(os.path.join(ROOT, 'src', 'data', 'retention.json')))
    pts = d['curve']
    tt = np.array([p['t'] for p in pts])
    pp = np.array([p['p'] for p in pts])
    keep = np.concatenate([[True], np.diff(tt) > 1e-6])
    return PchipInterpolator(tt[keep], pp[keep])


CURVE = curve_fn()
PENTA = [m for m in range(60, 90) if m % 12 in (2, 4, 6, 9, 11)]  # D E F# A B
f = 600.0
while f <= 662.01:
    v = float(np.clip(CURVE(tau_chart(f)), 0, 100))
    m = min(PENTA, key=lambda q: abs(q - (62 + 24 * v / 100)))
    knee = abs(f - 630) < 1.8
    place(mus, pluck(midi(m), 0.5, bright=1.1, decay=0.2 if not knee else 0.4), f, (0.1 if not knee else 0.14) * (0 if os.environ.get('NO_SONIF') else 1),
          pan=-0.6 + 1.2 * (f - 600) / 62, send=0.3)
    f += 3.5

# CONVERSÃO (violet): a 3-3-2 pluck motif on the chord tones, climbing through the chapter into the price
for k, b0 in enumerate(bars(756, 961)):
    vo, _ = VOICING[chord_at(b0)]
    top = [vo[3] + 12, vo[2] + 12, vo[3] + 12] if k % 2 == 0 else [vo[3] + 12, vo[2] + 12, vo[1] + 24]
    for pos, m, acc in zip((0, 21, 42), top, (1.0, 0.85, 0.9)):
        place(mus, pluck(midi(m), 0.4, bright=1.0, decay=0.16), b0 + pos, 0.06 * acc * (1 + 0.08 * k), pan=0.2, send=0.2)
    if k % 2 == 1:
        place(mus, pluck(midi(vo[3] + 12), 0.3, bright=1.0, decay=0.12), b0 + 49, 0.045 * (1 + 0.08 * k), pan=0.2, send=0.2)


# ---------------------------------------------------------------- sound design, on the frame of each action
DOT = plip()


def cam_air(f, d_frames, push=True, g=0.1):
    """A soft air move for a camera push (rising) or pull back (falling), peaking mid-move."""
    d = ts(d_frames) + 0.15
    y = whoosh(d, 300, 1400, peak=0.5, bw=0.9, tail=0.5) if push else whoosh(d, 1400, 300, peak=0.5, bw=0.9, tail=0.5)
    place(sfx, lp(y, 3000), f, g, send=0.08)


# 1 · opening: the dot falls onto a hairline and bounces on the beat
place(sfx, swish(0.4, 600, 3000), 0, 0.10, send=0.1)
for f, fq, g in ((14, 1040, 0.55), (28, 930, 0.5), (42, 830, 0.46)):
    place(sfx, tap(fq), f, g, pan=-0.25 + f / 140, send=0.12)
place(sfx, tap(740, weight=0.9), 56, 0.7, pan=0.15, send=0.12)  # the weighty squash
place(sfx, swish(0.3, 3000, 800), 56, 0.08)  # the hairline retracts
place(sfx, whoosh(0.45, 400, 5200, peak=0.35), 57, 0.4, pan=0.2, send=0.1)  # launch
place(sfx, swish(0.4, 1500, 4200), 58, 0.07)  # triangle draws
place(sfx, snap(), 70, 0.42)  # SNAP: dry, pre-attenuated so the limiter leaves its transient alone
# the ribbons fall onto the icon as paper flaps (src/scenes/Opening.tsx FLAP): released 74/78/81, each lands
# 10 frames later and bounces back 6 frames after; the landings play D-F#-A
for rel, fq, pn in ((74, midi(62), -0.45), (78, midi(66), 0.0), (81, midi(69), 0.1)):
    place(sfx, flap_air(10), rel, 0.16, pan=pn, send=0.08)
    place(sfx, flap_land(fq), rel + 10, 0.42, pan=pn, send=0.12)
    place(sfx, flap_land(fq * 2, 0.2, 0.2), rel + 16, 0.1, pan=pn, send=0.1)  # the bounce comes back down
place(sfx, button_press(), 98, 0.6, send=0.1)  # the play triangle is pressed, on the beat
place(sfx, DOT, 112, 0.64, send=0.15)  # the dot lands in its socket (pre-attenuated 3 dB)
place(sfx, whoosh(1.2, 300, 1200, peak=0.4), 112, 0.10)  # camera pulls back
for f in (128, 130, 132):
    place(sfx, keytick(), f, 0.22)
for f, m in zip((136, 140, 144, 148), (74, 78, 81, 86)):
    place(sfx, mallet(midi(m), 0.9), f, 0.18, send=0.4)  # P L A Y strokes draw
place(sfx, bell(midi(90), 2.0), 172, 0.05, send=0.4)  # tagline

# 2 · deconstruction
place(sfx, whoosh(0.8, 2400, 300, peak=0.35), 224, 0.28, send=0.1)  # wordmark drops, camera moves in
place(sfx, pan_ramp(whoosh(0.5, 400, 3000, peak=0.4), 0, -0.9), 236, 0.34)  # cool leaves left
place(sfx, whoosh(0.5, 1500, 200, peak=0.4), 236, 0.28)  # purple drops
place(sfx, whoosh(0.5, 200, 2600, peak=0.8), 236, 0.42, send=0.1)  # warm grows toward the camera
place(sfx, riser(ts(252 - 224)), 224, 0.22)


def card(f0, letters, dot_at, exit_at):
    for i in range(letters):
        place(sfx, keytick(), f0 + i * 1.2, 0.13, pan=-0.4 + 0.8 * i / max(1, letters - 1))
    place(sfx, DOT, dot_at, 0.8, send=0.15)
    place(sfx, whoosh(0.35, 800, 5000, peak=0.35), exit_at, 0.26)
    place(sfx, swish(0.15, 2000, 7000), exit_at + 3, 0.16)


card(246, 7, 266, 280)
place(sfx, whoosh(0.5, 3000, 400, peak=0.3), 286, 0.34, send=0.1)  # coral field collapses into the Smart box

# 3 · chapter 1
for f in (296, 366, 436, 544, 596, 764, 828, 896):
    place(sfx, swish(0.25, 1500, 6000), f, 0.10)  # feature titles rise
place(sfx, lp(blip(1760, 0.3, 0.12), 2500), 302, 0.08, send=0.2)  # the muted Smart AutoPlay ping
place(sfx, mouse_click(), 336, 0.45)  # clicks pre-attenuated 5 dB: the limiter had flattened them
place(sfx, pop(700), 337, 0.22)
place(sfx, swish(0.2, 3000, 800), 336, 0.14)
cam_air(344, 14, push=False)  # the camera pulls back from the box
place(sfx, mouse_click(), 392, 0.45)
place(sfx, thud(0.4, 70), 392, 0.32)
place(sfx, lp(whoosh(0.22, 200, 900, peak=0.3, bw=0.9, tail=0.4), 1500), 392, 0.14)  # the camera punches in
place(sfx, pop(600), 394, 0.28, send=0.1)  # big play button springs in
cam_air(422, 12, push=False)
place(sfx, whoosh(0.3, 3000, 600, peak=0.3), 434, 0.24)  # "continue watching" slides in
cam_air(438, 18, push=True)
place(sfx, mouse_click(), 462, 0.45)
place(sfx, whoosh(0.3, 600, 4000, peak=0.4), 464, 0.24)  # overlay lifts away
place(sfx, whoosh(0.2, 1500, 7000, peak=0.5), 465, 0.1)  # the seek jumps to 07:42
# the tooltip counts up with the knob, then settles on 07:42
KNOB = lambda fr: 462 * E_expr(prog(fr, 465, 12))
for i, fx in enumerate(crossings(KNOB, 465, 477, np.arange(40, 461, 60))):
    place(sfx, tick(2200 * 2 ** (i / 12), 0.02, 0.003), fx, 0.07, pan=-0.2 + 0.05 * i)
place(sfx, blip(midi(86), 0.14), 477, 0.08, send=0.25)
place(sfx, pan_ramp(swish(0.25, 700, 4000), -0.5, 0), 493, 0.3)  # cool ribbon flies in
place(sfx, whoosh(0.4, 250, 2500, peak=0.75), 491, 0.4, send=0.1)  # it grows into the Cyan field (peak f500)

# 4 · chapter 2
card(500, 8, 518, 532)
place(sfx, whoosh(0.5, 3000, 300, peak=0.3), 534, 0.34, send=0.1)  # Cyan field collapses into the bar head
for i in range(1, 13):
    u = i / 12
    fake = 1 - (1 - u) ** 2.4
    place(sfx, tick(1200 * 2 ** (1.5 * fake), 0.04, 0.006), 550 + 32 * u, 0.16, pan=-0.3 + 0.6 * u)
place(sfx, swish(0.35, 3500, 900), 588, 0.14)  # the diagram draws back into its origin
place(sfx, tick(1900, 0.04, 0.008), 600, 0.1)  # the bar lands as the time axis
place(sfx, whoosh(0.55, 300, 3500, peak=0.45), 596, 0.28)  # the camera dives into the chart
place(sfx, thud(0.4, 80), 630, 0.34)  # the knee
place(sfx, tick(3000), 630, 0.1)
place(sfx, swish(0.34, 1000, 4000), 632, 0.1)  # the circle draws
place(sfx, pop(820), 641, 0.38, send=0.1)  # it fills
place(sfx, blip(midi(81)), 642, 0.14, send=0.2)  # "-42%"
place(sfx, keytick(), 646, 0.08)  # "nos primeiros 6 s"
place(sfx, whoosh(0.8, 2500, 300, peak=0.35), 640, 0.26)  # the view widens to the whole curve
for i in range(4):
    place(sfx, tick(2600 + 150 * i), 654 + 3 * i, 0.11)
    place(sfx, keytick(), 654 + 3 * i, 0.08)
place(sfx, swish(0.25, 500, 3000), 714, 0.3)  # purple ribbon rises
place(sfx, whoosh(0.4, 250, 2500, peak=0.75), 711, 0.4, send=0.1)  # it grows into the Violet field (full at 720)

# 5 · chapter 3
card(721, 9, 742, 756)
place(sfx, whoosh(0.5, 3000, 400, peak=0.3), 758, 0.34, send=0.1)  # Violet field folds into the diamond marker
place(sfx, tick(3200), 770, 0.18)
place(sfx, pop(1100), 770, 0.12)
place(sfx, tick(2800), 772, 0.1)  # tooltip 12:30
cam_air(776, 18, push=True)
for fx in crossings(lambda fr: 550 + 200 * E_prod(prog(fr, 772, 26)), 772, 798, np.arange(560, 751, 10)):
    place(sfx, tick(3500, 0.02, 0.003), fx, 0.09, pan=0.2)  # the playhead scrubs to 12:30
place(sfx, pop(500), 798, 0.4, send=0.1)  # touches the marker, the diamond squashes
place(sfx, swish(0.33, 1000, 5000), 801, 0.28)  # the diamond flies into the button
place(sfx, pop(700), 810, 0.45, send=0.15)  # COMPRAR AGORA grows out of it
place(sfx, thud(0.3, 90), 810, 0.18)
place(sfx, blip(midi(86)), 811, 0.12, send=0.3)
cam_air(818, 14, push=False)
for i in range(8):
    place(sfx, tick(2400 + 90 * i, 0.03, 0.004), 834 + 2 * i, 0.07)  # checklist rows
cam_air(838, 16, push=True)
for f, on in ((852, False), (859, False), (866, False), (873, False), (880, True), (887, True)):
    place(sfx, click_part(1.1 if on else 0.85), f, 0.34)
    place(sfx, blip(1350 if on else 900, 0.1, 0.03), f, 0.09 if on else 0.07)
cam_air(876, 14, push=False)
for i in range(4):
    place(sfx, pop(1000 + 100 * i), 900 + 2 * i, 0.11)  # swatches appear
for f, m in zip((904, 911, 918, 925), (71, 74, 78, 81)):
    place(sfx, mallet(midi(m), 0.8), f, 0.3, send=0.3)  # each color change, a note
    place(sfx, pop(1300), f, 0.08)
place(sfx, whoosh(0.3, 800, 2000, peak=0.5), 925, 0.1)  # corners round off


def elastic(start=933, frames=30):
    t = np.arange(int(SR * ts(frames))) / SR
    fr = start + t * FPS
    p = spring(fr, start, 0.3, 0.42)
    freq = 190 * 2 ** (0.9 * (p - 1))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    env = (1 - np.exp(-t / 0.01)) * np.exp(-t / 0.35)
    return lp(x * env, 2500)


place(sfx, tick(1800, 0.05, 0.01), 930, 0.08)  # the 3-frame anticipation
place(sfx, elastic(), 933, 0.4, send=0.15)  # the player stretches into the vertical format
place(sfx, pan_ramp(whoosh(0.5, 300, 6000, peak=0.33), 0.7, -0.7), 959, 0.6, send=0.1)  # the whip
place(sfx, thud(0.3, 70), 971, 0.2)
for i in range(4):
    place(sfx, tick(2000 + 200 * i, 0.03, 0.004), 971 + 2 * i, 0.06)  # rows settle one after another

# 6 · price
PLAYS = lambda fr: 100000 * E_prod(prog(fr, 974, 30))
for i, fx in enumerate(crossings(PLAYS, 974, 1004, np.arange(5000, 100001, 5000))):
    place(sfx, tick(1200 * 2 ** (i / 20), 0.03, 0.005), fx, 0.3, pan=-0.2 + 0.4 * i / 20)
F50K = crossings(PLAYS, 974, 1004, [50000])[0]
place(sfx, thud(0.6, 45), F50K, 0.3)  # past 50.000 the competitor starts charging per play
place(bas, bass(midi(33), 1.4, decay=0.9), F50K, 0.3)
place(sfx, riser(ts(1013 - F50K), 200, 3000, tone=False), F50K, 0.12)
place(sfx, swish(0.3, 2000, 4500), 1013, 0.12)  # the pill draws around R$ 582
place(sfx, thud(0.4, 60), 1022, 0.45)  # it fills and is pressed
place(sfx, pop(760), 1022, 0.34, send=0.1)
place(sfx, blip(midi(81), 0.14), 1022, 0.16, send=0.3)
place(sfx, blip(midi(86), 0.2), 1025, 0.16, send=0.3)

# 7 · e muito mais
for i in range(9):
    place(sfx, keytick(), 1077 + i * 1.1, 0.08)
for i, m in enumerate((74, 76, 78, 81, 83, 86)):
    f = 1092 + 7 * i
    place(sfx, mallet(midi(m), 0.7), f, 0.26, pan=0.2, send=0.3)
    place(sfx, keytick(), f, 0.1)
    place(sfx, tick(4200, 0.03, 0.004), f + 3, 0.09)
    place(sfx, blip(midi(93), 0.1, 0.03), f + 3, 0.05)
place(sfx, bell(midi(90), 1.5), 1139, 0.05, send=0.4)

# 8 · integrations: YouTube and MP4 plug into the icon, fold into it, then the 14 logos burst out
place(sfx, pop(620), 1162, 0.32, send=0.1)  # the icon
place(sfx, thud(0.3, 75), 1162, 0.24)
place(sfx, pop(880), 1166, 0.3, pan=-0.45, send=0.1)  # YouTube
place(sfx, pop(990), 1168, 0.28, pan=0.45, send=0.1)  # MP4
place(sfx, pan_ramp(swish(0.28, 900, 3500), -0.5, 0.5), 1174, 0.12)  # the connectors draw
place(sfx, lp(riser(ts(12), 400, 2400, tone=False), 5000), 1182, 0.08)  # the pulses run in
place(sfx, blip(midi(78), 0.16), 1194, 0.14, send=0.25)  # they arrive, the icon takes them
place(sfx, pop(700), 1194, 0.16)
place(sfx, whoosh(0.3, 2500, 500, peak=0.55), 1198, 0.2)  # the sources fold into the icon
place(sfx, pop(560), 1207, 0.2)
CELLS = sorted([(c, r) for r in range(3) for c in range(5) if not (r == 1 and c == 2)], key=lambda cr: np.hypot((cr[0] - 2) * 2, cr[1] - 1))
for i, (m, (c, r)) in enumerate(zip((62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86, 88, 90, 93), CELLS)):
    x = 400 + 280 * c
    place(sfx, pop(700 + 40 * i), 1206 + i, 0.09, pan=(x - 960) / 1100)
    place(sfx, mallet(midi(m), 0.5), 1206 + i, 0.11, pan=(x - 960) / 1100, send=0.25)

# 9 · the mark rebuilds
place(sfx, swish(0.45, 400, 2000), 1260, 0.1)
place(sfx, bell(midi(74), 1.6), 1260, 0.06, send=0.4)
USERS = lambda fr: 2000 * E_prod(prog(fr, 1264, 16))  # src/scenes/Finale.tsx FILL: counts 1264-1280, holds 14 frames
for i, fx in enumerate(crossings(USERS, 1264, 1280, np.arange(100, 2001, 100))):
    place(sfx, tick(1400 * 2 ** (i / 20), 0.03, 0.005), fx, 0.12)
place(sfx, pop(900), 1280, 0.22)
place(sfx, blip(midi(86)), 1280, 0.12, send=0.3)
SUCK = suck(ts(10))
place(sfx, SUCK, ts(1304) - len(SUCK) / SR, 0.42, sec=True)  # everything spirals into the dot
place(sfx, tick(2600), 1304, 0.12)

# anticipation, in near silence: the dot compresses
t = np.arange(int(SR * ts(12))) / SR
squeeze = np.sin(2 * np.pi * np.cumsum(58 - 14 * t / t[-1]) / SR) * (t / t[-1]) ** 2
squeeze += hp(lp(noise(ts(12)), 900), 200) * 0.25 * (t / t[-1]) ** 3
place(ant, squeeze, 1304, 0.1)
place(ant, np.sin(2 * np.pi * midi(93) * t) * np.clip(t / 0.1, 0, 1) * np.clip((t[-1] - t) / 0.02, 0, 1), 1304, 0.012)

# release (pre-attenuated 4.5 dB, like every loud hit below: in v4 the limiter took 6-7 dB off it)
REL_G = 10 ** (-4.5 / 20)
place(sfx, impact(), 1316, 0.45 * REL_G)
place(drm, kick(punch=1.3), 1316, 0.8 * REL_G)
KICKS.append(1316)
place(drm, crash(), 1316, 0.6 * REL_G, send=0.3)
for i, m in enumerate(VOICING['A'][0]):
    place(mus, ep(midi(m + 12), 2.0), 1316, 0.2, pan=-0.3 + 0.2 * i, send=0.4)
place(bas, bass(midi(45), 1.0, decay=0.5), 1316, 0.45)
place(sfx, whoosh(0.4, 500, 6000, peak=0.2), 1315, 0.45 * REL_G)  # the dot shoots up
place(sfx, whoosh(0.5, 2600, 400, peak=0.2), 1316, 0.34 * REL_G)  # the warm ribbon pulls out of the camera
# cool and purple come back as flaps (src/scenes/Finale.tsx FLAPS): released 1319/1321, landing on A and C#
for rel, fq, pn in ((1319, midi(69), -0.45), (1321, midi(73), 0.1)):
    place(sfx, flap_air(10), rel, 0.15, pan=pn, send=0.08)
    place(sfx, flap_land(fq), rel + 10, 0.4, pan=pn, send=0.12)
    place(sfx, flap_land(fq * 2, 0.2, 0.2), rel + 16, 0.09, pan=pn, send=0.1)
place(sfx, snap(), 1332, 0.42 * REL_G)  # the mark locks (the guides flash); no press: the triangle stays negative space

# land and lockup
place(sfx, DOT, 1344, 0.95 * REL_G, send=0.2)
place(drm, kick(), 1344, 0.5 * REL_G)
KICKS.append(1344)
for i, m in enumerate((74, 78, 81, 85, 88)):
    place(mus, bell(midi(m), 3.5, 1.4), ts(1344) + 0.06 * i, 0.08, pan=-0.4 + 0.2 * i, send=0.45, sec=True)
place(bas, bass(midi(38), 2.5, decay=1.2), 1344, 0.45)
place(sfx, whoosh(1.0, 300, 1200, peak=0.4), 1344, 0.1)
for f in (1354, 1356, 1358):
    place(sfx, keytick(), f, 0.2)
for f, m in zip((1362, 1366, 1370, 1374), (74, 78, 81, 86)):
    place(sfx, mallet(midi(m), 0.9), f, 0.18, send=0.4)
place(sfx, bell(midi(86), 2.5), 1376, 0.08, send=0.45)
place(sfx, bell(midi(93), 2.5), 1378, 0.05, send=0.45)
place(sfx, tick(3000), 1388, 0.07)
# the button: the dot hops once in its socket (src/scenes/Finale.tsx WINK) and lands
place(sfx, hop(), 1400, 0.12, pan=-0.25, send=0.15)
place(sfx, DOT, 1412, 0.42, pan=-0.25, send=0.2)

# ---------------------------------------------------------------- mix
# the bass also speaks on phones: a saturated copy, band-passed to 150 Hz-1.2 kHz, rides under it
harm = np.stack([bp(np.tanh(3.2 * bas[:, c] / (np.max(np.abs(bas)) + 1e-9)), 150, 1200) for c in range(2)], 1)
harm *= 0.3 * np.max(np.abs(bas))
mus += bas + harm
# presence lift: about +3.5 dB above 300 Hz on the score, so the chords and plucks survive small speakers
mus += 0.5 * np.stack([hp(mus[:, c], 300) for c in range(2)], 1)

# sidechain: the chord bed breathes with the kick
side = np.ones(N)
for kf in KICKS:
    i = int(ts(kf) * SR)
    L = min(int(0.25 * SR), N - i)
    if L > 0:
        side[i : i + L] = np.minimum(side[i : i + L], 1 - 0.38 * np.exp(-np.arange(L) / SR / 0.08))
mus *= side[:, None]


def make_ir(rt=1.7, pre=0.014):
    n = int(SR * rt * 1.1)
    t = np.arange(n) / SR
    env = np.exp(-6.91 * t / rt)
    ir = np.zeros((n + int(pre * SR), 2))
    for ch in range(2):
        ir[int(pre * SR):, ch] = lp(rng.standard_normal(n) * env, 6000)
    for dly, g in ((0.007, 0.5), (0.011, 0.4), (0.017, 0.3), (0.023, 0.25)):
        ir[int(dly * SR), 0] += g
        ir[int((dly + 0.003) * SR), 1] += g
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))


IR = make_ir()
wet = np.stack([fftconvolve(rev[:, c], IR[:, c])[:N] for c in range(2)], 1)

# the near silence before the release: everything but the anticipation drops away
gate = np.ones(N)
t0, t1 = int(ts(1302) * SR), int(ts(1316) * SR)
fade = int(0.03 * SR)
gate[t0:t1] = 0.02
gate[t0 : t0 + fade] = np.linspace(1, 0.02, fade)
gate_sfx = np.ones(N)
s0 = int(ts(1304) * SR)
gate_sfx[s0:t1] = 0.02
gate_sfx[s0 : s0 + int(0.01 * SR)] = np.linspace(1, 0.02, int(0.01 * SR))
G = {'mus': 1.0, 'drm': 0.8, 'sfx': 2.0 * 10 ** (-4 / 20), 'wet': 0.6}  # effects bus 4 dB under v2


def envelope(points):
    """Gain curve from (frame, dB) points, linear in dB between them."""
    fr = np.arange(N) / SR * FPS
    return 10 ** (np.interp(fr, [p[0] for p in points], [p[1] for p in points]) / 20)


# Macro dynamics (the v4 mix sat at one level, LRA 3.2 LU; the house range is 6-10): the cold open builds up into
# the downbeat where the music starts, the groove stays light under the logo and the tagline so the chapters lift
# when they arrive, and the score steps back under the price, so the numbers lead.
DYN_ALL = envelope([(0, -6.5), (60, -5.5), (100, -3), (112, 0), (NFR, 0)])
DYN_SCORE = envelope([(0, 0), (118, 0), (132, -4), (216, -4), (232, 0), (958, 0), (968, -5), (1014, -5), (1022, 0), (NFR, 0)])
stems = {
    'music': mus * G['mus'] * (gate * DYN_ALL * DYN_SCORE)[:, None],
    'drums': drm * G['drm'] * (gate * DYN_ALL * DYN_SCORE)[:, None],
    'sfx': sfx * G['sfx'] * (gate_sfx * DYN_ALL)[:, None] + ant,
    'reverb': wet * G['wet'] * (gate * DYN_ALL)[:, None],
}
mix = sum(stems.values())
mix = np.stack([hp(mix[:, c], 32) for c in range(2)], 1)
t = np.arange(N) / SR
# the last chord decays from END_DECAY (the pad's own release); only the final 0.12 s are faded for safety
mix *= np.clip((ts(NFR) - t) / 0.12, 0, 1)[:, None]


def limiter(x, ceiling=0.80, look=0.004, rel=0.09):
    # true-peak aware: detect on a 4x oversampled copy, so inter-sample overs are caught too
    up = np.stack([resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    pk = np.max(np.abs(up), axis=1)[: 4 * len(x)].reshape(-1, 4).max(axis=1)
    w = int(look * SR)
    pk = maximum_filter1d(pk, size=2 * w + 1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    a = np.exp(-16 / (rel * SR))
    gb = g.reshape(-1, 16).min(axis=1) if len(g) % 16 == 0 else np.pad(g, (0, 16 - len(g) % 16), constant_values=1).reshape(-1, 16).min(axis=1)
    out = np.empty_like(gb)
    cur = 1.0
    for i, v in enumerate(gb):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    gs = np.repeat(out, 16)[: len(g)]
    gs = np.minimum(uniform_filter1d(gs, size=int(0.002 * SR)), g)
    return x * gs[:, None]


FF = os.environ.get('FFMPEG', 'ffmpeg')
MIX = os.path.join(OUT, 'mix.wav')


def write(path, x):
    wavfile.write(path, SR, x.astype(np.float32))


def measure(path):
    r = subprocess.run([FF, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True)
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
    LRA = float(re.findall(r'LRA:\s+(-?[\d.]+) LU', r.stderr)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
    return I, LRA, tp


gain = 1.0 / (np.max(np.abs(mix)) + 1e-9) * 0.5
for it in range(6):
    y = limiter(mix * gain)
    write(MIX, y)
    I, LRA, tp = measure(MIX)
    print(f'pass {it}: I {I:.2f} LUFS, LRA {LRA:.1f} LU, TP {tp:.2f} dBTP')
    if abs(I + 14.0) < 0.15 and tp <= -1.0:
        break
    gain *= 10 ** ((-14.0 - I) / 20)
for name, st in stems.items():
    write(os.path.join(OUT, f'stem-{name}.wav'), st * gain)
print('written', MIX)
