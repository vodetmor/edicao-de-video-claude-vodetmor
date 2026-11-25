"""Vlog do Lustosa (feira): montagem 9:16 com ffmpeg. Cortes presos às palavras da narração (palavras.json do Groq).
Uso: python montar.py   ->  ../render/vlog-previa.mp4
Tudo que é bruto fica em ../brutos (fora do git). Música: motion-base/musica (CC BY, crédito na descrição)."""
import json, os, re, subprocess, sys, math, glob
HERE = os.path.dirname(os.path.abspath(__file__))
T = os.path.abspath(os.path.join(HERE, '..'))
R = os.path.join(T, 'render'); os.makedirs(R, exist_ok=True)
TMP = os.path.join(R, 'tmp'); os.makedirs(TMP, exist_ok=True)
B = os.path.join(T, 'brutos')
VOZ = os.path.join(T, 'voz', 'narracao-juliano-v1.mp3')
MUS = os.path.join(T, 'voz', 'musica-tema-chris.mp3')  # pedido do Vítor 24/11: abertura da série; direito autoral: trocar pelo som oficial no TikTok ao postar
FPS = 30
def run(c):
    r = subprocess.run(c, capture_output=True, text=True)
    if r.returncode: print(' '.join(c)[:300]); print(r.stderr[-800:]); sys.exit(1)
    return r.stdout
W = json.load(open(os.path.join(T, 'voz', 'narracao-juliano-v1.palavras.json'), encoding='utf8'))
norm = lambda s: re.sub(r'[^\wÀ-ÿ]', '', s.lower())
def achar(frase, ini=0):
    t = [norm(x) for x in frase.split()]
    for i in range(ini, len(W) - len(t) + 1):
        if [norm(W[i + k]['w']) for k in range(len(t))] == t: return i
    raise SystemExit('frase não achada: ' + frase)
DUR = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', VOZ]).strip())
# grupos de cenas: (frase de início, [clipes]); a ordem dos clipes segue a história
G = [
 ('esse é o', ['IMG_2161', 'IMG_2099']),
 ('nascido e criado', ['IMG_2105', 'IMG_2111']),
 ('hoje ele faz', ['IMG_2087', 'IMG_2109', 'IMG_2090']),
 ('segunda-feira', ['IMG_2051', 'IMG_2183']),
 ('aeroporto avião', ['IMG_2016', 'IMG_2013', 'IMG_1980', 'IMG_2176']),
 ('chegou chegou', ['IMG_2083', 'IMG_2084', 'IMG_2081']),
 ('montar a barraca', ['IMG_2096', 'IMG_2105', 'IMG_2134', 'IMG_2161']),
 ('e de vez', ['IMG_2097', 'IMG_2099']),
 ('mas ele vende', ['IMG_2134', 'IMG_2111']),
 ('agora é praia', ['IMG_2178', 'IMG_2100', 'IMG_2090']),
 ('eu gosto', ['IMG_2161']),
]
ini = []; pos = 0
for frase, _ in G:
    i = achar(frase, pos); ini.append(i); pos = i
tempos = [max(0.0, W[i]['s'] - (0.0 if k else 0.0)) for k, i in enumerate(ini)] + [DUR]
tempos[0] = 0.0
def fonte(nome):
    for e in ('.mov', '.mp4', '.jpg', '.jpeg', '.heic', '.png'):
        p = os.path.join(B, nome + e)
        if os.path.exists(p): return p
    raise SystemExit('sem arquivo: ' + nome)
def foto_jpg(nome):
    p = fonte(nome)
    if not p.lower().endswith('.heic'): return p
    out = os.path.join(TMP, nome + '.jpg')
    if not os.path.exists(out):
        from PIL import Image; import pillow_heif
        pillow_heif.register_heif_opener(); im = Image.open(p).convert('RGB'); im.thumbnail((2400, 2400)); im.save(out, quality=92)
    return out
