"""Rodada 2 dos quadros-chave (pedido do Vítor 09/10 15:34 BRT): cenas variadas e literais ao que é falado,
10 estilos de motion diferentes inspirados nos reels do X (A06), 49,90 só no início e no fim do 02, coroa ouro sobre branco.
Uso: python3 gera2.py && node render.mjs (com ARQS=criativo2-A,criativo2-B e SAIDA=quadros-v2)."""
import os, math, random
from gera import icon, hud, onda, odometro, DEFS, CSS, cursor, PRETO, OURO, OURO_CL, OURO_ES, BRANCO, CINZA, GRAFITE
HERE = os.path.dirname(os.path.abspath(__file__))
COBALTO, LARANJA, CREME, MENTA, CORAL = '#2E3BFF', '#FF4A1C', '#EFE6D2', '#C8F169', '#F2A38A'

CSS2 = CSS + """
.chip{position:absolute;font:700 11px Inter;letter-spacing:.14em;padding:6px 10px;border-radius:8px}
.phone{position:absolute;border-radius:26px;background:#050505;padding:7px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
.phone .scr{position:relative;width:100%;height:100%;border-radius:20px;overflow:hidden}
.out{color:transparent;-webkit-text-stroke:2px currentColor}
"""

def brk(w, h, cor='#fff', m=8, op=.8):
    """cantos de HUD dentro de um mini vídeo"""
    s = f'stroke="{cor}" stroke-width="1.5" fill="none" opacity="{op}"'
    L = 10
    return (f'<svg class="abs" style="left:0;top:0" width="{w}" height="{h}"><path {s} d="M{m} {m+L}V{m}H{m+L}M{w-m-L} {m}H{w-m}V{m+L}M{w-m} {h-m-L}V{h-m}H{w-m-L}M{m+L} {h-m}H{m}V{h-m-L}"/></svg>')

