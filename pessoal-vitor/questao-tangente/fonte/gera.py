# Gera o roteiro (PDF + TXT só de fala) da questão da tangente, ENEM 2025.
# Uso: python3 gera.py   (PDF via chromium headless)
import html, subprocess, pathlib

AQUI = pathlib.Path(__file__).resolve().parent
SAIDA = AQUI.parent

BLOCOS = [
    ("0 · Gancho", "0:00 – 0:12", [
        ("Essa é a questão mais difícil do ENEM 2025. Um copo enchendo de água... e uma função tangente. Até o fim desse vídeo, você vai resolver ela sozinho. Mesmo que nunca tenha entendido tangente.",
         "Primeiro quadro = último quadro (loop). Figura do INEP recriada em Manim: copo à esquerda, gráfico à direita. A água sobe e um ponto corre pela curva, ligados por tracejado azul. Texto no topo: \"A questão mais difícil do ENEM 2025\"."),
    ]),
    ("1 · O que a questão pede", "0:12 – 0:32", [
        ("A questão diz: um copo é enchido com vazão constante, a mesma quantidade de água por minuto. D é a altura da água, T é o tempo, e a altura segue D = k + tg[p(T + m)]. A pergunta: quanto valem k, p e m?",
         "Enunciado resumido na tela; marca-texto (fundo colorido, nunca linha sobre o texto) em \"vazão constante\", \"D\" e \"T\". A fórmula cresce com k, p e m em três cores fixas. Nascem três caixinhas com \"?\" no rodapé: a trilha do vídeo, preenchida no fim."),
    ]),
    ("2 · O copo desenha o gráfico", "0:32 – 1:00", [
        ("Primeiro, o desenho. Num cubo, toda camada é igual, então a altura sobe sempre no mesmo ritmo: o gráfico é uma reta. Mas esse copo é estreito, largo, estreito. Onde é estreito, pouca água já sobe bastante: rápido. Onde é largo, sobe devagar.",
         "Cubo pequeno enchendo em camadas iguais com a reta ao lado (3 s). Depois o vaso do INEP enchendo em fatias de mesmo volume: finas embaixo e em cima, grossas no meio; cada fatia aparece também no gráfico. \"rápido / devagar / rápido\" ao lado da curva."),
        ("Rápido, devagar, rápido. E o meio, onde a curva quase deita, é o ponto (2,5 ; 30). Guarda ele. Mas por que isso é uma tangente?",
         "Ponto (2,5 ; 30) pulsa e fica marcado. A pergunta \"por que tangente?\" aparece na tela e a câmera entra num plano limpo."),
    ]),
    ("3 · O que é tangente (do zero)", "1:00 – 2:00", [
        ("Esquece a fórmula. Pensa numa rampa. A tangente de um ângulo diz quanto a rampa sobe pra cada 1 passo que você anda pra frente.",
         "Uma rampa (segmento grosso) presa na origem, com um bonequinho/bolinha em cima. Régua mostrando \"anda 1\" na horizontal e \"sobe ?\" na vertical. Ângulo téta marcado."),
        ("Rampa deitada, ângulo 0: não sobe nada. Tangente de 0 é 0. Rampa a 45°: anda 1, sobe 1. Tangente de 45° é 1. Levanta mais. 60°: sobe quase 2. 80°: sobe quase 6.",
         "A rampa vai girando; ao lado, um contador grande: tg téta = 0 → 1 → 1,7 → 5,7. O degrau \"sobe\" cresce e sai do quadro."),
        ("E em 90°? A rampa virou uma parede. Não tem como andar pra frente. A tangente não existe ali: ela dispara pro infinito. Essa parede é a assíntota. E se a rampa descer, a tangente fica negativa.",
         "A rampa encosta na vertical; a parede vira uma reta verde pontilhada (o mesmo estilo das assíntotas do INEP). Pausa curta, a música sobe. Depois a rampa gira para baixo e o contador fica negativo."),
        ("Agora joga tudo num gráfico: embaixo o ângulo, em cima a tangente. Olha a curva: passa pelo 0, dispara perto das paredes, e de uma parede até a outra são 180°, que é π. Depois disso a rampa volta à mesma posição, e o desenho se repete.",
         "Cada posição da rampa deixa um ponto no gráfico ao lado, que vai formando y = tg téta. Assíntotas verdes em −π/2 e π/2. Chave \"largura = π (180°)\". Mais dois ramos aparecem repetidos."),
        ("Rápido, devagar, rápido. É o formato do copo. Guarda 3 coisas dessa tangente: o centro está no 0, na altura 0, e a largura é π.",
         "Um ramo faz morph sobre a curva do vaso e encaixa. Aparece a \"ficha da tangente original\": centro em 0 · altura 0 · largura π."),
    ]),
    ("4 · Como mexer num gráfico", "2:00 – 3:05", [
        ("Só que o gráfico do copo não está no 0. Ele foi movido. E pra mover um gráfico, existem só 3 movimentos. Cada letra da fórmula faz um.",
         "A tangente original (cinza) e a curva do copo lado a lado. As três caixinhas do rodapé acendem: k, m, p."),
        ("Primeiro: somar um número fora. k + tg. Isso soma k em todos os pontos: o gráfico inteiro sobe, como um elevador. Com +30, sobe 30.",
         "Ícone de elevador ao lado de k. Controle deslizante: k de 0 a 30, o gráfico sobe inteiro; o centro acompanha com a etiqueta \"altura = k\"."),
        ("Segundo: somar dentro do parêntese. Aí o gráfico anda pro lado, mas ao contrário do sinal. Por quê? O centro acontece quando o que está dentro dá 0. Em tg(T − 2), isso só acontece em T = 2. O centro andou 2 pra direita. Menos dentro: direita. Mais dentro: esquerda.",
         "Ícone de esteira ao lado de m. Escrito: T − 2 = 0 → T = 2. O gráfico desliza 2 para a direita; o centro deixa um rastro de 0 até 2. Depois tg(T + 2) desliza para a esquerda."),
        ("Terceiro: multiplicar dentro. Isso muda a velocidade. Com p = 2, tudo acontece 2 vezes mais rápido: o gráfico espreme, a largura cai pela metade. Com p = ½, tudo acontece 2 vezes mais devagar: estica, a largura dobra. A regra é: largura = π/p.",
         "Ícone de sanfona ao lado de p. Controle de p: em p = 2 as assíntotas se aproximam (largura π/2); em p = ½ se afastam (largura 2π). A chave da largura atualiza ao vivo; aparece \"largura = π/p\"."),
        ("Pronto. Agora você sabe tudo que precisa. É só comparar o gráfico do copo com a tangente original.",
         "Os três ícones (elevador, esteira, sanfona) se alinham no rodapé, nas caixinhas. Volta a figura do INEP."),
    ]),
    ("5 · Resolvendo: k, m e p", "3:05 – 4:15", [
        ("O k, o elevador. O centro estava na altura 0, e no copo está na altura 30. Subiu 30: k = 30.",
         "Fantasma da tangente original sobre a figura. Seta vertical do centro até a altura 30. A caixinha k vira \"30\" com check."),
        ("O m, a esteira. O centro estava em 0 e foi pra 2,5. Andou pra direita, então dentro do parêntese é menos: T − 2,5. m = −5/2.",
         "Seta horizontal de 0 até 2,5. Escrito: T + m = 0 → 2,5 + m = 0 → m = −5/2. A caixinha m vira \"−5/2\" com check."),
        ("E dá pra conferir: 2,5 fica exatamente no meio das duas assíntotas da figura. Some as duas e divida por 2: os 2π se cancelam e dá 2,5.",
         "As duas assíntotas verdes piscam com (5 − 2π)/2 e (5 + 2π)/2. Conta: os ±2π acendem e somem juntos (sem risco), fica 5 ÷ 2 = 2,5."),
        ("O p, a sanfona. A largura original era π. No copo, a largura é a distância entre as assíntotas: (5 + 2π)/2 − (5 − 2π)/2. Os 5 se cancelam e sobra 2π. A largura dobrou: o gráfico esticou, então p = ½.",
         "Chave entre as assíntotas: 4π/2 = 2π. Comparação lado a lado: largura π (fantasma) × 2π (copo). π/p = 2π → p = ½. A caixinha p vira \"½\" com check."),
    ]),
    ("6 · Resposta e loop", "4:15 – 4:45", [
        ("Juntando os três: D = 30 + tg[½(T − 5/2)]. Alternativa E.",
         "As três caixinhas voam para dentro da fórmula. As cinco alternativas aparecem; a E acende."),
        ("E o atalho pra prova: o k é sempre a altura do centro. Só com o 30 você já elimina A, B e C. E o centro em 2,5 elimina a D.",
         "A, B e C ficam cinzas e saem (sem riscar o texto). Em D, (T − 5) acende e marca T = 5 no eixo, longe do 2,5; D sai."),
        ("O copo desenhou o gráfico. E o gráfico deu a resposta.",
         "O copo esvazia e a câmera volta ao enquadramento do primeiro quadro. Último quadro = primeiro quadro."),
    ]),
]

