# Quadros-chave do vídeo de venda do site MedicMais (9:16, 1080x1920).
# Identidade = design system medido no site (identidade/tema.json): vermelho #EB2026, grafite #121216,
# névoa #F4F5F7, Poppins 800 em caixa alta, o "+" em squircle vermelho. Imagens = prints reais do site
# (img/celular-*.png, img/desktop-*.png) e quadros reais dos reels da clínica (img/tour-*, ana-*).
# Uso: python3 gera.py  -> html/Kxx.html ; depois render.mjs -> quadros/Kxx.png
import json, os
here = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(here, 'html'), exist_ok=True)

# offsets das seções no print do celular (px CSS, largura 390; o print está em 3x)
OFF = {'hero': 69, 'odonto': 1237, 'facts': 1738, 'medicina': 2047, 'sday': 2571, 'depo': 3519, 'contato': 4332}
PAGE_H = 5581

CSS = """
@font-face{font-family:P;font-weight:400;src:url(../fontes/pxiEyp8kv8JHgFVrFJA.ttf)}
@font-face{font-family:P;font-weight:500;src:url(../fontes/pxiByp8kv8JHgFVrLGT9V1s.ttf)}
@font-face{font-family:P;font-weight:600;src:url(../fontes/pxiByp8kv8JHgFVrLEj6V1s.ttf)}
@font-face{font-family:P;font-weight:700;src:url(../fontes/pxiByp8kv8JHgFVrLCz7V1s.ttf)}
@font-face{font-family:P;font-weight:800;src:url(../fontes/pxiByp8kv8JHgFVrLDD4V1s.ttf)}
:root{--red:#EB2026;--red-dark:#A72A2E;--ink:#121216;--gray:#E6E8EC;--mid:#A1A1A9;--soft:#F4F5F7;--t2:#55565e;--wa:#25D366}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:P,sans-serif;color:var(--ink);background:var(--soft);position:relative;-webkit-font-smoothing:antialiased}
.dark{background:var(--ink);color:#fff}.redbg{background:var(--red);color:#fff}.white{background:#fff}
.plus{display:inline-grid;place-items:center;background:var(--red);color:#fff;font-weight:700;line-height:1;border-radius:28%;flex:none}
.eb{position:absolute;left:84px;display:flex;align-items:center;gap:22px;font-weight:600;font-size:38px;color:var(--red)}
.eb .plus{width:62px;height:62px;font-size:44px}
.h{position:absolute;left:84px;right:84px;font-weight:800;text-transform:uppercase;letter-spacing:-.025em;line-height:1.04}
.h em{font-style:normal;color:var(--red);display:block}
.dark .h em{color:var(--red)}
.sub{position:absolute;left:84px;right:84px;font-size:40px;line-height:1.35;color:var(--t2);font-weight:400}
.dark .sub{color:#c9cad1}
.src{position:absolute;left:84px;bottom:300px;font-size:24px;color:var(--mid);font-weight:500;letter-spacing:.01em}
.tag{position:absolute;left:84px;top:200px;display:flex;align-items:center;gap:20px;font-size:34px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--red)}
.tag .plus{width:72px;height:72px;font-size:40px;letter-spacing:0}
/* celular com o site real */
.phone{position:absolute;background:var(--ink);border-radius:84px;padding:18px;box-shadow:0 40px 80px rgba(18,18,22,.22)}
.scr{position:relative;width:100%;height:100%;border-radius:68px;overflow:hidden;background:#fff}
.scr .pg{position:absolute;left:0;width:100%}
.scr .tp{position:absolute;left:0;top:0;width:100%;z-index:2}
.scr .bar{position:absolute;left:0;bottom:0;width:100%;z-index:2}
.card{position:absolute;border-radius:48px;overflow:hidden;background:#ddd;box-shadow:0 30px 60px rgba(18,18,22,.18)}
.card img{width:100%;height:100%;object-fit:cover;object-position:50% 0}
.pill{white-space:nowrap;display:inline-flex;align-items:center;gap:18px;border-radius:999px;font-weight:600}
.btn{background:var(--red);color:#fff;padding:34px 58px;font-size:44px;box-shadow:0 16px 40px rgba(235,32,38,.28)}
.search{position:absolute;left:84px;right:84px;height:150px;background:#fff;border:3px solid var(--gray);border-radius:999px;display:flex;align-items:center;gap:30px;padding:0 54px;font-size:46px;font-weight:500}
.search svg{width:52px;height:52px;flex:none}
.caret{display:inline-block;width:5px;height:58px;background:var(--red);margin-left:4px;vertical-align:middle}
.ring{position:absolute;border:8px solid var(--red);border-radius:40px}
.tap{position:absolute;width:84px;height:84px;border-radius:50%;background:rgba(18,18,22,.18);border:5px solid #fff;box-shadow:0 0 0 3px var(--ink);z-index:5}
.tap::after{content:"";position:absolute;inset:-34px;border-radius:50%;border:6px solid var(--red);opacity:.6}
"""

