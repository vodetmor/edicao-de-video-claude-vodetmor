# Gera o roteiro (PDF + TXT só de fala) da questão da tangente, ENEM 2025.
# Uso: python3 gera.py   (PDF via chromium headless)
import html, subprocess, pathlib

AQUI = pathlib.Path(__file__).resolve().parent
SAIDA = AQUI.parent

BLOCOS = [
    ("0 · Gancho", "0:00 – 0:10", [
        ("Essa é a questão mais difícil do ENEM 2025. E eu vou te mostrar que dá pra resolver olhando pro desenho.",
         "Primeiro quadro = último quadro (loop). Figura do INEP recriada em Manim: copo à esquerda, gráfico à direita. A água sobe e um ponto corre pela curva, ligados por tracejado azul. Texto no topo: \"A questão mais difícil do ENEM 2025\"."),
    ]),
    ("1 · O que a questão pede", "0:10 – 0:35", [
        ("A questão diz o seguinte: um copo está sendo enchido com vazão constante, ou seja, entra a mesma quantidade de água a cada minuto. D é a altura da água e T é o tempo.",
         "Enunciado na tela em texto limpo; marca-texto (fundo colorido, nunca linha sobre o texto) em \"vazão constante\", \"D\" e \"T\". Setas curtas: D até o nível da água, T até o eixo horizontal."),
        ("Essa altura segue a função D = k + tg[p(T + m)]. E a pergunta é: quanto valem k, p e m?",
         "A fórmula cresce no centro, k, p e m em três cores fixas. Embaixo nascem três caixinhas com \"?\": k, m, p. Essa é a trilha do vídeo: elas ficam no rodapé até o fim e vão sendo preenchidas."),
    ]),
    ("2 · Por que o gráfico tem esse formato", "0:35 – 1:15", [
        ("Antes da conta, vamos entender o desenho. A água entra sempre no mesmo ritmo, mas a altura não sobe no mesmo ritmo: depende da largura do copo.",
         "Torneira com fluxo fixo. Etiqueta \"mesma água por minuto\"."),
        ("Pensa num cubo: toda camada tem o mesmo tamanho, então a altura sobe sempre igual. O gráfico é uma reta.",
         "Cubo pequeno enchendo em camadas iguais; ao lado, a reta se desenha junto."),
        ("Agora, esse copo. Embaixo ele é estreito: pouca água já sobe bastante, e a curva sobe rápido. No meio ele é largo: precisa de muita água pra subir um pouquinho, e a curva quase deita. Em cima, estreita de novo, e a curva acelera.",
         "O vaso do INEP enchendo em fatias de mesmo volume: finas embaixo e em cima, grossas no meio. Cada fatia aparece também no gráfico, no trecho correspondente. \"rápido / devagar / rápido\" ao lado da curva, sem cruzar linhas."),
        ("Rápido, devagar, rápido. E o meio, onde a curva é mais deitada, é o ponto (2,5 ; 30). Guarda esse ponto: ele é a chave.",
         "Faixa ligando a parte mais larga do copo ao ponto (2,5 ; 30), que pulsa e ganha a etiqueta \"centro\". Fica marcado até o fim."),
    ]),
    ("3 · A tangente original", "1:15 – 2:00", [
        ("Esse formato, rápido, devagar, rápido, é o formato da tangente. Então vamos ver a tangente mais simples de todas: y = tg x.",
         "O copo sai de cena. Plano limpo com y = tg x sendo traçado (rápido círculo trigonométrico no canto: o segmento tg téta crescendo na reta x = 1 e virando o gráfico)."),
        ("Ela tem um centro, no ponto (0 ; 0). E dos lados ela tem duas paredes que nunca toca: as assíntotas, em −π/2 e π/2. Perto delas, a curva dispara pro infinito.",
         "Ponto central (0 ; 0) acende. Assíntotas pontilhadas em verde (estilo INEP) em ±π/2; a curva corre para cima e para baixo perto delas."),
        ("E a distância de uma assíntota até a outra é π. Essa é a largura de cada pedaço. Então guarda três coisas: o centro está em x = 0, na altura 0, e a largura é π.",
         "Chave entre as assíntotas: \"largura = π\". Aparece uma ficha da tangente original: centro em x = 0 · altura 0 · largura π."),
    ]),
    ("4 · A ideia que resolve tudo", "2:00 – 2:20", [
        ("Agora a ideia que resolve a questão: o gráfico do copo é essa mesma tangente, só que levantada, arrastada pro lado e esticada. E cada número da fórmula faz um desses movimentos. É só comparar as duas.",
         "A tangente original (cinza, fantasma) se move até virar a curva da questão: sobe, desliza para a direita, estica. Volta ao início e as três caixinhas do rodapé ganham legenda: k = subir · m = lado · p = esticar."),
    ]),
    ("5 · Passo 1: o k", "2:20 – 2:40", [
        ("Passo 1: o k. O k é quanto a tangente subiu. O centro estava na altura 0. Na questão, o centro está na altura 30. Subiu 30. Então k = 30.",
         "Fantasma e curva da questão lado a lado; seta vertical do centro (0 ; 0) até a altura 30. A caixinha k vira \"30\" com um check."),
    ]),
    ("6 · Passo 2: o m", "2:40 – 3:10", [
        ("Passo 2: o m. O m é quanto ela andou pro lado. O centro estava em T = 0 e foi pra T = 2,5. Andou 2,5 pra direita.",
         "Seta horizontal do centro em 0 até 2,5 no eixo T."),
        ("Mas cuidado com a pegadinha: o centro é onde o parêntese vale zero. T + m = 0, com T = 2,5. Então m = −2,5, ou −5/2. Andou pra direita, o m fica negativo.",
         "T + m = 0 → 2,5 + m = 0 → m = −5/2, escrito passo a passo. A caixinha m vira \"−5/2\" com check."),
    ]),
    ("7 · Passo 3: o p", "3:10 – 3:45", [
        ("Passo 3: o p. O p estica ou espreme. A largura original era π. Na questão, a largura é a distância entre as assíntotas: (5 + 2π)/2 − (5 − 2π)/2. Os 5 se cancelam e sobra 4π/2, que é 2π.",
         "Chave entre as assíntotas verdes da figura. A subtração aparece; os dois 5 acendem e somem juntos (sem risco por cima), fica 4π/2 = 2π."),
        ("A largura foi de π pra 2π: dobrou. E pra esticar o dobro, o p tem que ser a metade, porque a largura nova é sempre π/p. Então p = ½.",
         "Comparação: largura π (fantasma) × largura 2π (questão). π/p = 2π → p = ½. A caixinha p vira \"½\" com check."),
    ]),
    ("8 · Resposta e loop", "3:45 – 4:10", [
        ("Juntando os três: D = 30 + tg[½(T − 5/2)]. Alternativa E.",
         "As três caixinhas voam para dentro da fórmula. As cinco alternativas aparecem; a E acende."),
        ("E o segredo pra prova: o k é sempre a altura do centro. Só com o 30 você já elimina A, B e C. E o centro em 2,5 elimina a D.",
         "A, B e C ficam cinzas e saem (sem riscar o texto). Em D, (T − 5) acende e marca T = 5 no eixo, longe do 2,5; D sai."),
        ("O copo desenhou o gráfico. E o gráfico deu a resposta.",
         "O copo esvazia e a câmera volta ao enquadramento do primeiro quadro. Último quadro = primeiro quadro."),
    ]),
]

