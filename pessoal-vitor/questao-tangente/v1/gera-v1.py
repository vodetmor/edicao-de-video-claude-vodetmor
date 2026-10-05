# Gera o roteiro (PDF + TXT só de fala) da questão da tangente, ENEM 2025.
# Uso: python3 gera.py   (PDF via chromium headless)
import html, subprocess, pathlib

AQUI = pathlib.Path(__file__).resolve().parent
SAIDA = AQUI.parent

BLOCOS = [
    ("0 · Gancho", "0:00 – 0:15", [
        ("Essa é considerada uma das questões mais difíceis do ENEM 2025. Um copo enchendo de água... e uma função tangente. Parece impossível. Mas no final eu vou te mostrar como resolver ela em trinta segundos.",
         "Primeiro quadro = último quadro (loop). A figura do INEP recriada em Manim: copo sobre o tampo da mesa à esquerda, gráfico à direita. A água sobe no copo e, ao mesmo tempo, um ponto corre pela curva, ligados por uma linha tracejada azul (como no INEP). Texto fixo no topo: \"A questão mais difícil do ENEM 2025\"."),
    ]),
    ("1 · O formato do copo desenha o gráfico", "0:15 – 1:10", [
        ("Antes de qualquer conta, entende o desenho. A torneira joga sempre a mesma quantidade de água por minuto. Isso é vazão constante. Mas a altura da água não sobe sempre no mesmo ritmo. Depende do formato do recipiente.",
         "Uma torneira com fluxo idêntico em três recipientes lado a lado. Etiqueta \"vazão constante\" acima da torneira."),
        ("Num cubo, cada minuto enche uma camada igualzinha. A altura sobe sempre no mesmo ritmo, e o gráfico é uma reta.",
         "Cubo enchendo em camadas iguais (fatias coloridas alternadas). Abaixo dele, o gráfico altura × tempo se desenha ao vivo: reta."),
        ("Num funil com a boca pra cima, o fundo é estreito: pouca água já sobe muito. Depois ele alarga, e a altura vai freando. O gráfico sobe rápido e vai deitando, parecido com um logaritmo.",
         "Funil (cone de ponta para baixo) enchendo; as fatias de mesmo volume ficam cada vez mais finas. Gráfico: curva que sobe rápido e deita."),
        ("Agora, o copo da questão. Embaixo ele é estreito: sobe rápido. No meio é largo: sobe devagar. Em cima estreita de novo: volta a acelerar. Rápido, devagar, rápido. Exatamente o formato dessa curva.",
         "O vaso do INEP enchendo com as mesmas fatias de volume: grossas no meio, finas embaixo e em cima. As palavras \"rápido / devagar / rápido\" aparecem ao lado de cada trecho da curva, sem cruzar nenhuma linha."),
        ("E repara: o ponto onde a curva está mais deitada é justamente onde o copo é mais largo. Aos dois minutos e meio, com trinta centímetros. Guarda esse ponto.",
         "Faixa horizontal ligando a parte mais larga do copo ao ponto (2,5 ; 30), que pulsa e ganha a etiqueta \"centro\". Ele fica marcado até o bloco 4."),
    ]),
    ("2 · O que é a tangente", "1:10 – 2:10", [
        ("Agora, a tangente. Desenha o círculo trigonométrico, de raio um, e pega um ângulo téta. A tangente de téta é seno sobre cosseno. E dá pra enxergar ela: é a altura onde o raio, prolongado, bate nessa reta vertical encostada no círculo.",
         "Círculo unitário em Manim. Ângulo téta varrendo. Reta vertical x = 1 tangente ao círculo. O raio se prolonga até ela; o segmento vertical de altura tg téta acende na cor da tangente. Fórmula tg téta = sen téta / cos téta escrita ao lado."),
        ("Ângulo zero: tangente zero. Aumenta o ângulo, e ela cresce. Chegando em noventa graus, o cosseno vai pra zero... e a tangente explode pro infinito. Ela nunca chega lá. Essa parede invisível é a assíntota vertical.",
         "Téta indo até perto de 90°: o segmento dispara para fora da tela, a câmera recua. O valor numérico de cos téta encolhe até 0. Pausa curta (deixa a música subir)."),
        ("Passando isso pra um gráfico: a tangente passa pela origem, sobe pro infinito perto de pi sobre dois, vem do menos infinito perto de menos pi sobre dois... e esse pedaço se repete a cada pi. Esse é o período da tangente: pi.",
         "O valor de tg téta é \"transportado\" para um gráfico y = tg x, traçado ao vivo. Assíntotas em ±π/2 pontilhadas em verde (mesmo estilo do INEP). Chave horizontal \"período = π\" entre duas assíntotas; mais dois ramos aparecem repetidos."),
        ("E olha o formato de cada pedaço: rápido, devagar, rápido. É o nosso copo.",
         "Um ramo da tangente se sobrepõe à curva do vaso (morph) e encaixa."),
    ]),
    ("3 · Mexendo na tangente", "2:10 – 3:10", [
        ("A questão pega essa tangente e mexe nela com três números: D igual a k, mais tangente de p, vezes T mais m. Cada um faz uma coisa só.",
         "Fórmula D = k + tg[p(T + m)] no topo, com k, p e m em três cores diferentes (as mesmas até o fim do vídeo)."),
        ("O k é o elevador. Soma k, e o gráfico inteiro sobe k. O centro, que estava no zero, vai pra altura k.",
         "Controle deslizante de k: o gráfico sobe inteiro. O ponto central acompanha e a etiqueta \"altura = k\" aparece."),
        ("O m empurra pro lado. E aqui mora a pegadinha: T mais m não anda pra direita, anda pra esquerda. O centro vai parar onde o parêntese dá zero: T igual a menos m. Então, se o centro está à direita, o m é negativo.",
         "Controle de m: o gráfico desliza no sentido contrário ao sinal. Aparece T + m = 0 → T = −m; em seguida \"centro à direita → m negativo\"."),
        ("E o p estica ou espreme. O período vira pi sobre p. Se p é um meio, o período vira dois pi: a tangente fica duas vezes mais larga.",
         "Controle de p: as assíntotas se afastam, a chave do período atualiza para π/p. Para em p = ½ com a chave mostrando 2π."),
    ]),
    ("4 · Resolvendo", "3:10 – 4:05", [
        ("Agora é só ler o desenho. Primeiro, o centro. Ele fica bem no meio das duas assíntotas. Soma as duas e divide por dois. Os dois pi se cancelam, a soma dá cinco, e dividindo por dois: dois e meio.",
         "Volta o gráfico do INEP. Seta no ponto médio entre as assíntotas. Conta escrita passo a passo: [(5 − 2π)/2 + (5 + 2π)/2] ÷ 2. Os termos 2π e −2π acendem na mesma cor e somem juntos (sem risco por cima do texto). Resultado 5/2 = 2,5."),
        ("É o ponto dois e meio, trinta, que a gente marcou lá no copo. Então k é trinta. E T igual a menos m dá dois e meio: m é menos cinco sobre dois.",
         "O ponto (2,5 ; 30) pulsa de novo. k = 30 e m = −5/2 voam para dentro da fórmula, nas cores do bloco 3."),
        ("Depois, o período: a distância entre as assíntotas. A da direita menos a da esquerda. Os cincos somem, e sobra quatro pi sobre dois: dois pi. Então pi sobre p igual a dois pi, e p é um meio.",
         "Chave entre as duas assíntotas. Conta: (5 + 2π)/2 − (5 − 2π)/2 = 4π/2 = 2π. Depois π/p = 2π → p = ½, e p entra na fórmula."),
        ("Monta tudo: D igual a trinta, mais tangente de um meio, vezes T menos cinco sobre dois. Alternativa E.",
         "Fórmula final completa: D = 30 + tg[½(T − 5/2)]. As cinco alternativas aparecem; a E acende."),
    ]),
    ("5 · O segredo", "4:05 – 4:30", [
        ("E o segredo pra fazer em trinta segundos. O centro, o meio entre as assíntotas, é sempre onde a tangente vale zero. Então ali, D é igual a k. A altura do centro é trinta: isso já elimina A, B e C.",
         "Cronômetro de 30 s no canto. Alternativas na tela; \"k = 30?\" filtra: A, B e C ficam cinzas e deslizam para fora (NÃO riscar o texto com linha)."),
        ("Sobram D e E. Na D, o parêntese zera em T igual a cinco. Mas o centro está em dois e meio. Sobrou a E. Sem nem calcular o período.",
         "Em D, o parêntese (T − 5) acende e aparece \"centro em T = 5\" com uma marcação no eixo em 5, longe do ponto 2,5. D sai do mesmo jeito. E fica sozinha. Cronômetro para antes do zero."),
    ]),
    ("6 · Fechamento (loop)", "4:30 – 4:45", [
        ("Então guarda isso: o formato do copo desenha o gráfico. E o gráfico entrega a resposta. Volta e vê o copo enchendo de novo... agora vai fazer sentido.",
         "A água do copo esvazia e a câmera volta exatamente ao enquadramento do primeiro quadro (copo + gráfico, água no nível inicial). Último quadro = primeiro quadro."),
    ]),
]

