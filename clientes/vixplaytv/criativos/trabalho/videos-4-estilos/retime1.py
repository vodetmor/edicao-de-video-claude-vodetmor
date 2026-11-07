# Reajusta os 17 planos da animação (cortes antigos) aos tempos da voz r1; plano encurtado = corta no início (1x), alongado = desacelera
import subprocess, os
SRC = 'C:/dev/maquina-de-editar/estudio/animacao-js/pecas/vixplay-avo-neto/renders/final.mp4'
OLD = [0, 2, 4, 5.5, 7.5, 9, 10.5, 12, 13.5, 15, 17, 18.5, 20.5, 22, 24, 25.5, 27, 30]
NEW = [0, 2.1, 3.7, 4.5, 5.4, 6.4, 8.1, 9.9, 12.0, 14.2, 16.2, 17.1, 18.6, 19.35, 19.8, 22.1, 24.9, 29.4]
os.makedirs('C:/tmp/vz/seg1', exist_ok=True)
lst = []
for i in range(17):
    o0, o1, n = OLD[i], OLD[i + 1], NEW[i + 1] - NEW[i]
    od = o1 - o0
    if n <= od:
        vf = f'trim=start={o0}:duration={n},setpts=PTS-STARTPTS'
    else:
        vf = f'trim=start={o0}:end={o1},setpts=(PTS-STARTPTS)*{n / od:.4f}'
    out = f'C:/tmp/vz/seg1/s{i:02d}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-vf', vf + ',fps=30', '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
    lst.append(f"file '{out}'")
open('C:/tmp/vz/seg1/lista.txt', 'w').write('\n'.join(lst) + '\n')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'C:/tmp/vz/seg1/lista.txt', '-c', 'copy', 'C:/tmp/vz/v1_mudo.mp4'], check=True)
print('ok')