NOTAS = [
    "<b>O fio condutor:</b> a questão vira uma comparação. A tangente simples (centro em 0, altura 0, largura π) é movida até virar o gráfico do copo; cada número da fórmula é um desses movimentos (k sobe, m arrasta, p estica). As três caixinhas no rodapé são o mapa: o espectador sempre sabe em que passo está e quanto falta.",
    "<b>Resposta conferida: alternativa E</b>, D = 30 + tg[½(T − 5/2)]. Assíntotas em ½(T − 5/2) = ±π/2, ou seja T = (5 ± 2π)/2, exatamente as do enunciado. A alternativa D tem o centro em T = 5, por isso cai.",
    "<b>A figura do INEP não está em escala.</b> Com a resposta E, D(0) ≈ 27 cm e D(4) ≈ 30,9 cm: na vida real a curva entre 0 e 4 minutos é quase plana. Nas cenas da questão a animação usa o desenho esquemático do INEP; só no bloco 3 (a tangente pura) o gráfico é em escala. Isso não entra na fala para não confundir (pode virar um comentário fixado).",
    "<b>Duração:</b> cerca de 550 palavras, uns 4:00 no seu ritmo. As pausas marcadas na animação são onde a música sobe.",
    "<b>Como gravar no WhatsApp:</b> um áudio por bloco (9 áudios). Se errar uma frase, respira e repete a frase inteira no mesmo áudio; eu corto. Lugar silencioso, celular a um palmo da boca. Eu converto o ogg, limpo o ruído e nivelo o volume.",
    "<b>Números:</b> em algarismos e fórmulas. Leia do seu jeito.",
]