def estilo(i, w, h):
    """10 estilos de motion diferentes (inspirados nos reels do X: grade de pontos, palavra gigante, 3D, fita, loader,
    gráfico, interface, partículas, contagem, UGC). Cores próprias de cada 'cliente', sempre chapadas."""
    rnd = random.Random(i)
    s = w / 100
    if i == 0:  # grade de pontos em onda (cobalto)
        dots = ''
        for r in range(12):
            for c in range(8):
                x = 8 * s + c * 12 * s; y = h * .35 + r * 9 * s
                a = 1.2 + 1.6 * (1 + math.sin(c * .7 + r * .5))
                dots += f'<div class="abs" style="left:{x}px;top:{y + math.sin(c*.8)*6*s}px;width:{a*s}px;height:{a*s}px;border-radius:50%;background:{"#FFC94A" if (r+c)%11==0 else "#fff"}"></div>'
        return f'<div class="abs" style="inset:0;background:{COBALTO}">{dots}{brk(w,h)}</div>'
    if i == 1:  # palavra gigante com blur direcional (laranja)
        return (f'<div class="abs" style="inset:0;background:{LARANJA}">'
                f'<div class="abs num" style="left:-{4*s}px;top:{h*.38}px;font-size:{34*s}px;color:#fff;filter:url(#hblur);opacity:.5">VENDA</div>'
                f'<div class="abs num" style="left:{6*s}px;top:{h*.38}px;font-size:{34*s}px;color:#fff">VENDA</div>{brk(w,h)}</div>')
    if i == 2:  # campo de blocos 3D (coral)
        tiles = ''.join(f'<div style="width:{10*s}px;height:{10*s}px;margin:{1*s}px;border-radius:{2*s}px;background:{["#F7B59D", CORAL, "#E07D63", "#B9543F"][(r*3+c+int(2*math.sin(r*.6+c*.4)))%4]}"></div>' for r in range(10) for c in range(8))
        return (f'<div class="abs" style="inset:0;background:#160F0D;perspective:{120*s}px">'
                f'<div class="abs" style="left:{4*s}px;top:{h*.3}px;width:{96*s}px;display:flex;flex-wrap:wrap;transform:rotateX(55deg) rotateZ(-20deg)">{tiles}</div>'
                f'<div class="abs" style="left:{40*s}px;top:{h*.42}px;width:{20*s}px;height:{20*s}px;border-radius:50%;background:#ddd;box-shadow:inset -{3*s}px -{3*s}px 0 #999"></div>{brk(w,h)}</div>')
    if i == 3:  # fita listrada (creme)
        d = f'M{80*s} {h*.25} C {-30*s} {h*.25}, {-10*s} {h*.75}, {85*s} {h*.72}'
        return (f'<div class="abs" style="inset:0;background:#F3CF3A"><svg class="abs" width="{w}" height="{h}">'
                f'<path d="{d}" stroke="#111" stroke-width="{22*s}" fill="none" stroke-linecap="round"/>'
                f'<path d="{d}" stroke="#fff" stroke-width="{15*s}" fill="none" stroke-linecap="round"/>'
                f'<path d="{d}" stroke="#E5322B" stroke-width="{7*s}" fill="none" stroke-linecap="round"/>'
                f'<path d="{d}" stroke="#2E3BFF" stroke-width="{2.5*s}" fill="none" stroke-linecap="round"/></svg>{brk(w,h,"#111")}</div>')
    if i == 4:  # anel de pontos (loader) no preto
        dots = ''.join(f'<div class="abs" style="left:{50*s + 22*s*math.cos(a*math.pi/4) - 4*s}px;top:{h/2 + 22*s*math.sin(a*math.pi/4) - 4*s}px;width:{8*s}px;height:{8*s}px;border-radius:50%;background:#E5322B;opacity:{.3 + .1*a}"></div>' for a in range(8))
        return f'<div class="abs" style="inset:0;background:#0E0E10">{dots}<div class="abs" style="left:{20*s}px;top:{h*.78}px;font:700 {6*s}px Inter;letter-spacing:.2em;color:#fff;opacity:.7">LOADING 87%</div>{brk(w,h)}</div>'
    if i == 5:  # gráfico subindo
        bars = ''.join(f'<div style="flex:1;height:{v}%;background:{"#111" if k < 4 else "#1DB954"};border-radius:{1.5*s}px {1.5*s}px 0 0"></div>' for k, v in enumerate([22, 30, 28, 45, 70, 96]))
        return (f'<div class="abs" style="inset:0;background:{CREME}"><div class="abs num" style="left:{10*s}px;top:{h*.2}px;font-size:{26*s}px;color:#111">+327%</div>'
                f'<div class="abs" style="left:{10*s}px;right:{10*s}px;top:{h*.42}px;height:{h*.4}px;display:flex;gap:{3*s}px;align-items:flex-end">{bars}</div>{brk(w,h,"#111")}</div>')
    if i == 6:  # cartão de interface (cobalto + laranja)
        return (f'<div class="abs" style="inset:0;background:{COBALTO}"><div class="abs" style="left:{12*s}px;right:{12*s}px;top:{h*.33}px;height:{h*.36}px;border-radius:{6*s}px;background:#fff;padding:{6*s}px">'
                f'<div style="font:700 {7*s}px Inter;color:#111">Checkout</div>'
                f'<div style="margin-top:{5*s}px;height:{4*s}px;width:70%;background:#E8E8EC;border-radius:{2*s}px"></div>'
                f'<div style="margin-top:{3*s}px;height:{4*s}px;width:50%;background:#E8E8EC;border-radius:{2*s}px"></div>'
                f'<div style="position:absolute;left:{6*s}px;right:{6*s}px;bottom:{6*s}px;height:{12*s}px;border-radius:{3*s}px;background:{LARANJA};color:#fff;font:700 {6*s}px Inter;display:flex;align-items:center;justify-content:center">Comprar agora</div></div>{brk(w,h)}</div>')
    if i == 7:  # partículas em rastro
        ln = ''.join(f'<div class="abs" style="left:{rnd.uniform(-10,100)*s}px;top:{rnd.uniform(0,h)}px;width:{rnd.uniform(6,22)*s}px;height:{rnd.uniform(.6,1.4)*s}px;background:{rnd.choice(["#fff","#fff","#fff","#FF8A5B","#7FB2FF"])};transform:rotate(-28deg);opacity:{rnd.uniform(.4,1):.2f}"></div>' for _ in range(70))
        return f'<div class="abs" style="inset:0;background:#050506">{ln}{brk(w,h)}</div>'
    if i == 8:  # contagem gigante (menta)
        return (f'<div class="abs" style="inset:0;background:{MENTA}"><div class="abs" style="left:{18*s}px;top:{h*.3}px;width:{64*s}px;height:{64*s}px;border-radius:50%;border:{3*s}px solid #111"></div>'
                f'<div class="abs num" style="left:0;right:0;top:{h*.36}px;text-align:center;font-size:{44*s}px;color:#111">03</div>{brk(w,h,"#111")}</div>')
    # 9: UGC com rosto e legenda
    return (f'<div class="abs" style="inset:0;background:#B8AFA3"><div class="abs" style="left:{30*s}px;top:{h*.24}px;width:{40*s}px;height:{40*s}px;border-radius:50%;background:#6E5F52"></div>'
            f'<div class="abs" style="left:{14*s}px;top:{h*.24+44*s}px;width:{72*s}px;height:{h}px;border-radius:{36*s}px {36*s}px 0 0;background:#3A3F4A"></div>'
            f'<div class="abs" style="left:{10*s}px;right:{10*s}px;top:{h*.72}px;text-align:center;font:800 {8*s}px Inter;color:#fff;background:#111;padding:{2*s}px">"funcionou demais"</div></div>')

