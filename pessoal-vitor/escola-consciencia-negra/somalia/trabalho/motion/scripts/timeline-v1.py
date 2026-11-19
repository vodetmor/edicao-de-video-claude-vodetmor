"""Monta src/data/timeline.json: ordem das falas e pausas, cada plano (vídeo, foto ou bloco de motion) preso
ao início de uma palavra falada, e as legendas. Uso: python3 scripts/timeline.py (na pasta do motion)."""
import json, re
F = {f['id']: f for f in json.load(open('src/data/falas.json'))}
GAP = 0.55  # respiro entre duas falas seguidas
ordem = [  # (id, pausa depois em s)
    ('intro', 4.6), ('vitor-1', 0), ('maria-1', GAP), ('anna-1', GAP), ('luisa-1', 3.2), ('urley-1', GAP),
    ('yago-1', 2.6), ('daniel-1', 3.0), ('maria-2', GAP), ('anna-2', GAP), ('luisa-2', 3.6), ('urley-2', 3.4),
    ('yago-2', GAP), ('daniel-2', GAP), ('jose-1', 3.2), ('vitor-2', 4.2), ('creditos', 6.5),
]
seg, t = {}, 0.0
for fid, pausa in ordem:
    if fid in ('intro', 'creditos'):
        seg[fid] = {'id': fid, 'ini': t, 'dur': pausa}; t += pausa; continue
    f = F[fid]
    lead = 0.5 if fid == 'vitor-1' else 0.0          # a cena da África abre 0,5 s antes da voz
    tail = 5.36 if fid == 'vitor-1' else 0.0         # e termina com o mergulho na Somália
    d = f['fim'] - f['ini']
    seg[fid] = {'id': fid, 'quem': f['quem'], 'ini': t, 'voz': t + lead, 'arq': f['arquivo'], 'a0': f['ini'], 'a1': f['fim'], 'dur': lead + d + tail}
    t += lead + d + tail + pausa
TOTAL = round(t, 2)

def w(fid, i):  # início global da palavra i da fala fid
    s = seg[fid]; return s['voz'] + F[fid]['palavras'][i]['s'] - s['a0']
def fim(fid):
    s = seg[fid]; return s['ini'] + s['dur']

planos = []
def P(t0, t1, tipo, src, **kw): planos.append({'t0': round(t0, 3), 't1': round(t1, 3), 'tipo': tipo, 'src': src, **kw})
B, T_, H = 'midia/bonito/', 'midia/triste/', 'midia/mapas-historia/'
nxt = lambda fid: seg[ordem[[o[0] for o in ordem].index(fid) + 1][0]]['ini']

# Abertura
P(0, seg['intro']['dur'] + 0.4, 'bloco', 'Globo', props={'alvo': 'africa'})
P(seg['vitor-1']['ini'], fim('vitor-1'), 'bloco', 'AfricaPais', props={'comAudio': False})
# Maria 1: nome e bandeira
m = 'maria-1'
P(seg[m]['ini'], w(m, 8), 'video', B + 'videos/voa-mogadiscio-vista-aerea.mp4', voa=True)
P(w(m, 8), w(m, 15), 'video', B + 'videos/praia-mogadiscio-2012-mar-a.mp4')
P(w(m, 15), nxt(m), 'bloco', 'Estrela5', props={'pontas': [round((w(m, 22) - w(m, 15)) + k * 0.32, 2) for k in range(5)]})
# Anna 1: o povo
a = 'anna-1'
P(seg[a]['ini'], w(a, 9), 'foto', B + 'fotos/ov-berbera-girls-getting-ready-e916db.jpg', ficha=True, ax=0.7, ay=0.3)
P(w(a, 9), w(a, 17), 'video', B + 'videos/mogadiscio-2016-mulheres-na-rua.mp4')
P(w(a, 17), nxt(a), 'video', B + 'videos/hargeisa-mercado-de-camelos-a.mp4')
# Luísa 1: a riqueza
l = 'luisa-1'
P(seg[l]['ini'], w(l, 6), 'video', B + 'videos/laas-geel-pinturas-rupestres.mp4', inicio=4)
P(w(l, 6), w(l, 9), 'video', B + 'videos/praia-mogadiscio-2012-mar-b.mp4')
P(w(l, 9), w(l, 12), 'video', B + 'videos/voa-mogadiscio-mercado-frutas.mp4', voa=True)
P(w(l, 12), w(l, 23), 'video', B + 'videos/px-sailboats-sailing-in-sea-at-sunset-11025496.mp4')
P(w(l, 23), seg['urley-1']['ini'] + 0.3, 'video', B + 'videos/puntland-por-do-sol-cidade.mp4', sepia_de=w(l, 26), sepia_ate=seg['urley-1']['ini'])
# Urley 1: partilha (a cena começa 1,2 s antes da fala, no fim da pausa)
u = 'urley-1'; u0 = seg[u]['ini'] - 1.2
P(u0, nxt(u) + 0.2, 'bloco', 'Partilha', props={'t': {k: round(v - u0, 2) for k, v in {
    'dissolve': w(u, 7), 'britanico': w(u, 12), 'italiano': w(u, 13), 'frances': w(u, 14), 'etiopia': w(u, 21) - 0.3,
    'quenia': w(u, 24) - 0.2, 'pontas': w(u, 27), 'fim': nxt(u) + 0.2}.items()}})