def html_doc():
    linhas = []
    for titulo, tempo, trechos in BLOCOS:
        linhas.append(f'<tr class="bloco"><td colspan="2"><span>{html.escape(titulo)}</span><em>{tempo}</em></td></tr>')
        for fala, anim in trechos:
            linhas.append(f"<tr><td class='fala'>{html.escape(fala)}</td><td class='anim'>{html.escape(anim)}</td></tr>")
    notas = "".join(f"<li>{n}</li>" for n in NOTAS)
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Roteiro questão da tangente</title>
<style>
@page {{ size: A4; margin: 16mm 14mm; }}
body {{ font-family: Inter, 'Helvetica Neue', Arial, sans-serif; color:#1d1d1f; background:#fff; font-size:10.5pt; line-height:1.45; }}
h1 {{ font-size:20pt; margin:0 0 2px; letter-spacing:-.02em; }}
.sub {{ color:#6e6e73; margin:0 0 14px; }}
table {{ width:100%; border-collapse:collapse; }}
th {{ text-align:left; font-size:9pt; color:#6e6e73; font-weight:600; padding:4px 8px; border-bottom:1px solid #d2d2d7; }}
td {{ vertical-align:top; padding:7px 8px; border-bottom:1px solid #ececf0; }}
td.fala {{ width:52%; font-size:11.5pt; }}
td.anim {{ color:#3a3a3c; font-size:9.5pt; background:#f5f5f7; }}
tr.bloco td {{ padding-top:14px; border-bottom:2px solid #0071e3; }}
tr.bloco span {{ font-weight:700; font-size:12pt; }}
tr.bloco em {{ float:right; color:#6e6e73; font-style:normal; }}
tr {{ page-break-inside:avoid; }}
tr.bloco {{ break-after:avoid; page-break-after:avoid; }}
.notas {{ margin-top:18px; padding:10px 14px; background:#f5f5f7; border-radius:12px; font-size:9.5pt; }}
.notas li {{ margin:4px 0; }}
</style></head><body>
<h1>Questão da tangente · ENEM 2025</h1>
<p class="sub">Roteiro de narração (sua voz, sem rosto) · animação em Manim · versão 4 (em passos) · cerca de 4:00</p>
<table><tr><th>Você fala</th><th>A animação mostra</th></tr>
{''.join(linhas)}</table>
<div class="notas"><b>Notas</b><ul>{notas}</ul></div>
</body></html>"""

def txt_fala():
    out = []
    for titulo, tempo, trechos in BLOCOS:
        out.append(f"[{titulo}]  ({tempo})")
        out.append(" ".join(f for f, _ in trechos))
        out.append("")
    return "\n".join(out)

if __name__ == "__main__":
    (AQUI / "roteiro.html").write_text(html_doc(), encoding="utf-8")
    (SAIDA / "ROTEIRO-SO-FALA.txt").write_text(txt_fala(), encoding="utf-8")
    palavras = sum(len(f.split()) for _, _, t in BLOCOS for f, _ in t)
    print("palavras:", palavras)
    subprocess.run(["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "--headless", "--no-sandbox",
                    "--no-pdf-header-footer", f"--print-to-pdf={SAIDA/'roteiro-questao-tangente.pdf'}",
                    (AQUI / "roteiro.html").as_uri()], check=True)
