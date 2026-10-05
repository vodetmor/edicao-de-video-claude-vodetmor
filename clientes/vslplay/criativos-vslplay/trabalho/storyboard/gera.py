"""Gera o HTML dos quadros do storyboard (criativos 2 e 3) e das pranchas.
Uso: python3 gera.py && node render.mjs
Cada quadro é 540x960 CSS (renderizado em 2x = 1080x1920, o tamanho real do vídeo vertical)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = json.load(open(os.path.join(HERE, 'icons.json')))
RET = json.load(open('/mnt/project-files/anuncio-vslplay/trabalho/fonte/src/data/retention.json'))

INK, PAPER, BLACK, CORAL, CYAN, VIOLET, SUN = '#111113', '#F2F1EE', '#0B0B0C', '#EC5F78', '#3DCBEE', '#6A10D8', '#FFD84D'

CSS = f"""
@font-face{{font-family:Archivo;src:url(fonts/archivo-latin-wdth-normal.woff2) format('woff2');font-weight:100 900;font-stretch:62% 125%}}
@font-face{{font-family:Inter;src:url(fonts/inter-latin-opsz-normal.woff2) format('woff2');font-weight:100 900}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#ddd;font-family:Inter}}
.frame{{position:relative;width:540px;height:960px;overflow:hidden;font-family:Inter;color:{INK}}}
.paper{{background:{PAPER}}} .white{{background:#fff}} .black{{background:{BLACK};color:#fff}}
.abs{{position:absolute}}
.h{{position:absolute;left:30px;right:30px;font-family:Archivo;font-weight:900;font-stretch:66%;text-transform:uppercase;line-height:.9;letter-spacing:-.005em;font-size:66px}}
.h .g{{color:#9a9a9e}}
.note{{position:absolute;background:{SUN};color:{INK};font:600 15px/1.25 Inter;padding:7px 11px;border-radius:10px;max-width:250px;z-index:50;box-shadow:0 1px 0 rgba(0,0,0,.15)}}
.player{{position:absolute;border-radius:14px;overflow:hidden;background:#0F0F10;box-shadow:0 18px 40px rgba(0,0,0,.18)}}
.player img.pv{{width:100%;height:100%;object-fit:cover;display:block}}
.ctrl{{position:absolute;left:0;right:0;bottom:0;height:34px;display:flex;align-items:center;gap:8px;padding:0 10px;background:linear-gradient(transparent,rgba(0,0,0,.55));color:#fff;font:600 11px Inter;font-variant-numeric:tabular-nums}}
.ctrl svg{{width:14px;height:14px;fill:#fff}}
.fake{{position:absolute;left:0;bottom:0;height:5px;background:{CORAL}}}
.cta{{position:absolute;display:flex;align-items:center;justify-content:center;background:{CORAL};color:{INK};font-family:Archivo;font-weight:900;font-stretch:80%;letter-spacing:.02em;border-radius:12px}}
.sk{{position:absolute;background:#E4E3E0;border-radius:6px}}
.tag{{position:absolute;font:700 13px Inter;padding:5px 9px;border-radius:7px;font-variant-numeric:tabular-nums}}
.pill{{position:absolute;font:600 12px Inter;padding:5px 10px;border-radius:99px}}
.card{{position:absolute;background:#fff;border-radius:16px;box-shadow:0 14px 34px rgba(0,0,0,.10)}}
.lbl{{font:500 12px Inter;color:#6b6b70}}
.num{{font-family:Archivo;font-weight:800;font-stretch:75%;font-variant-numeric:tabular-nums}}
"""

def icon(name, size=14, color='#fff'):
    i = ICONS[name]
    return f'<svg viewBox="{i["vb"]}" width="{size}" height="{size}" style="fill:{color};color:{color}">{i["inner"]}</svg>'

def note(x, y, text, w=None):
    st = f'left:{x}px;top:{y}px' + (f';width:{w}px' if w else '')
    return f'<div class="note" style="{st}">{text}</div>'

def svg(inner):
    return f'''<svg class="abs" style="left:0;top:0;z-index:40" width="540" height="960" viewBox="0 0 540 960">
<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{INK}"/></marker></defs>{inner}</svg>'''

def arrow(d, color=INK, dash='5 5', w=2):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-dasharray="{dash}" stroke-linecap="round" marker-end="url(#ah)"/>'

def player(x, y, w, time='00:07 / 18:30', prog=0.02, extra='', dim=0, blur=0):
    h = round(w * 9 / 16)
    filt = f'filter:blur({blur}px);' if blur else ''
    dimdiv = f'<div class="abs" style="inset:0;background:rgba(0,0,0,{dim})"></div>' if dim else ''
    return f'''<div class="player" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;{filt}">
<img class="pv" src="img/presenter.jpg">{dimdiv}{extra}
<div class="ctrl">{icon("pause",13)}{icon("speaker",14)}<span>{time}</span><span style="flex:1"></span>{icon("gear",13)}{icon("fullscreen",13)}</div>
<div class="fake" style="width:{prog*100:.1f}%"></div></div>'''

def urlbar(y=34):
    return f'''<div class="abs" style="left:20px;right:20px;top:{y}px;height:34px;border-radius:99px;background:#EEEDEA;display:flex;align-items:center;justify-content:center;font:500 13px Inter;color:#77777c">suaoferta.com.br</div>'''

def skeleton(y0, n=4, x=24, w=492):
    out = ''
    for i in range(n):
        ww = w if i % 3 != 2 else w * 0.62
        out += f'<div class="sk" style="left:{x}px;top:{y0+i*26}px;width:{ww:.0f}px;height:13px"></div>'
    return out

def cta(x, y, w, h, fs, text='COMPRAR AGORA', rot=0, extra=''):
    return f'<div class="cta" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;font-size:{fs}px;transform:rotate({rot}deg);{extra}">{text}</div>'

def xmark(x, y, s=46):
    return f'<svg class="abs" style="left:{x}px;top:{y}px" width="{s}" height="{s}" viewBox="0 0 46 46"><path d="M8 8L38 38M38 8L8 38" stroke="{CORAL}" stroke-width="8" stroke-linecap="round"/></svg>'

def logo(y, w=440):
    return f'<img class="abs" src="img/logo-lockup.png" style="left:{(540-w)/2}px;top:{y}px;width:{w}px">'

def blocks3():
    return ''.join(f"<div style='width:90px;height:{h*1.6:.0f}px;border-radius:12px;background:{c}'></div>" for h, c in ((70, INK), (34, CORAL), (90, '#c9c8c4')))

def pills4():
    return ''.join(f"<span class='pill' style='position:relative;background:{b};color:{INK}'>{t}</span>" for t, b in (('Smart AutoPlay', CORAL), ('Botão com delay', '#fff'), ('Sincronização', '#fff'), ('E muito mais', '#fff')))

def frame(cls, inner):
    return f'<div class="frame {cls}">{inner}</div>'

# ---------------------------------------------------------------- criativo 2
def c2():
    F = []
    # 1 - 0,0 s: botão despenca em cima da VSL
    F.append(frame('white', urlbar() + player(20, 110, 500) + skeleton(430) + skeleton(560, 3) + skeleton(680, 4) + f'<div class="sk" style="left:24px;top:800px;width:492px;height:130px;border-radius:14px"></div>' +
        cta(110, 168, 320, 74, 30, rot=-5, extra='box-shadow:0 20px 40px rgba(0,0,0,.25)') +
        svg(''.join(f'<line x1="{x}" y1="40" x2="{x}" y2="{140-abs(x-270)//6}" stroke="{INK}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>' for x in (150, 200, 270, 340, 390)) +
            ''.join(f'<line x1="{a}" y1="{b}" x2="{c}" y2="{d}" stroke="{CORAL}" stroke-width="4" stroke-linecap="round"/>' for a, b, c, d in ((96, 200, 70, 190), (96, 230, 66, 236), (444, 196, 470, 184), (444, 226, 474, 230)))) +
        note(300, 290, 'Quadro 1: o botão despenca do topo e bate em cima do vídeo. A tela treme.') +
        note(30, 860, 'Sem logo, sem fade: o vídeo já começa no meio da ação.')))
    # 2 - 0,4 s: etiquetas + pergunta
    F.append(frame('white', urlbar() + player(20, 110, 500, extra='') + skeleton(430, 2) +
        cta(110, 196, 320, 74, 30, rot=-2) +
        f'<div class="tag" style="left:30px;top:300px;background:{CORAL};color:{INK}">00:07</div>' +
        f'<div class="tag" style="left:94px;top:300px;background:#fff;color:#77777c;box-shadow:0 4px 12px rgba(0,0,0,.12)">oferta só em 12:40</div>' +
        f'<div class="abs" style="left:0;right:0;top:500px;height:300px;background:#fff"></div>' +
        xmark(30, 520) + '<div class="h" style="top:582px;font-size:72px">Botão antes<br>do pitch?</div>' + skeleton(780, 3) + f'<div class="sk" style="left:24px;top:870px;width:492px;height:70px;border-radius:14px"></div>' +
                note(300, 410, 'Etiqueta no relógio: 00:07 contra 12:40. É a curiosidade.') +
        note(300, 520, 'O X coral se desenha no lugar do emoji.')))
    # 3 - 1,5 s: polegar empurra a página para fora
    F.append(frame('paper', f'<div class="abs white" style="left:0;top:0;width:540px;height:960px;transform:translateY(-330px) rotate(-5deg);transform-origin:50% 100%;box-shadow:0 30px 60px rgba(0,0,0,.18)">' +
        urlbar() + player(20, 110, 500) + cta(110, 196, 320, 74, 30, rot=-2) + skeleton(430) + skeleton(560, 3) + '</div>' +
        f'<div class="abs" style="left:236px;top:700px;width:64px;height:64px;border-radius:50%;background:rgba(17,17,19,.14);border:3px solid rgba(17,17,19,.45)"></div>' +
        svg(arrow('M268 690 L268 560', w=3, dash='0')) +
        '<div class="h" style="top:800px;font-size:44px;color:#9a9a9e">o visitante foi embora</div>' +
        note(320, 640, 'Swipe rápido: a página sai da tela antes da oferta.')))
    # 4 - 2,5 s: zoom no botão culpado
    F.append(frame('black', f'<div class="abs" style="inset:0;background:url(img/presenter.jpg) center/cover;filter:blur(14px) brightness(.35)"></div>' +
        cta(40, 380, 460, 120, 52, extra='box-shadow:0 30px 60px rgba(0,0,0,.5)') +
        '<div class="h" style="top:170px;color:#fff;font-size:76px">Antes da<br>oferta?</div>' +
        svg(arrow('M70 600 L120 540', color='#fff') + arrow('M470 600 L420 540', color='#fff')) +
        note(150, 620, 'Zoom rápido: o botão fica sozinho, "culpado".')))
    # 5 - cena 2: ação na frente da informação
    F.append(frame('paper', f'''<div class="card" style="left:70px;top:330px;width:400px;height:380px;filter:blur(3.5px);opacity:.85">
<div style="padding:28px"><div class="num" style="font-size:40px">OFERTA</div><div class="sk" style="position:relative;margin-top:18px;width:220px;height:40px;background:#d6d5d2"></div>
<div class="sk" style="position:relative;margin-top:16px;width:300px;height:14px"></div><div class="sk" style="position:relative;margin-top:10px;width:260px;height:14px"></div>
<div style="display:flex;gap:8px;margin-top:20px"><span class="pill" style="position:relative;background:{SUN}">Bônus 1</span><span class="pill" style="position:relative;background:{SUN}">Bônus 2</span></div></div></div>''' +
        cta(60, 470, 420, 96, 42, extra='box-shadow:0 26px 50px rgba(0,0,0,.28)') +
        '<div class="h" style="top:120px">Ação na frente<br><span class="g">da informação.</span></div>' +
        svg(arrow('M470 760 C520 700 520 620 480 580')) +
        note(250, 770, 'Na palavra "informação" a câmera tenta espiar por trás. O botão bloqueia de novo (toc).')))
    # 6 - cena 3a: painel do VSLPLAY, botão com delay
    F.append(frame('paper', '<div class="h" style="top:110px">Botão<br>com delay</div>' +
        f'''<div class="card" style="left:30px;top:330px;width:480px;height:330px;padding:26px">
<div style="display:flex;align-items:center;justify-content:space-between"><div style="font:700 19px Inter">Botão com delay</div>
<div style="width:52px;height:30px;border-radius:99px;background:{CORAL};position:relative"><div style="position:absolute;right:3px;top:3px;width:24px;height:24px;border-radius:50%;background:#fff"></div></div></div>
<div class="lbl" style="margin-top:22px">Aparecer em</div>
<div style="margin-top:8px;width:150px;height:44px;border-radius:10px;border:1.5px solid #d6d5d2;display:flex;align-items:center;padding-left:14px;font:700 20px Inter;font-variant-numeric:tabular-nums">12:40</div>
<div class="lbl" style="margin-top:26px">Linha do tempo da VSL</div>
<div style="position:relative;margin-top:16px;height:8px;border-radius:99px;background:#E4E3E0"><div style="position:absolute;left:0;top:0;height:8px;width:68%;border-radius:99px;background:{INK}"></div>
<div style="position:absolute;left:68%;top:-11px;width:30px;height:30px;margin-left:-15px;border-radius:50%;background:{CORAL};border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div></div>
<div style="display:flex;justify-content:space-between;margin-top:14px;font:500 12px Inter;color:#8a8a8f"><span>00:00</span><span>18:30</span></div></div>''' +
        f'<svg class="abs" style="left:330px;top:612px" width="26" height="30" viewBox="0 0 26 30"><path d="M2 2L2 24L8 18L12 28L16 26L12 16L21 16Z" fill="#fff" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/></svg>' +
        svg(arrow('M150 612 L330 612')) +
        note(40, 700, 'O cursor arrasta o marcador até 12:40 (clique seco).')))
    # 7 - cena 3b: botão nasce no 12:40
    F.append(frame('white', urlbar() + player(20, 110, 500, time='12:40 / 18:30', prog=0.68) +
        f'<div class="tag" style="left:30px;top:300px;background:{CORAL};color:{INK}">12:40</div>' +
        cta(40, 420, 460, 84, 34) +
        svg(''.join(f'<path d="{d}" stroke="{CORAL}" stroke-width="4" stroke-linecap="round" fill="none"/>' for d in ('M28 412 L14 398', 'M512 412 L526 398', 'M28 512 L14 526', 'M512 512 L526 526'))) +
        '<div class="h" style="top:560px">No segundo<br>que você<br>escolhe.</div>' + skeleton(790, 3) + f'<div class="sk" style="left:24px;top:880px;width:492px;height:60px;border-radius:14px"></div>' +
        note(300, 250, 'A agulha corre de 00:07 até 12:40 e o botão nasce com mola, no lugar certo.')))
    # 8 - cena 4: a página ainda vazia
    F.append(frame('paper', f'<div class="abs white" style="left:95px;top:250px;width:350px;height:622px;border-radius:26px;box-shadow:0 20px 50px rgba(0,0,0,.14);overflow:hidden">' +
        f'<div style="transform:scale(.648);transform-origin:0 0;width:540px;height:960px;position:relative">' + player(20, 40, 500, time='12:40 / 18:30', prog=0.68) + cta(40, 340, 460, 84, 34) +
        ''.join(f'<div class="abs" style="left:24px;top:{460+i*150}px;width:492px;height:130px;border:2.5px dashed #c9c8c4;border-radius:14px"></div>' for i in range(3)) + '</div></div>' +
        '<div class="h" style="top:90px">Não para<br>no botão.</div>' +
        svg(arrow('M470 900 L420 840') + arrow('M70 900 L120 840')) +
        note(300, 840, 'A câmera recua: abaixo do player a página ainda está vazia. Música quase some (respiro).')))
    # 9 - cena 5: seções sincronizadas
    marks = [(0.225, '04:10', 'Depoimentos'), (0.514, '09:30', 'Bônus'), (0.685, '12:40', 'Oferta')]
    tl = ''.join(f'<div class="abs" style="left:{30+480*p-5}px;top:388px;width:10px;height:10px;transform:rotate(45deg);background:{CORAL if i<2 else "#fff"}"></div><div class="abs" style="left:{30+480*p-40}px;top:404px;width:80px;text-align:center;font:600 11px Inter;color:#cfcfd2">{t}<br>{n}</div>' for i, (p, t, n) in enumerate(marks))
    F.append(frame('black', player(30, 104, 480, time='09:30 / 18:30', prog=0.514) +
        f'<div class="abs" style="left:30px;top:390px;width:480px;height:6px;border-radius:99px;background:#333"></div><div class="abs" style="left:30px;top:390px;width:{480*0.514}px;height:6px;border-radius:99px;background:#fff"></div>' + tl +
        '<div class="h" style="top:40px;color:#fff;font-size:46px">Seções no tempo</div>' +
        f'''<div class="abs" style="left:0;top:470px;width:540px;height:490px;background:#fff;border-radius:22px 22px 0 0;padding:22px 24px">
<div style="height:120px;border-radius:14px;background:{PAPER};padding:16px"><div style="font:700 15px Inter">Depoimentos</div><div style="display:flex;gap:10px;margin-top:12px">{''.join('<div style="flex:1;height:58px;border-radius:10px;background:#fff"></div>' for _ in range(3))}</div></div>
<div style="margin-top:16px;height:120px;border-radius:14px;background:{SUN};padding:16px;transform:translateY(-14px) scale(1.03);box-shadow:0 16px 30px rgba(0,0,0,.18)"><div style="font:700 15px Inter">Bônus</div><div style="display:flex;gap:10px;margin-top:12px">{''.join('<div style="flex:1;height:58px;border-radius:10px;background:rgba(255,255,255,.6)"></div>' for _ in range(2))}</div></div>
<div style="margin-top:2px;height:120px;border-radius:14px;border:2.5px dashed #c9c8c4;display:flex;align-items:center;justify-content:center;font:600 14px Inter;color:#a5a5a9">Oferta entra em 12:40</div></div>''' +
        svg(arrow(f'M{30+480*0.514} 432 L{30+480*0.514} 560', color=CORAL, dash='0', w=2.5)) +
        note(300, 640, 'Cada marcador que a agulha passa encaixa uma seção na página, na batida da música.')))
    # 10 - cena 6a: vídeo + botão + página
    F.append(frame('paper', '<div class="h" style="top:150px;font-size:96px;line-height:1">Vídeo<br><span style="color:' + CORAL + '">+</span> botão<br><span style="color:' + CORAL + '">+</span> página</div>' +
        note(250, 560, 'Cada palavra entra junto com a palavra falada (três batidas).') +
        
        f'<div class="abs" style="left:120px;top:700px;display:flex;gap:14px;align-items:flex-end">{blocks3()}</div>' +
        note(30, 880, 'Os três blocos deslizam e se encaixam numa página só.')))
    # 11 - cena 6b: página completa
    F.append(frame('white', urlbar() + player(20, 110, 500, time='12:40 / 18:30', prog=0.68) + cta(40, 410, 460, 76, 32) +
        f'<div class="abs" style="left:24px;top:510px;width:492px;height:110px;border-radius:14px;background:{PAPER}"></div><div class="abs" style="left:24px;top:634px;width:492px;height:110px;border-radius:14px;background:{SUN}"></div>' +
        f'<div class="abs" style="left:0;right:0;top:770px;height:190px;background:linear-gradient(rgba(255,255,255,0),#fff 30%)"></div>' +
        '<div class="h" style="top:800px;font-size:82px">Na hora certa.</div>' +
        note(300, 520, 'A página completa rola sozinha. Acorde que resolve.')))
    # 12 - CTA
    F.append(frame('black', logo(300) +
        '<div class="h" style="top:470px;color:#fff;text-align:center;font-size:44px">VSL + página + oferta<br><span style="color:#8d8d92">no momento certo.</span></div>' +
        cta(120, 650, 300, 78, 34, text='7 DIAS GRÁTIS') +
        note(300, 760, 'Vinheta curta da logo (já aprovada). O botão pulsa uma vez e segura 1,5 s.')))
    return F

C2CAP = [
    ('0,0 s', 'Gancho', 'O botão de compra despenca em cima da VSL e a tela treme.', 'Seu botão de compra…'),
    ('0,4 s', 'Gancho', 'Etiquetas 00:07 e "oferta só em 12:40". Pergunta na tela.', 'aparece antes…'),
    ('1,5 s', 'Gancho', 'O visitante rola e a página sai da tela.', 'da sua VSL…'),
    ('2,5 s', 'Gancho', 'Zoom no botão, sozinho, "culpado".', 'apresentar a oferta?'),
    ('0:05', 'Cena 2', 'O botão fica na frente da oferta, que ainda está se montando.', 'uma ação na frente de uma informação…'),
    ('0:11', 'Cena 3 · virada', 'Painel do VSLPLAY: o marcador é arrastado até 12:40.', 'Com VSL Play, você configura o botão com delay…'),
    ('0:15', 'Cena 3 · virada', 'A agulha chega a 12:40 e o botão nasce no lugar certo.', 'no momento definido por você.'),
    ('0:18', 'Cena 4', 'A câmera recua: o resto da página ainda está vazio.', 'E não precisa parar no botão.'),
    ('0:20', 'Cena 5', 'Cada marcador da VSL encaixa uma seção da página.', 'sincronizar seções da sua página…'),
    ('0:27', 'Cena 6', 'VÍDEO + BOTÃO + PÁGINA, uma palavra por batida.', 'vídeo, botão e página…'),
    ('0:31', 'Cena 6', 'A página completa, tudo no lugar.', 'trabalhando juntos na hora certa.'),
    ('0:33', 'CTA', 'Logo e tela final do briefing.', 'Isso é VSL Play. Teste grátis por 7 dias.'),
]

# ---------------------------------------------------------------- criativo 3
def dots(points, r=6.5, color=INK, op=1):
    return ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}" opacity="{op}"/>' for x, y in points)

def c3():
    F = []
    import random
    random.seed(4)
    walk = [(24 + i * 17.5, 600) for i in range(28)]
    counter = lambda n, lab='assistindo', col=INK: f'<div class="abs" style="right:30px;top:300px;text-align:right"><div class="num" style="font-size:96px;line-height:.9;color:{col}">{n}</div><div class="lbl" style="font-size:15px">{lab}</div></div>'
    tagline = f'<div class="abs" style="left:30px;top:120px;background:{INK};color:#fff;font-family:Archivo;font-weight:900;font-stretch:70%;font-size:40px;padding:10px 16px 8px;border-radius:10px">GESTOR DE TRÁFEGO:</div>'
    # 1 - fila andando
    F.append(frame('paper', tagline + counter(100) +
        svg(f'<line x1="0" y1="608" x2="540" y2="608" stroke="{INK}" stroke-width="3"/>' + dots([(x, 598) for x, _ in walk]) + arrow('M380 660 L500 660')) +
        note(30, 680, 'Os pontinhos são os espectadores, andando como numa esteira.') +
        note(30, 250, 'A etiqueta entra seca no quadro 1, junto com a palavra "Gestor".')))
    # 2 - precipício
    cliff = f'M0 608 L230 608 C238 640 250 760 262 800 C300 812 420 820 540 826'
    fall = [(240 + random.uniform(-6, 18), 640 + i * 20 + random.uniform(-6, 6)) for i in range(8)] + [(275 + random.uniform(0, 30), 700 + random.uniform(0, 80)) for _ in range(6)]
    F.append(frame('paper', tagline + counter(58, col=CORAL) +
        svg(f'<path d="{cliff}" stroke="{INK}" stroke-width="3" fill="none"/>' + dots([(30 + i * 17.5, 598) for i in range(12)]) + dots(fall, op=.85) +
            ''.join(f'<line x1="{x}" y1="{y-30}" x2="{x}" y2="{y-12}" stroke="{INK}" stroke-width="2" opacity=".35"/>' for x, y in fall[:8]) + dots([(330 + i * 34, 806 + i * 1.2) for i in range(6)])) +
        note(300, 470, 'A linha quebra num precipício. Os pontos caem e o contador despenca de 100 para 58.')))
    # 3 - congela + anel + pergunta
    F.append(frame('paper', '<div class="h" style="top:110px;font-size:62px">Onde as pessoas<br>abandonam<br>sua VSL?</div>' +
        svg(f'<path d="{cliff}" stroke="{INK}" stroke-width="3" fill="none"/>' + dots([(30 + i * 17.5, 598) for i in range(12)]) + dots(fall, op=.85) +
            f'<circle cx="238" cy="626" r="44" fill="none" stroke="{CORAL}" stroke-width="4.5"/>' + dots([(330 + i * 34, 806 + i * 1.2) for i in range(6)])) +
        f'<div class="tag" style="left:286px;top:560px;background:{CORAL};color:{INK}">00:06</div>' +
        note(30, 880, 'A queda congela no ar por 0,3 s. O anel coral se desenha no ponto da quebra.')))
    # 4 - cena 2a: só o CPA
    F.append(frame('paper', '<div class="h" style="top:110px">Só o CPA?</div>' +
        f'''<div class="card" style="left:30px;top:300px;width:480px;height:330px;padding:26px">
<div class="lbl">Painel de anúncios</div>
<div style="display:flex;gap:18px;margin-top:22px;opacity:.35">{"".join(f'<div style="flex:1"><div class="lbl">{l}</div><div class="num" style="font-size:24px">{v}</div></div>' for l, v in (("Cliques", "1.200"), ("CTR", "1,8%"), ("CPM", "R$ 32")))}</div>
<div class="lbl" style="margin-top:30px;font-size:16px;color:{INK}">CPA</div><div class="num" style="font-size:110px;line-height:1">R$ 47,90</div></div>''' +
        note(250, 650, 'Painel genérico, sem marca de nenhuma plataforma. Um número só.') +
        note(30, 760, 'Tique de números somando.')))
    # 5 - cena 2b: funil com buraco
    rows = [('Cliques', '1.200', 1), ('Página', '980', .82), ('Play', '610', .6), ('???', 'dentro do vídeo', .78), ('Compra', '25', .14)]
    funnel = ''
    for i, (n, v, w) in enumerate(rows):
        y = 300 + i * 92; ww = 120 + 360 * w
        if n == '???':
            funnel += f'<div class="abs" style="left:{270-ww/2}px;top:{y}px;width:{ww}px;height:76px;border-radius:12px;border:3px dashed {CORAL};display:flex;align-items:center;justify-content:center;font:700 16px Inter;color:{CORAL}">??? o que acontece dentro do vídeo</div>'
        else:
            funnel += f'<div class="abs" style="left:{270-ww/2}px;top:{y}px;width:{ww}px;height:76px;border-radius:12px;background:{INK if i==0 else "#fff"};color:{"#fff" if i==0 else INK};display:flex;align-items:center;justify-content:space-between;padding:0 18px;font:600 15px Inter;box-shadow:0 8px 20px rgba(0,0,0,.08)"><span>{n}</span><span class="num" style="font-size:26px">{v}</span></div>'
    F.append(frame('paper', '<div class="h" style="top:90px;font-size:58px">Não conta<br>a história inteira.</div>' + funnel +
        note(300, 800, 'A câmera se afasta: o CPA era só a ponta. A linha do meio está vazia.')))
    # 6 - cena 3: revelação, gráfico de retenção
    cv = RET['curve']
    gx, gy, gw, gh = 50, 330, 460, 330
    tmax = 30
    cv = [c for c in cv if c['t'] <= 30.5]
    def pt(t, p): return gx + gw * t / tmax, gy + gh * (1 - p / 100)
    path = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in (pt(c['t'], c['p']) for c in cv))
    area = path + f' L{gx+gw} {gy+gh} L{gx} {gy+gh}Z'
    axes = ''.join(f'<line x1="{gx}" y1="{gy+gh*(1-p/100)}" x2="{gx+gw}" y2="{gy+gh*(1-p/100)}" stroke="#d6d5d2" stroke-width="1"/><text x="{gx-8}" y="{gy+gh*(1-p/100)+4}" text-anchor="end" font-family="Inter" font-size="11" fill="#8a8a8f">{p}%</text>' for p in (0, 25, 50, 75, 100))
    kx, ky = pt(6.0, 58.3)
    kpis = ''.join(f'<div style="flex:1"><div class="num" style="font-size:38px">{v}</div><div class="lbl">{l}</div></div>' for v, l in (('14K', 'Visitas'), ('3,5K', 'Cliques'), ('24,54%', 'Play rate')))
    graph = svg(axes + f'<path d="{area}" fill="{CYAN}" opacity=".18"/><path d="{path}" stroke="{CYAN}" stroke-width="3.5" fill="none"/>' + dots([pt(c['t'], c['p']) for c in cv[2::7]], r=5.5, op=.8) + f'<circle cx="{kx}" cy="{ky}" r="7" fill="{INK}"/>')
    F.append(frame('paper', '<div class="h" style="top:100px">Retenção<br>da sua VSL.</div>' + graph +
        f'<div class="tag" style="left:{kx+12}px;top:{ky-36}px;background:{INK};color:#fff">00:06 · 58%</div>' +
        f'<div class="abs" style="left:30px;right:30px;top:700px;display:flex;gap:10px">{kpis}</div>' +
        '<div class="abs lbl" style="left:30px;top:790px;font-size:11px">Dados de demonstração do painel VSLPLAY</div>' +
        note(250, 250, 'Revelação: a linha do gancho era o gráfico de retenção. Os eixos se desenham em volta.')))
    # 7 - cena 4a: achou a queda
    F.append(frame('paper', '<div class="h" style="top:100px">Achou<br>a queda?</div>' + graph +
        svg(f'<circle cx="{kx}" cy="{ky}" r="46" fill="none" stroke="{CORAL}" stroke-width="4.5"/>' + arrow(f'M{kx+190} {ky-90} C{kx+150} {ky-90} {kx+80} {ky-60} {kx+44} {ky-20}', color=CORAL, dash='0', w=2.5)) +
        f'<div class="abs" style="left:{kx+196}px;top:{ky-104}px;font:700 16px Inter;color:{CORAL}">perdendo<br>atenção aqui</div>' +
        note(30, 760, 'Anel coral na queda do 00:06.')))
    # 8 - cena 4b: versão A x B
    pathB = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in (pt(c['t'], min(100, c['p'] + (16 if c['t'] > 6 else c['t'] * 2.7))) for c in cv))
    F.append(frame('paper', '<div class="h" style="top:100px">Teste outra<br>versão.</div>' +
        svg(axes + f'<path d="{path}" stroke="#a5a5a9" stroke-width="3" fill="none" stroke-dasharray="7 6"/><path d="{pathB}" stroke="{CYAN}" stroke-width="4" fill="none"/>') +
        f'<div class="abs" style="left:30px;top:700px;display:flex;gap:22px;font:600 15px Inter"><span><span style="display:inline-block;width:22px;height:4px;background:#a5a5a9;vertical-align:middle;margin-right:8px"></span>Versão A</span><span><span style="display:inline-block;width:22px;height:4px;background:{CYAN};vertical-align:middle;margin-right:8px"></span>Versão B</span></div>' +
        note(250, 770, 'A curva se duplica: a versão B (ciano) segura mais gente depois do 00:06. Curvas ilustrativas.')))
    # 9 - cena 5a: Smart AutoPlay
    sa = f'''<div class="abs" style="left:12%;top:22%;width:76%;height:56%;border-radius:12px;background:{CORAL};display:flex;align-items:center;gap:14px;padding:0 18px">{icon("speakerSlash",58,INK)}
<div><div style="display:inline-block;background:rgba(255,255,255,.55);font:600 10px Inter;padding:3px 8px;border-radius:99px">Seu vídeo já começou</div><div style="font:800 19px Inter;margin-top:6px;color:{INK}">Clique para ouvir</div></div></div>'''
    F.append(frame('paper', '<div class="h" style="top:110px">Smart<br>AutoPlay</div>' + player(20, 340, 500, dim=.55, extra=sa) +
        f'<div class="abs" style="left:30px;top:680px;display:flex;gap:8px;flex-wrap:wrap;width:480px">{pills4()}</div>' +
        note(250, 760, 'Um recurso a cada ~1,5 s, cada um mostrando a própria função: o autoplay pulsa, o botão nasce, a seção encaixa.')))
    # 10 - cena 5b: e muito mais (logos)
    logos = ['hotmart', 'cademi', 'memberkit', 'elementor', 'wordpress', 'leadlovers', 'ticto', 'webflow', 'edduz', 'wix', 'typebot', 'great-pages']
    lg = ''
    import math
    for i, n in enumerate(logos):
        col, row = i % 3, i // 3
        x = 42 + col * 160 + (row % 2) * 0; y = 330 + row * 122 + (col == 1) * 30
        lg += f'<div class="abs" style="left:{x}px;top:{y}px;width:136px;height:100px;border-radius:20px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center"><img src="img/{n}.webp" style="max-width:104px;max-height:60px"></div>'
    F.append(frame('paper', '<div class="h" style="top:110px">E muito<br>mais.</div>' + lg +
        note(250, 850, 'Os logos reais das integrações entram um por batida.')))
    # 11 - cena 6: menos achismo, mais dados
    mini = 'M' + ' L'.join(f'{30+480*c["t"]/184:.1f} {640+90*(1-c["p"]/100):.1f}' for c in RET['curve'])
    F.append(frame('paper', '<div class="h" style="top:200px;font-size:64px;color:#b4b4b8">Menos <span style="text-decoration:line-through;text-decoration-thickness:6px;text-decoration-color:#EC5F78">achismo</span>.</div>' +
        '<div class="h" style="top:380px;font-size:120px">Mais<br>dados.</div>' +
        svg(f'<path d="{mini}" stroke="{CYAN}" stroke-width="5" fill="none"/>') +
        note(250, 790, 'ACHISMO encolhe e sai; DADOS cresce, sublinhado pela curva. Duas batidas.')))
    # 12 - CTA
    F.append(frame('black', logo(260) +
        '<div class="h" style="top:420px;color:#fff;text-align:center;font-size:50px">Mais controle.<br>Mais dados.<br><span style="color:#8d8d92">Mais inteligência<br>para sua VSL.</span></div>' +
        cta(120, 700, 300, 78, 34, text='7 DIAS GRÁTIS') +
        note(300, 810, 'Vinheta curta da logo. O botão pulsa uma vez e segura 1,5 s.')))
    return F

C3CAP = [
    ('0,0 s', 'Gancho', '"GESTOR DE TRÁFEGO:" entra seco. 100 pontinhos andando.', 'Gestor de tráfego…'),
    ('0,8 s', 'Gancho', 'A linha vira precipício: 100 caem para 58.', 'você sabe exatamente…'),
    ('2,0 s', 'Gancho', 'A queda congela. Anel coral no 00:06 e a pergunta.', 'onde as pessoas estão abandonando sua VSL?'),
    ('0:07', 'Cena 2', 'Painel de anúncios com um número só: o CPA.', 'olhar apenas o CPA…'),
    ('0:10', 'Cena 2', 'O CPA vira a ponta de um funil com um buraco no meio.', 'não conta a história inteira.'),
    ('0:13', 'Cena 3 · virada', 'A linha do gancho vira o gráfico de retenção do VSLPLAY.', 'Com o VSL Play, você consegue acompanhar a retenção…'),
    ('0:20', 'Cena 4', 'Anel na queda: "perdendo atenção aqui".', 'onde está perdendo atenção…'),
    ('0:24', 'Cena 4', 'Versão A x versão B: a nova segura mais gente.', 'pode testar novas versões…'),
    ('0:27', 'Cena 5', 'Recursos em sequência, cada um mostrando a função.', 'Smart Autoplay, botão com delay, sincronização…'),
    ('0:31', 'Cena 5', 'Logos reais das integrações, um por batida.', 'e muito mais.'),
    ('0:33', 'Cena 6', 'ACHISMO encolhe, DADOS cresce.', 'Menos achismo. Mais dados para otimizar sua VSL.'),
    ('0:37', 'CTA', 'Logo e tela final do briefing.', 'Conheça o VSL Play e teste grátis por 7 dias.'),
]

def page(frames):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div style="display:flex;flex-wrap:wrap;gap:20px;padding:20px">{"".join(frames)}</div></body></html>'

SHEET_CSS = """
@font-face{font-family:Archivo;src:url(fonts/archivo-latin-wdth-normal.woff2) format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:Inter;src:url(fonts/inter-latin-opsz-normal.woff2) format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F2F1EE;font-family:Inter;color:#111113;width:1300px}
.wrap{padding:44px 40px 30px}
h1{font-family:Archivo;font-weight:900;font-stretch:68%;text-transform:uppercase;font-size:48px;line-height:.95}
.sub{font:500 17px Inter;color:#55555a;margin-top:10px}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:26px 18px;margin-top:30px}
.it img{width:100%;border-radius:12px;display:block;box-shadow:0 8px 22px rgba(0,0,0,.10)}
.t{margin-top:10px;font:700 13px Inter;font-variant-numeric:tabular-nums}
.t span{color:#EC5F78}
.d{font:500 12.5px/1.35 Inter;margin-top:4px}
.v{font:italic 500 12px/1.35 Inter;color:#77777c;margin-top:5px}
.foot{margin-top:26px;font:500 12px Inter;color:#8a8a8f}
"""

def sheet(title, sub, prefix, caps, part):
    items = ''.join(f'<div class="it"><img src="quadros/{prefix}-{i+1:02d}.png"><div class="t">{i+1:02d} · {t} <span>{c}</span></div><div class="d">{d}</div><div class="v">"{v}"</div></div>' for i, (t, c, d, v) in enumerate(caps) if i // 6 == part)
    return f'<!doctype html><html><head><meta charset="utf-8"><style>{SHEET_CSS}</style></head><body><div class="wrap"><h1>{title}</h1><div class="sub">{sub}</div><div class="grid">{items}</div><div class="foot">Storyboard para aprovação · quadros-chave em 9:16 · notas amarelas explicam o movimento e não aparecem no vídeo · VSLPLAY · outubro de 2026</div></div></body></html>'

os.makedirs(os.path.join(HERE, 'quadros'), exist_ok=True)
open(os.path.join(HERE, 'c2.html'), 'w').write(page(c2()))
open(os.path.join(HERE, 'c3.html'), 'w').write(page(c3()))
for p in (0, 1):
    open(os.path.join(HERE, f'prancha-c2-{p+1}.html'), 'w').write(sheet('Criativo 2 · Não mostre sua oferta antes da hora', f'Parte {p+1} de 2 · cerca de 37 s · vertical 9:16 · o botão que chega cedo demais é o vilão; o VSLPLAY coloca ele no segundo certo', 'c2', C2CAP, p))
    open(os.path.join(HERE, f'prancha-c3-{p+1}.html'), 'w').write(sheet('Criativo 3 · Gestor de tráfego', f'Parte {p+1} de 2 · cerca de 40 s · vertical 9:16 · espectadores caindo de um precipício que, na cena 3, se revela o gráfico de retenção', 'c3', C3CAP, p))
print('ok')
