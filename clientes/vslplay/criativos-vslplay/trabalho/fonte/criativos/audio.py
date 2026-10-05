"""Trilha, efeitos e mix dos criativos (100% sintetizado, sem amostras).
Uso: python3 criativos/audio.py c2   ->  out/audio/mix_c2.wav (-14 LUFS, pico real <= -1 dBTP)
A música tem grade própria (120 BPM = 15 quadros por tempo, primeiro tempo no quadro do impacto);
cada efeito cai no quadro do acontecimento na tela (src/data/keys_*.json)."""
import json, os, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, uniform_filter1d
from scipy.signal import fftconvolve, resample_poly
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'audio'))
from synth import *  # noqa

NAME = sys.argv[1] if len(sys.argv) > 1 else 'c2'
K = json.load(open(os.path.join(ROOT, f'src/data/keys_{NAME}.json')))
FPS = 30
NFR = K['end']
N = int(NFR / FPS * SR) + SR
OUT = os.path.join(ROOT, 'out/audio')
BEAT = 15  # frames per beat (120 BPM)
B0 = K.get('impact', 4)  # first downbeat


def bus():
    return np.zeros((N, 2))


mus, drm, sfx, rev = bus(), bus(), bus(), bus()


def place(dst, sig, f, gain=1.0, pan=0.0, send=0.0):
    i = int(round(f / FPS * SR))
    if i >= N or gain == 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    st = np.stack([sig * l, sig * r], 1)
    dst[i: i + len(st)] += st * gain
    if send:
        rev[i: i + len(st)] += st * gain * send


def ending_at(dst, sig, f, gain=1.0, **kw):
    place(dst, sig, f - len(sig) / SR * FPS, gain, **kw)


def beats(a, b, sub=1):
    """grid frames (beat / sub) inside [a, b)"""
    step = BEAT / sub
    n0 = int(np.ceil((a - B0) / step))
    out = []
    n = n0
    while B0 + n * step < b:
        out.append((B0 + n * step, n))
        n += 1
    return out


# A minor: Am F C G, one chord per bar (4 beats)
PROG = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]


def chord(f):
    bar = int(np.floor((f - B0) / (4 * BEAT)))
    return PROG[bar % 4]


def groove(a, b, kick_=True, clap_=True, hats=True, bassline=True, arp=True, g=1.0):
    for f, n in beats(a, b):
        if kick_:
            place(drm, kick(punch=1.1), f, 0.9 * g)
        if clap_ and n % 2 == 1:
            place(drm, clap(), f, 0.42 * g, send=0.12)
    if hats:
        for f, n in beats(a, b, 2):
            place(drm, hat(open_=(n % 2 == 1 and n % 4 == 3)), f, (0.24 if n % 2 else 0.14) * g, pan=0.25)
    if bassline:
        for f, n in beats(a, b, 2):
            root = chord(f)[0] - 24
            if n % 8 in (0, 3, 4, 6, 7):
                place(mus, bass(midi(root + (12 if n % 8 == 7 else 0)), d=0.22), f, 0.55 * g)
    if arp:
        for f, n in beats(a, b, 4):
            notes = chord(f)[1]
            seq = [0, 1, 2, 1, 2, 0, 1, 2]
            m = notes[seq[n % 8]] + 12
            place(mus, pluck(midi(m), d=0.3, bright=0.8, decay=0.12), f, 0.16 * g * (1.0 if n % 4 == 0 else 0.7), pan=-0.3 + 0.6 * ((n % 8) / 7), send=0.18)


def pad(a, b, g=0.5):
    for f, n in beats(a, b):
        if n % 4 == 0 or f == beats(a, b)[0][0]:
            bar_end = min(b, f + 4 * BEAT)
            for m in chord(f)[1]:
                place(mus, pad_voice(midi(m), (bar_end - f) / FPS, att=0.25, rel=0.5), f, g, send=0.3)


def tension(a, b, g=1.0):
    """no kick: a low pulse, ticking 16ths, the bass held"""
    for f, n in beats(a, b, 4):
        place(drm, shaker(), f, (0.16 if n % 2 else 0.1) * g, pan=0.3)
    for f, n in beats(a, b, 2):
        place(mus, bass(midi(chord(f)[0] - 24), d=0.3, decay=0.2), f, 0.32 * g)
    for f, n in beats(a, b):
        if n % 2 == 0:
            place(drm, kick(punch=0.6, tone=46), f, 0.35 * g)
    pad(a, b, 0.35 * g)


def hit(f, g=1.0, crash_g=0.4):
    place(drm, kick(punch=1.4), f, 1.0 * g)
    place(drm, crash(), f, crash_g * g, send=0.25)
    place(sfx, impact(1.6), f, 0.5 * g)


