"""Retime the ad around the narration, without touching the scenes.

Reads the voice-over script (locucao/roteiro.json: each line anchored to a source frame of the 48 s cut) and the
generated clips, and stretches the source timeline piecewise between beat-aligned boundaries:
- the opening build (0-172) and the rebuild + end card (1304-1440) stay at the original speed (physics, beat);
- every other segment plays at least SLOW times slower, the integrations more, and a segment grows further
  whenever a line would not end GAP seconds before the next one starts.
Writes src/warp.ts (output frame -> source frame, used by Ad.tsx), out/audio/warp.json (used by
audio/make_audio.py) and out/audio/vo.wav (the narration on the new timeline)."""
import json, os, subprocess, sys
import numpy as np
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
VO = os.environ.get('VO_DIR') or next(p for p in (os.path.join(HERE, 'locucao'), os.path.join(HERE, '..', 'locucao')) if os.path.isdir(p))
FPS, SR = 30, 48000
B = [0, 112, 172, 224, 252, 294, 364, 434, 486, 506, 532, 588, 654, 710, 730, 756, 826, 896, 956, 974, 1013, 1078,
     1162, 1204, 1260, 1304, 1440]
LOCKED = {(0, 112), (112, 172), (1304, 1440)}
# the transitions (chapter wipes, the whip into the price) keep their snap: barely slower, never stretched
TRANSITIONS = {(486, 506), (710, 730), (956, 974)}
SLOW = {k: 1.15 for k in zip(B, B[1:])}
SLOW[(1162, 1204)] = SLOW[(1204, 1260)] = 1.7  # the integrations were too fast
SLOW[(1013, 1078)] = 1.4
for t in TRANSITIONS:
    SLOW[t] = 1.1
# SPEED: the whole narrated cut runs this much faster (Vítor, 30/09: "acelerar 1.2"). The voice is time-stretched
# (pitch kept), the picture follows the faster voice and may play up to MAXR x its original speed; the score and
# the effects keep their normal tempo.
SPEED = float(os.environ.get('SPEED', '1.2'))
GAP = 0.45 / SPEED  # s of breath between lines (the music swells into it)
LEAD = 4  # frames: a line starts this long after its anchor

lines = json.load(open(os.path.join(VO, 'roteiro.json')))
dur = {}
for L in lines:
    p = os.path.join(VO, 'clips', L['id'] + '.wav')
    dur[L['id']] = 1 / SPEED * float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                                        capture_output=True, text=True).stdout)

import unicodedata
def norm(w):
    return ''.join(c for c in unicodedata.normalize('NFD', w.lower()) if unicodedata.category(c) != 'Mn').strip('.,?!:;')

# Sync: every clip is placed so that its key words land on the frame of the animation they name
# (locucao/sincronia.json, word times from locucao/transcricao.json). Clips run back to back with at least GAP
# between them; the picture is never played faster than the original (rate <= 1). The opening (0-172) and the
# rebuild + end card (1304-1440) keep the original speed.
SYNC = json.load(open(os.path.join(VO, 'sincronia.json')))
TR = json.load(open(os.path.join(VO, 'transcricao.json')))
MAXR = 1.2
anch = [(0, 0.0), (112, 112.0), (172, 172.0)]  # (source frame, output frame)
starts, prev_end = {}, 0.0
for L in lines:
    words = TR[L['id']]['words']
    keys = []
    for k in SYNC.get(L['id'], []):
        hits = [w for w in words if norm(w['w']).startswith(k[0])]
        n = k[2] if len(k) > 2 else 0
        if len(hits) > n:
            keys.append((k[1], hits[n]['s'] / SPEED * FPS))
        else:
            print('key word not found', L['id'], k, file=sys.stderr)
    if L['id'] == 'cta':  # the end card keeps its speed: 1304..1440 around "Teste" at 1376
        t = keys[0][1]
        keys = [(1304, t - 72), (1376, t), (1440, t + 64)]
    s0 = prev_end + (GAP * FPS if prev_end else 0)
    for sf, t in keys:
        ls, lo = anch[-1]
        if sf > ls:
            s0 = max(s0, lo + (sf - ls) / MAXR - t)
    kept = []
    for sf, t in keys:
        ls, lo = (kept[-1] if kept else anch[-1])
        o = s0 + t
        if sf <= ls or o - lo < (sf - ls) / MAXR - 0.01:
            print('key dropped (would play faster than the original)', L['id'], sf, file=sys.stderr)
            continue
        kept.append((sf, o))
    if L['id'] == 'abre':  # the opening is locked (output = source): "VSL" lands on the wordmark
        kept = []
        s0 = keys[0][0] - keys[0][1] if keys else 124
    anch += kept
    starts[L['id']] = s0
    prev_end = s0 + dur[L['id']] * FPS