SEARCH_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#121216" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>'


def phone(x, y, w, sec='hero', extra='', bar=True, dy=0):
    """Celular mostrando o print real do site rolado até a seção `sec` (cabeçalho fixo + barra fixa reais)."""
    inner = w - 36
    s = inner / 390
    h = int(w * 844 / 390)
    top = (OFF[sec] - 69 - dy) * s
    ph = PAGE_H * s
    b = f'<img class="bar" src="../img/celular-bar.png">' if bar else ''
    return (f'<div class="phone" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><div class="scr">'
            f'<img class="tp" src="../img/celular-top.png">'
            f'<img class="pg" src="../img/celular-pagina.png" style="top:{-top}px;height:{ph}px;width:{inner}px">'
            f'{b}{extra}</div></div>')


def laptop(x, y, w, img='desktop-dobra.png'):
    h = int(w * 900 / 1440)
    return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px">'
            f'<div style="background:var(--ink);border-radius:36px 36px 0 0;padding:18px 18px 22px">'
            f'<img src="../img/{img}" style="display:block;width:100%;height:{h}px;object-fit:cover;object-position:0 0;border-radius:10px"></div>'
            f'<div style="height:30px;background:#2a2a31;border-radius:0 0 30px 30px;margin:0 -50px;box-shadow:0 30px 60px rgba(18,18,22,.25)"></div></div>')


def plus(size, x=None, y=None, extra=''):
    pos = f'position:absolute;left:{x}px;top:{y}px;' if x is not None else ''
    return f'<span class="plus" style="{pos}width:{size}px;height:{size}px;font-size:{int(size*.68)}px;{extra}">+</span>'


Q = []  # (id, tempo, cena, fala, o que acontece, classe do body, html)


def k(id_, t, cena, fala, acao, cls, body):
    Q.append(dict(id=id_, t=t, cena=cena, fala=fala, acao=acao, cls=cls, body=body))


# ---------------- ATO 1 · GANCHO ----------------
k('K01', '0,0 s', 'Capa', 'Este é o site da MedicMais Sobradinho. E ele já está pronto.',
  'Quadro 0 já é a capa: o site real no celular, título montado. Na fala, o celular sobe 40 px e a página rola sozinha.',
  '', f'''
<div class="eb" style="top:170px"><span class="plus">+</span>Para a MedicMais Sobradinho</div>
<div class="h" style="top:270px;font-size:104px">O site de vocês<em>já está pronto.</em></div>
{phone(200, 640, 680)}
''')

# ---------------- ATO 2 · A CLÍNICA ----------------
k('K02', '5,3 s', 'A clínica', '…quinhentos e cinquenta metros quadrados…',
  'Corredor real do tour (Instagram da clínica) em card; "550 m²" conta de 0 a 550 e pousa na palavra.',
  '', f'''
<div class="card" style="left:60px;top:150px;width:960px;height:1020px"><img src="../img/tour-19.jpg"></div>
<div class="h" style="top:1230px;font-size:250px;line-height:1;text-transform:none">550 m²</div>
<div class="sub" style="top:1500px">de estrutura, na Quadra 7/9 de Sobradinho</div>
''')