NOTAS = [
    "<b>Resposta conferida: alternativa E</b>, D = 30 + tg[½(T − 5/2)]. Assíntotas em ½(T − 5/2) = ±π/2, ou seja T = (5 ± 2π)/2, exatamente as do enunciado. A alternativa D tem o centro em T = 5, por isso cai.",
    "<b>A figura do INEP não está em escala.</b> Com a resposta E, D(0) ≈ 27 cm e D(4) ≈ 30,9 cm: na vida real a curva entre 0 e 4 minutos é quase plana. Nas cenas da questão a animação usa o desenho esquemático do INEP; só nos blocos 2 e 3 (a tangente pura) o gráfico é em escala. Isso não entra na fala para não confundir (pode virar um comentário fixado: \"repararam que o desenho não está em escala?\").",
    "<b>Duração:</b> cerca de 680 palavras, entre 4:30 e 5:00 no seu ritmo. As pausas marcadas na animação são onde a música sobe.",
    "<b>Como gravar no WhatsApp:</b> um áudio por bloco (7 áudios). Se errar uma frase, respira e repete a frase inteira no mesmo áudio; eu corto. Lugar silencioso, celular a um palmo da boca. Eu converto o ogg, limpo o ruído e nivelo o volume.",
    "<b>Fórmulas na fala:</b> escrevi do jeito que se fala (\"pi sobre dois\", \"um meio\"). A tela mostra a forma escrita, então você não precisa ler a fórmula letra por letra.",
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
<p class="sub">Roteiro de narração (sua voz, sem rosto) · animação em Manim · 4:30 a 5:00</p>
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