def phone(x, y, w, inner, rot=0, extra='', z=1):
    h = round(w * 16 / 9)
    return f'<div class="phone" style="left:{x}px;top:{y}px;width:{w+14}px;height:{h+14}px;transform:{rot};z-index:{z}"><div class="scr">{inner}</div>{extra}</div>'

def tela(i, w):
    return estilo(i, w, round(w * 16 / 9))

def frame(cls, inner, cod, tc, hudcor=BRANCO, style=''):
    return f'<div class="frame {cls}" style="{style}">{inner}{hud(cod, tc, hudcor)}</div>'

def chip(x, y, txt, bg=OURO, cor=PRETO):
    return f'<div class="chip" style="left:{x}px;top:{y}px;background:{bg};color:{cor}">{txt}</div>'

def etiqueta(x, y, w, rot, preco, sub=''):
    h = w * .56
    return (f'<div class="abs" style="left:{x}px;top:{y}px;transform:rotate({rot}deg);transform-origin:{w*.06}px {h/2}px">'
            f'<svg width="{w}" height="{h}" viewBox="0 0 100 56"><path d="M14 0H96a4 4 0 0 1 4 4V52a4 4 0 0 1-4 4H14L0 28Z" fill="{BRANCO}"/><circle cx="12" cy="28" r="3.6" fill="{OURO}"/></svg>'
            f'<div class="abs num" style="left:{w*.2}px;top:{h*.2}px;font-size:{w*.25}px;color:{PRETO}"><span style="font-size:.42em">R$ </span>{preco}</div>'
            f'<div class="abs" style="left:{w*.2}px;top:{h*.7}px;font:700 {w*.045}px Inter;letter-spacing:.16em;color:{CINZA}">{sub}</div></div>')

A = []
# A01 0,3 s: close extremo nos dígitos girando, cortados pelas bordas
A.append(frame('preto', f'<div class="abs" style="left:34px;top:250px;font:800 40px Archivo;font-stretch:70%;color:{BRANCO}">R$</div>'
               + odometro('39,90', -18, 300, 330, OURO, rolando=(1, 3, 4)), 'Criativo 01', '00:00:00:09'))
# A02 1,8 s: a câmera abre e o número é uma etiqueta de preço balançando
A.append(frame('ouro', '<svg class="abs" style="left:0;top:0" width="540" height="960"><path d="M270 0 L118 352" stroke="#0B0B0B" stroke-width="3" fill="none"/></svg>'
               + etiqueta(100, 330, 400, 18, '39,90', 'CADA CRIATIVO'), 'Criativo 01', '00:00:01:24', PRETO))
# A03 2,8 s: a etiqueta está pendurada num celular que toca um criativo
A.append(frame('preto', phone(150, 170, 226, tela(1, 226), 'rotate(-4deg)')
               + '<svg class="abs" style="left:0;top:0;z-index:3" width="540" height="960"><path d="M362 186 C 420 200, 430 250, 410 300" stroke="#F7F5EF" stroke-width="2.5" fill="none"/></svg>'
               + f'<div style="position:absolute;z-index:4">{etiqueta(395, 285, 150, 62, "39,90")}</div>'
               + f'<div class="H" style="top:640px;font-size:96px;color:{BRANCO}">POR<br><span style="color:{OURO}">CRIATIVO</span></div>', 'Criativo 01', '00:00:02:24'))
# A04 4,3 s: "Sim" em eco de contorno + carimbo
eco = ''.join(f'<div class="H" style="top:{170+k*140}px;font-size:250px;color:transparent;-webkit-text-stroke:2.5px {PRETO};opacity:.45">SIM.</div>' if k != 2 else f'<div class="H" style="top:{170+k*140}px;font-size:250px;color:{PRETO}">SIM.</div>' for k in range(5))
A.append(frame('ouro', eco + f'<div class="abs" style="left:250px;top:610px;transform:rotate(-7deg);background:{PRETO};color:{OURO};font:900 34px Archivo;font-stretch:70%;padding:10px 18px;border-radius:8px">É ISSO MESMO</div>', 'Criativo 01', '00:00:04:09', PRETO))
# A05 6,1 s: um pacote (caixa) fechando com fita
caixa = f'''<svg class="abs" style="left:70px;top:250px" width="400" height="420" viewBox="0 0 400 420">
<path d="M200 150 L370 230 L370 380 L200 420 L30 380 L30 230 Z" fill="#D8C9A6"/>
<path d="M200 150 L370 230 L200 290 L30 230 Z" fill="#E9DDBE"/>
<path d="M200 290 L370 230 L370 380 L200 420 Z" fill="#C9B88F"/>
<path d="M30 230 L-10 140 L170 70 L200 150 Z" fill="#EFE5CB"/>
<path d="M370 230 L410 150 L240 80 L200 150 Z" fill="#E2D4B1" opacity=".95"/>
<path d="M115 190 L285 270 L285 285 L115 205 Z" fill="{OURO}"/>
<path d="M200 290 L200 420" stroke="{OURO}" stroke-width="16"/></svg>'''
A.append(frame('branco', caixa + f'<div class="abs" style="left:250px;top:560px;transform:skewY(-14deg);background:{PRETO};color:{OURO};font:900 30px Archivo;font-stretch:70%;padding:6px 12px">10 ×</div>'
               + f'<div class="H" style="top:110px;font-size:88px;color:{PRETO}">FECHANDO<br>O <span style="color:{OURO_ES}">PACOTE</span></div>', 'Criativo 01', '00:00:06:03', PRETO))
