"""Mixagem da VSL VixPlay TV (v4).
uso: python mix_vsl_vixplay.py  (lê out/vsl-vixplay/mudo.mp4, grava as saídas na pasta saida/ da obra)
Voz na frente; trilha "Wonders" (Seth_Makes_Sounds, CC0) a partir de 10 s, 13 dB abaixo da voz antes do
ducking (sidechain pela voz); SFX com pico normalizado no quadro exato; master com ganho LINEAR até
-14 LUFS + limitador (o loudnorm de uma passada desfaz o ducking: LICOES-MOTION, Somália)."""
import json, re, subprocess, sys
from pathlib import Path

MOTOR = Path(__file__).resolve().parent
PUB = MOTOR / 'public'
OUT = MOTOR / 'out' / 'vsl-vixplay'
SAIDA = Path('C:/dev/maquina-de-editar/clientes/vixplaytv/mini-vsl-gratis/saida')
DUR = 139.0
VOZ = PUB / 'vsl-vixplay' / 'narracao.mp3'
MUS = PUB / 'vsl-vixplay' / 'musica.mp3'
MUS_INICIO = 10.0

A = PUB / 'audio'
S = PUB / 'vsl-vixplay' / 'sfx'
# (arquivo, segundo, pico alvo em dBFS)
SFX = [
    (A / 'sfx_whoosh.wav', 0.0, -15),      # G01 gancho
    (A / 'sfx_swish.wav', 19.45, -20),     # R$ chegando
    (A / 'sfx_whoosh.wav', 25.95, -17),    # atravessa o R$
    (A / 'sfx_impact.wav', 26.62, -17),    # logo
    (A / 'sfx_whoosh.wav', 49.05, -17),    # atravessa o V
    (S / 'moeda.mp3', 76.95, -14),         # +R$5 indicado
    (S / 'moeda.mp3', 83.8, -14),          # +R$5 bônus
    *[(A / 'sfx_pop.wav', 86.48 + i * 0.3, -22) for i in range(6)],   # 6 indicados acendem
    *[(A / 'sfx_tick.wav', 89.76 + i * 0.17, -20) for i in range(6)],  # contador até 30
    (A / 'sfx_tick.wav', 93.9, -20),
    (S / 'moeda.mp3', 93.95, -15),         # +5 = R$35
    (A / 'sfx_impact.wav', 104.85, -13),   # batida R$0
    (A / 'sfx_riser.wav', 109.7, -19),
    (S / 'cadeado.mp3', 110.6, -11),       # cadeado abre
    (S / 'brilho.mp3', 110.75, -18),       # brilho
    (S / 'brilho.mp3', 112.62, -15),       # revelação do cupom
    (A / 'sfx_impact.wav', 112.62, -19),
    (A / 'sfx_swish.wav', 126.9, -19),     # botão
    (A / 'sfx_press.wav', 128.14, -20),
]


def pico(f):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(f), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
    return float(re.search(r'max_volume: (-?[\d.]+) dB', r.stderr).group(1))


def ebur(args):
    r = subprocess.run(['ffmpeg', '-hide_banner', *args, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    i = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)[-1])
    p = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r.stderr)[-1])
    return i, p


def run(cmd):
    print(' '.join(str(c) for c in cmd)[:300], '...')
    subprocess.run([str(c) for c in cmd], check=True)


def main():
    voz_i, _ = ebur(['-i', str(VOZ)])
    mus_i, _ = ebur(['-ss', str(MUS_INICIO), '-t', str(DUR), '-i', str(MUS)])
    g_mus = (voz_i - 13) - mus_i
    print(f'voz {voz_i} LUFS, trilha {mus_i} LUFS -> ganho trilha {g_mus:.1f} dB')

    ins = ['-i', VOZ, '-ss', MUS_INICIO, '-t', DUR, '-i', MUS]
    fc = [
        f'[0:a]aresample=48000,apad=whole_dur={DUR},asplit=2[v][vsc]',
        f'[1:a]aresample=48000,volume={g_mus:.2f}dB,afade=t=in:d=1.5,afade=t=out:st={DUR-2.0}:d=2.0[m0]',
        '[m0][vsc]sidechaincompress=threshold=0.03:ratio=3:attack=30:release=600:makeup=1[m]',
    ]
    sx = []
    for k, (f, t, alvo) in enumerate(SFX):
        ins += ['-i', f]
        g = alvo - pico(f)
        ms = int(t * 1000)
        fc.append(f'[{k+2}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g:.2f}dB,adelay={ms}|{ms}[s{k}]')
        sx.append(f'[s{k}]')
    fc.append(f'{"".join(sx)}amix=inputs={len(sx)}:normalize=0,apad=whole_dur={DUR}[sfx]')
    fc.append('[m]asplit=2[mm][mstem]')
    fc.append(f'[v][mm][sfx]amix=inputs=3:normalize=0,atrim=0:{DUR}[mix]')
    pre = OUT / 'mix_pre.wav'
    stem = OUT / 'trilha_ducked.wav'
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[mix]', '-c:a', 'pcm_s24le', pre, '-map', '[mstem]', '-c:a', 'pcm_s24le', stem])

    i_pre, _ = ebur(['-i', str(pre)])
    g = -14.0 - i_pre
    master = OUT / 'master.wav'
    run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:attack=2:release=60:level=false,aresample=48000', '-c:a', 'pcm_s24le', master])
    i_m, p_m = ebur(['-i', str(master)])
    i_trilha, _ = ebur(['-i', str(stem)])
    rel = {'voz_LUFS': voz_i, 'trilha_ducked_LUFS': i_trilha, 'voz_menos_trilha_LU': round(voz_i - i_trilha, 1), 'master_LUFS': i_m, 'master_pico_true_dBFS': p_m}
    print(json.dumps(rel))
    (OUT / 'mix.json').write_text(json.dumps(rel, indent=1))

    SAIDA.mkdir(parents=True, exist_ok=True)
    mudo = OUT / 'mudo.mp4'
    final = SAIDA / 'vsl-vixplay-v4.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-i', mudo, '-i', master, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', final])
    web = SAIDA / 'vsl-vixplay-v4-web.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-i', final, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '750k', '-bufsize', '1500k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', web])


if __name__ == '__main__':
    main()
