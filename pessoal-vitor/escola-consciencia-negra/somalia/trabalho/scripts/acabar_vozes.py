"""Acabamento padrão de TODAS as falas (regra do Vítor 2026-11-19: todas limpas e no mesmo volume).
Para cada wav: 2ª passada DeepFilterNet3 sem limite (pega o ruído que sobrou da 1ª, que tinha lim 30 dB + loudnorm dinâmico
que subia o ruído nas pausas) -> EQ de clareza (passa-alta 90, -2 dB em 300 Hz, +3 dB em 3,2 kHz) -> compressor suave
-> ganho LINEAR até -16 LUFS (nada de loudnorm dinâmico) -> limitador -1.5 dB. Tempo/duração não mudam (timeline continua válida).
Uso: acabar_vozes.py pasta_entrada pasta_saida [--sem-df arquivo1,arquivo2]  (--sem-df para vozes sintéticas)"""
import sys, os, glob, subprocess, tempfile, numpy as np, soundfile as sf, torch
from df.enhance import init_df, enhance
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
sem = sys.argv[sys.argv.index('--sem-df') + 1].split(',') if '--sem-df' in sys.argv else []
m, st, _ = init_df(os.environ.get('DF_MODEL', '/tmp/claude-0/dfm/DeepFilterNet3'))
def lufs(p):
    r = subprocess.run(['ffmpeg', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True).stderr.decode()
    return float(r.rsplit('I:', 1)[1].split('LUFS')[0])
for p in sorted(glob.glob(src + '/*.wav')):
    n = os.path.basename(p); d = tempfile.mkdtemp()
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    if n.split('.')[0] not in sem:
        y = enhance(m, st, torch.from_numpy(x)[None]).numpy()[0][:len(x)]
        x = np.pad(y, (0, len(x) - len(y)))
    a = f'{d}/a.wav'; b = f'{d}/b.wav'; sf.write(a, x, 48000, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-af',
        'highpass=f=90,equalizer=f=300:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=3,'
        'acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=1,agate=threshold=0.008:ratio=3:range=0.05:attack=4:release=180', '-c:a', 'pcm_f32le', b], check=True)
    g = -16 - lufs(b)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', b, '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=false',
        '-ar', '48000', '-c:a', 'pcm_s24le', f'{dst}/{n}'], check=True)
    print(n, 'ok', round(lufs(f'{dst}/{n}'), 1))