VF = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p,setsar=1'
shots = []; n = 0
for gi, (frase, clipes) in enumerate(G):
    d = tempos[gi + 1] - tempos[gi]; sub = d / len(clipes)
    for ci, nome in enumerate(clipes):
        p = fonte(nome); out = os.path.join(TMP, f'shot{n:02d}.mp4'); n += 1
        if os.path.exists(out) and os.path.getsize(out) > 20000 and os.environ.get('RECACHE') != '1': shots.append(out); continue
        frames = max(2, round(sub * FPS))
        if p.lower().endswith(('.heic', '.jpg', '.jpeg', '.png')):
            j = foto_jpg(nome)
            z = 'zoompan=z=\'min(zoom+0.0012,1.18)\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d=%d:s=1080x1920:fps=30' % frames
            run(['ffmpeg', '-v', 'error', '-y', '-i', j, '-vf', 'scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,' + z + ',format=yuv420p', '-frames:v', str(frames), '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-an', out])
        else:
            dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).strip())
            ss = min(max(0.0, dur * 0.18), max(0.0, dur - sub - 0.05))
            run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ss:.2f}', '-i', p, '-t', f'{sub:.3f}', '-vf', VF, '-frames:v', str(frames), '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-an', out])
        shots.append(out)
lista = os.path.join(TMP, 'lista.txt')
open(lista, 'w', encoding='utf8').write('\n'.join("file '%s'" % s.replace('\\', '/') for s in shots))
mudo = os.path.join(TMP, 'mudo.mp4')
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', mudo])
# legendas (ASS): palavra atual em amarelo (karaokê), 3 a 4 palavras por tela
def cs(t): return f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'
ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 0', '',
 '[V4+ Styles]', 'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
 'Style: Leg,Arial Black,76,&H0000E5FF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,6,2,2,90,90,520,1',
 'Style: Tit,Arial Black,150,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,9,3,8,40,40,330,1', '',
 '[Events]', 'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text']
chunks = []; cur = []
for w in W:
    cur.append(w)
    fim = re.search(r'[.?!]$', w['w']) or len(cur) >= 4 or (re.search(r',$', w['w']) and len(cur) >= 2)
    if fim: chunks.append(cur); cur = []
if cur: chunks.append(cur)
for ci, ch in enumerate(chunks):
    s = ch[0]['s']; e = (chunks[ci + 1][0]['s'] if ci + 1 < len(chunks) else ch[-1]['e'] + 0.4)
    e = min(e, ch[-1]['e'] + 0.6)
    txt = ''
    for k, w in enumerate(ch):
        nxt = ch[k + 1]['s'] if k + 1 < len(ch) else e
        txt += '{\\kf%d}%s ' % (max(5, round((nxt - w['s']) * 100)), w['w'].upper())
    ass.append('Dialogue: 0,%s,%s,Leg,,0,0,0,,%s' % (cs(s), cs(e), txt.strip()))
g4 = tempos[3]
ass.append('Dialogue: 1,%s,%s,Tit,,0,0,0,,{\\fad(150,250)}SEGUNDA-FEIRA\\N{\\fs210\\c&H0000E5FF&}4:45' % (cs(g4), cs(g4 + 3.4)))
open(os.path.join(R, 'legendas.ass'), 'w', encoding='utf8').write('\n'.join(ass))
# 1) legenda queimada no vídeo
os.chdir(R)
import shutil
if not os.path.exists('ariblk.ttf'): shutil.copy(r'C:\Windows\Fontsriblk.ttf', 'ariblk.ttf')
run(['ffmpeg', '-v', 'error', '-y', '-i', mudo, '-vf', 'ass=legendas.ass:fontsdir=.', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-an', 'legendado.mp4'])
# 2) áudio: narração na frente, música (em loop) ~20 LU abaixo com ducking, master -14 LUFS / -1 dBTP
fim_fade = max(0, DUR - 2.0)
af = ('[1:a]volume=1.0,asplit=2[v][sc];[2:a]atrim=0:%.2f,asetpts=PTS-STARTPTS,volume=0.30,afade=t=out:st=%.2f:d=2[m0];'
      '[m0][sc]sidechaincompress=threshold=0.04:ratio=9:attack=15:release=450[m];[v][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[a]') % (DUR + 1, fim_fade)
run(['ffmpeg', '-v', 'error', '-y', '-i', 'legendado.mp4', '-i', VOZ, '-stream_loop', '1', '-i', MUS, '-filter_complex', af, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{DUR:.2f}', '-movflags', '+faststart', 'vlog-previa.mp4'])
out = os.path.join(R, 'vlog-previa.mp4')
print('ok', out, round(os.path.getsize(out) / 1e6, 1), 'MB;', n, 'planos;', round(DUR, 1), 's')
print('cortes:', [round(t, 1) for t in tempos])