k('K03', '8,6 s', 'A clínica', '…médico e dentista no mesmo lugar…',
  'Dois cards reais (consulta e cadeira odontológica) chegam de lados opostos e se encostam; o "+" nasce entre eles.',
  '', f'''
<div class="card" style="left:60px;top:420px;width:465px;height:540px"><img src="../img/tour-13.jpg"></div>
<div class="card" style="left:555px;top:420px;width:465px;height:540px"><img src="../img/tour-28.9.jpg" style="object-position:30% 0"></div>
{plus(150, 465, 615, 'box-shadow:0 0 0 14px #F4F5F7')}
<div style="position:absolute;left:60px;top:1000px;width:465px;text-align:center;font-size:44px;font-weight:700">Médico</div>
<div style="position:absolute;left:555px;top:1000px;width:465px;text-align:center;font-size:44px;font-weight:700">Dentista</div>
<div class="h" style="top:1160px;font-size:120px;text-align:center">no mesmo<em>lugar</em></div>
''')

chips = ''.join(f'<span class="pill" style="background:#fff;color:var(--ink);padding:18px 34px;font-size:34px;font-weight:500">{c}</span>'
                for c in ['Médico', 'Dentista', 'Aferição de pressão', 'Glicemia', 'Saturação', 'Acupuntura'])
k('K04', '11,4 s', 'A clínica', '…e mais de trinta edições do Saúde Day.',
  'Fundo vira vermelho (cor do bloco Saúde Day do site); "30+" conta; os atendimentos reais do site entram em fila.',
  'redbg', f'''
<div style="position:absolute;right:-60px;bottom:-260px;font-size:1300px;font-weight:800;line-height:1;color:rgba(255,255,255,.10)">+</div>
<div style="position:absolute;left:84px;top:300px;font-size:34px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.9">#SaúdeDay</div>
<div class="h" style="top:380px;font-size:380px;line-height:.95;color:#fff">30+</div>
<div class="h" style="top:770px;font-size:92px;color:#fff">edições de<br>atendimento<br>gratuito</div>
<div style="position:absolute;left:84px;right:84px;top:1180px;display:flex;flex-wrap:wrap;gap:20px">{chips}</div>
''')

# ---------------- ATO 3 · O PROBLEMA ----------------
tiles = ['tour-4.jpg', 'ana-10.jpg', 'tour-25.7.jpg', 'maria-10.jpg', 'tour-32.jpg', 'familia-10.jpg', 'tour-13.jpg', 'tour-35.jpg', 'ana-20.jpg']
rot = [-6, 4, -3, 5, -2, 7, 3, -5, 6]
dx = [0, 30, -20, -30, 10, 25, 20, -10, -25]
g = ''
for i, im in enumerate(tiles):
    c, r = i % 3, i // 3
    g += (f'<div class="card" style="left:{70+c*320+dx[i]}px;top:{560+r*400+dx[(i+3)%9]}px;width:300px;height:380px;'
          f'transform:rotate({rot[i]}deg);border-radius:30px"><img src="../img/{im}"></div>')
k('K05', '14,0 s', 'O problema', 'Mas, na internet, tudo isso está espalhado num feed.',
  'Fundo grafite. Os reels reais da clínica caem em grade e se espalham, cada um torto para um lado.',
  'dark', f'''
<div class="h" style="top:200px;font-size:92px;color:#fff">Na internet, hoje,<em>tudo espalhado num feed.</em></div>
{g}
''')

k('K06', '18,6 s', 'O problema', 'Quem procura implante, prótese fixa ou lentes de contato dental pesquisa antes de decidir.',
  'Barra de busca no estilo do site; o texto é digitado letra a letra; os 3 tratamentos reais do site sobem como etiquetas.',
  '', f'''
<div class="h" style="top:260px;font-size:100px">Tratamento caro<em>se pesquisa antes.</em></div>
<div class="search" style="top:760px">{SEARCH_ICON}<span>implante dentário sobradinho<i class="caret"></i></span></div>
<div style="position:absolute;left:84px;right:84px;top:1000px;display:flex;flex-direction:column;gap:26px">
  <span class="pill" style="align-self:flex-start;background:#fff;border:3px solid var(--gray);padding:24px 40px;font-size:42px">{plus(56)} Implante dentário</span>
  <span class="pill" style="align-self:flex-start;background:#fff;border:3px solid var(--gray);padding:24px 40px;font-size:42px">{plus(56)} Prótese fixa (protocolo)</span>
  <span class="pill" style="align-self:flex-start;background:#fff;border:3px solid var(--gray);padding:24px 40px;font-size:42px">{plus(56)} Lentes de contato dental</span>
</div>
''')

