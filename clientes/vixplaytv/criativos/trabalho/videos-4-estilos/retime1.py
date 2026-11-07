# Reajusta os 17 planos da animação (cortes antigos) aos tempos da voz r1; plano encurtado = corta no início (1x), alongado = desacelera
import subprocess, os
SRC = 'C:/dev/maquina-de-editar/estudio/animacao-js/pecas/vixplay-avo-neto/renders/final.mp4'
OLD = [0, 2, 4, 5.5, 7.5, 9, 10.5, 12, 13.5, 15, 17, 18.5, 20.5, 22, 24, 25.5, 27, 30]
PULA = {13}  # plano do menu sai; a novela de verdade passa na TV no plano 12
NEW = [0, 2.1, 3.7, 4.5, 5.4, 6.4, 8.1, 9.9, 12.0, 14.2, 16.2, 17.1, 18.6, 19.8, 19.8, 22.1, 24.9, 29.4]
os.makedirs('C:/tmp/vz/seg1', exist_ok=True)
lst = []
for i in range(17):
    if i in PULA:
        continue
    o0, o1, n = OLD[i], OLD[i + 1], NEW[i + 1] - NEW[i]
    od = o1 - o0
    if n <= od:
        vf = f'trim=start={o0}:duration={n},setpts=PTS-STARTPTS'
    else:
        vf = f'trim=start={o0}:end={o1},setpts=(PTS-STARTPTS)*{n / od:.4f}'
    out = f'C:/tmp/vz/seg1/s{i:02d}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-vf', vf + ',fps=30', '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
    if i == 12:
        nov = 'C:/tmp/vz/nov/02-pexels-a-woman-embracing-a-man-while-.mp4'
        tmp = out.replace('.mp4', '_n.mp4')
        fc = ('[1:v]trim=start=3,setpts=PTS-STARTPTS,scale=840:472:force_original_aspect_ratio=increase,crop=840:472,fps=30[c];'
              '[0:v]drawbox=x=100:y=1000:w=880:h=512:color=0x04140a:t=fill,drawbox=x=505:y=1512:w=70:h=50:color=0x04140a:t=fill,'
              'drawbox=x=400:y=1560:w=280:h=20:color=0x04140a:t=fill[b];[b][c]overlay=120:1020:shortest=1[v]')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-i', nov, '-filter_complex', fc, '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', tmp], check=True)
        out = tmp
    lst.append(f"file '{out}'")
open('C:/tmp/vz/seg1/lista.txt', 'w').write('\n'.join(lst) + '\n')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'C:/tmp/vz/seg1/lista.txt', '-c', 'copy', 'C:/tmp/vz/v1_mudo.mp4'], check=True)
print('ok')
