# Quadros-chave para aprovação: tira stills dos renders -qm e monta PDF (história por etapa + quadro + fala + o que acontece)
import json, subprocess, pathlib, html
D = pathlib.Path("/mnt/project-files/pessoal-vitor/questao-tangente"); OUT = D / "quadros-chave"; OUT.mkdir(exist_ok=True)
V = pathlib.Path("/root/mm/videos/questao/720p30")
P = json.load(open(D / "audio/palavras.json")); PA = json.load(open(D / "audio/pausas.json"))
LIM = [0.0] + [p["de"] for p in PA] + [P[-1]["e"] + 2.4]
CENAS = ["C0Gancho", "C1Questao", "C2Desenho", "C3Tangente", "C4Movimentos", "C5Resolve", "C6Resposta"]
ETAPAS = [
  ("Gancho", "O copo e o gráfico da questão já aparecem prontos. A água sobe e desenha a curva: a promessa do vídeo é que o próprio desenho dá a resposta."),
  ("A questão", "Enquanto você lê, a figura do INEP é redesenhada peça por peça (copo, torneira, eixos, curva, assíntotas). No fim ficam as três caixas k, m, p com interrogação: o mapa do vídeo."),
  ("1 · O desenho", "Em 3D: primeiro o cubo enche no mesmo ritmo e o gráfico vira uma reta. Depois o vaso: camadas de mesmo volume, rápido onde é estreito, devagar onde é largo. Por isso a curva tem cara de tangente."),
  ("2 · O que é tangente", "Tangente do zero, como uma rampa: quanto sobe para cada 1 que anda. 45° sobe 1, 80° quase 6, 90° vira parede (a assíntota). A rampa desenha o gráfico, que se repete a cada π."),
  ("3 · Como mexer num gráfico", "Os três movimentos com nomes fáceis: k elevador (sobe), m esteira (anda ao contrário do sinal), p sanfona (largura vira π/p). A tangente original fica cinza de fundo para comparar."),
  ("4 · Resolvendo", "A tangente original (cinza) é movida até cair em cima do gráfico do copo: elevador até 30, esteira até 2,5, conferência pelo meio das assíntotas, sanfona dobrando a largura. As caixas k, m, p vão sendo preenchidas."),
  ("Resposta", "Os valores das caixas voam para a fórmula, aparecem as cinco alternativas e a E acende. Atalho de prova: o 30 elimina A, B e C; o centro 2,5 elimina D. Fecha voltando ao primeiro quadro (loop)."),
]
QUADROS = [  # (tempo global, o que acontece)
  (0.0, "Quadro 0 e último quadro (loop): título + copo + gráfico."),
  (14.0, "A questão sendo redesenhada: copo, torneira, vazão constante destacada."),
  (24.0, "Figura completa com a fórmula e as caixas k, m, p."),
  (42.0, "Cubo em 3D enchendo em camadas iguais; o gráfico ao lado é uma reta."),
  (60.0, "Vaso em 3D com camadas de mesmo volume, cada uma com a sua cor no gráfico."),
  (75.0, "Rampa: o contador mostra quanto ela sobe para cada 1 que anda."),
  (105.5, "Rampa vira parede em 90°: nasce a assíntota."),
  (135.0, "O gráfico se repete a cada π; ficha da tangente original no topo."),
  (160.5, "k elevador: o gráfico inteiro sobe."),
  (186.0, "m esteira: menos dentro anda para a direita, mais dentro para a esquerda."),
  (208.0, "p sanfona: largura = π/p."),
  (241.5, "Esteira até 2,5: m = −5/2 entra na caixa."),
  (271.8, "Largura dobrou: a tangente cinza estica e cai em cima do gráfico do copo."),
  (286.0, "Fórmula montada e alternativa E destacada."),
  (295.5, "Atalho: A, B e C eliminadas pelo 30."),
]
def cena(t):
    for i in range(len(CENAS)):
        if LIM[i] <= t < LIM[i + 1]: return i
    return len(CENAS) - 1
def fala(t, raio=2.2):
    return " ".join(x["w"] for x in P if t - raio <= x["s"] <= t + raio)
blocos = {}
for n, (t, o) in enumerate(QUADROS, 1):
    i = cena(t); img = OUT / f"q{n:02d}.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t - LIM[i]):.3f}", "-i", str(V / f"{CENAS[i]}.mp4"), "-frames:v", "1", str(img)], check=True)
    m, s = divmod(t, 60)
    blocos.setdefault(i, []).append(f"""<div class="q"><img src="{img.name}"><div class="leg"><span class="n">{n} · {int(m)}:{s:04.1f}</span>
<p class="o">{html.escape(o)}</p><p class="f">“{html.escape(fala(t))}”</p></div></div>""")
corpo = "".join(f"""<section><h2>{html.escape(ETAPAS[i][0])}</h2><p class="h">{html.escape(ETAPAS[i][1])}</p><div class="g">{''.join(blocos.get(i, []))}</div></section>""" for i in range(len(ETAPAS)))
doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: A4 landscape; margin: 12mm; }}
body {{ font-family: Inter, Arial, sans-serif; color:#1d1d1f; font-size:9.5pt; line-height:1.4; }}
h1 {{ font-size:18pt; margin:0 0 2px; }} .sub {{ color:#86868b; margin:0 0 10px; }}
section {{ break-inside: avoid; margin-bottom:10px; }} h2 {{ font-size:12.5pt; margin:8px 0 2px; color:#0071e3; }} .h {{ margin:0 0 6px; }}
.g {{ display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; }}
.q img {{ width:100%; border-radius:8px; border:1px solid #d2d2d7; display:block; }}
.n {{ font-weight:600; }} .o {{ margin:3px 0 1px; }} .f {{ margin:0; color:#86868b; font-style:italic; }}
</style></head><body><h1>Questão da tangente · quadros-chave</h1>
<p class="sub">Vídeo de 5:02 com a sua voz (cortes padrão, pausas de transição entre as etapas). Cada quadro é um frame real do render. Falta depois da aprovação: legendas, música, efeitos e render em alta.</p>
{corpo}</body></html>"""
(OUT / "quadros.html").write_text(doc, encoding="utf-8")
subprocess.run(["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "--headless", "--no-sandbox", "--no-pdf-header-footer",
                f"--print-to-pdf={OUT / 'quadros-chave-questao-tangente.pdf'}", (OUT / "quadros.html").as_uri()], check=True, capture_output=True)
print("ok", len(QUADROS))
