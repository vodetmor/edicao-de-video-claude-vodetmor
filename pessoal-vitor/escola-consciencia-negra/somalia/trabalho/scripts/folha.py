import subprocess,io,glob,os
from PIL import Image,ImageDraw,ImageFont
M='/mnt/project-files/escola-consciencia-negra/somalia/midia'
items=[('triste','v','voa-seca-mulher-caminha-no-deserto'),('triste','v','voa-seca-carcacas-de-animais'),('triste','v','voa-fome-hospital-e-galoes-de-agua'),('triste','v','voa-fome-maes-e-filhos-nutricao'),('triste','v','voa-seca-mulher-close'),('triste','v','voa-fome-acampamento-deslocados'),('triste','v','voa-seca-pastor-animais-mortos'),('triste','v','px-drone-view-of-dry-cracked-earth-and-empty-reservoi-37533724'),
('triste','f','ov-fmsc-staff-trip-2011-somali-woman'),('triste','f','ov-children-queue-for-food-aid'),('triste','f','ov-a-woman-in-somalia-washes'),('triste','f','ov-fmsc-staff-trip-2011-somali-drought'),
('bonito','v','praia-mogadiscio-2012-mar-a'),('bonito','v','danca-somali-mulheres-a'),('bonito','v','voa-mogadiscio-oracao-mesquita'),('bonito','v','voa-mogadiscio-mesquita-noite'),('bonito','v','voa-mogadiscio-mercado-frutas'),('bonito','v','laas-geel-pinturas-rupestres'),('bonito','v','hargeisa-mercado-de-camelos-a'),('bonito','v','independencia-2013-mulheres-cantando'),('bonito','v','puntland-por-do-sol-cidade'),('bonito','v','px-a-woman-wearing-a-hijab-in-the-desert-9880871'),
('bonito','f','ov-'),('bonito','f','lido'),('bonito','f','girls'),('bonito','f','football'),
('mapas-historia','v','batalha-mogadiscio-1993-aerea-a'),('mapas-historia','v','voa-atentado-predios-destruidos'),('mapas-historia','v','piratas-somalis-2006-marinha-eua'),('mapas-historia','m','conferencia-de-berlim-1884'),('mapas-historia','m','partilha-da-africa-1880-1913'),('mapas-historia','m','tamanho-real-da-africa')]
W,H=480,270;tiles=[]
used=set()
for cat,k,key in items:
    if k=='v':
        f=f'{M}/{cat}/videos/{key}.mp4'
        if not os.path.exists(f): continue
        b=subprocess.run(['ffmpeg','-v','error','-ss','2.5','-i',f,'-frames:v','1','-f','image2pipe','-vcodec','png','-'],capture_output=True).stdout
        im=Image.open(io.BytesIO(b)); lab=key
    else:
        sub='mapas' if k=='m' else 'fotos'
        c=[g for g in sorted(glob.glob(f'{M}/{cat}/{sub}/*')) if key.lower() in os.path.basename(g).lower() and g not in used]
        if not c: continue
        used.add(c[0]); im=Image.open(c[0]); lab=os.path.basename(c[0])[:40]
    im=im.convert('RGB'); r=max(W/im.width,H/im.height); im=im.resize((int(im.width*r)+1,int(im.height*r)+1))
    l=(im.width-W)//2;t=(im.height-H)//2; im=im.crop((l,t,l+W,t+H))
    tiles.append((cat,lab,im))
cols=4; rows=(len(tiles)+cols-1)//cols; S=Image.new('RGB',(cols*W+ (cols+1)*12, rows*(H+44)+80),'#f5f5f7'); d=ImageDraw.Draw(S)
fb=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30); f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
d.text((12,22),'Somália · melhores quadros (triste · bonito · mapas e história)',fill='#1d1d1f',font=fb)
cor={'triste':'#8a2a1f','bonito':'#0a6cff','mapas-historia':'#555'}
for i,(cat,lab,im) in enumerate(tiles):
    c,r=i%cols,i//cols; x=12+c*(W+12); y=80+r*(H+44); S.paste(im,(x,y))
    d.rectangle((x,y+H,x+W,y+H+40),fill='white'); d.text((x+8,y+H+4),cat.upper(),fill=cor[cat],font=f); d.text((x+8,y+H+21),lab[:58],fill='#333',font=f)
S.save(M+'/folha-de-contato.jpg',quality=85); print(len(tiles),S.size)
