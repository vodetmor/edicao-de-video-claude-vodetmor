"""Estáticos de anúncio Rei da VSL (Dhay, 13/10/2026): 3 por criativo, feitos com os artefatos dos vídeos de preço.
01 = R$ 39,90 por criativo / pacote de 10 por R$ 399 (dourado no preto). 02 = R$ 49,90 criativo completo (preto no branco).
Uso: python3 gera.py [W H] -> estaticos.html ; depois  NODE_PATH=<node_modules com playwright> node render.mjs
Preço 3D: caixa3d/preco3d.py (criativos-precos) renderizado em 2160 e recortado (prepara.py)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
IC = json.load(open('/mnt/project-files/clientes/rei-da-vsl/criativos-precos/trabalho/storyboard/icons.json'))
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1080, 1350)
Q = H < 1200  # quadrado: comprime o miolo

PRETO, OURO, OURO_CL, OURO_ES, BRANCO, CINZA, GRAFITE = '#0B0B0B', '#DCB906', '#ECD119', '#B99100', '#F7F5EF', '#8A877F', '#1A1A19'

def icon(n, s=24, c=PRETO):
    return IC[n].replace('<svg ', f'<svg class="i" width="{s}" height="{s}" style="fill:{c}" ', 1)

CSS = f"""
@font-face{{font-family:Archivo;src:url(img/archivo-latin-wdth-normal.woff2) format('woff2');font-weight:100 900;font-stretch:62% 125%}}
@font-face{{font-family:Inter;src:url(img/inter-latin-opsz-normal.woff2) format('woff2');font-weight:100 900}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#666;font-family:Inter;display:flex;flex-wrap:wrap;gap:40px;padding:40px;width:{W*3+160}px}}
.f{{position:relative;width:{W}px;height:{H}px;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:{64 if not Q else 52}px 72px {64 if not Q else 52}px}}
.preto{{background:{PRETO};color:{BRANCO}}} .ouro{{background:{OURO};color:{PRETO}}} .branco{{background:{BRANCO};color:{PRETO}}}
.H{{font-family:Archivo;font-weight:900;font-stretch:62%;text-transform:uppercase;line-height:.86;letter-spacing:-.005em;text-align:center}}
.k{{font:600 30px/1.25 Inter;letter-spacing:-.01em;text-align:center}}
.sp{{flex:1}}
.logo{{height:58px;display:block}}
svg.i{{display:block}}
.pill{{display:flex;align-items:center;gap:14px;font:600 32px Inter;letter-spacing:-.01em}}
.ic{{width:64px;height:64px;border-radius:22%;display:flex;align-items:center;justify-content:center}}
.btn{{display:flex;align-items:center;justify-content:center;gap:14px;height:104px;padding:0 54px;border-radius:30px;font-family:Archivo;font-weight:900;font-stretch:75%;font-size:42px;text-transform:uppercase;letter-spacing:.02em}}
.num{{font-family:Archivo;font-weight:900;font-stretch:62%;font-variant-numeric:tabular-nums;line-height:.8}}
"""

def trio(cor_ic, cor_bg, cor_txt, sep='+'):
    it = [('pen-nib', 'Copy'), ('microphone', 'Locução'), ('film-strip', 'Edição')]
    out = []
    for n, t in it:
        out.append(f'<div class="pill" style="color:{cor_txt}"><div class="ic" style="background:{cor_bg}">{icon(n, 36, cor_ic)}</div>{t}</div>')
    s = f'<div style="font:700 34px Inter;color:{cor_txt};opacity:.45">{sep}</div>'
    return f'<div style="display:flex;align-items:center;gap:26px">{s.join(out)}</div>'

def rodape(txt_esq, cor_txt, btn_bg, btn_c, sub=''):
    return (f'<div style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:30px">'
            f'<div style="font:600 30px/1.25 Inter;color:{cor_txt};letter-spacing:-.01em">{txt_esq}{sub}</div>'
            f'<div class="btn" style="background:{btn_bg};color:{btn_c}">Saiba mais {icon("cursor-click", 40, btn_c)}</div></div>')

# ---------------- 01 · R$ 39,90 por criativo (preto + ouro) ----------------
A1 = f"""<div class="f preto">
<img class="logo" src="img/LOGO_rei_da_VSL_horizontal.png">
<div class="sp"></div>
<div class="k" style="color:{CINZA}">Criativo em vídeo pro seu anúncio</div>
<div style="position:relative;margin-top:26px;display:flex;align-items:flex-start;justify-content:center">
  <div class="num" style="font-size:120px;color:{OURO};margin:34px 10px 0 0">R$</div>
  <img src="img/precoA.png" style="height:{380 if not Q else 290}px;display:block">
</div>
<div class="H" style="font-size:{150 if not Q else 120}px;margin-top:18px">por criativo</div>
<div style="width:120px;height:6px;background:{OURO};border-radius:3px;margin:{46 if not Q else 34}px 0"></div>
{trio(PRETO, OURO, BRANCO)}
<div class="sp"></div>
{rodape(f'Pacote com 10:<br><b style="color:{OURO};font-weight:800">R$ 399 no total</b>', BRANCO, OURO, PRETO)}
</div>"""

A2 = f"""<div class="f ouro">
<img class="logo" src="img/LOGO_rei_da_VSL_horizontal_2.png">
<div class="H" style="font-size:{172 if not Q else 130}px;margin-top:{44 if not Q else 26}px">10 criativos</div>
<div class="H" style="font-size:{78 if not Q else 64}px;margin-top:10px;font-stretch:70%">prontos pra anunciar</div>
<div style="position:relative;flex:1;width:100%;display:flex;align-items:center;justify-content:center;min-height:0">
  <img src="img/caixa.png" style="height:100%;max-height:{560 if not Q else 400}px;display:block;filter:drop-shadow(0 30px 40px rgba(0,0,0,.25))">
</div>
<div style="display:flex;align-items:flex-end;gap:28px">
  <div class="num" style="font-size:{190 if not Q else 150}px"><span style="font-size:.5em">R$ </span>399</div>
  <div style="font:700 34px/1.2 Inter;letter-spacing:-.01em;padding-bottom:10px">no total.<br><span style="font-weight:600;opacity:.7">Sai R$ 39,90 cada.</span></div>
</div>
<div style="margin-top:{40 if not Q else 26}px">{trio(OURO, PRETO, PRETO)}</div>
</div>"""

linhas = ''.join(f'<div style="display:flex;justify-content:space-between;font:500 {25 if not Q else 21}px/1 Inter;font-variant-numeric:tabular-nums;padding:{7 if not Q else 4}px 0">'
                 f'<span>Criativo {i:02d}<span style="opacity:.45"> · até 30 s</span></span><span>39,90</span></div>' for i in range(1, 11))
A3 = f"""<div class="f preto">
<img class="logo" src="img/LOGO_rei_da_VSL_horizontal.png">
<div class="H" style="font-size:{124 if not Q else 96}px;margin-top:{40 if not Q else 26}px">teste <span style="color:{OURO}">10 abordagens</span></div>
{'' if Q else f'<div class="k" style="color:{CINZA};margin-top:18px">10 vídeos prontos pras suas campanhas</div>'}
<div class="sp"></div>
<div style="position:relative;width:{560 if not Q else 520}px;transform:rotate(-2.5deg)">
  <div style="background:{BRANCO};color:{PRETO};padding:34px 40px 26px;border-radius:6px 6px 0 0;box-shadow:0 40px 80px rgba(0,0,0,.6)">
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;font:800 24px Inter;letter-spacing:.14em;margin-bottom:16px"><img src="img/coroa_rei_da_VSL.png" style="height:30px">REI DA VSL</div>
    <div style="border-top:2px dashed #0b0b0b55;margin-bottom:8px"></div>
    {linhas}
    <div style="border-top:2px dashed #0b0b0b55;margin:12px 0 12px"></div>
    <div style="display:flex;align-items:center;gap:10px;font:700 24px Inter;color:#8a6d00;margin-bottom:12px">{icon('check-circle', 30, OURO_ES)}Copy + locução + edição inclusos</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end"><span style="font:800 28px Inter;letter-spacing:.06em">TOTAL</span>
      <span class="num" style="font-size:96px">R$ 399</span></div>
  </div>
  <svg viewBox="0 0 560 22" preserveAspectRatio="none" style="display:block;width:100%;height:22px"><path d="{'M0 0 ' + ' '.join(f'L{x+14} 22 L{x+28} 0' for x in range(0, 560, 28)) + ' Z'}" fill="{BRANCO}"/></svg>
</div>
<div class="sp"></div>
{rodape(f'R$ 39,90<br><span style="color:{CINZA}">por criativo</span>', BRANCO, OURO, PRETO)}
</div>"""

# ---------------- 02 · R$ 49,90 criativo completo (preto no branco) ----------------
B1 = f"""<div class="f branco">
<img class="logo" src="img/LOGO_rei_da_VSL_horizontal_2.png">
<div class="sp"></div>
<div style="display:flex;align-items:flex-start;justify-content:center;margin-left:-20px">
  <div class="num" style="font-size:96px;margin:40px 4px 0 0;line-height:.9">POR<br>R$</div>
  <img src="img/precoB.png" style="height:{360 if not Q else 290}px;display:block">
</div>
<div class="H" style="font-size:{140 if not Q else 112}px;margin-top:6px">criativo<br><span style="color:{OURO_ES}">completo</span></div>
<div style="margin-top:{50 if not Q else 34}px">{trio(OURO, PRETO, PRETO)}</div>
<div class="sp"></div>
{rodape('Do roteiro ao vídeo<br><b style="font-weight:800">pronto pra anunciar.</b>', PRETO, PRETO, OURO)}
</div>"""

def cargo(n, t, sub, rot):
    return (f'<div style="display:flex;align-items:center;gap:22px;background:#fff;border-radius:28px;padding:22px 26px;width:620px;transform:rotate({rot}deg);'
            f'box-shadow:0 14px 34px rgba(0,0,0,.08);position:relative">'
            f'<div class="ic" style="width:78px;height:78px;background:#ECEAE3">{icon(n, 40, CINZA)}</div>'
            f'<div style="flex:1"><div style="font:700 34px Inter;letter-spacing:-.02em;color:{CINZA};text-decoration:line-through;text-decoration-thickness:3px">{t}</div>'
            f'<div style="font:500 23px Inter;color:#A8A59C;margin-top:4px">{sub}</div></div>'
            f'<div style="width:58px;height:58px;border-radius:50%;background:#E5483A;display:flex;align-items:center;justify-content:center">{icon("x", 32, "#fff")}</div></div>')

B2 = f"""<div class="f branco">
<img class="logo" src="img/LOGO_rei_da_VSL_horizontal_2.png">
<div class="H" style="font-size:{116 if not Q else 92}px;margin-top:{40 if not Q else 24}px">contratar<br>3 pessoas?</div>
<div class="sp"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:{18 if not Q else 10}px">
  {cargo('pen-nib', 'Copywriter', 'orçamento em 3 dias', -1.5)}
  {cargo('microphone', 'Locutor', 'agenda só semana que vem', 1.2) if not Q else ''}
  {cargo('scissors', 'Editor', 'mais uma conversa no WhatsApp', -.8)}
</div>
<div style="margin:{26 if not Q else 16}px 0">{icon('arrow-left', 54, PRETO).replace('class="i"', 'class="i" transform="rotate(-90)"')}</div>
<div style="display:flex;align-items:center;gap:30px;background:{PRETO};color:{BRANCO};border-radius:36px;padding:30px 40px;width:100%">
  <img src="img/coroa_rei_da_VSL.png" style="height:84px">
  <div style="flex:1"><div class="H" style="text-align:left;font-size:58px">a gente faz tudo</div>
    <div style="font:600 25px Inter;color:#BDBAB2;margin-top:8px">copy, locução e edição juntos</div></div>
  <div class="num" style="color:{OURO};font-size:100px;text-align:right"><span style="font-size:.42em">R$</span>49,90</div>
</div>
<div class="sp"></div>
<div style="width:100%;display:flex;justify-content:flex-end"><div class="btn" style="background:{PRETO};color:{OURO}">Saiba mais {icon("cursor-click", 40, OURO)}</div></div>
</div>"""

pw = 430 if not Q else 340
B3 = f"""<div class="f branco" style="padding-left:64px;padding-right:64px">
<img class="logo" src="img/LOGO_rei_da_VSL_horizontal_2.png">
<div style="flex:1;width:100%;display:flex;align-items:center;gap:44px;min-height:0">
  <div style="position:relative;width:{pw}px;height:{round(pw*2.05)}px;flex:none;border-radius:{pw*.14}px;background:{PRETO};padding:14px;box-shadow:0 40px 70px rgba(0,0,0,.22);transform:rotate(-3deg)">
    <div style="position:relative;width:100%;height:100%;border-radius:{pw*.11}px;overflow:hidden;background:#fff;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:12px;padding:44px 18px 12px">
        <div style="width:40px;height:40px;border-radius:50%;background:{PRETO};display:flex;align-items:center;justify-content:center"><img src="img/coroa_rei_da_VSL.png" style="width:28px"></div>
        <div><div style="font:700 17px Inter">sua marca</div><div style="font:500 14px Inter;color:{CINZA}">Patrocinado</div></div></div>
      <div style="position:relative;flex:1;background:url(img/port-inseguro.jpg) center 30%/cover">
        <div style="position:absolute;left:0;bottom:0;height:6px;width:62%;background:{OURO}"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;background:{OURO};padding:16px 18px;font:700 19px Inter">Saiba mais <span>›</span></div>
      <div style="padding:12px 18px 22px;font:500 15px Inter;color:{CINZA}">♥ 1,5 mil · 95 comentários</div>
    </div>
    <div style="position:absolute;right:-56px;top:{pw*.42}px;width:150px;height:150px;border-radius:50%;background:{PRETO};color:{OURO};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(12deg);box-shadow:0 14px 30px rgba(0,0,0,.25)">
      {icon('seal-check', 52, OURO)}<div class="H" style="font-size:40px;margin-top:4px">pronto</div></div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column">
    <div class="H" style="text-align:left;font-size:{106 if not Q else 84}px">seu vídeo<br>pronto pra<br><span style="color:{OURO_ES}">anunciar</span></div>
    <div style="font:600 29px/1.3 Inter;letter-spacing:-.01em;margin-top:28px;color:#3a3a38">Copy, locução e edição.<br>Você só sobe a campanha.</div>
    <div class="num" style="font-size:{150 if not Q else 120}px;margin-top:{44 if not Q else 26}px"><span style="font-size:.4em">R$ </span>49,90</div>
  </div>
</div>
<div style="width:100%;display:flex;align-items:center;justify-content:space-between">
  <div style="font:600 30px Inter;color:{CINZA}">Criativo completo</div>
  <div class="btn" style="background:{PRETO};color:{OURO}">Saiba mais {icon("cursor-click", 40, OURO)}</div></div>
</div>"""

html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{A1}{A2}{A3}{B1}{B2}{B3}</body></html>'
open(os.path.join(HERE, f'estaticos-{W}x{H}.html'), 'w').write(html)
print('ok', W, H)
