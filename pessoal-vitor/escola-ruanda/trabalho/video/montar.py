"""Junta as partes renderizadas e faz a mixagem final (voz na frente, música 20 LU abaixo sob a voz,
sobe suave nos cartões de capítulo, abertura e créditos). Master -14 LUFS / -1 dBTP.
Uso: python3 montar.py [saida.mp4]   (usa renders/partes/*.mp4 em ordem de nome)"""
import subprocess, json, glob, os, sys, numpy as np, soundfile as sf
V = '/mnt/project-files/ruanda/trabalho/video'
P = sorted(glob.glob(f'{V}/renders/partes/*.mp4'))
out = sys.argv[1] if len(sys.argv) > 1 else f'{V}/renders/ruanda-previa.mp4'
SR = 48000; INTRO = 2.8
MUS = f'{V}/public/musica.mp3'
SOB_VOZ = -36.0   # LUFS da música sob a voz (voz em -16)
LIVRE = -23.0     # LUFS da música sem voz (cartões, abertura, fim)
RAMPA = 0.8

def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def lufs_arr(x):
    tmp = '/tmp/claude-0/_l.wav'; sf.write(tmp, x, SR)
    r = subprocess.run(['ffmpeg', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True).stderr.decode()
    return float(r.rsplit('I:', 1)[1].split('LUFS')[0])

# 1) vídeo: concat reencodando (com -c copy as emendas quebravam o h264)
lst = '/tmp/claude-0/partes.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in P))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '/tmp/claude-0/_v.mp4'], check=True)
# 2) voz: áudio de cada parte em sequência + onde há voz
voz, vivo, t = [], [], 0.0
for p in P:
    d = dur(p)
    a = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(a, np.float32).reshape(-1, 2) if a else np.zeros((0, 2), np.float32)
    n = int(round(d * SR)); x = np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]
    voz.append(x)
    nome = os.path.basename(p)
    seg = f"{V}/public/segmentos/{nome[:-4]}.json"
    if os.path.exists(seg):
        s = json.load(open(seg))
        if not s.get('aguardando'):
            f = json.load(open(f"{V}/public/falas/{s['id']}.json"))
            vivo.append((t + INTRO - 0.2, t + INTRO + f['dur'] + 0.1))
    t += d
voz = np.concatenate(voz); N = len(voz)
# 3) música: repete se precisar, envelope guiado pelas falas
m, msr = sf.read(MUS, dtype='float32', always_2d=True)
if msr != SR:
    m = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', MUS, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2)
while len(m) < N: m = np.concatenate([m, m])
m = m[:N].copy()
g0 = 10 ** ((LIVRE - lufs_arr(m)) / 20)
env = np.ones(N, np.float32) * g0
alvo_sob = 10 ** ((SOB_VOZ - LIVRE) / 20)
tt = np.arange(N) / SR
k = np.ones(N, np.float32)
for a, b in vivo:
    up = np.clip((tt - (a - RAMPA)) / RAMPA, 0, 1) * np.clip(((b + RAMPA) - tt) / RAMPA, 0, 1)
    k = np.minimum(k, 1 - up * (1 - alvo_sob))
env *= k
env *= np.clip((tt[-1] - tt) / 4.0, 0, 1)          # some nos últimos 4 s
env *= np.clip(tt / 1.5, 0, 1)                      # entra em 1,5 s
mix = voz + m * env[:, None]
# 4) master -14 LUFS, pico -1 dBTP
g = 10 ** ((-14 - lufs_arr(mix)) / 20); mix *= g
sf.write('/tmp/claude-0/_mix.wav', mix, SR, subtype='FLOAT')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/_mix.wav', '-af', 'alimiter=limit=0.89:attack=2:release=50:level=false', '-ar', str(SR), '/tmp/claude-0/_mix2.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/claude-0/_v.mp4', '-i', '/tmp/claude-0/_mix2.wav', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
r = subprocess.run(['ffmpeg', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True).stderr.decode().rsplit('Summary', 1)[1]
print(out, f'{N / SR:.1f}s', ' '.join(r.split()))
