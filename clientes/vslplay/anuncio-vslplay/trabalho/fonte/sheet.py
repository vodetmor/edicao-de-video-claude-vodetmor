import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 6; tw=int(sys.argv[4]) if len(sys.argv)>4 else 480
files=sorted(glob.glob(os.path.join(d,'f*.png')))
if len(sys.argv)>5:
    keep=set(int(x) for x in sys.argv[5].split(','))
    files=[f for f in files if int(os.path.basename(f)[1:5]) in keep]
th=int(tw*9/16)
rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cols*(tw+6),rows*(th+22)),(90,90,90))
dr=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((tw,th),Image.LANCZOS)
    x=(i%cols)*(tw+6); y=(i//cols)*(th+22)
    sheet.paste(im,(x,y+18))
    dr.text((x+4,y+3),os.path.basename(f)[1:5]+f"  ({int(os.path.basename(f)[1:5])/30:.2f}s)",fill=(255,255,255))
sheet.save(out)
print(sheet.size)
