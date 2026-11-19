"""Monta src/data/timeline.json: ordem das falas e pausas, cada plano (vídeo, foto ou bloco de motion) preso
ao início de uma palavra falada, e as legendas. Uso: python3 scripts/timeline.py (na pasta do motion)."""
import json, re
F = {f['id']: f for f in json.load(open('src/data/falas.json'))}
# v2 (Vítor 19/11): respiros maiores entre falas e os refrões de "Pearls" SEM fala, só imagens fortes.
# Tempos da música (letra alinhada com whisper): "hurts like brand new shoes" 112,1-115,8 e 218,1-222,2;
# "Hallelujah" 172,1 e 177,8 (+ lamento até ~190). S1 é calculada para a fala da Urley sobre as pérolas acabar em 177,5 s.
URLEY2_FIM = 178.3
pausas = {'maria-1': 0.8, 'anna-1': 2.0, 'luisa-1': 1.8, 'urley-1': 1.0, 'yago-1': 1.4, 'daniel-1': None,
          'maria-2': 1.0, 'anna-2': 1.3, 'luisa-2': 1.0, 'urley-2': 12.7, 'yago-2': 1.2, 'daniel-2': None,
          'jose-1': 2.6, 'vitor-2': 1.2}
ids = ['vitor-1', 'maria-1', 'anna-1', 'luisa-1', 'urley-1', 'yago-1', 'daniel-1', 'maria-2', 'anna-2', 'luisa-2', 'urley-2',
       'yago-2', 'daniel-2', 'jose-1', 'vitor-2']
dur = lambda fid: F[fid]['fim'] - F[fid]['ini']
INTRO, LEAD1, TAIL1 = 4.6, 0.5, 5.36
antes = INTRO + LEAD1 + TAIL1 + sum(dur(i) for i in ids[:ids.index('urley-2') + 1]) + sum(pausas[i] for i in ids[1:ids.index('urley-2')] if pausas[i] is not None)
pausas['daniel-1'] = round(URLEY2_FIM - antes, 2)
# S3: depois da fala do Daniel sobre racismo, o refrão "and it hurts like brand new shoes" (218,1-222,2) fica sem fala
pausas['daniel-2'] = None
FRASE_DUR, CRED_DUR, MLK_DUR = 6.5, 11.5, 17.6
ordem = [('intro', INTRO)] + [(i, pausas[i] if i != 'vitor-1' else 0) for i in ids] + [('mlk', MLK_DUR), ('frase', FRASE_DUR), ('creditos', CRED_DUR)]
seg, t = {}, 0.0
for fid, pausa in ordem:
    if fid in ('intro', 'creditos', 'frase'):
        seg[fid] = {'id': fid, 'ini': t, 'dur': pausa}; t += pausa; continue
    if fid == 'mlk':  # Martin Luther King, 28/08/1963 (trecho 743,95-759,7 s do discurso, com eco), sem ducking da música
        seg[fid] = {'id': fid, 'quem': 'Martin Luther King Jr.', 'ini': t, 'voz': t + 0.6, 'arq': 'editado/mlk.wav', 'a0': 0, 'a1': 19.69, 'dur': pausa, 'semDucking': True}
        t += pausa; continue
    if pausa is None:  # S3: a fala seguinte começa quando o refrão termina
        pausa = 0
    f = F[fid]
    lead = LEAD1 if fid == 'vitor-1' else 0.0
    tail = TAIL1 if fid == 'vitor-1' else 0.0
    d = f['fim'] - f['ini']
    seg[fid] = {'id': fid, 'quem': f['quem'], 'ini': t, 'voz': t + lead, 'arq': f['arquivo'], 'a0': f['ini'], 'a1': f['fim'], 'dur': lead + d + tail}
    t += lead + d + tail + pausa
    if fid == 'daniel-2':
        t = max(t + 1.0, 222.6); seg[fid]['pausa'] = round(t - seg[fid]['ini'] - seg[fid]['dur'], 2)
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
P(fim(y) + 1.4, nxt(y), 'video', H + 'videos/voa-atentado-predios-destruidos.mp4', voa=True, lento=0.7)
# Daniel 1: guerra civil e a TV que desliga
d = 'daniel-1'
P(seg[d]['ini'], w(d, 5), 'video', H + 'videos/voa-atentado-predios-destruidos.mp4', voa=True, inicio=5)
P(w(d, 5), w(d, 13), 'video', T_ + 'videos/voa-fome-multidao-sentada.mp4', voa=True)
P(w(d, 13), fim(d) + 1.2, 'video', T_ + 'videos/voa-fome-seca-entrega-aerea.mp4', voa=True, tv=round(w(d, 27) + 0.25, 2), tvfade=0.6)
# S1 (refrão "hurts like brand new shoes"): o que a câmera deixou de mostrar
def montagem(t0, t1, itens):  # itens: (src, peso, extras)
    tot = sum(i[1] for i in itens); t = t0
    for src, peso, kw in itens:
        d = (t1 - t0) * peso / tot
        P(t, t + d, 'video' if src.endswith('.mp4') else 'foto', src, **kw); t += d
    respiros.append([round(t0, 2), round(t1, 2)])