# Yago 1: ditadura (linha do tempo, com um respiro de imagem de arquivo na Guerra Fria)
y = 'yago-1'
tempo = {'t1960': w(y, 1), 't1969': w(y, 6), 't1991': w(y, 26), 'racha': w(y, 33)}
P(seg[y]['ini'], fim(y) + 1.4, 'bloco', 'Tempo', props={'t': {k: round(v - seg[y]['ini'], 2) for k, v in tempo.items()}})
P(w(y, 14), w(y, 25) + 0.2, 'video', H + 'videos/px-a-group-of-military-men-marching-7467343.mp4')
P(fim(y) + 1.4, nxt(y), 'video', H + 'videos/batalha-mogadiscio-1993-aerea-a.mp4', lento=0.7)
# Daniel 1: guerra civil e a TV que desliga
d = 'daniel-1'
P(seg[d]['ini'], w(d, 5), 'video', H + 'videos/batalha-mogadiscio-1993-aerea-b.mp4')
P(w(d, 5), w(d, 13), 'video', T_ + 'videos/voa-fome-multidao-sentada.mp4', voa=True)
P(w(d, 13), nxt(d), 'video', T_ + 'videos/voa-fome-seca-entrega-aerea.mp4', voa=True, tv=round(w(d, 27) + 0.25, 2))
# Maria 2: Al-Shabaab e o atentado
m = 'maria-2'
P(seg[m]['ini'], w(m, 6), 'foto', T_ + 'al-shabaab/alshabaabfightersinbarawe2013-jpg.jpg')
P(w(m, 6), w(m, 14), 'foto', T_ + 'al-shabaab/al-shabaab-fighters-patrolling-afgooye-mogadishu-road-jpg.jpg')
P(w(m, 14), w(m, 26), 'bloco', 'Atentado', props={'t': {'data': 0.1, 'num': round(w(m, 22) - w(m, 14) - 0.2, 2)}})
P(w(m, 26), w(m, 31), 'foto', T_ + 'al-shabaab/2017-10-15-vbied-8-37666124646-jpg.jpg')
P(w(m, 31), nxt(m), 'video', B + 'videos/voa-mogadiscio-oracao-mesquita.mp4', voa=True)
# Anna 2: política e pirataria
a = 'anna-2'
P(seg[a]['ini'], w(a, 18), 'video', B + 'videos/mogadiscio-2018-rua.mp4')
P(w(a, 18), w(a, 24), 'video', B + 'videos/px-silhouetted-fishermen-on-a-boat-at-sea-40982177.mp4')
P(w(a, 24), nxt(a), 'video', H + 'videos/piratas-somalis-2006-marinha-eua.mp4')
# Luísa 2: seca
l = 'luisa-2'
P(seg[l]['ini'], w(l, 16), 'bloco', 'Seca', props={'t': {'ini': round(w(l, 4) - seg[l]['ini'], 2), 'cheio': round(w(l, 13) - seg[l]['ini'], 2), 'metade': round(w(l, 14) - seg[l]['ini'], 2)}})
P(w(l, 16), w(l, 19), 'video', T_ + 'videos/voa-seca-terra-com-carcacas.mp4', voa=True)
P(w(l, 19), fim(l), 'video', T_ + 'videos/voa-fome-acampamento-deslocados.mp4', voa=True)
P(fim(l), nxt(l), 'video', T_ + 'videos/voa-fome-maes-e-filhos-nutricao.mp4', voa=True, lento=0.6)
# Urley 2: a mulher
u = 'urley-2'
P(seg[u]['ini'], w(u, 4), 'video', T_ + 'videos/voa-seca-mulher-caminha-no-deserto.mp4', voa=True)
P(w(u, 4), w(u, 10), 'video', T_ + 'videos/px-women-carrying-jerry-cans-26798382.mp4')
P(w(u, 10), w(u, 15), 'video', T_ + 'videos/px-woman-with-baby-on-hands-11866426.mp4')
P(w(u, 15), w(u, 23), 'video', T_ + 'videos/voa-seca-mulher-acampamento.mp4', voa=True)
P(w(u, 23), w(u, 32), 'video', T_ + 'videos/voa-seca-mulher-close.mp4', voa=True)
P(w(u, 32), fim(u) + 0.6, 'video', T_ + 'videos/px-young-girl-collecting-water-in-rural-setting-36044137.mp4', lento=0.6, perolas=round(w(u, 39) - w(u, 32), 2))
fp = fim(u) + 0.6; dd = (nxt(u) - fp) / 2
P(fp, fp + dd, 'foto', B + 'fotos/ov-young-somali-woman-her-face-d1f11f.jpg')
P(fp + dd, nxt(u), 'foto', B + 'fotos/ov-somali-woman-wearing-clothing-somali-07d207.jpg')
# Yago 2: o julgamento
y = 'yago-2'
P(seg[y]['ini'], nxt(y), 'bloco', 'Manchetes', props={'t': {'cai': round(w(y, 11) - seg[y]['ini'], 2)}})
# Daniel 2: racismo
d = 'daniel-2'
P(seg[d]['ini'], w(d, 7), 'video', T_ + 'videos/voa-refugiados-campo-multidao.mp4')
P(w(d, 7), w(d, 14), 'video', T_ + 'videos/korsan-campo-deslocados-tenda.mp4')
P(w(d, 14), w(d, 18), 'video', T_ + 'videos/voa-refugiados-falta-de-comida.mp4')
P(w(d, 18), nxt(d), 'video', B + 'videos/px-children-playing-with-a-tire-in-the-dirt-19749261.mp4')
# José: Brasil
j = 'jose-1'
P(seg[j]['ini'], w(j, 10), 'video', B + 'videos/px-friends-smiling-and-laughing-9305965.mp4')
P(w(j, 10), nxt(j) - 2.4, 'bloco', 'Atlantico', props={'t': {'linha': round(w(j, 24) - w(j, 10), 2), 'brasil': round(w(j, 33) - w(j, 10), 2)}})
P(nxt(j) - 2.4, nxt(j) + 0.3, 'bloco', 'Globo', props={'alvo': 'gira'})
# Vítor 2: os 54 de novo, a Somália por último, a estrela sozinha
v = 'vitor-2'
v0 = seg[v]['ini']
P(v0, w(v, 28), 'bloco', 'AfricaPais', props={'comAudio': False, 'modo': 'final', 't': {
    'n54': round(w(v, 10) - v0, 2), 'f1': round(w(v, 15) - v0, 2), 'so': round(w(v, 18) - v0, 2), 'fim': round(w(v, 18) - v0 + 0.3, 2)}})