# ---------------------------------------------------------------------------------------------------
if NAME == 'c2':
    k = K
    # music
    hit(k['impact'], 1.1, 0.5)
    place(sfx, thud(0.6, 50), k['impact'], 0.9)
    groove(k['impact'], k['s2'])
    pad(k['impact'], k['s2'], 0.25)
    tension(k['s2'], k['s3'] - 2)
    ending_at(sfx, riser(1.2, 200, 5000), k['s3'], 0.32)
    hit(k['s3'], 0.8)
    groove(k['s3'], k['s4'])
    pad(k['s3'], k['s4'], 0.25)
    # breath: the page is still empty
    pad(k['s4'], k['s5'], 0.4)
    ending_at(sfx, riser(1.0, 300, 6000), k['s5'], 0.28)
    hit(k['s5'], 0.8)
    groove(k['s5'], k['s6'])
    pad(k['s5'], k['s6'], 0.22)
    # build into "na hora certa"
    for f, n in beats(k['s6'], k['junta']):
        place(drm, kick(punch=0.8), f, 0.5)
    for i, key in enumerate(['video', 'botao3', 'pagina']):
        place(drm, tom(110 + 30 * i), k[key], 0.9)
        place(drm, kick(punch=1.2), k[key], 0.7)
    for f, n in beats(k['junta'], k['hora'], 4):
        u = (f - k['junta']) / (k['hora'] - k['junta'])
        place(drm, snare(0.6 + 0.6 * u), f, 0.12 + 0.3 * u ** 2)
    pad(k['s6'], k['hora'], 0.3)
    ending_at(sfx, riser(1.4, 200, 7000), k['hora'], 0.35)
    hit(k['hora'], 1.0, 0.5)
    for m in (48, 52, 55, 60, 64):
        place(mus, pad_voice(midi(m), (k['s7'] - k['hora']) / FPS + 0.3, att=0.05, rel=1.2), k['hora'], 0.55, send=0.4)
        place(mus, bell(midi(m + 12)), k['hora'], 0.12, send=0.4)
    groove(k['hora'], k['s7'] - 2, kick_=True, clap_=True, hats=True, bassline=True, arp=False, g=0.7)
    # the approved logo sting brings its own sound (frames 66-200 of the sting)
    sr_, st = wavfile.read('/mnt/project-files/anuncio-vslplay/trabalho/renders/vinheta_curta.wav')
    st = st.astype(np.float64)
    st = st / (32768.0 if st.dtype != np.float64 or np.max(np.abs(st)) > 2 else 1.0)
    if st.ndim == 2:
        st = st.mean(1)
    if sr_ != SR:
        st = resample_poly(st, SR, sr_)
    place(sfx, st, k['s7'] - 2, 0.9)

    # effects
    place(sfx, whoosh(0.2, 4000, 600, peak=0.6), 0, 0.5)          # the button falling
    place(sfx, pop(1100), k['tag1'], 0.3)
    place(sfx, pop(1300), k['tag2'], 0.25)
    place(sfx, swish(0.18, 1200, 6000), k['head1'], 0.18)
    place(sfx, whoosh(0.5, 400, 4000, peak=0.5), k['swipe'] - 2, 0.55, pan=0.1)
    place(sfx, suck(0.3), k['zoom'] - 9, 0.4)
    place(sfx, impact(1.2), k['zoom'], 0.45)
    place(sfx, swish(0.25, 600, 3500), k['s2'], 0.45)
    place(sfx, blip(660), k['acao'], 0.25)
    place(sfx, whoosh(0.25, 800, 2600, peak=0.5), k['info'], 0.3, pan=0.3)
    place(sfx, tap(420, 0.8), k['toc1'] + 4, 0.7)
    place(sfx, whoosh(0.25, 800, 2600, peak=0.5), k['apresentada'], 0.3, pan=-0.3)
    place(sfx, tap(380, 0.8), k['toc2'] + 4, 0.7)
    place(sfx, whoosh(0.4, 300, 3000, peak=0.6), k['s3'], 0.4)
    place(sfx, mouse_click(), k['delay'], 0.5)
    place(sfx, mouse_click(), k['drag'], 0.45)
    for f in range(k['drag'] + 2, k['dragEnd'], 2):
        place(sfx, keytick(), f, 0.12)
    place(sfx, click_part(0.9), k['dragEnd'], 0.35)
    for i, f in enumerate(np.linspace(k['s3b'], k['born'] - 1, 12)):
        place(sfx, tick(2600 + 80 * i), f, 0.2)
    place(sfx, pop(780), k['born'], 0.6)
    place(sfx, bell(midi(76)), k['born'], 0.2, send=0.3)
    place(sfx, whoosh(0.6, 3000, 300, peak=0.4), k['s4'], 0.4)
    place(sfx, swish(0.3, 500, 4000), k['s5'], 0.35)
    for i, key in enumerate(['snap1', 'snap2', 'snap3']):
        place(sfx, flap_land(294 * 2 ** (i * 4 / 12)), k[key], 0.75)
        place(sfx, snap(), k[key], 0.3)
    place(sfx, whoosh(0.45, 300, 3500, peak=0.7), k['junta'] - 4, 0.45)
    place(sfx, pop(900), k['teste'], 0.5)
    place(sfx, button_press(), k['teste'] + 26, 0.5)


