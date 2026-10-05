import sys, os, glob
from PIL import Image, ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 8; tw=int(sys.argv[4]) if len(sys.argv)>4 else 270
files=sorted(glob.glob(os.path.join(d,'f*.png')))
th=int(tw*16/9); rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cols*(tw+6),rows*(th+22)),(90,90,90)); dr=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((tw,th),Image.LANCZOS); x=(i%cols)*(tw+6); y=(i//cols)*(th+22)
    sheet.paste(im,(x,y+18)); n=int(os.path.basename(f)[1:5]); dr.text((x+4,y+3),f"{n} ({n/30:.2f}s)",fill=(255,255,255))
sheet.save(out); print(sheet.size)