res = ''.join(f'<div style="background:#fff;border:3px solid var(--gray);border-radius:36px;padding:34px 44px;font-size:42px;font-weight:600;color:var(--t2)">{x}<div style="font-size:30px;font-weight:400;color:var(--mid);margin-top:6px">{y}</div></div>'
              for x, y in [('Catálogo de médicos', 'lista de clínicas da região'), ('Outra clínica', 'Sobradinho-DF'), ('Plataforma de agendamento', 'especialistas em Sobradinho')])
k('K07', '23,6 s', 'O problema', 'E, buscando pelo nome da clínica, encontra catálogos e outras clínicas.',
  'Agora a busca é o nome da clínica. Chegam 3 resultados de outros; o lugar da MedicMais fica vazio, tracejado em vermelho.',
  '', f'''
<div class="search" style="top:240px">{SEARCH_ICON}<span>medicmais sobradinho</span></div>
<div style="position:absolute;left:84px;right:84px;top:470px;display:flex;flex-direction:column;gap:28px">{res}
<div style="border:6px dashed var(--red);border-radius:36px;padding:40px 44px;font-size:46px;font-weight:700;color:var(--red);display:flex;align-items:center;gap:24px">{plus(64)} MedicMais: sem site próprio</div></div>
''')

k('K08', '30,4 s', 'O problema', 'Em 2023, um terço dos estabelecimentos de saúde já agendava pela internet. Um ano antes, eram treze por cento.',
  'Barras crescem: 13% (2022, cinza) e 34% (2023, vermelho), com a fonte na tela.',
  'white', f'''
<div class="h" style="top:220px;font-size:100px">1 em cada 3<em>já agenda online.</em></div>
<div class="sub" style="top:620px">estabelecimentos de saúde no Brasil com agendamento pela internet</div>
<div style="position:absolute;left:150px;bottom:470px;width:300px;height:{int(13*16)}px;background:var(--gray);border-radius:36px 36px 0 0"></div>
<div style="position:absolute;left:600px;bottom:470px;width:300px;height:{int(34*16)}px;background:var(--red);border-radius:36px 36px 0 0"></div>
<div style="position:absolute;left:150px;width:300px;bottom:{470+13*16+20}px;text-align:center;font-size:90px;font-weight:800;color:var(--mid)">13%</div>
<div style="position:absolute;left:600px;width:300px;bottom:{470+34*16+20}px;text-align:center;font-size:90px;font-weight:800;color:var(--red)">34%</div>
<div style="position:absolute;left:84px;right:84px;bottom:466px;height:4px;background:var(--ink)"></div>
<div style="position:absolute;left:150px;width:300px;bottom:390px;text-align:center;font-size:40px;font-weight:600">2022</div>
<div style="position:absolute;left:600px;width:300px;bottom:390px;text-align:center;font-size:40px;font-weight:600">2023</div>
<div class="src">Fonte: TIC Saúde 2023, Cetic.br/NIC.br</div>
''')

# ---------------- ATO 4 · COMO O SITE AGREGA ----------------
fr = ''.join(f'<div style="background:#1d1d23;border-radius:44px;padding:44px 40px;display:flex;flex-direction:column;gap:30px">{plus(96)}'
             f'<div style="font-size:30px;font-weight:700;letter-spacing:.14em;color:var(--red)">{n}</div><div style="font-size:46px;font-weight:700;line-height:1.15">{t}</div></div>'
             for n, t in [('01', 'Ser encontrado'), ('02', 'Um toque até o WhatsApp'), ('03', 'Prova reunida'), ('04', 'Endereço de vocês')])
k('K09', '35,5 s', 'Como o site agrega', 'O site resolve isso em quatro frentes.',
  'Grafite. Quatro "+" nascem em grade 2x2 com stagger de 3 quadros; cada um vira o ícone da sua frente.',
  'dark', f'''
<div class="h" style="top:220px;font-size:104px;color:#fff">O site resolve<em>em 4 frentes.</em></div>
<div style="position:absolute;left:84px;right:84px;top:640px;display:grid;grid-template-columns:1fr 1fr;gap:32px">{fr}</div>
''')