# A06 7,0 s: a caixa abre em leque: 10 celulares, cada um num estilo de motion diferente
leque = ''
for k in range(10):
    ang = (k - 4.5) * 9
    x = 270 + (k - 4.5) * 42 - 52
    y = 380 + abs(k - 4.5) ** 1.6 * 9
    leque += phone(x, y, 104, tela(k, 104), f'rotate({ang}deg)', z=10 - int(abs(k - 4.5)))
A.append(frame('preto', f'<div class="H" style="top:110px;font-size:110px;color:{BRANCO}"><span style="color:{OURO}">10</span> CRIATIVOS</div>' + leque
               + f'<div class="t" style="top:790px;color:{CINZA};font-size:19px">cada um num estilo diferente</div>', 'Criativo 01', '00:00:07:00'))
# A07 8,6 s: régua de tempo 0 a 30 s com timecode gigante
ticks = ''.join(f'<div class="abs" style="left:{40+k*15.3:.1f}px;top:{560 - (34 if k%5==0 else 16)}px;width:2px;height:{34 if k%5==0 else 16}px;background:{PRETO}"></div>' + (f'<div class="abs" style="left:{32+k*15.3:.1f}px;top:575px;font:700 12px Inter;color:{PRETO}">{k}s</div>' if k % 10 == 0 else '') for k in range(31))
A.append(frame('ouro', f'<div class="abs num" style="left:0;right:0;top:250px;text-align:center;font-size:170px;color:{PRETO}">00:30</div>' + ticks
               + f'<div class="abs" style="left:40px;top:556px;width:459px;height:4px;background:{PRETO}"></div>'
               + f'<div class="abs" style="left:494px;top:500px;width:3px;height:90px;background:{BRANCO}"></div><div class="abs" style="left:486px;top:490px;width:19px;height:19px;background:{BRANCO};transform:rotate(45deg)"></div>'
               + f'<div class="H" style="top:660px;font-size:58px;color:{PRETO}">ATÉ 30 SEGUNDOS</div>', 'Criativo 01', '00:00:08:18', PRETO))
# A08 10,8 s: cupom fiscal saindo: 10 linhas e o total
linhas = ''.join(f'<div style="display:flex;justify-content:space-between;font:500 15px ui-monospace,Menlo,monospace;color:#333;margin:5px 0"><span>CRIATIVO {k+1:02d}</span><span>39,90</span></div>' for k in range(10))
A.append(frame('preto', f'<div class="abs" style="left:110px;top:118px;width:320px;height:16px;border-radius:8px;background:#222"></div>'
               + f'<div class="abs" style="left:126px;top:126px;width:288px;padding:22px 22px 28px;background:#FBFAF6;clip-path:polygon(0 0,100% 0,100% 100%,95% 97%,90% 100%,85% 97%,80% 100%,75% 97%,70% 100%,65% 97%,60% 100%,55% 97%,50% 100%,45% 97%,40% 100%,35% 97%,30% 100%,25% 97%,20% 100%,15% 97%,10% 100%,5% 97%,0 100%)">'
               + f'<div style="font:700 13px Inter;letter-spacing:.2em;text-align:center;color:#111;margin-bottom:10px">REI DA VSL</div>{linhas}'
               + f'<div style="border-top:2px dashed #999;margin:12px 0 8px"></div><div style="display:flex;justify-content:space-between;align-items:flex-end"><span style="font:800 16px Inter;color:#111">TOTAL</span><span class="num" style="font-size:66px;color:#111">R$ 399</span></div></div>'
               + f'<div class="H" style="top:760px;font-size:66px;color:{BRANCO}">NO <span style="color:{OURO}">TOTAL</span></div>', 'Criativo 01', '00:00:10:24'))
