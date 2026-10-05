# Gera quadros-chave.html (e o PDF via chromium) com a história em atos e os quadros reais.
Q = [
 (0, 'Ato 1 · A bolinha', 'Já no quadro 1 a bolinha laranja está caindo do alto.', 'assobio caindo'),
 (8, '', '1º quique: amassa no chão e estica ao subir.', 'boing (dó)'),
 (22, '', '2º quique, mais baixo, chegando ao centro.', 'boing (mi)'),
 (31, '', 'Pousa no centro e se agacha (antecipação).', 'tambor abafado'),
 (38, 'Ato 2 · Vira a logo', 'POP: a bolinha infla e vira o losango da logo, com mola.', 'pop + whoosh'),
 (47, '', 'O miolo se abre e nasce o anel.', 'bloop'),
 (52, 'Ato 3 · As letras pulam', 'As letras saltam de dentro do losango, uma por vez.', 'marimba subindo'),
 (57, '', 'Cada letra estica ao subir e balança ao pousar.', 'dó-mi-sol-dó'),
 (72, '', 'O i olha pros lados: cadê o pingo?', 'pausa engraçada'),
 (84, 'Ato 4 · O pingo volta', 'O pingo despenca do alto, esticado pela velocidade.', 'assobio caindo'),
 (90, '', 'Plim! O pingo cai no lugar, o i e a logo cedem.', 'plim + palmas'),
 (96, 'Ato 5 · Festa', 'O laranja inunda a tela a partir do pingo; a logo fica branca.', 'acorde "tcharam"'),
 (104, '', 'Losangos e bolinhas da própria logo estouram em volta.', 'chocalho'),
 (165, 'Final', 'Logo parada com zoom lento; o pingo dá um último pulinho (4,6 s).', 'acorde soando'),
]
cards = ''.join(f'''<div class="card">{f'<div class="ato">{a}</div>' if a else '<div class="ato vazio">·</div>'}
<img src="Vinheta169-{f:03d}.png"><div class="t">{f/30:.1f} s</div><p>{d}</p><div class="som">♪ {s}</div></div>''' for f, a, d, s in Q)
vert = ''.join(f'<div class="v"><img src="Vinheta916-{f:03d}.png"><div class="t">{f/30:.1f} s</div></div>' for f in [0, 22, 57, 96, 165])
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Inter;src:url(inter.woff2);font-weight:100 900}}
@page{{size:A4 landscape;margin:12mm}}
body{{font-family:Inter;color:#2a1a12;margin:0}}
h1{{font-size:26px;margin:0 0 4px;font-weight:800}} .sub{{font-size:13px;color:#7a6a60;margin-bottom:14px;line-height:1.5}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}}
.card{{break-inside:avoid}} .card img{{width:100%;border-radius:8px;border:1px solid #eee;display:block}}
.ato{{font-size:11px;font-weight:700;color:#E85E23;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;height:14px}} .vazio{{color:transparent}}
.t{{font-size:11px;font-weight:700;margin-top:5px}} p{{font-size:12px;margin:2px 0;line-height:1.35}} .som{{font-size:11px;color:#7a6a60}}
.vrow{{display:flex;gap:14px;margin-top:8px}} .v{{width:110px}} .v img{{width:100%;border-radius:8px;border:1px solid #eee}}
h2{{font-size:17px;margin:18px 0 4px}} .pg{{break-before:page}}
</style></head><body>
<h1>Vinheta "life" · quadros-chave para aprovação</h1>
<div class="sub">6 s · 120 BPM · a bolinha laranja carrega a história do começo ao fim: quica, vira o losango, as letras pulam, o pingo do i volta pro lugar e a cor explode a partir dele.<br>
Logo redesenhada em vetor a partir do PNG (anel geométrico exato, letras com os contornos do original suavizados). Cores: laranja da logo #E85E23, branco e um amarelo sol #FFC83D só nos confetes.</div>
<div class="grid">{cards}</div>
<div class="pg"></div>
<h2>Versão 9:16 (Reels, TikTok, Status)</h2><div class="sub">Mesma história; a logo fica maior e o quique ganha altura em vez de largura.</div>
<div class="vrow">{vert}</div>
<h2>Som (feito sob medida, sem licença de terceiros)</h2>
<div class="sub">Ukulele e palmas a 120 BPM no fundo; cada ação tem seu efeito no quadro exato: boing em cada quique, pop quando vira o losango, marimba subindo nas letras, assobio caindo no pingo e um "tcharam" com palmas quando a cor explode. Master em -14 LUFS.</div>
</body></html>'''
open('quadros-chave.html', 'w').write(html)
