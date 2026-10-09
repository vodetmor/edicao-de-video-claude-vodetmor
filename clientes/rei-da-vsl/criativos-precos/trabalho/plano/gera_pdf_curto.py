"""PDF de aprovação OBJETIVO (regra do Vítor, 09/10/2026): capa, 1 página por vídeo, 1 de som, 1 de aprovação.
Uso: python3 gera_pdf_curto.py && PLANO=$PWD HTML=aprovacao.html OUT=plano-criativos-rei-da-vsl.pdf node pdf.mjs
O plano longo (referências medidas, SPEC) fica só interno: gera_pdf.py -> plano-detalhado-interno.pdf."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
Q, IMG = '../storyboard/quadros', '../storyboard/img'
OURO, PRETO, PAPEL, CINZA = '#DCB906', '#0B0B0B', '#F7F5EF', '#8A877F'

CSS = f"""
@font-face{{font-family:Archivo;src:url(../storyboard/fonts/archivo-latin-wdth-normal.woff2) format('woff2');font-weight:100 900;font-stretch:62% 125%}}
@font-face{{font-family:Inter;src:url(../storyboard/fonts/inter-latin-opsz-normal.woff2) format('woff2');font-weight:100 900}}
@page{{size:297mm 210mm;margin:0}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Inter;color:{PRETO};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pg{{width:297mm;height:210mm;padding:12mm 15mm 10mm;position:relative;overflow:hidden;background:{PAPEL};page-break-after:always}}
.escuro{{background:{PRETO};color:#F7F5EF}}
.k{{font:700 8.5pt Inter;letter-spacing:.16em;text-transform:uppercase;color:#9a7f00}}
.escuro .k{{color:{OURO}}}
h1{{font-family:Archivo;font-weight:900;font-stretch:62%;text-transform:uppercase;font-size:64pt;line-height:.86}}
h2{{font-family:Archivo;font-weight:900;font-stretch:62%;text-transform:uppercase;font-size:28pt;line-height:.9;margin-top:1.5mm}}
.ideia{{font:500 11pt/1.35 Inter;margin:2mm 0 5mm;color:#3a3833}}
.ideia b{{color:{PRETO};font-weight:700}}
.grid{{display:grid;gap:4mm 4.5mm}}
figure img{{width:100%;aspect-ratio:9/16;border-radius:2mm;display:block;box-shadow:0 .8mm 2.5mm rgba(0,0,0,.18)}}
figcaption{{margin-top:1.6mm;font:500 8pt/1.3 Inter}}
figcaption span{{display:inline-block;font:700 7pt Inter;background:{OURO};color:{PRETO};padding:.3mm 1.3mm;border-radius:1mm;margin-right:1.2mm;font-variant-numeric:tabular-nums}}
.rod{{position:absolute;left:15mm;right:15mm;bottom:5mm;display:flex;justify-content:space-between;font:500 7pt Inter;color:{CINZA};letter-spacing:.06em}}
table{{width:100%;border-collapse:collapse;font:400 9.4pt/1.35 Inter}}
th{{text-align:left;font:700 7.6pt Inter;letter-spacing:.1em;text-transform:uppercase;color:{CINZA};padding:1.6mm 2.5mm;border-bottom:1.2pt solid {PRETO}}}
td{{padding:2.1mm 2.5mm;border-bottom:.5pt solid #d9d5ca;vertical-align:top}}
td:first-child{{font-weight:650;white-space:nowrap}}
.ok{{display:flex;gap:3.5mm;align-items:flex-start;margin-bottom:4.5mm;font:500 12pt/1.35 Inter}}
.ok i{{flex:none;width:6mm;height:6mm;border:1.4pt solid {OURO};border-radius:1.2mm;margin-top:.3mm}}
.ok small{{display:block;font:400 9.5pt Inter;color:#a9a59a;margin-top:.6mm}}
.big{{font-family:Archivo;font-weight:900;font-stretch:62%;font-size:38pt;line-height:.85;color:{OURO}}}
.card{{background:#fff;border:.5pt solid #e2ded3;border-radius:3mm;padding:4.5mm 5mm}}
.card h3{{font:700 11pt Inter;margin-bottom:1.5mm}} .card p{{font:400 9.6pt/1.45 Inter}}
"""

def rod(n):
    return f'<div class="rod"><span>REI DA VSL · 2 CRIATIVOS EM MOTION · PARA APROVAÇÃO</span><span>{n}</span></div>'

def pagina_video(k, titulo, ideia, quadros, cols, n):
    figs = ''.join(f'<figure><img src="{Q}/{a}.png"><figcaption><span>{a} · {t}</span>{c}</figcaption></figure>' for a, t, c in quadros)
    return (f'<div class="pg"><div class="k">{k}</div><h2>{titulo}</h2><p class="ideia">{ideia}</p>'
            f'<div class="grid" style="margin:0 auto;grid-template-columns:repeat({cols},1fr);width:{cols*(35 if cols==5 else 37)+(cols-1)*(4.5 if cols==5 else 12)}mm;column-gap:{4.5 if cols==5 else 12}mm">{figs}</div>{rod(n)}</div>')

A = [('A01', '0 s', 'Preço girando já no 1º quadro'), ('A02', '3 s', '"por criativo": nasce o 1º vídeo'),
     ('A03', '4 s', '"Sim, é isso mesmo": tela vira ouro'), ('A04', '7 s', 'Um vira dez'),
     ('A05', '9 s', 'Até 30 segundos cada'), ('A06', '11 s', 'Os 10 empilham e somam R$ 399'),
     ('A07', '13 s', 'Tudo incluso'), ('A08', '16 s', 'Copy, locução e edição se mostram'),
     ('A09', '21 s', 'Testes A/B: a coroa escolhe o vencedor'), ('A10', '23 s', 'Logo + botão Saiba mais')]
B = [('B01', '0 s', 'Preço girando, cores invertidas'), ('B02', '4 s', 'O criativo completo se desenha'),
     ('B03', '6 s', 'Copy, locução e edição entram'), ('B04', '10 s', '3 pessoas, 3 contratos'),
     ('B05', '12 s', 'Os três viram a coroa'), ('B06', '14 s', 'Pronto pra anunciar no feed'),
     ('B07', '16 s', '"Esse vídeo é um exemplo": ele aparece na própria edição'), ('B08', '19 s', 'Logo + botão Saiba mais')]

P = []
P.append(f'''<div class="pg escuro">
<img src="{IMG}/LOGO_rei_da_VSL_horizontal.png" style="width:90mm;margin-top:3mm">
<div style="position:absolute;left:15mm;top:64mm;width:140mm">
<div class="k">Para aprovação</div>
<h1 style="margin-top:4mm">2 criativos<br><span style="color:{OURO}">em motion</span></h1>
<p style="margin-top:6mm;color:#cfcbc0;font-size:11.5pt;line-height:1.45">Vertical 9:16 para Facebook, Instagram e TikTok. Cada animação entra na palavra exata da locução.</p></div>
<div style="position:absolute;right:15mm;top:36mm;display:flex;gap:5mm">
<img src="{Q}/A02.png" style="width:52mm;border-radius:3mm"><img src="{Q}/B07.png" style="width:52mm;border-radius:3mm;margin-top:16mm"></div>
<div style="position:absolute;left:15mm;bottom:15mm;display:flex;gap:14mm">
<div><div class="big">01</div><p style="color:#cfcbc0;font-size:10pt">Pacote 10 por R$ 399 · 25 s</p></div>
<div><div class="big">02</div><p style="color:#cfcbc0;font-size:10pt">Completo por R$ 49,90 · 20 s</p></div></div>
{rod(1)}</div>''')
P.append(pagina_video('Criativo 01 · 25 s', 'Pacote 10 por R$ 399', '<b>A ideia:</b> um criativo vira dez, e os dez viram um preço.', A, 5, 2))
P.append(pagina_video('Criativo 02 · 20 s', 'Completo por R$ 49,90', '<b>A ideia:</b> três profissionais viram uma coroa, e o próprio anúncio é a prova.', B, 4, 3))

P.append(f'''<div class="pg"><div class="k">Som</div><h2>Composição audiovisual</h2>
<p class="ideia">Voz na frente. A música é original, então não tem risco de direito autoral no anúncio pago. Cada efeito acontece no quadro exato da ação.</p>
<div style="display:grid;grid-template-columns:1fr 1.35fr;gap:8mm">
<div>
<div class="card" style="margin-bottom:4mm"><h3>Música</h3><p>Batida moderna e pulsante a 128 BPM, com grave curto e sem melodia disputando com a voz. Ela abaixa quando a voz fala e sobe nas pausas.</p></div>
<div class="card" style="margin-bottom:4mm"><h3>Voz</h3><p>A locução enviada, sem cortes, com leve tratamento de clareza.</p></div>
<div class="card"><h3>Volume final</h3><p>Padrão das plataformas (−14 LUFS): nem baixo nem estourado.</p></div></div>
<table><tr><th>momento</th><th>efeito sonoro</th></tr>
<tr><td>Preço girando</td><td>catraca a cada dígito e batida grave quando o número para</td></tr>
<tr><td>"Sim" · "A gente faz tudo"</td><td>impacto forte com acorde</td></tr>
<tr><td>Um vira dez</td><td>10 cliques subindo de tom</td></tr>
<tr><td>Textos e cartões entrando</td><td>whoosh no auge do movimento</td></tr>
<tr><td>Copy · locução · edição</td><td>teclado, respiro de microfone e estalo de corte</td></tr>
<tr><td>Coroa pousando · "PRONTO"</td><td>impacto metálico e carimbo</td></tr>
<tr><td>"Esse vídeo é um exemplo"</td><td>a música abre quando a câmera recua</td></tr>
<tr><td>Botão Saiba mais</td><td>clique e acorde final</td></tr></table></div>
{rod(4)}</div>''')

P.append(f'''<div class="pg escuro"><div class="k">Aprovação</div><h2>Para aprovar</h2>
<div style="margin-top:8mm;width:175mm">
<div class="ok"><i></i><div>Quadros do Criativo 01 (A01 a A10)<small>Para ajustar, basta citar o código. Exemplo: "muda o A05".</small></div></div>
<div class="ok"><i></i><div>Quadros do Criativo 02 (B01 a B08)</div></div>
<div class="ok"><i></i><div>Som: música original + efeitos acima</div></div>
<div class="ok"><i></i><div>Formato 9:16<small>Opcional: versão 4:5 para o feed, feita da mesma base.</small></div></div></div>
<p style="position:absolute;left:15mm;bottom:16mm;width:200mm;color:#8f8b80;font-size:9pt">Os quadros mostram composição e cor. O vídeo final ganha movimento, desfoque de velocidade e acabamento.</p>
{rod(5)}</div>''')

open(os.path.join(HERE, 'aprovacao.html'), 'w').write(f'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Aprovação · 2 criativos Rei da VSL</title><style>{CSS}</style><body>{"".join(P)}</body></html>')
print('paginas', len(P))
