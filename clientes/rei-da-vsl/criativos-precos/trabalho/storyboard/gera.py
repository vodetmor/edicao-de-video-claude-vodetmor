"""Quadros-chave dos 2 criativos Rei da VSL (A = pacote 10 por R$ 399, B = criativo completo R$ 49,90).
Uso: python3 gera.py && node render.mjs   (quadros 540x960 CSS renderizados em 2x = 1080x1920)
Paleta medida na coroa (mediana dos pixels de ouro): OURO #DCB906, claro #ECD119, escuro #B99100."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
IC = json.load(open(os.path.join(HERE, 'icons.json')))
ONDA = {k: json.load(open(os.path.join(HERE, f'onda-{k}.json'))) for k in ('texto-1', 'texto-2')}

PRETO, OURO, OURO_CL, OURO_ES, BRANCO, CINZA, GRAFITE = '#0B0B0B', '#DCB906', '#ECD119', '#B99100', '#F7F5EF', '#8A877F', '#1A1A19'

CSS = f"""
@font-face{{font-family:Archivo;src:url(fonts/archivo-latin-wdth-normal.woff2) format('woff2');font-weight:100 900;font-stretch:62% 125%}}
@font-face{{font-family:Inter;src:url(fonts/inter-latin-opsz-normal.woff2) format('woff2');font-weight:100 900}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#777;font-family:Inter;display:flex;flex-wrap:wrap;gap:20px;padding:20px}}
.frame{{position:relative;width:540px;height:960px;overflow:hidden;color:{BRANCO}}}
.preto{{background:{PRETO}}} .ouro{{background:{OURO};color:{PRETO}}} .branco{{background:{BRANCO};color:{PRETO}}}
.abs{{position:absolute}}
.H{{position:absolute;left:0;right:0;text-align:center;font-family:Archivo;font-weight:900;font-stretch:62%;text-transform:uppercase;line-height:.86;letter-spacing:-.01em}}
.num{{font-family:Archivo;font-weight:900;font-stretch:62%;font-variant-numeric:tabular-nums;line-height:.8}}
.t{{position:absolute;left:0;right:0;text-align:center;font:600 22px/1.2 Inter;letter-spacing:-.01em}}
.hud{{position:absolute;font:600 9px Inter;letter-spacing:.12em;text-transform:uppercase;opacity:.55;font-variant-numeric:tabular-nums}}
.tick{{position:absolute;width:14px;height:14px;opacity:.55}}
.card{{position:absolute;border-radius:12px;overflow:hidden}}
.bar{{position:absolute;left:0;bottom:0;height:4px;background:{OURO}}}
.btn{{position:absolute;display:flex;align-items:center;justify-content:center;gap:10px;background:{OURO};color:{PRETO};font-family:Archivo;font-weight:900;font-stretch:75%;text-transform:uppercase;letter-spacing:.02em;border-radius:16px}}
.sq{{border-radius:22%}}
svg.i{{display:block}}
"""

def icon(n, s=24, c=PRETO):
    return IC[n].replace('<svg ', f'<svg class="i" width="{s}" height="{s}" fill="{c}" ', 1)

def hud(cod, tc, cor=BRANCO):
    """Moldura de editor fixa (ideia do showreel @ajith_io): cantos, nome da peça, BPM e timecode real."""
    t = lambda x, y, r: f'<svg class="tick" style="left:{x}px;top:{y}px;transform:rotate({r}deg)" viewBox="0 0 14 14"><path d="M1 13V1h12" fill="none" stroke="{cor}" stroke-width="1.5"/></svg>'
    return (t(18, 18, 0) + t(508, 18, 90) + t(508, 928, 180) + t(18, 928, 270) +
            f'<div class="hud" style="left:40px;top:22px;color:{cor}">Rei da VSL · {cod}</div>'
            f'<div class="hud" style="right:40px;top:22px;color:{cor}">128 BPM</div>'
            f'<div class="hud" style="left:40px;bottom:22px;color:{cor}">{tc}</div>')

def mini(x, y, w, kind=0, prog=.4, rot=0, z=1, op=1):
    """Um criativo em miniatura (9:16). Cada 'kind' é uma abordagem diferente."""
    h = round(w * 16 / 9)
    s = w / 100
    bgs = [GRAFITE, OURO, BRANCO, GRAFITE, '#2A2620', OURO, BRANCO, GRAFITE, OURO, BRANCO]
    bg = bgs[kind % 10]
    ink = PRETO if bg in (OURO, BRANCO) else BRANCO
    acc = PRETO if bg == OURO else OURO
    inner = [
        f'<div class="abs" style="left:{10*s}px;top:{40*s}px;width:{80*s}px;height:{14*s}px;background:{ink}"></div><div class="abs" style="left:{10*s}px;top:{58*s}px;width:{55*s}px;height:{14*s}px;background:{acc}"></div>',
        f'<div class="abs num" style="left:0;right:0;top:{55*s}px;text-align:center;font-size:{48*s}px;color:{ink}">3X</div>',
        f'<div class="abs" style="left:{30*s}px;top:{50*s}px;width:{40*s}px;height:{40*s}px;border-radius:50%;background:{ink}"></div><div class="abs" style="left:{20*s}px;top:{96*s}px;width:{60*s}px;height:{30*s}px;border-radius:{30*s}px {30*s}px 0 0;background:{ink}"></div>',
        f'<div class="abs" style="left:{10*s}px;right:{10*s}px;top:{70*s}px;display:flex;gap:{4*s}px;align-items:flex-end;height:{40*s}px">' + ''.join(f'<div style="flex:1;height:{v}%;background:{acc if i==3 else ink}"></div>' for i, v in enumerate([30, 55, 40, 95, 60])) + '</div>',
        f'<div class="abs num" style="left:0;right:0;top:{60*s}px;text-align:center;font-size:{30*s}px;color:{OURO}">PARE</div>',
        f'<div class="abs" style="left:{18*s}px;top:{58*s}px;width:{64*s}px;height:{64*s}px;border-radius:22%;background:{ink}"></div>',
        f'<div class="abs num" style="left:{10*s}px;top:{48*s}px;font-size:{26*s}px;color:{ink};text-align:left;line-height:.9">ANTES<br><span style="color:{OURO_ES}">DEPOIS</span></div>',
        f'<div class="abs" style="left:{35*s}px;top:{65*s}px">{icon("play", int(30*s), OURO)}</div>',
        f'<div class="abs num" style="left:0;right:0;top:{58*s}px;text-align:center;font-size:{38*s}px;color:{ink}">?!</div>',
        f'<div class="abs" style="left:{10*s}px;top:{50*s}px;width:{80*s}px;height:{50*s}px;border:{3*s}px solid {ink};border-radius:{8*s}px"></div>',
    ][kind % 10]
    return (f'<div class="card" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{bg};transform:rotate({rot}deg);z-index:{z};opacity:{op};'
            f'box-shadow:0 {6*s}px {18*s}px rgba(0,0,0,.35)">{inner}<div class="bar" style="width:{prog*100:.0f}%;background:{acc}"></div></div>')

def onda(x, y, w, h, key, cor=OURO, n=None, ate=1.0):
    v = ONDA[key]
    k = len(v) if n is None else n
    bw = w / k
    out = ''
    for i in range(k):
        a = v[i * len(v) // k]
        hh = max(3, a * h)
        c = cor if i / k <= ate else '#3a3a38'
        out += f'<div class="abs" style="left:{x+i*bw:.1f}px;top:{y+(h-hh)/2:.1f}px;width:{bw*.62:.1f}px;height:{hh:.1f}px;border-radius:2px;background:{c}"></div>'
    return out

def odometro(txt, x, y, size, cor, rolando=(), cor_fantasma=None):
    """Número tipo hodômetro: dígitos em 'rolando' aparecem no meio do giro (vizinhos visíveis + blur vertical)."""
    out = f'<div class="abs num" style="left:{x}px;top:{y}px;font-size:{size}px;color:{cor};display:flex">'
    for i, ch in enumerate(txt):
        if i in rolando and ch.isdigit():
            d = int(ch)
            col = ''.join(f'<div>{(d+k)%10}</div>' for k in (-1, 0, 1))
            out += (f'<div style="position:relative;height:{size*.8}px;overflow:hidden;width:.5em">'
                    f'<div style="position:absolute;top:{-size*.8*0.42}px;filter:url(#vblur)">{col}</div></div>')
        else:
            out += f'<div style="height:{size*.8}px;{"width:.5em" if ch.isdigit() else ""}">{ch}</div>'
    return out + '</div>'

DEFS = '<svg width="0" height="0" style="position:absolute"><filter id="vblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="0 7"/></filter><filter id="hblur" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="8 0"/></filter></svg>'

def logo_h(x, y, w, branco=True):
    f = 'LOGO_rei_da_VSL_horizontal.png' if branco else 'LOGO_rei_da_VSL_horizontal_2.png'
    return f'<img class="abs" src="img/{f}" style="left:{x}px;top:{y}px;width:{w}px">'

def coroa(x, y, w, rot=0):
    return f'<img class="abs" src="img/coroa_rei_da_VSL.png" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)">'

def trio(y, ativo=3, tam=1.0, cor_txt=BRANCO, onda_key='texto-1'):
    """Copy + locução + edição: cada palavra demonstra o próprio verbo."""
    s = tam
    rows = []
    # COPY: linhas de texto sendo escritas
    copy = (f'<div class="abs" style="left:{150*s}px;top:{14*s}px;width:{220*s}px">' +
            ''.join(f'<div style="height:{9*s}px;margin-bottom:{7*s}px;width:{w}%;background:{BRANCO if i<3 else OURO};border-radius:3px"></div>' for i, w in enumerate([100, 86, 94, 58])) +
            f'</div><div class="abs" style="left:{150*s+0.58*220*s+4}px;top:{60*s}px;width:3px;height:{14*s}px;background:{OURO}"></div>')
    loc = onda(150 * s, 8 * s, 230 * s, 58 * s, onda_key)
    clips = ''.join(f'<div class="abs" style="left:{150*s+a*s}px;top:{(10 if r==0 else 40)*s}px;width:{b*s}px;height:{24*s}px;border-radius:5px;background:{c}"></div>'
                    for a, b, c, r in [(0, 70, OURO, 0), (74, 50, BRANCO, 0), (128, 92, OURO_ES, 0), (0, 120, '#55524b', 1), (124, 96, '#55524b', 1)])
    clips += f'<div class="abs" style="left:{150*s+150*s}px;top:{2*s}px;width:2px;height:{66*s}px;background:{OURO_CL}"></div>'
    data = [('pen-nib', 'COPY', copy), ('microphone', 'LOCUÇÃO', loc), ('film-strip', 'EDIÇÃO', clips)]
    out = ''
    for i, (ic_, nome, vis) in enumerate(data):
        if i >= ativo: break
        yy = y + i * 150 * s
        out += (f'<div class="abs" style="left:40px;top:{yy}px;width:460px;height:{72*s}px">'
                f'<div class="abs sq" style="left:0;top:0;width:{72*s}px;height:{72*s}px;background:{OURO};display:flex;align-items:center;justify-content:center">{icon(ic_, int(38*s), PRETO)}</div>'
                f'<div class="abs num" style="left:{88*s}px;top:{-2*s}px;font-size:{22*s}px;color:{cor_txt};letter-spacing:.04em;width:{60*s}px;line-height:1">{""}</div>'
                f'<div class="abs" style="left:{150*s}px;top:{-24*s}px;font:700 {13*s}px Inter;letter-spacing:.14em;color:{cor_txt}">{nome}</div>'
                f'<div class="abs" style="left:{-30*s}px;top:{-6*s}px">{""}</div>{vis}</div>')
        if i < ativo - 1:
            out += f'<div class="abs num" style="left:{40+18*s}px;top:{yy+92*s}px;font-size:{40*s}px;color:{OURO};width:{36*s}px;text-align:center">+</div>'
    return out

def cursor(x, y, s=34, cor=BRANCO):
    return f'<div class="abs" style="left:{x}px;top:{y}px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))">{icon("hand-pointing", s, cor)}</div>'

def frame(cls, inner, cod, tc, hudcor=BRANCO):
    return f'<div class="frame {cls}">{inner}{hud(cod, tc, hudcor)}</div>'

A = []  # ------------------------------------------------------------- CRIATIVO A (texto 01)
# A1 0,3 s: quadro 1 já é imagem pronta: dígitos girando
A.append(frame('preto',
    f'<div class="abs" style="left:52px;top:300px;font:800 46px Archivo;font-stretch:70%;color:{BRANCO}">R$</div>'
    + odometro('39,90', 62, 360, 196, OURO, rolando=(1, 3, 4))
    + f'<div class="abs" style="left:40px;right:40px;top:610px;height:2px;background:{GRAFITE}"></div>', 'Criativo 01', '00:00:00:09'))
# A2 2,6 s: pousou em 39,90 e o primeiro criativo sobe da máscara
A.append(frame('preto',
    f'<div class="abs" style="left:52px;top:150px;font:800 40px Archivo;font-stretch:70%;color:{BRANCO}">R$</div>'
    + odometro('39,90', 84, 200, 172, OURO)
    + mini(185, 470, 170, kind=7, prog=.15)
    + f'<div class="H" style="top:800px;font-size:64px;color:{BRANCO}">POR CRIATIVO</div>', 'Criativo 01', '00:00:02:24'))
# A3 4,3 s: confirmação em cor chapada (troca de fundo no corte)
A.append(frame('ouro',
    f'<div class="H" style="top:300px;font-size:300px;color:{PRETO}">SIM.</div>'
    + f'<div class="t" style="top:600px;font:600 30px Inter;color:{PRETO}">é isso mesmo.</div>'
    + f'<div class="abs" style="left:205px;top:650px;width:130px;height:4px;background:{PRETO}"></div>', 'Criativo 01', '00:00:04:09', PRETO))
# A4 7,1 s: um vira dez (stagger de 3 quadros; o último ainda entrando)
grid = ''.join(mini(40 + (i % 5) * 94, 310 + (i // 5) * 170, 82, kind=i, prog=.2 + .07 * i, op=(1 if i < 9 else .5)) for i in range(10))
A.append(frame('preto',
    f'<div class="H" style="top:170px;font-size:92px;color:{BRANCO}"><span style="color:{OURO}">10</span> CRIATIVOS</div>' + grid
    + f'<div class="t" style="top:690px;color:{CINZA};font-size:20px">pacote fechado</div>', 'Criativo 01', '00:00:07:03'))
# A5 8,6 s: "até 30 segundos": fundo claro, anel de tempo se desenhando
A.append(frame('branco',
    f'<svg class="abs" style="left:110px;top:230px" width="320" height="320" viewBox="0 0 320 320"><circle cx="160" cy="160" r="140" fill="none" stroke="#E4E1D8" stroke-width="18"/>'
    f'<circle cx="160" cy="160" r="140" fill="none" stroke="{OURO}" stroke-width="18" stroke-linecap="round" stroke-dasharray="{2*3.1416*140*.82:.0f} 999" transform="rotate(-90 160 160)"/></svg>'
    + f'<div class="H" style="top:318px;font-size:150px;color:{PRETO};text-transform:none">30s</div>'
    + f'<div class="H" style="top:610px;font-size:56px;color:{PRETO}">ATÉ <span style="color:{OURO_ES}">30 SEGUNDOS</span></div>'
    + f'<div class="t" style="top:680px;color:{CINZA};font-size:20px">cada um</div>', 'Criativo 01', '00:00:08:18', PRETO))
# A6 10,9 s: os 10 empilham (cascata) e o hodômetro soma até 399
pile = ''.join(mini(200 + i * 3, 560 - i * 4, 140, kind=i, rot=(-8 + i * 1.8), z=i, prog=1) for i in range(10))
A.append(frame('preto',
    f'<div class="t" style="top:140px;color:{CINZA};font:600 22px Inter;font-variant-numeric:tabular-nums">10 × R$ 39,90</div>'
    + f'<div class="abs" style="left:58px;top:212px;font:800 46px Archivo;font-stretch:70%;color:{BRANCO}">R$</div>'
    + odometro('399', 110, 200, 270, OURO, rolando=(2,)) + pile
    + f'<div class="H" style="top:860px;font-size:40px;color:{BRANCO}">NO TOTAL</div>', 'Criativo 01', '00:00:10:27'))
# A7 13,2 s: "tudo incluso" em fundo claro + selo de check desenhando
A.append(frame('branco',
    f'<div class="H" style="top:260px;font-size:150px;color:{PRETO}">TUDO<br>INCLUSO</div>'
    + f'<div class="abs" style="left:200px;top:560px;width:140px;height:140px;border-radius:50%;background:{OURO};display:flex;align-items:center;justify-content:center">{icon("check", 80, PRETO)}</div>', 'Criativo 01', '00:00:13:06', PRETO))
# A8 15,9 s: copy + locução + edição, cada um demonstrando a função (onda = a voz real deste anúncio)
A.append(frame('preto',
    f'<div class="t" style="top:170px;color:{OURO};font:700 16px Inter;letter-spacing:.16em">TUDO INCLUSO</div>' + trio(280, 3, 1.12), 'Criativo 01', '00:00:15:27'))
# A9 21,0 s: testar abordagens: 4 ganchos, barras sobem, a coroa pousa no vencedor
tests = ''
for i, (k, v) in enumerate([(4, .42), (1, .64), (7, .93), (6, .51)]):
    x = 40 + i * 120
    tests += mini(x, 250, 100, kind=k, prog=1)
    tests += f'<div class="abs" style="left:{x}px;top:440px;width:100px;font:700 12px Inter;letter-spacing:.12em;color:{CINZA};text-align:center">GANCHO {"ABCD"[i]}</div>'
    tests += f'<div class="abs" style="left:{x+30}px;top:{700-v*220}px;width:40px;height:{v*220}px;border-radius:6px 6px 0 0;background:{OURO if i==2 else "#3a3833"}"></div>'
tests += coroa(272, 172, 96, -6)
A.append(frame('preto',
    f'<div class="H" style="top:96px;font-size:58px;color:{BRANCO}">TESTE <span style="color:{OURO}">ABORDAGENS</span></div>' + tests
    + f'<div class="abs" style="left:40px;right:40px;top:700px;height:2px;background:#3a3833"></div>'
    + f'<div class="t" style="top:730px;color:{CINZA};font-size:20px">10 vídeos prontos para as suas campanhas</div>', 'Criativo 01', '00:00:21:00'))
# A10 23,1 s: fim: logo real + botão sendo apertado
A.append(frame('preto',
    logo_h(70, 300, 400)
    + f'<div class="t" style="top:470px;color:{BRANCO};font:600 24px Inter">10 criativos · <span style="color:{OURO}">R$ 399</span></div>'
    + f'<div class="btn" style="left:110px;top:560px;width:320px;height:88px;font-size:38px;transform:scale(.96)">Saiba mais</div>'
    + cursor(330, 620, 52)
    + f'<div class="t" style="top:690px;color:{CINZA};font-size:20px">e fale com a gente</div>', 'Criativo 01', '00:00:23:03'))

B = []  # ------------------------------------------------------------- CRIATIVO B (texto 02)
# B1 0,3 s: série irmã, cores invertidas: ouro com dígitos pretos girando
B.append(frame('ouro',
    f'<div class="abs" style="left:52px;top:300px;font:800 46px Archivo;font-stretch:70%;color:{PRETO}">R$</div>'
    + odometro('49,90', 62, 360, 196, PRETO, rolando=(1, 3, 4)), 'Criativo 02', '00:00:00:09', PRETO))
# B2 3,6 s: o quadro do criativo se desenha (traço dourado), preço sobe para o topo
B.append(frame('preto',
    f'<div class="abs" style="left:150px;top:120px;font:800 26px Archivo;font-stretch:70%;color:{BRANCO}">R$</div>' + odometro('49,90', 180, 112, 90, OURO)
    + f'<svg class="abs" style="left:140px;top:250px" width="260" height="462" viewBox="0 0 260 462"><rect x="3" y="3" width="254" height="456" rx="22" fill="none" stroke="{OURO}" stroke-width="5" stroke-dasharray="1150 2000"/></svg>'
    + f'<div class="abs" style="left:226px;top:440px">{icon("play", 88, "#2c2b28")}</div>'
    + f'<div class="H" style="top:770px;font-size:66px;color:{BRANCO}">CRIATIVO <span style="color:{OURO}">COMPLETO</span></div>', 'Criativo 02', '00:00:03:24'))
# B3 6,2 s: as três camadas entram no quadro, cada uma na sua palavra
B.append(frame('preto',
    f'<div class="abs" style="left:150px;top:120px;font:800 26px Archivo;font-stretch:70%;color:{BRANCO}">R$</div>' + odometro('49,90', 180, 112, 90, OURO)
    + f'<div class="abs" style="left:0;right:0;top:250px;height:470px">{trio(30, 3, .92, onda_key="texto-2")}</div>'
    + f'<div class="t" style="top:700px;color:{CINZA};font-size:20px">tudo num vídeo só</div>', 'Criativo 02', '00:00:06:06'))
# B4 9,0 s: o jeito antigo: três contratações separadas (fundo claro)
pessoas = ''
for i, (nome, ic_) in enumerate([('Copywriter', 'pen-nib'), ('Locutor', 'microphone'), ('Editor', 'film-strip')]):
    x = 40 + i * 160
    rot = [-5, 2, 6][i]
    pessoas += (f'<div class="abs" style="left:{x}px;top:{330 + [0, 40, 10][i]}px;width:140px;height:190px;border-radius:18px;background:#fff;box-shadow:0 10px 26px rgba(0,0,0,.10);transform:rotate({rot}deg)">'
                f'<div class="abs sq" style="left:40px;top:26px;width:60px;height:60px;background:#ECE9E0;display:flex;align-items:center;justify-content:center">{icon("user", 34, "#9a968c")}</div>'
                f'<div class="abs" style="left:0;right:0;top:100px;text-align:center;font:700 16px Inter;color:{PRETO}">{nome}</div>'
                f'<div class="abs" style="left:30px;top:130px;display:flex;align-items:center;gap:6px;font:600 12px Inter;color:#8a877f">{icon(ic_, 14, "#8a877f")} contrato {i+1}</div>'
                f'<div class="abs" style="left:18px;right:18px;top:158px;height:8px;border-radius:4px;background:#ECE9E0"></div></div>')
B.append(frame('branco',
    f'<div class="H" style="top:150px;font-size:76px;color:{PRETO}">NÃO PRECISA<br>CONTRATAR</div>' + pessoas
    + f'<div class="t" style="top:590px;color:{CINZA};font:600 20px Inter">3 pessoas · 3 contratos</div>'
    + f'<div class="H" style="top:650px;font-size:58px;color:{PRETO}">SEPARADAMENTE</div>', 'Criativo 02', '00:00:10:15', PRETO))
# B5 12,2 s: os três se fundem num só: a coroa (a gente faz tudo)
B.append(frame('preto',
    ''.join(f'<div class="abs sq" style="left:{235 + dx}px;top:{360 + dy}px;width:70px;height:70px;background:#26251f;opacity:{o}"></div>' for dx, dy, o in [(-120, -10, .35), (120, 20, .35), (0, 110, .35)])
    + f'<div class="abs sq" style="left:160px;top:300px;width:220px;height:220px;background:{OURO};display:flex;align-items:center;justify-content:center"><img src="img/coroa_rei_da_VSL_2.png" style="width:160px"></div>'
    + f'<div class="H" style="top:600px;font-size:96px;color:{BRANCO}">A GENTE<br><span style="color:{OURO}">FAZ TUDO</span></div>', 'Criativo 02', '00:00:12:06'))
# B6 14,4 s: entregue pronto pra anunciar: o criativo entra num post patrocinado
B.append(frame('preto',
    f'<div class="abs" style="left:95px;top:150px;width:350px;height:604px;border-radius:24px;background:#151514;border:1px solid #2a2925">'
    f'<div class="abs" style="left:18px;top:16px;display:flex;align-items:center;gap:10px"><div class="sq" style="width:36px;height:36px;background:{PRETO};display:flex;align-items:center;justify-content:center"><img src="img/coroa_rei_da_VSL.png" style="width:28px"></div>'
    f'<div><div style="font:700 13px Inter;color:{BRANCO}">Rei da VSL</div><div style="font:500 11px Inter;color:{CINZA}">Patrocinado</div></div></div>'
    + f'<div class="card" style="left:18px;top:66px;width:314px;height:490px;background:{OURO}">'
    + f'<div class="abs" style="left:40px;top:150px;font:800 24px Archivo;font-stretch:70%;color:{PRETO}">R$</div>' + odometro('49,90', 50, 180, 100, PRETO)
    + f'<div class="abs" style="left:0;right:0;top:300px;text-align:center;font:700 13px Inter;letter-spacing:.14em;color:{PRETO}">COPY · LOCUÇÃO · EDIÇÃO</div>'
    + f'<div class="bar" style="width:70%;background:{PRETO}"></div></div>'
    + f'<div class="btn" style="left:18px;top:566px;width:314px;height:22px;font-size:12px;border-radius:6px">Saiba mais</div>'
    + '</div>'
    + f'<div class="abs" style="left:340px;top:120px;transform:rotate(8deg);border:4px solid {OURO};color:{OURO};font:900 34px Archivo;font-stretch:70%;padding:6px 14px;border-radius:10px;background:{PRETO}">PRONTO</div>'
    + f'<div class="H" style="top:790px;font-size:58px;color:{BRANCO}">PRA <span style="color:{OURO}">ANUNCIAR</span></div>', 'Criativo 02', '00:00:14:12'))
# B7 16,3 s: virada meta: a câmera recua e o próprio vídeo aparece dentro da linha do tempo de edição
tl = ''
for r, (nome, cor_) in enumerate([('COPY', OURO), ('LOCUÇÃO', OURO_ES), ('EDIÇÃO', '#55524b')]):
    yy = 640 + r * 46
    tl += f'<div class="abs" style="left:30px;top:{yy+10}px;font:700 10px Inter;letter-spacing:.12em;color:{CINZA}">{nome}</div>'
    if r == 1:
        tl += onda(110, yy, 400, 34, 'texto-2', OURO_ES)
    else:
        for a, b in ([(0, 90), (94, 120), (218, 70), (292, 108)] if r == 0 else [(0, 60), (63, 48), (114, 80), (198, 52), (253, 70), (326, 74)]):
            tl += f'<div class="abs" style="left:{110+a}px;top:{yy}px;width:{b-3}px;height:34px;border-radius:5px;background:{cor_}"></div>'
tl += f'<div class="abs" style="left:{110+400*16.3/19.7:.0f}px;top:620px;width:2px;height:170px;background:{BRANCO}"></div><div class="abs" style="left:{104+400*16.3/19.7:.0f}px;top:612px;width:14px;height:14px;border-radius:3px;background:{BRANCO};transform:rotate(45deg)"></div>'
B.append('<div class="frame" style="background:#121211">'
    + f'<div class="abs" style="left:150px;top:110px;width:240px;height:427px;border-radius:14px;overflow:hidden;background:{PRETO};outline:2px solid {OURO}">'
    + f'<div style="transform:scale(.444);transform-origin:0 0;width:540px;height:960px;position:relative">'
    + f'<div class="H" style="top:330px;font-size:120px;color:{BRANCO}">ESTE<br><span style="color:{OURO}">VÍDEO</span></div>' + hud('Criativo 02', '00:00:16:09') + '</div></div>'
    + f'<div class="abs" style="left:400px;top:280px">{icon("arrow-left", 44, OURO)}</div>'
    + f'<div class="abs" style="left:398px;top:330px;font:900 30px Archivo;font-stretch:65%;color:{BRANCO};line-height:.95">É UM<br><span style="color:{OURO}">EXEMPLO</span></div>'
    + f'<div class="abs" style="left:30px;top:570px;font:600 11px Inter;letter-spacing:.12em;color:{CINZA};font-variant-numeric:tabular-nums">00:00:16:09 / 00:00:19:22</div>'
    + tl + '</div>')
# B8 18,6 s: fim: logo empilhada real + botão
B.append(frame('preto',
    f'<img class="abs" src="img/LOGO_rei_da_VSL_outra.png" style="left:130px;top:170px;width:280px">'
    + f'<div class="t" style="top:430px;color:{BRANCO};font:600 24px Inter">Peça o seu · <span style="color:{OURO}">R$ 49,90</span></div>'
    + f'<div class="btn" style="left:110px;top:520px;width:320px;height:88px;font-size:38px">Saiba mais</div>'
    + cursor(330, 575, 52)
    + f'<div class="t" style="top:650px;color:{CINZA};font-size:20px">copy · locução · edição</div>', 'Criativo 02', '00:00:18:18'))

for nome, fr in (('A', A), ('B', B)):
    html = f'<!doctype html><meta charset="utf-8"><style>{CSS}</style><body>{DEFS}{"".join(fr)}</body>'
    open(os.path.join(HERE, f'criativo-{nome}.html'), 'w').write(html)
print(len(A), len(B))
