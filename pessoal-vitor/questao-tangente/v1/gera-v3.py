# Gera o roteiro (PDF + TXT só de fala) da questão da tangente, ENEM 2025.
# Uso: python3 gera.py   (PDF via chromium headless)
import html, subprocess, pathlib

AQUI = pathlib.Path(__file__).resolve().parent
SAIDA = AQUI.parent

BLOCOS = [
    ("0 · Gancho", "0:00 – 0:10", [
        ("Essa é a questão mais difícil do ENEM 2025. Mas o próprio desenho já entrega a resposta. Olha.",
         "Primeiro quadro = último quadro (loop). Figura do INEP recriada em Manim: copo à esquerda, gráfico à direita. A água sobe e um ponto corre pela curva, ligados por tracejado azul. Texto no topo: \"A questão mais difícil do ENEM 2025\"."),
    ]),
    ("1 · Lendo a questão", "0:10 – 0:55", [
        ("Primeiro, vamos ler. \"Um recipiente tem um formato que faz com que, ao ser enchido de água com uma vazão constante...\" Vazão constante: a mesma quantidade de água entra a cada minuto.",
         "Enunciado do INEP na tela, em texto limpo. Um marca-texto (fundo colorido, nunca linha sobre o texto) acompanha a leitura. \"vazão constante\" ganha cor; ao lado, uma torneira pequena com fluxo fixo."),
        ("\"...a distância D da lâmina de água ao tampo da mesa, em centímetro, aumente em relação ao tempo T, em minuto...\" Ou seja: D é a altura da água, e T é o tempo.",
         "\"D\" e \"T\" ganham cor. Setas curtas levam D até o nível da água no copo e até o eixo vertical; T até o eixo horizontal."),
        ("\"...de acordo com uma função do tipo D = k + tg[p(T + m)], sendo os parâmetros k, p e m números reais...\" É uma tangente com 3 números escondidos: k, p e m. Achar eles é a questão inteira.",
         "A fórmula sai do texto e cresce no centro, com k, p e m nas três cores fixas do vídeo e um \"?\" sobre cada um."),
        ("\"...para T variando entre 0 e 4 minutos, conforme ilustrado na figura, na qual estão apresentadas assíntotas verticais da função tangente.\" Assíntotas são essas retas verdes pontilhadas. Guarda elas, já já explico.",
         "A figura do INEP entra. O trecho de 0 a 4 do eixo T acende. As duas retas verdes piscam, com os valores (5 − 2π)/2 e (5 + 2π)/2 em destaque."),
        ("E o comando: \"A expressão algébrica que representa a relação entre D e T é...\" Repara nas alternativas: todas têm a mesma cara. O que muda são só os 3 números. Então bora descobrir k, p e m.",
         "As 5 alternativas aparecem empilhadas; em cada uma, só k, p e m ficam coloridos, o resto fica cinza. Volta a fórmula com os três \"?\"."),
    ]),
    ("2 · O copo desenha o gráfico", "0:55 – 1:25", [
        ("Agora, o desenho. Como a vazão é constante, a altura sobe conforme a largura do copo. Num cubo, sobe sempre igual: o gráfico é uma reta.",
         "Torneira com \"vazão constante\". Cubo pequeno enchendo em camadas iguais; ao lado, a reta se desenha. Rápido, uns 5 s."),
        ("Onde o copo é estreito, sobe rápido. Onde é largo, sobe devagar. Esse copo é estreito, largo, estreito. Então o gráfico é rápido, devagar, rápido.",
         "O vaso do INEP enchendo em fatias de mesmo volume: finas embaixo e em cima, grossas no meio. \"rápido / devagar / rápido\" aparece ao lado de cada trecho da curva, sem cruzar linhas."),
        ("E o ponto mais deitado é a parte mais larga: o ponto (2,5 ; 30).",
         "Faixa ligando a parte mais larga do copo ao ponto (2,5 ; 30), que pulsa e fica marcado até o fim."),
    ]),
    ("3 · Isso é uma tangente", "1:25 – 1:50", [
        ("E esse formato é o da tangente. Ela passa pelo zero, sobe pro infinito, vem do menos infinito, e nunca encosta nas assíntotas, aquelas retas verdes. E se repete a cada π.",
         "Círculo unitário rápido: o segmento tg téta cresce na reta x = 1 e é transportado para o gráfico y = tg x. Assíntotas pontilhadas em verde (estilo INEP). Chave \"período = π\". Um ramo faz morph e encaixa na curva do vaso."),
    ]),
    ("4 · Os três números", "1:50 – 2:20", [
        ("A questão mexe nela com três números. O k sobe o gráfico: é a altura do centro.",
         "Fórmula D = k + tg[p(T + m)] no topo, k, p e m em três cores fixas. Controle de k: o gráfico sobe, o centro acompanha."),
        ("O m arrasta pro lado: o centro fica onde o parêntese zera, em T = −m.",
         "Controle de m: o gráfico desliza; aparece T + m = 0 → T = −m."),
        ("E o p estica: o período vira π/p.",
         "Controle de p: as assíntotas se afastam, a chave do período mostra π/p."),
    ]),
    ("5 · Resolvendo", "2:20 – 2:55", [
        ("Agora lê o desenho. O centro é o meio das assíntotas: os 2π se cancelam, e dá 2,5. Altura 30. Então k = 30, e m = −5/2.",
         "Gráfico do INEP de volta. [(5 − 2π)/2 + (5 + 2π)/2] ÷ 2: os 2π acendem e somem juntos, fica 2,5. O ponto (2,5 ; 30) pulsa. k = 30 e m = −5/2 voam para dentro da fórmula."),
        ("A distância entre as assíntotas é 2π. π/p = 2π: p = ½. Alternativa E.",
         "Chave entre as assíntotas: 4π/2 = 2π. π/p = 2π → p = ½. Fórmula final D = 30 + tg[½(T − 5/2)]; as alternativas aparecem e a E acende."),
    ]),
    ("6 · Segredo e loop", "2:55 – 3:15", [
        ("E o segredo: nem precisava da conta. Centro na altura 30? Sobram D e E. Na D, o centro cai em T = 5. Não é. Resposta E.",
         "Alternativas na tela. \"k = 30\": A, B e C ficam cinzas e saem (sem riscar o texto). Em D, o parêntese (T − 5) acende e marca T = 5 no eixo, longe do 2,5; D sai. Sobra E."),
        ("O formato do copo desenhou o gráfico... e o gráfico entregou a resposta.",
         "O copo esvazia e a câmera volta ao enquadramento do primeiro quadro. Último quadro = primeiro quadro."),
    ]),
]

