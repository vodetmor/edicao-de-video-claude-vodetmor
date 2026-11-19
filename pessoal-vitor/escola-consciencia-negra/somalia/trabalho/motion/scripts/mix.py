# Mixagem do vídeo da Somália a partir de src/data/timeline.json.
# Vozes (audio/editado) nos tempos da timeline; "Pearls" (Sade) desde 0 com ducking: ~21 LU abaixo da voz quando falam,
# sobe suave nas pausas; fade no fim. Saída: mix-pre.wav (depois loudnorm -14 LUFS / -1 dBTP no ffmpeg).
import json, subprocess, sys, numpy as np, soundfile as sf
AUD = '/mnt/project-files/escola-consciencia-negra/somalia/audio/'
TL = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'src/data/timeline.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/claude-0/render/mix-pre.wav'
SR = 48000; N = int((TL['total'] + 0.5) * SR)
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
voz = np.zeros((N, 2), np.float32); ativo = np.zeros(N, np.float32)
for sg in TL['segmentos']:
    if 'arq' not in sg: continue
    a = load(AUD + sg['arq'])[int(sg['a0'] * SR):int(sg['a1'] * SR)]
    i = int(sg['voz'] * SR); a = a[:N - i]
    voz[i:i + len(a)] += a
    if sg.get('semDucking'): continue  # MLK no fim: a música (que já está acabando) não abaixa
    # atividade da voz por janelas de 50 ms (pausas internas também deixam a música respirar um pouco)
    m = np.abs(a).mean(1); w = int(0.05 * SR)
    e = np.repeat(np.array([m[k:k + w].max() for k in range(0, len(m), w)]), w)[:len(m)]
    ativo[i:i + len(m)] = np.maximum(ativo[i:i + len(m)], (e > 0.02).astype(np.float32))
# envelope de ducking: ataque 0.25 s, segura 0.6 s, solta em ~1.2 s
def suaviza(x, ataque, solta):
    y = np.empty_like(x); v = 0.0; ka = 1 - np.exp(-1 / (ataque * SR / 64)); ks = 1 - np.exp(-1 / (solta * SR / 64))
    xs = x[::64]; ys = np.empty_like(xs)
    for k, t in enumerate(xs):
        v += (t - v) * (ka if t > v else ks); ys[k] = v
    return np.interp(np.arange(len(x)), np.arange(0, len(x), 64)[:len(ys)], ys).astype(np.float32)
seg = np.convolve(ativo, np.ones(int(0.6 * SR), np.float32), 'full')[:N] > 0  # segura 0.6 s depois da fala
d = suaviza(seg.astype(np.float32), 0.25, 1.2)
mus = load(AUD + 'bruto/sade-pearls.mp3')
if len(mus) < N: mus = np.concatenate([mus, np.zeros((N - len(mus), 2), np.float32)])
mus = mus[:N]
# níveis: voz já está em -16 LUFS; música medida e posta em -24 LUFS nas pausas e -37 sob a voz (21 LU abaixo)
def lufs(x):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float(r.rsplit('I:', 1)[1].split('LUFS')[0])
lm = lufs(mus[:int(min(len(mus), 200 * SR))])
# Pearls é muito dinâmica (voz a capela forte, trechos quase vazios): nivelador lento (janela 3 s, ±9 dB) deixa a cama constante
pw = (mus ** 2).mean(1); w3 = int(3 * SR)
rms = np.sqrt(np.convolve(pw, np.ones(w3, np.float32) / w3, 'same') + 1e-9)
ref = np.sqrt(pw[pw > 1e-6].mean())
mus = mus * np.clip(ref / rms, db(-9), db(9))[:, None]
lm = lufs(mus[:int(min(len(mus), 200 * SR))])
g_pausa, g_fala = db(-22 - lm), db(-37 - lm)
g = g_pausa + (g_fala - g_pausa) * d
t = np.arange(N) / SR
g *= np.clip(t / 1.5, 0, 1)                                   # entra em 1.5 s
fim = TL['total']; g *= np.clip((fim - t) / 3.0, 0, 1)         # some nos últimos 3 s (a própria música já termina ~268 s)
# refrões sem fala e créditos (timeline['respiros']): a música sobe mais 3 dB, com rampa de 1 s
sobe = np.zeros(N, np.float32)
for a0, a1 in TL.get('respiros', []):
    sobe = np.maximum(sobe, np.clip(np.minimum((t - a0) / 1.0, (a1 - t) / 1.0), 0, 1).astype(np.float32))
g *= db(3) ** sobe
musf = mus * g[:, None]
# créditos: volta o começo de "Pearls" (o mesmo da abertura), baixinho, como fecho
if 'creditos_ini' in TL:
    raw = load(AUD + 'bruto/sade-pearls.mp3'); c0 = int(TL['creditos_ini'] * SR); n = N - c0
    rep = raw[int(1.0 * SR):int(1.0 * SR) + n] * db(-22 - lm)
    rep = rep * np.clip(np.minimum(np.arange(len(rep)) / (1.5 * SR), (len(rep) - np.arange(len(rep))) / (2.5 * SR)), 0, 1)[:, None]
    musf[c0:c0 + len(rep)] += rep
mix = voz + musf
sf.write(OUT, mix, SR, subtype="FLOAT")
if len(sys.argv) > 3: sf.write(sys.argv[3], musf, SR, subtype="FLOAT"); sf.write(sys.argv[4], voz, SR, subtype="FLOAT")
print('música', round(lm, 1), 'LUFS -> pausas -22 (+3 nos refrões sem fala) / fala -37; voz', round(lufs(voz), 1), 'LUFS')
