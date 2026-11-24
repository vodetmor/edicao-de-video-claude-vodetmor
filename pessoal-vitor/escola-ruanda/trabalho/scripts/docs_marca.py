"""Rende páginas de documentos (PDF) em PNG e acha a posição de frases para o marca-texto.
Uso: docs_marca.py  (lê a lista DOCS abaixo; grava video/public/docs/<id>.png e video/public/docs/marcas.json)"""
import subprocess, re, json, os, html
B='/mnt/project-files/ruanda/trabalho'; D=f'{B}/arquivo/docs'; O=f'{B}/video/public/docs'
DOCS=[ # id, pdf, página, [frases a grifar]
 ('res872','S-RES-872_1993_.pdf',1,['Welcoming the signing of the Arusha Peace Agreement']),
 ('res872b','S-RES-872_1993_.pdf',2,['Decides to establish a peace-keeping operation under the name']),
 ('res912','S-RES-912_1994_.pdf',1,['Shocked at the tragic incident that resulted in the deaths of the']),
 ('res912b','S-RES-912_1994_.pdf',2,['Decides, in the light of the current situation in Rwanda, to adjust']),
 ('res955','S-RES-955_1994_.pdf',2,['to establish an international tribunal for the sole']),
 ('inq1999','S-1999-1257.pdf',3,['Approximately 800,000 people were killed during the 1994 genocide in Rwanda.','a failure by the United Nations system as a whole.']),
 ('afp0406','afp-0406-aviao.pdf',1,["Rwandan president's plane reported shot down"]),
 ('reu0407','reuters-0407-explosoes.pdf',1,['Explosions rock Rwandan capital after']),
 ('reu0407b','tropas-0407.pdf',1,['Troops rampage in Rwanda after presidents']),
 ('reu0422','reuters-0422-270.pdf',1,['UN Council to reduce Rwanda peacekeepers to','reducing the Rwanda force, once numbering 2,500, to a bare minimum of 270']),
]
def words(pdf,page):
    x=subprocess.run(['pdftotext','-bbox','-f',str(page),'-l',str(page),pdf,'-'],capture_output=True,text=True).stdout
    pw,ph=map(float,re.search(r'<page width="([\d.]+)" height="([\d.]+)"',x).groups())
    ws=[(float(a),float(b),float(c),float(d),html.unescape(t)) for a,b,c,d,t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>',x)]
    if not ws:  # página escaneada: OCR (tesseract) na imagem já renderizada
        from PIL import Image
        img=OCR_IMG; W,H=Image.open(img).size
        t=subprocess.run(['tesseract',img,'-','tsv'],capture_output=True,text=True).stdout.splitlines()[1:]
        for l in t:
            c=l.split('\t')
            if len(c)==12 and c[11].strip(): x0,y0,w,h=map(float,c[6:10]); ws.append((x0,y0,x0+w,y0+h,c[11]))
        pw,ph=W,H
    return pw,ph,ws
norm=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
out={}
for i,pdf,pg,frases in DOCS:
    subprocess.run(['pdftoppm','-r','200','-f',str(pg),'-l',str(pg),'-png','-singlefile',f'{D}/{pdf}',f'{O}/{i}'],check=True)
    global OCR_IMG; OCR_IMG=f'{O}/{i}.png'
    pw,ph,ws=words(f'{D}/{pdf}',pg); marks=[]
    toks=[norm(w[4]) for w in ws]
    for f in frases:
        alvo=[norm(t) for t in f.split() if norm(t)]
        hit=None
        for k in range(len(toks)):
            j=k; ok=True
            for a in alvo:
                while j<len(toks) and toks[j]=='' : j+=1
                if j>=len(toks) or toks[j]!=a: ok=False; break
                j+=1
            if ok: hit=(k,j); break
        if not hit: print('NÃO ACHEI',i,f); continue
        sel=ws[hit[0]:hit[1]]; linhas=[]
        for w in sel:
            if linhas and abs(linhas[-1][1]-w[1])<0.012*ph: L=linhas[-1]; L[2]=max(L[2],w[2]); L[3]=max(L[3],w[3]); L[0]=min(L[0],w[0])
            else: linhas.append(list(w[:4]))
        marks.append([[round(l[0]/pw,4),round(l[1]/ph,4),round(l[2]/pw,4),round(l[3]/ph,4)] for l in linhas])
    out[i]={'marks':marks,'aspect':round(pw/ph,4)}
    print(i,len(marks))
json.dump(out,open(f'{O}/marcas.json','w'),indent=1)