respiros = []
montagem(fim(d) + 1.2, nxt(d), [(T_ + 'fotos/ov-2013-08-04-afgoye-food-dist-d-jpg-cca012.jpg', 1, {'ax': 0.5, 'ay': 0.5}),
    (T_ + 'fotos/ov-a-young-child-measured-for-malnourishment-in-07de6e.jpg', 1.2, {'ax': 0.5, 'ay': 0.5})])
# Maria 2: Al-Shabaab e o atentado
m = 'maria-2'
P(seg[m]['ini'], w(m, 6), 'foto', T_ + 'al-shabaab/alshabaabfightersinbarawe2013-jpg.jpg')
P(w(m, 6), w(m, 16), 'foto', T_ + 'al-shabaab/al-shabaab-fighters-patrolling-afgooye-mogadishu-road-jpg.jpg')
P(w(m, 16), w(m, 28), 'bloco', 'Atentado', props={'t': {'data': 0.1, 'num': round(w(m, 24) - w(m, 16) - 0.2, 2)}})
P(w(m, 28), w(m, 33), 'foto', T_ + 'al-shabaab/2017-10-15-vbied-8-37666124646-jpg.jpg')
P(w(m, 33), nxt(m), 'video', B + 'videos/voa-mogadiscio-oracao-mesquita.mp4', voa=True)
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
# S2 ("Hallelujah" e o lamento): a seca e a fome sem nenhuma palavra; termina no olhar de uma mulher
montagem(fim(u) + 0.6, nxt(u), [(T_ + 'videos/voa-seca-pastor-animais-mortos.mp4', 2.2, {'voa': True, 'lento': 0.8}),
    (T_ + 'videos/voa-fome-carcaca-paisagem.mp4', 1.9, {'voa': True}),
    (T_ + 'fotos/ov-queuing-for-registration-in-the-heat-of-the-s-bbd112.jpg', 1.9, {}),
    (T_ + 'videos/voa-fome-hospital-e-galoes-de-agua.mp4', 2.2, {'voa': True, 'lento': 0.7}),
    (T_ + 'fotos/ov-extra-food-for-every-child-under-five-a46c17.jpg', 2.0, {'ay': 0.3}),
    (T_ + 'fotos/ov-a-young-woman-waits-to-receive-uk-funded-food-eb908f.jpg', 2.8, {'ay': 0.25})])
# Yago 2: o julgamento
y = 'yago-2'
P(seg[y]['ini'], nxt(y), 'bloco', 'Manchetes', props={'t': {'cai': round(w(y, 10) - seg[y]['ini'], 2)}})
# Daniel 2: racismo
d = 'daniel-2'
P(seg[d]['ini'], w(d, 7), 'video', T_ + 'videos/voa-refugiados-campo-multidao.mp4')
P(w(d, 7), w(d, 14), 'video', T_ + 'videos/korsan-campo-deslocados-tenda.mp4')
P(w(d, 14), w(d, 18), 'video', T_ + 'videos/voa-refugiados-falta-de-comida.mp4')
P(w(d, 18), fim(d) + 0.4, 'video', B + 'videos/px-children-playing-with-a-tire-in-the-dirt-19749261.mp4')
# S3 (refrão "and it hurts like brand new shoes"): crianças refugiadas olhando para quem assiste
montagem(fim(d) + 0.4, nxt(d), [(T_ + 'fotos/ov-children-queue-for-food-aid-in-mogadishu-soma-37ab2b.jpg', 1, {}),
    (T_ + 'fotos/ov-2012-11-18-amisom-mogadishu-h-5eec28.jpg', 1, {'ay': 0.45}),
    (T_ + 'fotos/ov-fmsc-staff-trip-2011-somali-children-68b0fe.jpg', 1.3, {'ay': 0.35})])
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
P(w(v, 28), TOTAL, 'bloco', 'Final', props={'creditos': round(seg['creditos']['ini'] - w(v, 28), 2), 'frase': round(seg['frase']['ini'] - w(v, 28), 2), 'mlk': round(seg['mlk']['ini'] - w(v, 28), 2), 'total': round(TOTAL - w(v, 28), 2)})
# "I have a dream": fotos da Marcha sobre Washington e a tradução palavra a palavra (tempos relativos ao início do áudio)
m0 = seg['mlk']['voz']
P(seg['mlk']['ini'], seg['frase']['ini'] + 0.3, 'bloco', 'Sonho', props={'voz': round(m0 - seg['mlk']['ini'], 2), 'dur': MLK_DUR + 0.3})
respiros.append([round(fim(v), 2), round(seg['mlk']['ini'], 2)])

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
json.dump({'total': TOTAL, 'respiros': respiros, 'segmentos': list(seg.values()), 'planos': planos, 'legendas': leg, 'creditos_ini': round(seg['creditos']['ini'], 2),
           'nomes': [{'nome': k, 't': round(v, 2)} for k, v in nomes.items()]}, open('src/data/timeline.json', 'w'), ensure_ascii=False, indent=1)
print('total', TOTAL, 's', len(planos), 'planos', len(leg), 'legendas')
