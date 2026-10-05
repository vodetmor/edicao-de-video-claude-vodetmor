"""3x zoom crops of the triangle's edges across frames: python3 zoomsheet.py dir out.png f1,f2,... [boxA] [boxB]"""
import sys
from PIL import Image, ImageDraw
d, out, fl = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]
A = tuple(int(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '730,330,850,450').split(','))
B = tuple(int(v) for v in (sys.argv[5] if len(sys.argv) > 5 else '1000,560,1120,680').split(','))
tiles = []
for n in fl:
    im = Image.open(f'{d}/f{n:04d}.png').convert('RGB')
    a = im.crop(A).resize((240, 240), Image.NEAREST)
    b = im.crop(B).resize((240, 240), Image.NEAREST)
    t = Image.new('RGB', (490, 262), (60, 60, 60)); t.paste(a, (0, 22)); t.paste(b, (250, 22))
    ImageDraw.Draw(t).text((4, 4), f'f{n}', fill=(255, 255, 0))
    tiles.append(t)
cols = 4; rows = (len(tiles) + cols - 1) // cols
S = Image.new('RGB', (cols * 495, rows * 266), (40, 40, 40))
for i, t in enumerate(tiles): S.paste(t, ((i % cols) * 495, (i // cols) * 266))
S.save(out); print(S.size)
