import json,re,os,html,glob,subprocess
M='/mnt/project-files/escola-consciencia-negra/somalia/midia'
def clean(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',s or ''))).strip()[:90]
rows={'triste':[],'bonito':[],'mapas-historia':[]}
somali_px={'Gulied Maarso':'Somália (criador somali)','Abdifatah Nadir':'Somália (criador somali)','Ali Khadaab':'Sanaag, Somalilândia','Olex Lia':'bandeira da Somalilândia (animação)'}
for x in json.load(open('cand/pex_done.json')):
    loc=somali_px.get(x['autor'])
    if not loc:
        s=x['url'].lower()
        for k,v in [('tanzania','Tanzânia'),('zanzibar','Zanzibar'),('ethiopia','Etiópia'),('nigeria','Nigéria'),('moroccan','Marrocos')]:
            if k in s: loc=v
    rows[x['cat']].append((x['arquivo'].split('/')[-1],'vídeo',f"{x['corte']} de {x['dur']}s",loc or 'ilustrativo (local não informado, não afirmar que é a Somália)',f"Pexels / {x['autor']}",'Licença Pexels (uso livre, sem atribuição obrigatória)',x['url']))
sel=json.load(open('cand/cm_vid_sel.json'))
for l in open('cand/cortes.tsv'):
    src,ss,t,cat,name=l.rstrip('\n').split('\t'); x=sel[int(src[3:])]
    lic=x['lic']; autor=clean(x['autor']) or 'Wikimedia Commons'
    if 'Public domain' in lic and ('VOA' in autor or 'Voice of America' in autor or 'a54' in name or name.startswith('voa')): autor='Voice of America (governo dos EUA)'
    nota='Somália' + (' (tem selo VOA/a54 no canto: usar com zoom ~1,15x)' if name.startswith('voa') else '')
    if 'refugiados' in name: nota='reportagem da VOA sobre fome na África Oriental (pode não ser só Somália)'
    rows[cat].append((name+'.mp4','vídeo',f"{ss}s +{t}s de {x['dur']}s",nota,autor,lic,x['url']))
for x in json.load(open('cand/ov_done.json')):
    rows[x['cat']].append((x['arquivo'].split('/')[-1],'foto',f"{x['px'][0]}x{x['px'][1]}",clean(x.get('titulo')),clean(x.get('autor')) or '?',f"CC {x['lic']}".replace('CC CC0','CC0').replace('CC PDM','Domínio público'),x['url']))
mp={}
if os.path.exists('cand/map_done.json'):
    for x in json.load(open('cand/map_done.json')): mp[x['nome']]=x
d=json.load(open('cand/cm_map.json'))
for f in sorted(glob.glob(M+'/mapas-historia/mapas/*')):
    nm=os.path.basename(f).rsplit('.',1)[0]; x=mp.get(nm)
    if not x: continue
    rows['mapas-historia'].append((os.path.basename(f),'mapa/imagem',x['id'][5:70],clean(x.get('data')),clean(x['autor']) or '?',x['lic'],x['url']))
nomes={'triste':'Triste (seca, fome, deslocamento, sofrimento)','bonito':'Bonito (cultura, fé, mercados, litoral, juventude, Somalilândia)','mapas-historia':'Mapas e história (colonização, guerra, independência)'}
out=['# Catálogo de mídia: vídeo da Somália','', 'Tudo baixado em 18/11/2026 para o vídeo escolar de Consciência Negra. Uso escolar, sem fins comerciais.',
'Regras de licença: **CC BY / CC BY-SA** pedem crédito (nome do autor + licença) nos créditos finais; **CC BY-NC** só uso não comercial (escola ok); **domínio público, CC0 e Pexels** não exigem crédito, mas é bom citar a VOA e a ONU/AMISOM.',
'Vídeos: H.264, até 720p (alguns da VOA vêm em 480p/360p), 30 fps, sem áudio, trechos de 5 a 20 s. Fotos do Openverse vêm com ~1024 px (a página da fonte tem a versão maior).','']
for c in ['triste','bonito','mapas-historia']:
    r=rows[c]; out+=[f'## {nomes[c]} · {len(r)} arquivos','','| Arquivo | Tipo | Trecho/tamanho | Onde/o quê | Autor/fonte | Licença | Página |','|---|---|---|---|---|---|---|']
    for a in sorted(r,key=lambda z:(z[1],z[0])): out.append('| '+' | '.join(str(v).replace('|','/') for v in a[:6])+f' | [link]({a[6]}) |')
    out.append('')
open(M+'/catalogo.md','w').write('\n'.join(out))
print({c:len(r) for c,r in rows.items()})