NOTAS = [
    "<b>Leitura:</b> o texto entre aspas é o enunciado oficial do INEP, palavra por palavra; o que vem depois das aspas é o seu comentário. Leia o enunciado num tom e comente noutro, como professor.",
    "<b>Resposta conferida: alternativa E</b>, D = 30 + tg[½(T − 5/2)]. Assíntotas em ½(T − 5/2) = ±π/2, ou seja T = (5 ± 2π)/2, exatamente as do enunciado. A alternativa D tem o centro em T = 5, por isso cai.",
    "<b>A figura do INEP não está em escala.</b> Com a resposta E, D(0) ≈ 27 cm e D(4) ≈ 30,9 cm: na vida real a curva entre 0 e 4 minutos é quase plana. Nas cenas da questão a animação usa o desenho esquemático do INEP; só nos blocos 2 e 3 (a tangente pura) o gráfico é em escala. Isso não entra na fala para não confundir (pode virar um comentário fixado: \"repararam que o desenho não está em escala?\").",
    "<b>Duração:</b> cerca de 400 palavras, uns 3:00 a 3:15 no seu ritmo. As pausas marcadas na animação são onde a música sobe.",
    "<b>Como gravar no WhatsApp:</b> um áudio por bloco (7 áudios). Se errar uma frase, respira e repete a frase inteira no mesmo áudio; eu corto. Lugar silencioso, celular a um palmo da boca. Eu converto o ogg, limpo o ruído e nivelo o volume.",
    "<b>Números:</b> em algarismos e fórmulas, como você pediu. Leia do seu jeito.",
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
<p class="sub">Roteiro de narração (sua voz, sem rosto) · animação em Manim · versão 3 (com a leitura da questão) · cerca de 3:15</p>
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