P(w(v, 28), TOTAL, 'bloco', 'Final', props={'creditos': round(seg['creditos']['ini'] - w(v, 28), 2)})

# Legendas: blocos de até 42 caracteres, quebram em pontuação; cada um vai do início da 1ª palavra ao fim da última
fixes = {'Oceano': 'oceano', 'chifre': 'Chifre', 'a gerações.': 'há gerações.', 'somales.': 'somalis.'}
leg = []
for fid, _ in ordem:
    if fid not in F: continue
    ws = F[fid]['palavras']; toks = []
    for x in ws:
        txt = fixes.get(x['w'], x['w'])
        if txt.startswith('-') and toks: toks[-1]['w'] += txt; toks[-1]['e'] = x['e']; continue
        toks.append({'w': txt, 's': x['s'], 'e': x['e']})
    cur = []
    def fecha():
        if cur:
            s0 = seg[fid]['voz'] + cur[0]['s'] - seg[fid]['a0']; s1 = seg[fid]['voz'] + cur[-1]['e'] - seg[fid]['a0'] + 0.25
            leg.append({'t0': round(s0, 2), 't1': round(s1, 2), 'txt': ' '.join(c['w'] for c in cur)})
    for i, x in enumerate(toks):
        cand = ' '.join(c['w'] for c in cur + [x])
        if cur and len(cand) > 42: fecha(); cur = []
        cur.append(x)
        if re.search(r'[.?!]$', x['w']) or (re.search(r'[,:]$', x['w']) and len(' '.join(c['w'] for c in cur)) > 24): fecha(); cur = []
    fecha()
for i in range(len(leg) - 1):  # nunca sobrepõe; cola na seguinte se o vão for curto
    if leg[i]['t1'] > leg[i + 1]['t0'] or leg[i + 1]['t0'] - leg[i]['t1'] < 0.25: leg[i]['t1'] = leg[i + 1]['t0'] - 0.07
nomes = {}
for fid, _ in ordem:
    if fid in F and fid != 'anna-2':
        q = F[fid]['quem']
        if q not in nomes: nomes[q] = seg[fid]['voz']
import subprocess
for pl in planos:
    if pl['tipo'] == 'video':
        pl['vdur'] = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'public/' + pl['src']]).decode())
json.dump({'total': TOTAL, 'segmentos': list(seg.values()), 'planos': planos, 'legendas': leg,
           'nomes': [{'nome': k, 't': round(v, 2)} for k, v in nomes.items()]}, open('src/data/timeline.json', 'w'), ensure_ascii=False, indent=1)
print('total', TOTAL, 's', len(planos), 'planos', len(leg), 'legendas')
