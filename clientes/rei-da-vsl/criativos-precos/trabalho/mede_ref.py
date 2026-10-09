"""Mede ritmo de referencias: diferenca entre quadros (30 fps, 96x170), quadros parados, eventos de troca visual, luminancia do fundo.
Uso: python3 mede_ref.py video.mp4 [...]"""
import subprocess, sys, numpy as np
W, H = 96, 170
for v in sys.argv[1:]:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-vf', f'fps=30,scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
    static = (d < 0.4).mean()
    # eventos: picos > 6 separados por >= 9 quadros
    ev, last = [], -99
    for i, x in enumerate(d):
        if x > 6 and i - last >= 9: ev.append(i); last = i
    dur = len(f) / 30
    lum = f.mean(axis=(1, 2))
    dark = (lum < 70).mean(); light = (lum > 170).mean()
    # trocas claro/escuro
    st = np.where(lum < 90, 0, np.where(lum > 150, 2, 1)); flips = int((np.diff(st) != 0).sum())
    print(f"{v.split('/')[-1][:40]:40s} dur {dur:5.1f}s | movimento medio {d.mean():4.1f} | parado {static*100:4.1f}% | trocas visuais {len(ev):3d} = 1 a cada {dur/max(1,len(ev)):.2f}s | escuro {dark*100:3.0f}% claro {light*100:3.0f}% | viradas claro/escuro {flips}")