NOTAS = [
    "<b>O caminho do vídeo:</b> a questão (o que pede) → o copo (por que a curva tem esse formato) → a tangente do zero, pela ideia da rampa → os 3 movimentos de um gráfico (elevador, esteira, sanfona) → aplicar os 3 na questão → resposta e atalho. Cada parte termina com uma pergunta ou um \"guarda isso\" que puxa a próxima.",
    "<b>Para prender até o fim:</b> a promessa no gancho (\"você vai resolver sozinho\"), as 3 caixinhas no rodapé que só se completam no fim, um ícone fixo para cada letra (elevador, esteira, sanfona) e a volta ao primeiro quadro (loop).",
    "<b>Resposta conferida: alternativa E</b>, D = 30 + tg[½(T − 5/2)]. Assíntotas em ½(T − 5/2) = ±π/2, ou seja T = (5 ± 2π)/2, exatamente as do enunciado. A alternativa D tem o centro em T = 5, por isso cai. Valores da rampa: tg 60° ≈ 1,7 e tg 80° ≈ 5,7.",
    "<b>A figura do INEP não está em escala.</b> Com a resposta E, D(0) ≈ 27 cm e D(4) ≈ 30,9 cm: a curva real entre 0 e 4 minutos é quase plana. As cenas da questão usam o desenho esquemático do INEP; só os blocos 3 e 4 usam gráfico em escala. Fica fora da fala (pode virar comentário fixado).",
    "<b>Duração:</b> cerca de 660 palavras, uns 4:45 no seu ritmo. As pausas marcadas são onde a música sobe.",
    "<b>Como gravar no WhatsApp:</b> um áudio por bloco (7 áudios). Se errar uma frase, respira e repete a frase inteira no mesmo áudio; eu corto. Lugar silencioso, celular a um palmo da boca. Eu converto o ogg, limpo o ruído e nivelo o volume.",
    "<b>Números:</b> em algarismos e fórmulas. Leia do seu jeito; \"téta\" é o ângulo.",
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
<p class="sub">Roteiro de narração (sua voz, sem rosto) · animação em Manim · versão 5 (do zero, com tangente e transformações) · cerca de 4:45</p>
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