# frente 1: celular na seção de odontologia, anel no card "Implante dentário"
pw = 600; s1 = (pw - 36) / 390
k('K10', '38,6 s', 'Frente 1 · Ser encontrado', 'Um: cada tratamento ganha o seu lugar, com o nome que o paciente digita na busca.',
  'A busca "implante dentário" desce e encaixa no card real do site, que ganha o anel vermelho.',
  '', f'''
<div class="tag"><span class="plus">1</span>Ser encontrado</div>
<div class="search" style="top:330px;height:130px;font-size:42px">{SEARCH_ICON}<span>implante dentário</span></div>
{phone(240, 560, pw, 'odonto', extra=f'<div class="ring" style="left:{14*s1}px;top:{(1432-1237+69)*s1-8}px;width:{306*s1}px;height:{262*s1}px"></div>', dy=0)}
''')

k('K11', '43,6 s', 'Frente 2 · Um toque', 'Dois: de qualquer ponto da página, um toque abre o WhatsApp da clínica.',
  'O dedo toca "Agendar no WhatsApp" na barra fixa real do site; anel de toque + som de clique; "1 toque" pousa ao lado.',
  '', f'''
<div class="tag"><span class="plus">2</span>Um toque até o WhatsApp</div>
<div class="h" style="top:330px;font-size:150px">1 toque.</div>
{phone(240, 560, pw, 'medicina', extra=f'<div class="tap" style="left:{(300)*s1-42}px;top:{(844-20)*s1-42}px"></div>')}
''')

k('K12', '49,5 s', 'Frente 3 · Prova reunida', 'Três: a prova fica reunida. Estrutura, depoimentos e Saúde Day num lugar só…',
  'Depoimento real (Dona Ana, reel da clínica) + comentário real do Instagram + faixa de diferenciais do site se empilham.',
  '', f'''
<div class="tag"><span class="plus">3</span>Prova reunida</div>
<div class="card" style="left:84px;top:330px;width:500px;height:560px"><img src="../img/ana-10.jpg"></div>
<div style="position:absolute;left:84px;top:920px;font-size:30px;color:var(--t2);font-weight:500">Dona Ana, paciente</div>
<div style="position:absolute;left:520px;top:600px;width:480px;background:#fff;border-radius:40px;padding:44px;box-shadow:0 30px 60px rgba(18,18,22,.14)">
 <div style="font-size:110px;line-height:.6;color:var(--red);font-weight:800">“</div>
 <div style="font-size:46px;font-weight:600;line-height:1.3;margin-top:20px">Nesta eu confio de olhos fechados.</div>
 <div style="font-size:28px;color:var(--t2);margin-top:22px">Comentário no Instagram da clínica</div></div>
<div style="position:absolute;left:84px;right:84px;top:1080px;background:var(--ink);color:#fff;border-radius:40px;padding:44px;display:flex;flex-direction:column;gap:30px">
 {''.join(f'<div style="display:flex;gap:26px;align-items:center">{plus(64)}<span style="font-size:40px;font-weight:700">{t}</span></div>' for t in ['550 m² de estrutura','Médico e dentista no mesmo lugar','Mais de 30 edições do Saúde Day'])}</div>
''')

src = ''.join(f'<span class="pill" style="background:#fff;border:3px solid var(--gray);padding:26px 44px;font-size:42px">{t}</span>' for t in ['Anúncio', 'Google', 'Instagram'])
k('K13', '57,5 s', 'Frente 4 · Endereço de vocês', 'Quatro: é um endereço de vocês. Anúncio, Google e Instagram levam para a mesma porta, aberta vinte e quatro horas.',
  'Três origens no topo; linhas vermelhas descem e convergem no celular com o site; selo "aberto 24 h".',
  '', f'''
<div class="tag"><span class="plus">4</span>Endereço de vocês</div>
<div style="position:absolute;left:84px;right:84px;top:330px;display:flex;justify-content:space-between">{src}</div>
<svg style="position:absolute;left:0;top:440px" width="1080" height="320"><g stroke="#EB2026" stroke-width="7" fill="none" stroke-linecap="round">
<path d="M215 10 C215 180 540 140 540 300"/><path d="M540 10 L540 300"/><path d="M860 10 C860 180 540 140 540 300"/></g></svg>
{phone(250, 770, 580)}
<div class="pill" style="position:absolute;left:640px;top:1460px;background:var(--ink);color:#fff;padding:26px 44px;font-size:40px">aberto 24 h</div>
''')