if NAME == 'c3':
    k = K
    hit(0, 1.0, 0.45)
    place(sfx, snap(), 0, 0.5)
    groove(0, k['brk'])
    # the line breaks: the groove drops out, the fall
    place(sfx, whoosh(0.9, 3000, 160, peak=0.25, tail=0.6), k['brk'], 0.6)
    place(sfx, thud(0.7, 46), k['brk'] + 2, 0.8)
    for i, f in enumerate(np.linspace(k['brk'] + 4, k['fallEnd'], 18)):
        place(sfx, tick(1900 - 40 * i, 0.03, 0.006), f, 0.14, pan=0.2)
    for f in range(k['brk'], k['fallEnd'], 3):
        place(sfx, keytick(), f, 0.08)
    pad(k['brk'], k['freeze'], 0.3)
    # the freeze: near silence, then the ring
    place(sfx, swish(0.3, 1500, 7000), k['ring'], 0.3)
    place(sfx, pop(1200), k['t006'], 0.45)
    hit(k['freeze'] + 9, 0.8)
    groove(k['freeze'] + 9, k['s2'])
    pad(k['freeze'] + 9, k['s2'], 0.22)
    # only the CPA
    tension(k['s2'], k['s3'] - 2)
    place(sfx, swish(0.3, 500, 3500), k['s2'], 0.4)
    for f in range(k['mandar'], k['mandar'] + 36, 2):
        place(sfx, keytick(), f, 0.1)
    place(sfx, blip(990), k['apenas'], 0.25)
    place(sfx, whoosh(0.4, 2400, 400, peak=0.4), k['funil'] - 2, 0.35)
    for i in range(5):
        place(sfx, pop(700 + 90 * i), k['funil'] + i * 4, 0.3)
    place(sfx, thud(0.5, 60), k['historia'], 0.5)
    place(sfx, blip(220, 0.4, 0.2), k['historia'], 0.3)
    ending_at(sfx, riser(1.2, 200, 5000), k['s3'], 0.32)
    # the reveal
    hit(k['s3'], 0.9)
    groove(k['s3'], k['s5'] - 2)
    pad(k['s3'], k['s5'] - 2, 0.22)
    place(sfx, whoosh(2.0, 2000, 500, peak=0.3, tail=0.5), k['s3'] + 16, 0.18)
    for i in range(3):
        place(sfx, pop(900 + 120 * i), k['comport'] + i * 4, 0.35)
    place(sfx, swish(0.3, 800, 5000), k['perdendo'] - 4, 0.3)
    place(sfx, blip(330, 0.3, 0.15), k['perdendo'], 0.25)
    place(sfx, whoosh(0.5, 400, 4000, peak=0.6), k['testar'], 0.35)
    place(sfx, pop(1300), k['versoes'], 0.3)
    ending_at(sfx, riser(0.8, 300, 6000), k['s5'], 0.25)
    # the features
    hit(k['s5'], 0.8)
    groove(k['s5'], k['s6'] - 2)
    pad(k['s5'], k['s6'] - 2, 0.2)
    place(sfx, pop(780), k['botao'] + 4, 0.5)
    place(sfx, flap_land(392), k['sinc'] + 4, 0.7)
    place(sfx, swish(0.25, 900, 5000), k['muito'] - 6, 0.35)
    for i in range(12):
        place(sfx, pop(800 * 2 ** (i / 12)), k['muito'] - 4 + i * 2, 0.18)
    # less guessing, more data
    pad(k['s6'], k['mais'], 0.35)
    place(sfx, swish(0.3, 3000, 600), k['achismo'] + 6, 0.35)
    ending_at(sfx, riser(0.9, 200, 6000), k['mais'], 0.3)
    hit(k['mais'], 1.1, 0.5)
    for m in (48, 52, 55, 60, 64):
        place(mus, pad_voice(midi(m), (k['s7'] - k['mais']) / FPS + 0.3, att=0.05, rel=1.2), k['mais'], 0.5, send=0.4)
        place(mus, bell(midi(m + 12)), k['mais'], 0.1, send=0.4)
    groove(k['mais'], k['s7'] - 2, arp=False, g=0.7)
    place(sfx, whoosh(1.1, 600, 5000, peak=0.6), k['dados'], 0.2)
    sr_, st = wavfile.read('/mnt/project-files/anuncio-vslplay/trabalho/renders/vinheta_curta.wav')
    st = st.astype(np.float64)
    if st.ndim == 2:
        st = st.mean(1)
    if sr_ != SR:
        st = resample_poly(st, SR, sr_)
    place(sfx, st, k['s7'], 0.9)
    place(sfx, pop(900), k['teste'], 0.5)
    place(sfx, button_press(), k['teste'] + 26, 0.5)