# A09 13,2 s: close no cupom + carimbo "TUDO INCLUSO"
A.append(frame('preto', f'<div class="abs" style="left:-40px;top:210px;width:620px;height:560px;background:#FBFAF6;transform:rotate(-6deg)">'
               + ''.join(f'<div style="display:flex;justify-content:space-between;font:500 34px ui-monospace,Menlo,monospace;color:#bbb;margin:16px 70px"><span>CRIATIVO {k:02d}</span><span>39,90</span></div>' for k in (5, 6, 7, 8, 9, 10)) + '</div>'
               + f'<div class="abs" style="left:58px;top:390px;transform:rotate(-14deg);border:9px solid {OURO};color:{OURO_ES};font:900 76px Archivo;font-stretch:66%;padding:4px 24px;border-radius:14px;line-height:1;text-align:center;background:rgba(251,250,246,.6)">TUDO<br>INCLUSO</div>', 'Criativo 01', '00:00:13:06'))
# A10 14,4 s: COPY em tela cheia: a frase sendo escrita
A.append(frame('branco', chip(40, 120, 'COPY') + f'<div class="abs" style="left:40px;top:250px">{icon("pen-nib", 54, OURO_ES)}</div>'
               + f'<div class="abs" style="left:40px;right:40px;top:340px;font:900 74px/0.95 Archivo;font-stretch:66%;text-transform:uppercase;color:{PRETO}">Seu cliente decide em 3 seg<span style="display:inline-block;width:5px;height:64px;background:{OURO};vertical-align:-6px;margin-left:4px"></span></div>'
               + ''.join(f'<div class="abs" style="left:40px;top:{620+k*30}px;width:{w}px;height:12px;border-radius:6px;background:#E4E1D8"></div>' for k, w in enumerate([440, 380, 410, 250])), 'Criativo 01', '00:00:14:12', PRETO))
# A11 15,0 s: LOCUÇÃO: microfone + a onda real da voz atravessando a tela
A.append(frame('preto', chip(40, 120, 'LOCUÇÃO') + f'<div class="abs" style="left:205px;top:200px;width:130px;height:130px;border-radius:50%;background:{OURO};display:flex;align-items:center;justify-content:center">{icon("microphone", 70, PRETO)}</div>'
               + onda(-10, 400, 560, 300, 'texto-1') + f'<div class="t" style="top:760px;color:{CINZA};font-size:19px">a voz deste anúncio</div>', 'Criativo 01', '00:00:15:00'))
# A12 15,9 s: EDIÇÃO: editor em tela cheia, clipes estalando e prévia tocando
trilhas = ''
for r, clips in enumerate([[(0, 110, OURO), (114, 90, OURO_CL), (208, 150, OURO), (362, 98, OURO_ES)], [(0, 70, '#5b5a55'), (74, 140, '#5b5a55'), (218, 120, '#5b5a55'), (342, 118, '#5b5a55')], [(0, 460, None)]]):
    y = 610 + r * 62
    if r == 2:
        trilhas += onda(40, y, 460, 46, 'texto-1', '#8f8a7c')
    else:
        trilhas += ''.join(f'<div class="abs" style="left:{40+a}px;top:{y}px;width:{b-4}px;height:46px;border-radius:7px;background:{c}"></div>' for a, b, c in clips)
A.append(frame('', chip(40, 120, 'EDIÇÃO') + phone(165, 170, 200, tela(6, 200))
               + trilhas + f'<div class="abs" style="left:300px;top:590px;width:3px;height:220px;background:{BRANCO}"></div><div class="abs" style="left:292px;top:580px;width:19px;height:19px;background:{BRANCO};transform:rotate(45deg)"></div>',
               'Criativo 01', '00:00:15:27', style='background:#121211'))
# A13 18,0 s: feed rolando com os criativos patrocinados
feed = ''
for k, st in enumerate([3, 5, 0]):
    yy = 20 + k * 300
    feed += (f'<div class="abs" style="left:0;top:{yy}px;width:240px;height:290px;background:#fff">'
             f'<div style="display:flex;align-items:center;gap:6px;padding:7px 9px"><div style="width:20px;height:20px;border-radius:50%;background:#ddd"></div><div><div style="font:700 9px Inter">sua marca</div><div style="font:500 8px Inter;color:#888">Patrocinado</div></div></div>'
             f'<div style="position:relative;width:240px;height:220px;overflow:hidden">{estilo(st, 240, 220)}</div>'
             f'<div style="margin:6px 9px;height:18px;border-radius:4px;background:#EEE;font:700 8px Inter;display:flex;align-items:center;padding-left:8px">Saiba mais</div></div>')
A.append(frame('ouro', phone(143, 130, 240, f'<div class="abs" style="inset:0;background:#fff;filter:url(#vblur)"><div class="abs" style="left:0;top:-60px">{feed}</div></div>', 'rotate(3deg)')
               + f'<div class="H" style="top:700px;font-size:64px;color:{PRETO}">PRONTOS PRAS<br>SUAS CAMPANHAS</div>', 'Criativo 01', '00:00:18:00', PRETO))