# ---------------- ATO 5 · POR QUE COMPRAR ----------------
sw = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:14px"><div style="width:150px;height:150px;border-radius:44px;background:{c};border:3px solid var(--gray)"></div><div style="font-size:30px;font-weight:600">{n}</div><div style="font-size:26px;color:var(--t2)">{c}</div></div>'
             for c, n in [('#EB2026', 'Vermelho'), ('#121216', 'Grafite'), ('#F4F5F7', 'Névoa')])
k('K14', '64,0 s', 'Por que comprar', 'E ele tem a cara da MedicMais: o vermelho, o sinal de mais, os serviços de verdade…',
  'Notebook e celular com o site real; as peças da identidade (cores, Poppins, o "+", o botão) saem da tela como num catálogo.',
  '', f'''
<div class="h" style="top:170px;font-size:100px">Com a cara<em>da MedicMais.</em></div>
{laptop(110, 440, 860)}
{phone(740, 640, 250, bar=True)}
<div style="position:absolute;left:84px;right:84px;top:1330px;display:flex;justify-content:space-between;align-items:flex-start">{sw}
<div style="display:flex;flex-direction:column;align-items:center;gap:14px"><div style="width:150px;height:150px;display:grid;place-items:center;font-size:100px;font-weight:800">Aa</div><div style="font-size:30px;font-weight:600">Poppins</div><div style="font-size:26px;color:var(--t2)">800 / 400</div></div></div>
<div style="position:absolute;left:84px;top:1620px;display:flex;gap:24px;align-items:center">{plus(96)}<span class="pill btn" style="padding:28px 48px;font-size:38px">Agendar pelo WhatsApp</span></div>
''')

items = ['Horário de funcionamento', 'CNPJ', 'Responsáveis técnicos (CRM e CRO)', 'Logo oficial']
li = ''.join(f'<div style="display:flex;align-items:center;gap:30px;padding:38px 0;border-bottom:3px solid var(--gray)"><span style="width:70px;height:70px;border-radius:22px;border:5px dashed var(--red);flex:none"></span><span style="font-size:46px;font-weight:600">{t}</span></div>' for t in items)
k('K15', '71,0 s', 'Por que comprar', 'Faltam só quatro detalhes: horário, CNPJ, responsáveis técnicos e o logo oficial.',
  'Checklist branco; cada item entra na palavra falada com a caixinha tracejada esperando a clínica.',
  '', f'''
<div class="h" style="top:220px;font-size:110px">Faltam só<em>4 detalhes.</em></div>
<div style="position:absolute;left:84px;right:84px;top:600px;background:#fff;border-radius:48px;padding:20px 56px 30px;box-shadow:0 30px 60px rgba(18,18,22,.10)">{li}</div>
<div class="sub" style="top:1420px">O resto já está no ar, testado no celular.</div>
''')

k('K16', '76,4 s', 'Chamada', 'Vamos colocar a MedicMais no ar?',
  'Volta ao enquadramento da capa (loop). O botão vermelho no estilo do site nasce embaixo e pulsa uma vez no "no ar".',
  '', f'''
<div class="eb" style="top:170px"><span class="plus">+</span>MedicMais Sobradinho</div>
<div class="h" style="top:270px;font-size:104px">Vamos colocar<em>no ar?</em></div>
{phone(200, 640, 680)}
<div class="pill btn" style="position:absolute;left:50%;transform:translateX(-50%);top:1610px;z-index:9;padding:40px 70px;font-size:50px">{plus(64, extra="background:#fff;color:var(--red)")} Colocar no ar</div>
''')

for q in Q:
    html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body class="{q["cls"]}">{q["body"]}</body></html>'
    open(os.path.join(here, 'html', q['id'] + '.html'), 'w').write(html)
json.dump([{k_: v for k_, v in q.items() if k_ not in ('body', 'cls')} for q in Q],
          open(os.path.join(here, 'quadros.json'), 'w'), ensure_ascii=False, indent=1)
print(len(Q), 'quadros')