# ---------------------------------------------------------------- reverb, voice, ducking, master
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

_, v = wavfile.read(os.path.join(OUT, f'vo_{NAME}.wav'))
v = v.astype(np.float64) / 32768.0
voice = np.zeros(N)
voice[: min(N, len(v))] = hp(v, 90)[:N]
rms = np.sqrt(uniform_filter1d(voice ** 2, int(0.03 * SR)) + 1e-12)
act = maximum_filter1d((rms > 10 ** (-40 / 20)).astype(float), int(0.3 * SR))
DS = SR // 1000
a_ = act[: len(act) // DS * DS].reshape(-1, DS).max(1)
ka, kr = np.exp(-1 / (0.12 * 1000)), np.exp(-1 / (0.7 * 1000))
e, cur = np.empty_like(a_), 0.0
for i, x in enumerate(a_):
    kk = ka if x > cur else kr
    cur = kk * cur + (1 - kk) * x
    e[i] = cur
act_s = np.interp(np.arange(N), np.arange(len(e)) * DS, e)
DUCK = 10 ** (-10.0 * act_s / 20)
DUCK_SFX = 10 ** (-4.0 * act_s / 20)

GATE = np.ones(N)
if NAME == 'c3':
    a0, a1 = int(K['freeze'] / FPS * SR), int((K['freeze'] + 9) / FPS * SR)
    GATE[a0:a1] = 0.05
    GATE[a0:a0 + 480] = np.linspace(1, 0.05, 480)
DUCK = DUCK * GATE
stems = {
    'music': mus * DUCK[:, None],
    'drums': drm * 0.8 * DUCK[:, None],
    'sfx': sfx * 0.9 * DUCK_SFX[:, None],
    'reverb': wet * 0.5 * DUCK[:, None],
}
speaking = act_s > 0.9
bed = sum(stems.values())[speaking]
bed_rms = np.sqrt(np.mean(bed ** 2))
v_rms = np.sqrt(np.mean(voice[speaking & (np.abs(voice) > 1e-4)] ** 2))
VOICE_OVER = 11.0
vg = bed_rms * 10 ** (VOICE_OVER / 20) / (v_rms + 1e-12)
stems['voice'] = np.stack([voice, voice], 1) * vg * 0.7071
print(f'voice gain {20 * np.log10(vg):.1f} dB, speaking {speaking.mean() * 100:.0f}%')
mix = sum(stems.values())
mix = np.stack([hp(mix[:, c], 32) for c in range(2)], 1)
t = np.arange(N) / SR
mix *= np.clip((NFR / FPS - t) / 0.12, 0, 1)[:, None]


def limiter(x, ceiling=0.80, look=0.004, rel=0.09):
    up = np.stack([resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    pk = np.max(np.abs(up), axis=1)[: 4 * len(x)].reshape(-1, 4).max(axis=1)
    w = int(look * SR)
    pk = maximum_filter1d(pk, size=2 * w + 1)
    g = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    a = np.exp(-16 / (rel * SR))
    pad_ = (16 - len(g) % 16) % 16
    gb = np.pad(g, (0, pad_), constant_values=1).reshape(-1, 16).min(axis=1)
    out = np.empty_like(gb)
    cur = 1.0
    for i, vv in enumerate(gb):
        cur = vv if vv < cur else a * cur + (1 - a) * vv
        out[i] = cur
    gs = np.repeat(out, 16)[: len(g)]
    gs = np.minimum(uniform_filter1d(gs, size=int(0.002 * SR)), g)
    return x * gs[:, None]


def measure(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True)
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
    tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
    return I, tp


MIX = os.path.join(OUT, f'mix_{NAME}.wav')
mix = mix[: int(NFR / FPS * SR)]
gain = 0.5 / (np.max(np.abs(mix)) + 1e-9)
for it in range(6):
    y = limiter(mix * gain)
    wavfile.write(MIX, SR, y.astype(np.float32))
    I, tp = measure(MIX)
    print(f'pass {it}: I {I:.2f} LUFS, TP {tp:.2f} dBTP')
    if abs(I + 14.0) < 0.15 and tp <= -1.0:
        break
    gain *= 10 ** ((-14.0 - I) / 20)
print('written', MIX)
