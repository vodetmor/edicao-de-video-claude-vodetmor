# Gera plano-quadros-chave.pdf (HTML -> Chromium headless). Uso: python3 gera_pdf.py
import subprocess, os
D = os.path.dirname(os.path.abspath(__file__))
FONTE = '/root/aula/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
Q = [
 (0, '0:00', 'Você chuta uma bola.', 'Bola de cetim preta em 3D (GLSL), num estúdio de papel infinito. O chute abre o vídeo.'),
 (230, '0:08', 'Essa curva tem nome, tem fórmula…', 'A câmera abre e a bola deixa fantasmas no caminho. Cada fantasma toca uma nota que sobe e desce com a altura: a parábola vira melodia.'),
 (400, '0:13', 'Isso é lançamento oblíquo.', 'Entra o título. A câmera 3D termina exatamente de lado, e o palco 2D assume sem corte.'),
 (900, '0:30', 'Só pra baixo.', 'Rebobina a bola, desliga o vento e mostra o peso igual em todos os pontos: a<sub>x</sub> = 0, a<sub>y</sub> = −g.'),
 (1440, '0:48', 'vê zero xis, igual a vê zero vezes cosseno de teta', 'O vetor v₀ vira triângulo. O Manim deriva cos θ = adjacente / hipotenusa até v₀ₓ = v₀ cos θ = 12 m/s (e v₀ᵧ = 16 m/s).'),
 (2000, '1:07', 'Um não interfere no outro.', 'Voo com sombras nos dois eixos: a horizontal anda em passos iguais, a vertical sobe, freia e volta.'),
 (2850, '1:35', 'ípsilon igual a vê zero ípsilon vezes tê, menos…', 'Enquanto a voz fala a fórmula, a tela prova de onde ela vem: no gráfico v × t, a área (retângulo menos triângulo) vira y = v₀ᵧt − ½gt².'),
 (3460, '1:55', '(pausa de silêncio)', 'Elimina o t: t = x / v₀ₓ e chega em y = a·x − b·x². A trajetória é uma parábola, provado na tela.'),
 (4330, '2:24', 'a descida leva exatamente o mesmo tempo', 'Tempo de subida t<sub>s</sub> = v₀ sin θ / g = 1,6 s. A curva se dobra no topo (simetria) e dá T = 3,2 s.'),
 (4720, '2:37', 'a velocidade vertical zerou, mas a horizontal continua', 'Zoom no topo: a seta vertical some, a horizontal fica. “Ela não para.”'),
 (6240, '3:28', 'a fórmula mais bonita', 'A = v₀² sin 2θ / g no centro, grande; o resto escurece. Antes disso a tela monta A = v₀ₓ · T e a identidade 2 sin θ cos θ = sin 2θ.'),
 (7000, '3:53', '(pausa de silêncio)', 'Varre o ângulo: leque de trajetórias e o gráfico de sin 2θ ao vivo. O máximo cai em 45° (40 m).'),
 (7460, '4:09', 'O outro sobe alto e demora mais.', '30° (2,0 s) e 60° (3,5 s) caem no mesmo X, a 34,6 m, porque sin 120° = sin 60°.'),
 (7600, '4:13', 'Resumindo…', 'Replay em 3D: os dois rastros congelados e a câmera orbitando até o “mesmo ponto”.'),
 (7990, '4:26', 'Três fórmulas. Uma parábola.', 'Resumo: as equações base em cima e as três fórmulas em cartões.'),
 (8200, '4:33', 'você já sabe onde ela vai cair', 'Chute final em 3D. O X marca A = 38,4 m antes da bola chegar.'),
]
ATOS = [
 ('0:00–0:15', 'Gancho em 3D', 'Chute, voo com rastros musicais, título. Termina de lado para virar 2D sem corte.'),
 ('0:15–0:44', 'A regra do jogo', 'Rebobina, desliga o ar, o peso é a única força: aceleração só para baixo.'),
 ('0:44–1:09', 'Quebrar a velocidade', 'Triângulo de v₀, cosseno e seno derivados, 12 m/s e 16 m/s. Voo com sombras nos eixos.'),
 ('1:09–2:00', 'Os dois movimentos', 'MRU com marcas a cada 12 m. MUV pelo gráfico v × t e sua área. Elimina o t: parábola.'),
 ('2:00–3:38', 'As três perguntas', 'Tempo de subida e total, o topo “não para”, altura por Torricelli (12,8 m), alcance até a fórmula herói (38,4 m).'),
 ('3:38–4:37', 'Dois segredos e fechamento', '45° dá o alcance máximo; 30° e 60° caem juntos; replay 3D, resumo e chute final.'),
]
cards = ''.join(f'''<div class="q"><img src="quadros/q{q:04d}.png"><div class="cap"><b>{t}</b><span class="fala">{fala}</span><p>{o}</p></div></div>''' for q, t, fala, o in Q)
atos = ''.join(f'<tr><td class="t">{a}</td><td><b>{b}</b><br>{c}</td></tr>' for a, b, c in ATOS)
html = f'''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>
@font-face{{font-family:Inter;src:url(file://{FONTE}) format("woff2");font-weight:100 900}}
@page{{size:A4 landscape;margin:14mm}}
body{{font-family:Inter;color:#1D1D1F;background:#fff;margin:0;font-size:10pt;line-height:1.4}}
h1{{font-size:26pt;font-weight:700;letter-spacing:-.02em;margin:0 0 2mm}} h2{{font-size:16pt;margin:0 0 4mm;font-weight:650}}
.sub{{color:#86868B;font-size:12pt;margin-bottom:3mm}}
.num{{display:flex;gap:6mm;margin:3mm 0 6mm}} .num div{{background:#F5F5F7;border-radius:4mm;padding:4mm 5mm;flex:1}} .num b{{display:block;font-size:18pt}}
.pg{{page-break-after:always}}
table{{border-collapse:collapse;width:100%}} td{{padding:1.6mm 3mm;border-top:1px solid #e3e3e6;vertical-align:top}} td.t{{color:#0071E3;white-space:nowrap;font-weight:600;width:28mm}}
ul{{margin:0;padding-left:5mm}} li{{margin-bottom:1.6mm}}
.grid{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm 6mm}}
.q{{break-inside:avoid}} .q img{{width:100%;border-radius:2mm;border:1px solid #e3e3e6;display:block}}
.cap{{padding:1.6mm 0 0}} .cap b{{color:#0071E3;margin-right:2mm}} .fala{{font-style:italic;color:#555}} .cap p{{margin:1mm 0 0;font-size:9pt;line-height:1.35}} .cap{{font-size:9.5pt}}
.duas{{display:grid;grid-template-columns:1.25fr 1fr;gap:10mm}}
</style><body>
<div class="pg"><h1>Lançamento oblíquo</h1><div class="sub">Plano, storytelling e quadros-chave para aprovação antes do render final</div>
<div class="num"><div><b>4:37</b>duração (voz de 3:46 + 51 s de pausas para ver a coisa acontecer)</div><div><b>v₀ = 20 m/s, θ ≈ 53°</b>um único exemplo do início ao fim (sin θ = 0,8; cos θ = 0,6; g = 10)</div><div><b>12,8 m · 3,2 s · 38,4 m</b>altura máxima, tempo total e alcance, calculados na tela</div></div>
<div class="duas"><div><h2>Storytelling em 6 atos</h2><table>{atos}</table></div>
<div><h2>Como foi construído</h2><ul>
<li><b>3D em GLSL</b> (nossa camada de shaders): gancho, replay dos dois ângulos e chute final.</li>
<li><b>Palco 2D em Remotion</b>: trajetória em escala real, vetores, sombras nos eixos, leque de ângulos, câmera que dá zoom.</li>
<li><b>Manim</b>: todas as derivações, inclusive as que a voz não fala (área do gráfico, eliminação do t, identidade do seno).</li>
<li><b>20 pausas</b> cortadas no silêncio da voz, para as derivações respirarem.</li>
<li><b>Som</b>: cada fantasma do voo é uma nota da escala pentatônica que acompanha a altura da bola; batidas, ticks e whooshes sincronizados à palavra; trilha “Inspired” (Kevin MacLeod, CC BY 4.0) que abaixa sob a voz e volta nas pausas. Master em −14 LUFS.</li>
<li><b>Legendas</b> em todo o vídeo, com as fórmulas escritas como fórmula; quando uma derivação ocupa a parte de baixo, a legenda desvia para o lado livre.</li>
</ul></div></div></div>
<h2>Quadros-chave (frames reais do render)</h2><div class="grid">{cards}</div>
</body></html>'''
open(f'{D}/plano.html', 'w').write(html)
subprocess.run(['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '--headless', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files',
                '--no-pdf-header-footer', f'--print-to-pdf={D}/plano-quadros-chave.pdf', f'file://{D}/plano.html'], check=True, capture_output=True)
print('ok')
