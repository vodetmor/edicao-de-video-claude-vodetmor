"""Lista arquivos que os segmentos usam e ainda não existem em video/public."""
import json, glob, os
V='/mnt/project-files/ruanda/trabalho/video/public'
falta=set()
for f in sorted(glob.glob(f'{V}/segmentos/*.json')):
    d=json.load(open(f))
    for e in d.get('eventos',[]):
        if e['tipo'] in ('foto','mapa') and not os.path.exists(f"{V}/{e['src']}"): falta.add((os.path.basename(f),e['src']))
        if e['tipo']=='doc' and not os.path.exists(f"{V}/docs/{e['src']}.png"): falta.add((os.path.basename(f),e['src']))
for x in sorted(falta): print('FALTA',*x)
print('ok' if not falta else f'{len(falta)} faltando')