# A14 21,1 s: teste A/B em tela dividida; a coroa pousa no vencedor
A.append(frame('preto', f'<div class="abs" style="left:0;top:0;width:270px;height:960px;overflow:hidden;opacity:.55">{estilo(4, 270, 960)}</div>'
               + f'<div class="abs" style="left:270px;top:0;width:270px;height:960px;overflow:hidden">{estilo(1, 270, 960)}</div>'
               + f'<div class="abs" style="left:269px;top:0;width:3px;height:960px;background:{BRANCO}"></div>'
               + f'<div class="abs num" style="left:30px;top:140px;font-size:90px;color:{BRANCO}">A</div><div class="abs num" style="left:300px;top:140px;font-size:90px;color:{BRANCO}">B</div>'
               + f'<div class="abs" style="left:30px;top:640px;font:600 14px Inter;color:#ccc;letter-spacing:.1em">CLIQUES</div><div class="abs num" style="left:30px;top:665px;font-size:70px;color:#ccc">1,2%</div>'
               + f'<div class="abs" style="left:300px;top:640px;font:600 14px Inter;color:#fff;letter-spacing:.1em">CLIQUES</div><div class="abs num" style="left:300px;top:665px;font-size:70px;color:#fff">3,8%</div>'
               + f'<img class="abs" src="img/coroa_rei_da_VSL.png" style="left:330px;top:250px;width:150px;transform:rotate(8deg)">'
               + f'<div class="abs" style="left:0;right:0;top:790px;padding:14px 0;background:{PRETO};text-align:center;font:900 44px Archivo;font-stretch:66%;color:{BRANCO}">TESTE <span style="color:{OURO}">ABORDAGENS</span></div>', 'Criativo 01', '00:00:21:03'))
# A15 23,0 s: fim: logo real + botão gigante sendo apertado (onda do clique)
A.append(frame('preto', f'<img class="abs" src="img/LOGO_rei_da_VSL_horizontal.png" style="left:70px;top:230px;width:400px">'
               + f'<div class="t" style="top:390px;color:{BRANCO};font:600 24px Inter">10 criativos · <span style="color:{OURO}">R$ 399</span></div>'
               + f'<div class="abs" style="left:150px;top:470px;width:240px;height:240px;border-radius:50%;border:3px solid {OURO};opacity:.35"></div>'
               + f'<div class="btn" style="left:70px;top:545px;width:400px;height:100px;font-size:46px;border-radius:50px;transform:scale(.96)">Saiba mais</div>'
               + cursor(350, 610, 64) + f'<div class="t" style="top:700px;color:{CINZA};font-size:20px">e fale com a gente</div>', 'Criativo 01', '00:00:23:00'))

B = []
# B01 0,4 s: o preço cai de cima e bate no chão (fundo claro, rastro de velocidade)
B.append(frame('branco', f'<div class="abs" style="left:46px;top:240px;font:800 42px Archivo;font-stretch:70%;color:{PRETO}">R$</div>'
               + f'<div class="abs num" style="left:40px;top:150px;font-size:230px;color:{PRETO};opacity:.18;filter:url(#vblur)">49,90</div>'
               + f'<div class="abs num" style="left:40px;top:300px;font-size:230px;color:{PRETO}">49,90</div>'
               + f'<div class="abs" style="left:40px;top:500px;width:460px;height:14px;background:{OURO}"></div>'
               + ''.join(f'<div class="abs" style="left:{x}px;top:530px;width:3px;height:{h}px;background:{PRETO};transform:rotate({r}deg)"></div>' for x, h, r in [(70, 30, -30), (120, 22, -15), (420, 22, 15), (470, 30, 30)])
               + f'<div class="H" style="top:600px;font-size:44px;color:{PRETO}">O CRIATIVO COMPLETO</div>', 'Criativo 02', '00:00:00:12', PRETO))
# B02 3,7 s: celular em vista explodida: as peças do criativo se montam
B.append(frame('preto', f'<div class="abs" style="left:150px;top:150px;width:240px;height:427px;border:2px dashed #3a3833;border-radius:26px"></div>'
               + phone(176, 196, 200, tela(8, 200), 'rotate(-6deg)')
               + f'<div class="abs" style="left:56px;top:250px;width:120px;padding:10px;border-radius:12px;background:{BRANCO};color:{PRETO};font:800 13px Inter;transform:rotate(-10deg)">"Pare de perder vendas"</div>'
               + f'<div class="abs" style="left:380px;top:300px;width:120px;height:60px;border-radius:12px;background:{GRAFITE};overflow:hidden">{onda(8, 10, 104, 40, "texto-2", OURO, 26)}</div>'
               + f'<div class="abs" style="left:370px;top:470px;width:120px;height:44px;border-radius:10px;background:{OURO};display:flex;gap:4px;padding:8px">' + ''.join(f'<div style="flex:{f};background:{PRETO};border-radius:4px;opacity:.85"></div>' for f in (2, 1, 3)) + '</div>'
               + '<svg class="abs" style="left:0;top:0" width="540" height="960"><path d="M176 280 L200 300 M380 330 L360 340 M370 492 L350 480" stroke="#8a877f" stroke-width="2" stroke-dasharray="4 4"/></svg>'
               + f'<div class="H" style="top:690px;font-size:84px;color:{BRANCO}">CRIATIVO<br><span style="color:{OURO}">COMPLETO</span></div>', 'Criativo 02', '00:00:03:21'))
