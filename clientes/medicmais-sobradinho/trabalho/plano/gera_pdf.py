"""PDF de aprovação OBJETIVO (regra do Vítor 09/10/2026): capa, 2 páginas de quadros-chave, som, aprovar.
Uso: python3 gera_pdf.py && PLANO=$PWD HTML=aprovacao.html OUT=plano-video-site-medicmais.pdf node pdf.mjs"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
Q = json.load(open(os.path.join(HERE, '../storyboard/quadros.json')))
F = '../storyboard/fontes/'
CSS = f"""
@font-face{{font-family:P;font-weight:400;src:url({F}pxiEyp8kv8JHgFVrFJA.ttf)}}
@font-face{{font-family:P;font-weight:500;src:url({F}pxiByp8kv8JHgFVrLGT9V1s.ttf)}}
@font-face{{font-family:P;font-weight:600;src:url({F}pxiByp8kv8JHgFVrLEj6V1s.ttf)}}
@font-face{{font-family:P;font-weight:700;src:url({F}pxiByp8kv8JHgFVrLCz7V1s.ttf)}}
@font-face{{font-family:P;font-weight:800;src:url({F}pxiByp8kv8JHgFVrLDD4V1s.ttf)}}
@page{{size:297mm 210mm;margin:0}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:P;color:#121216;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pg{{width:297mm;height:210mm;padding:13mm 15mm 10mm;position:relative;overflow:hidden;background:#F4F5F7;page-break-after:always}}
.dark{{background:#121216;color:#fff}}
.plus{{display:inline-grid;place-items:center;width:7mm;height:7mm;border-radius:2mm;background:#EB2026;color:#fff;font-weight:700;font-size:13pt;line-height:1;vertical-align:middle}}
.k{{font-weight:700;font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;color:#EB2026}}
h1{{font-weight:800;text-transform:uppercase;letter-spacing:-.025em;font-size:40pt;line-height:1.02}}
h1 em,h2 em{{font-style:normal;color:#EB2026}}
h2{{font-weight:800;text-transform:uppercase;letter-spacing:-.02em;font-size:20pt;line-height:1.05;margin-top:1mm}}
p.l{{font-size:11pt;line-height:1.45;color:#55565e}} .dark p.l{{color:#c9cad1}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:7mm 6mm;margin-top:6mm}} figure{{display:flex;gap:3mm;align-items:flex-start}} figure img{{width:39mm!important;flex:none}}
figure img{{width:100%;aspect-ratio:9/16;border-radius:2mm;display:block;box-shadow:0 .6mm 2mm rgba(18,18,22,.18)}}
figcaption{{font-size:7.6pt;line-height:1.3;color:#55565e}}
figcaption b{{display:block;color:#121216;font-size:8.2pt;margin-top:1.5mm;margin-bottom:.6mm}}
figcaption span{{display:inline-block;background:#EB2026;color:#fff;font-weight:700;font-size:7.4pt;border-radius:1mm;padding:.2mm 1.2mm;margin-right:1mm}}
.rod{{position:absolute;left:15mm;right:15mm;bottom:5mm;display:flex;justify-content:space-between;font-size:7pt;color:#A1A1A9;letter-spacing:.04em}}
.cols{{display:grid;grid-template-columns:1fr 1fr;gap:10mm;margin-top:6mm}}
.box{{background:#fff;border-radius:4mm;padding:6mm 7mm}}
.row{{display:flex;gap:3mm;align-items:flex-start;padding:2.2mm 0;border-bottom:.4pt solid #E6E8EC;font-size:9.5pt;line-height:1.4}}
.row:last-child{{border-bottom:0}}
.row b{{min-width:30mm;font-weight:700}}
.chk{{width:4.5mm;height:4.5mm;border:1.2pt solid #EB2026;border-radius:1.2mm;flex:none;margin-top:.6mm}}
.atos{{display:grid;grid-template-columns:repeat(5,1fr);gap:4mm;margin-top:8mm}}
.ato{{background:#1d1d23;border-radius:4mm;padding:5mm}}
.ato .k{{font-size:7.5pt}} .ato div{{font-size:9pt;line-height:1.4;margin-top:2mm;color:#e6e8ec}}
"""
def rod(n): return f'<div class="rod"><span>MedicMais Sobradinho · vídeo de venda do site · plano para aprovação</span><span>{n}/5</span></div>'
def grade(qs):
    return '<div class="grid">' + ''.join(
        f'<figure><img src="../storyboard/quadros/{q["id"]}.png"><figcaption><span>{q["t"]}</span><b>{q["cena"]}</b>{q["acao"]}</figcaption></figure>' for q in qs) + '</div>'
P = []
P.append(f'''<div class="pg dark">
<div class="k"><span class="plus">+</span>&nbsp; Plano para aprovação · 14/10/2026</div>
<div style="display:grid;grid-template-columns:1fr 62mm;gap:12mm;margin-top:8mm">
<div><h1>Vídeo de venda<br><em>do site MedicMais</em></h1>
<p class="l" style="margin-top:6mm;max-width:150mm">Mostrar ao dono, com o material da própria clínica, que o site já existe, o que ele traz para o negócio e o que falta para ir ao ar.</p>
<p class="l" style="margin-top:4mm">Celular 9:16 (1080x1920), cerca de 78 s, narrado. Depois, a mesma edição em 16:9 para reunião.</p>
<div class="atos">
<div class="ato"><div class="k">1 · Gancho</div><div>"O site de vocês já está pronto." O site real no celular desde o quadro 0.</div></div>
<div class="ato"><div class="k">2 · A clínica</div><div>O que eles já têm: 550 m², médico e dentista juntos, 30+ Saúde Day. Imagens reais do tour.</div></div>
<div class="ato"><div class="k">3 · O problema</div><div>Tudo espalhado num feed; paciente pesquisa antes; 1 em cada 3 já agenda online.</div></div>
<div class="ato"><div class="k">4 · Como agrega</div><div>4 frentes: ser encontrado, 1 toque até o WhatsApp, prova reunida, endereço próprio.</div></div>
<div class="ato"><div class="k">5 · Por que comprar</div><div>Feito com a cara deles, faltam só 4 detalhes. "Vamos colocar no ar?"</div></div>
</div></div>
<img src="../storyboard/quadros/K01.png" style="width:62mm;border-radius:3mm">
</div>{rod(1)}</div>''')
P.append(f'<div class="pg"><div class="k">Quadros-chave · 1 de 2</div><h2>Gancho, a clínica <em>e o problema</em></h2>{grade(Q[:8])}{rod(2)}</div>')
P.append(f'<div class="pg"><div class="k">Quadros-chave · 2 de 2</div><h2>Como o site agrega <em>e por que comprar</em></h2>{grade(Q[8:])}{rod(3)}</div>')
P.append(f'''<div class="pg"><div class="k">Som</div><h2>Voz na frente, <em>música no tempo</em></h2>
<div class="cols"><div class="box">
<div class="row"><b>Voz</b>Narrada, falando com o dono ("vocês"). A amostra enviada é provisória (voz grátis) só para medir o tempo; a final sai do ElevenLabs.</div>
<div class="row"><b>Música</b>Trilha original, calma e confiante (~96 BPM, piano e baixo macio). Viradas em "pronto", "quatro frentes" e "no ar".</div>
<div class="row"><b>Mixagem</b>Música bem abaixo da voz enquanto ela fala e volta suave nas pausas. Volume final no padrão das redes (-14 LUFS).</div>
</div><div class="box">
<div class="row"><b>Contadores</b>Tique leve em 550 m², 30+ e 13% para 34%.</div>
<div class="row"><b>Buscas</b>Digitação curta nas duas barras de busca.</div>
<div class="row"><b>1 toque</b>Clique + "pop" quando o dedo toca o botão do WhatsApp.</div>
<div class="row"><b>Sinal de +</b>Nota curta cada vez que um "+" nasce (as 4 frentes, a lista).</div>
<div class="row"><b>Cards</b>Sopro curto quando as imagens do tour entram.</div>
</div></div>{rod(4)}</div>''')
P.append(f'''<div class="pg"><div class="k">Para aprovar</div><h2>O que preciso <em>de você</em></h2>
<div class="cols"><div class="box">
<div class="row"><span class="chk"></span>História em 5 atos e os 16 quadros: ok ou o que muda.</div>
<div class="row"><span class="chk"></span>Duração de ~78 s (é um vídeo para uma pessoa, não anúncio). Ok?</div>
<div class="row"><span class="chk"></span>Quem narra: você manda a voz do ElevenLabs (texto em voz/roteiro.json) ou gero com qual voz?</div>
<div class="row"><span class="chk"></span>Entra preço ou condição no fim? Não está no site, então hoje o vídeo termina em "Vamos colocar no ar?".</div>
<div class="row"><span class="chk"></span>Pode usar os reels do Instagram da clínica (tour e depoimentos)? Já baixei 4.</div>
</div><div class="box">
<div class="row"><b>Conferir</b>No seu Google: buscar "MedicMais Sobradinho". Na minha busca só vieram catálogos e outra clínica (quadro K07). Se aparecer outra coisa, troco a frase.</div>
<div class="row"><b>Logo</b>O logo oficial (coração em M) não tem arquivo; uso o letreiro do próprio site e mostro a parede real nos vídeos. Não redesenho.</div>
<div class="row"><b>Dados</b>Só o que está no site + TIC Saúde 2023 (Cetic.br), com a fonte na tela.</div>
<div class="row"><b>Depois do OK</b>Motion completo no Remotion, som, crítica independente (≥ 8/10), final 9:16 e 16:9.</div>
</div></div>{rod(5)}</div>''')
open(os.path.join(HERE, 'aprovacao.html'), 'w').write(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(P)}</body></html>')
print('ok')
