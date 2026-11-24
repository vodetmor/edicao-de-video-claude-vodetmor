"""Copia arquivo/fotos -> video/public/fotos em JPG de até 2400 px (PNG com transparência vira fundo preto)."""
from PIL import Image; import os, glob
B='/mnt/project-files/ruanda/trabalho'; O=f'{B}/video/public/fotos'; os.makedirs(O,exist_ok=True)
for p in glob.glob(f'{B}/arquivo/fotos/*'):
    k,ext=os.path.splitext(os.path.basename(p))
    if ext.lower() not in ('.jpg','.jpeg','.png'): continue
    dst=f'{O}/{k}{".png" if ext==".png" else ".jpg"}'
    if os.path.exists(dst) and os.path.getmtime(dst)>os.path.getmtime(p): continue
    im=Image.open(p); im.thumbnail((2400,2400))
    if ext=='.png': im.save(dst)
    else: im.convert('RGB').save(dst,quality=90)
    print('ok',k)