# B03 6,2 s: três faixas em tela cheia, cada uma acende na sua palavra
B.append(frame('', f'<div class="abs" style="left:0;top:0;width:540px;height:320px;background:{BRANCO}">{chip(30, 40, "COPY", PRETO, OURO)}'
               + f'<div class="abs" style="left:30px;top:110px;right:30px;font:900 60px/0.95 Archivo;font-stretch:66%;text-transform:uppercase;color:{PRETO}">Pare de perder vendas<span style="display:inline-block;width:4px;height:50px;background:{OURO};margin-left:4px"></span></div></div>'
               + f'<div class="abs" style="left:0;top:320px;width:540px;height:320px;background:{PRETO}">{chip(30, 30, "LOCUÇÃO")}{onda(20, 90, 500, 200, "texto-2")}</div>'
               + f'<div class="abs" style="left:0;top:640px;width:540px;height:320px;background:{OURO}">{chip(30, 30, "EDIÇÃO", PRETO, OURO)}'
               + ''.join(f'<div class="abs" style="left:{30+a}px;top:{110+r*70}px;width:{b}px;height:52px;border-radius:8px;background:{PRETO};opacity:{.9 if r==0 else .45}"></div>' for r, a, b in [(0, 0, 150), (0, 156, 110), (0, 272, 210), (1, 0, 240), (1, 246, 230)])
               + f'<div class="abs" style="left:300px;top:90px;width:3px;height:170px;background:{BRANCO}"></div></div>', 'Criativo 02', '00:00:06:06', style='background:#000'))
# B04 9,0 s: o jeito antigo: contratar três pessoas (cartões de contratação)
perf = ''
for k, (nome, ic_, info) in enumerate([('Copywriter', 'pen-nib', 'orçamento em 3 dias'), ('Locutor', 'microphone', 'agenda só semana que vem'), ('Editor', 'film-strip', 'prazo: 7 dias')]):
    y = 300 + k * 150
    perf += (f'<div class="abs" style="left:{40 + k*14}px;top:{y}px;width:440px;height:126px;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(0,0,0,.10);transform:rotate({[-2,1.5,-1][k]}deg)">'
             f'<div class="abs sq" style="left:18px;top:22px;width:80px;height:80px;background:#ECE9E0;display:flex;align-items:center;justify-content:center">{icon(ic_, 40, "#8a877f")}</div>'
             f'<div class="abs" style="left:116px;top:28px;font:800 22px Inter;color:{PRETO}">{nome}</div><div class="abs" style="left:116px;top:60px;font:500 15px Inter;color:#8a877f">{info}</div>'
             f'<div class="abs" style="right:18px;top:40px;padding:10px 14px;border-radius:10px;background:{PRETO};color:#fff;font:700 13px Inter">Contratar</div></div>')
B.append(frame('branco', f'<div class="H" style="top:120px;font-size:70px;color:{PRETO}">CONTRATAR<br><span style="color:{CINZA}">3 PESSOAS?</span></div>' + perf, 'Criativo 02', '00:00:09:00', PRETO))
# B05 10,8 s: separadamente: o caos de três conversas ao mesmo tempo
bolhas = ''
msgs = [('Copywriter', 'qual o público mesmo?', 40, 150, -3), ('Editor', 'cadê o áudio?', 230, 250, 4), ('Locutor', 'mando amanhã', 60, 360, -2), ('Copywriter', 'orçamento: R$ ???', 210, 455, 3),
        ('Editor', 'falta o roteiro', 30, 560, -4), ('Locutor', 'regravar? +1 dia', 240, 650, 2)]
for nome, txt, x, y, r in msgs:
    bolhas += (f'<div class="abs" style="left:{x}px;top:{y}px;width:270px;padding:12px 14px;border-radius:16px;background:#1d1d1b;transform:rotate({r}deg)">'
               f'<div style="font:700 11px Inter;color:{OURO};letter-spacing:.06em">{nome.upper()}</div><div style="font:600 18px Inter;color:#eee;margin-top:3px">{txt}</div>'
               f'<div style="position:absolute;right:-8px;top:-8px;width:24px;height:24px;border-radius:50%;background:#E5322B;color:#fff;font:800 12px Inter;display:flex;align-items:center;justify-content:center">{1 + (x+y)%3}</div></div>')
