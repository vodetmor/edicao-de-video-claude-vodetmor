import sys, glob
from PIL import Image, ImageDraw
pasta, saida = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
w, h = 405, 720
fs = sorted(glob.glob(pasta + '/*.jpg'))
rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), 'white')
for i, p in enumerate(fs):
    im = Image.open(p).convert('RGB').resize((w, h), Image.LANCZOS)
    d = ImageDraw.Draw(im); d.rectangle([0, 0, 120, 30], fill='black'); d.text((6, 8), p.split('/')[-1].replace('.jpg', ''), fill='white')
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
sheet.save(saida, quality=88)
print(sheet.size)