# between key anchors: transitions keep ~0.9 speed, the rest shares the time in proportion to its source length
full = []
for (sa, oa), (sb, ob) in zip(anch, anch[1:]):
    inner = [x for x in B if sa < x < sb]
    pts = [sa] + inner + [sb]
    parts = list(zip(pts, pts[1:]))
    total = ob - oa
    fixed = {pr: (pr[1] - pr[0]) / 0.9 for pr in parts if any(pr[0] >= t[0] and pr[1] <= t[1] for t in TRANSITIONS)}
    rest = total - sum(fixed.values())
    free_src = sum(pr[1] - pr[0] for pr in parts if pr not in fixed)
    if rest <= 0 or free_src == 0:
        fixed, rest, free_src = {}, total, sum(pr[1] - pr[0] for pr in parts)
    o = oa
    for pr in parts:
        o += fixed.get(pr, (pr[1] - pr[0]) / free_src * rest)
        full.append((pr[1], o))
# integer output anchors
anchors = [[0, 0]] + [[sf, int(round(o))] for sf, o in full]
total = anchors[-1][1]
open(os.path.join(HERE, 'src', 'warp.ts'), 'w').write(
    '// Generated by warp.py: output frame -> source frame, piecewise linear (source = the original 48 s cut).\n'
    f'export const WARP: [number, number][] = {json.dumps(anchors)};\n'
    f'export const OUT_DURATION = {total};\n'
    'export const srcAt = (fo: number) => {\n'
    '  for (let i = 1; i < WARP.length; i++) {\n'
    '    const [s0, o0] = WARP[i - 1];\n'
    '    const [s1, o1] = WARP[i];\n'
    '    if (fo < o1 || i === WARP.length - 1) return s0 + ((fo - o0) * (s1 - s0)) / (o1 - o0);\n'
    '  }\n'
    '  return fo;\n'
    '};\n'
    '// source frames per output frame (1 = original speed)\n'
    'export const rateAt = (fo: number) => {\n'
    '  for (let i = 1; i < WARP.length; i++) if (fo < WARP[i][1] || i === WARP.length - 1) return (WARP[i][0] - WARP[i - 1][0]) / (WARP[i][1] - WARP[i - 1][1]);\n'
    '  return 1;\n'
    '};\n'
    '// output frame of a source frame\n'
    'export const outAt = (fs: number) => {\n'
    '  for (let i = 1; i < WARP.length; i++) {\n'
    '    const [s0, o0] = WARP[i - 1];\n'
    '    const [s1, o1] = WARP[i];\n'
    '    if (fs < s1 || i === WARP.length - 1) return o0 + ((fs - s0) * (o1 - o0)) / (s1 - s0);\n'
    '  }\n'
    '  return fs;\n'
    '};\n')
os.makedirs(os.path.join(HERE, 'out', 'audio'), exist_ok=True)
N = int(SR * total / FPS)
vo = np.zeros(N)
placed = []
for L in lines:
    src = os.path.join(VO, 'clips', L['id'] + '.wav')
    if SPEED != 1:
        fast = os.path.join(HERE, 'out', 'audio', 'vo_' + L['id'] + '.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'atempo={SPEED}', '-ar', str(SR), fast], check=True)
        src = fast
    sr, x = wavfile.read(src)
    x = x.astype(np.float64) / 32768.0
    if x.ndim > 1:
        x = x.mean(1)
    assert sr == SR
    fo = starts[L['id']]
    i = int(fo / FPS * SR)
    x = x[: max(0, N - i)]
    vo[i: i + len(x)] += x
    placed.append({'id': L['id'], 'start': round(i / SR, 3), 'end': round((i + len(x)) / SR, 3)})
wavfile.write(os.path.join(HERE, 'out', 'audio', 'vo.wav'), SR, (np.clip(vo, -1, 1) * 32767).astype(np.int16))
json.dump({'anchors': anchors, 'duration': total, 'lines': placed}, open(os.path.join(HERE, 'out', 'audio', 'warp.json'), 'w'), indent=1)
print('duration', total, 'frames =', round(total / FPS, 1), 's')
for a0, a1 in zip(anchors, anchors[1:]):
    print(f'{a0[0]:5d}-{a1[0]:5d} -> {a0[1]:5d}-{a1[1]:5d}  rate {(a1[0] - a0[0]) / max(1, a1[1] - a0[1]):.2f}')
for p in placed:
    print(p)