B.append(frame('preto', bolhas + f'<div class="H" style="top:780px;font-size:70px;color:{BRANCO}">SEPARADAMENTE</div>', 'Criativo 02', '00:00:10:24'))
# B06 12,2 s: a gente faz tudo: as conversas somem, fica uma só com a coroa (ouro sobre branco)
B.append(frame('preto', f'<div class="abs sq" style="left:170px;top:170px;width:200px;height:200px;background:{BRANCO};display:flex;align-items:center;justify-content:center"><img src="img/coroa_rei_da_VSL.png" style="width:150px"></div>'
               + f'<div class="abs" style="left:80px;top:420px;width:380px;padding:16px 18px;border-radius:18px;background:{BRANCO}"><div style="font:700 12px Inter;color:#9a7f00;letter-spacing:.06em">REI DA VSL</div><div style="font:700 22px Inter;color:{PRETO};margin-top:4px">Deixa com a gente.</div><div style="font:600 12px Inter;color:{OURO_ES};text-align:right">✓✓</div></div>'
               + f'<div class="H" style="top:610px;font-size:100px;color:{BRANCO}">A GENTE<br><span style="color:{OURO}">FAZ TUDO</span></div>', 'Criativo 02', '00:00:12:06'))
# B07 13,6 s: entrega: exportação 100% e o arquivo pronto
B.append(frame('branco', f'<div class="abs" style="left:60px;top:220px;width:420px;height:300px;border-radius:24px;background:#fff;box-shadow:0 16px 40px rgba(0,0,0,.12);padding:26px">'
               + f'<div style="display:flex;gap:16px;align-items:center"><div style="width:84px;height:120px;border-radius:12px;overflow:hidden;position:relative">{estilo(6, 84, 120)}</div>'
               + f'<div><div style="font:800 20px Inter;color:{PRETO}">seu-criativo.mp4</div><div style="font:500 14px Inter;color:#8a877f;margin-top:4px">1080×1920 · 30 s</div></div></div>'
               + f'<div style="margin-top:34px;height:16px;border-radius:8px;background:{OURO}"></div><div style="display:flex;justify-content:space-between;margin-top:10px;font:700 15px Inter;color:{PRETO}"><span>Exportando</span><span>100%</span></div></div>'
               + f'<div class="abs" style="left:380px;top:180px;width:110px;height:110px;border-radius:50%;background:{PRETO};display:flex;align-items:center;justify-content:center">{icon("check", 60, OURO)}</div>'
               + f'<div class="H" style="top:600px;font-size:96px;color:{PRETO}">ENTREGUE<br><span style="color:{OURO_ES}">PRONTO</span></div>', 'Criativo 02', '00:00:13:21', PRETO))
# B08 14,5 s: pra anunciar: o arquivo vira anúncio no feed
post = (f'<div class="abs" style="inset:0;background:#fff"><div style="display:flex;align-items:center;gap:8px;padding:10px"><div class="sq" style="width:28px;height:28px;background:{PRETO};display:flex;align-items:center;justify-content:center"><img src="img/coroa_rei_da_VSL.png" style="width:22px"></div>'
        f'<div><div style="font:700 11px Inter">sua marca</div><div style="font:500 9px Inter;color:#888">Patrocinado</div></div></div>'
        f'<div style="position:relative;width:240px;height:330px;overflow:hidden">{estilo(6, 240, 330)}</div>'
        f'<div style="margin:8px 10px;height:30px;border-radius:6px;background:{OURO};font:800 12px Inter;display:flex;align-items:center;justify-content:space-between;padding:0 10px">Saiba mais <span>›</span></div></div>')
B.append(frame('ouro', phone(143, 120, 240, post, 'rotate(-3deg)') + f'<div class="H" style="top:720px;font-size:90px;color:{PRETO}">PRA ANUNCIAR</div>', 'Criativo 02', '00:00:14:15', PRETO))
B.append(None)  # B09: virada meta, reaproveita o quadro B07 da rodada 1
# B10 18,6 s: fim: logo real + o preço pela 2ª e última vez
B.append(frame('preto', f'<img class="abs" src="img/LOGO_rei_da_VSL_outra.png" style="left:130px;top:160px;width:280px">'
               + f'<div class="abs num" style="left:0;right:0;top:420px;text-align:center;font-size:96px;color:{OURO}"><span style="font-size:.4em;color:{BRANCO}">R$ </span>49,90</div>'
               + f'<div class="btn" style="left:70px;top:560px;width:400px;height:100px;font-size:46px;border-radius:50px">Saiba mais</div>'
               + cursor(350, 625, 64) + f'<div class="t" style="top:700px;color:{CINZA};font-size:20px">peça o seu</div>', 'Criativo 02', '00:00:18:18'))

for nome, fr in (('A', A), ('B', B)):
    html = f'<!doctype html><meta charset="utf-8"><style>{CSS2}</style><body>{DEFS}{"".join(f for f in fr if f)}</body>'
    open(os.path.join(HERE, f'criativo2-{nome}.html'), 'w').write(html)
print(len(A), len(B))
