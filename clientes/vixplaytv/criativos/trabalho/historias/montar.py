# -*- coding: utf-8 -*-
"""Fonte única do PDF de aprovação das 4 histórias da VixPlay TV (06/11/2026).
Gera frames.json (lido por estudio/motor/stills_vix.mjs) e plano.json (lido por skill pdf-aprovacao/gera_pdf.py).
Uso: python -I montar.py   (depois: node estudio/motor/stills_vix.mjs <pasta>  e  python gera_pdf.py plano.json)
Texto só com fatos da seção 2 do ESTADO.md; sem nome de canal/streaming, sem 'melhor', sem 'na hora', sem legalidade."""
import json
from pathlib import Path

AQUI = Path(__file__).resolve().parent

def sec(titulo, chips):
    return {"titulo": titulo, "chips": [{"l": l, "t": 0.15 + i * 0.25, "d": i == len(chips) - 1} for i, l in enumerate(chips)]}

PRECO = {"tNum": 0.1, "tRenova": 1.0, "tPix": 1.4}
PRECO1 = {"renova": False, "tNum": 0.1, "tPix": 1.0}

def cena(n, texto):
    return {"bloco": "Cena", "p": {"n": n, "texto": texto}, "f": 10}

# ---- frames: id -> especificação do quadro (take de c2/c4 + bloco de motion, ou cartão de cena) ----
H = {}
def f(vid, fid, t, legenda, spec):
    H.setdefault(vid, []).append({"id": fid, "t": t, "legenda": legenda, "spec": spec})

# A: Domingo à noite
f("A", "A01", "0:00", "Sala, domingo à noite. A família toda no sofá.", cena("Cena A01", "Sala, domingo à noite. Família no sofá, pipoca pronta, o controle passando de mão em mão."))
f("A", "A02", "0:05", "Cada um pede uma coisa diferente.", cena("Cena A02", "Um quer filme, outro quer série, a criança pede desenho e a avó quer a novela."))
f("A", "A03", "0:10", "Quatro celulares, quatro aplicativos, quatro assinaturas.", {"bloco": "Gancho", "src": "c4", "ss": 11, "zoom": 1.2, "p": {"titulo": "Cada um no seu aplicativo", "sub": "Uma assinatura aqui, outra ali", "colapsa": 1.8}, "f": 40, "legenda": "Cada um num aplicativo, cada um com uma assinatura."})
f("A", "A04", "0:14", "Alguém lembra da VixPlay TV. A tela inicial aparece.", {"bloco": "Titulo", "src": "c4", "ss": 12, "zoom": 1.2, "p": {"l1": "Conheça a", "l2": "VixPlay TV"}, "f": 50, "legenda": "Foi aí que alguém lembrou da VixPlay TV."})
f("A", "A05", "0:18", "Canais ao vivo, filmes, séries, doramas, novelas e infantil no mesmo lugar.", {"bloco": "Secao", "src": "c4", "ss": 48, "zoom": 1.2, "ox": 70, "p": sec("Tudo em um só lugar", ["Canais ao vivo", "Filmes", "Séries", "Doramas", "Novelas", "Infantil"]), "f": 100, "legenda": "Tudo em um só aplicativo."})
f("A", "A06", "0:26", "Sala, quarto e celular: até 3 telas no mesmo plano.", {"bloco": "Telas", "src": "c2", "ss": 37, "zoom": 1.28, "ox": 88, "oy": 70, "p": {}, "f": 80, "legenda": "Funciona em até três telas."})
f("A", "A07", "0:31", "Primeiro mês R$ 35, Pix, sem cartão, sem fidelidade.", {"bloco": "Preco", "src": "c4", "ss": 73, "zoom": 1.2, "p": PRECO1, "f": 95, "legenda": "O primeiro mês custa trinta e cinco reais."})
f("A", "A08", "0:36", "Botão Saiba mais e teste grátis de 4 horas.", {"bloco": "CTA", "src": "c2", "ss": 40, "zoom": 1.28, "ox": 88, "oy": 70, "p": {"horas": True}, "f": 80, "legenda": "Solicite o seu teste grátis de quatro horas."})

# B: A conta do mês
f("B", "B01", "0:00", "Cozinha, fim do mês. Caderno aberto e calculadora.", cena("Cena B01", "Cozinha, fim do mês. Caderno aberto, calculadora e uma xícara de café. Plano fechado na mão que anota."))
f("B", "B02", "0:05", "As assinaturas entram na página, uma a uma.", {"bloco": "Gancho", "src": "c4", "ss": 17, "zoom": 1.3, "ox": 30, "oy": 55, "p": {"titulo": "A conta do mês", "sub": "Uma assinatura aqui, outra ali", "colapsa": 1.8}, "f": 40, "legenda": "Uma assinatura de filmes, outra de séries, outra de esportes."})
f("B", "B03", "0:11", "O total chega maior do que parecia.", cena("Cena B03", "A calculadora mostra o total. A mão para. Olhar de quem esperava menos."))
f("B", "B04", "0:15", "Existe um jeito mais simples: tudo em um aplicativo só.", {"bloco": "Titulo", "src": "c4", "ss": 19, "zoom": 1.3, "ox": 30, "oy": 55, "p": {"l1": "Mais simples", "l2": "um app só"}, "f": 50, "legenda": "A VixPlay TV reúne tudo em um aplicativo só."})
f("B", "B05", "0:20", "Canais ao vivo, filmes, séries, doramas e novelas.", {"bloco": "Secao", "src": "c2", "ss": 39, "zoom": 1.3, "ox": 12, "oy": 72, "p": sec("O que tem dentro", ["Canais ao vivo", "Filmes", "Séries", "Doramas", "Novelas"]), "f": 100, "legenda": "Canais ao vivo, filmes, séries, doramas e novelas."})
f("B", "B06", "0:26", "R$ 35 no primeiro mês; R$ 30 renovando em dia.", {"bloco": "Preco", "src": "c4", "ss": 76, "zoom": 1.3, "ox": 30, "oy": 55, "p": PRECO, "f": 105, "legenda": "A renovação em dia sai por trinta."})
f("B", "B07", "0:32", "Pix, sem renovação automática. Saiba mais.", {"bloco": "CTA", "src": "c4", "ss": 80, "zoom": 1.3, "ox": 30, "oy": 55, "p": {"horas": True}, "f": 80, "legenda": "Toque em Saiba mais e solicite o seu teste grátis."})

# C: O tutorial do neto
f("C", "C01", "0:00", "Quarto da avó. O neto senta ao lado dela.", cena("Cena C01", "Quarto, fim de tarde. A avó com o controle na mão, indecisa. O neto senta ao lado."))
f("C", "C02", "0:06", "Ele abre o tutorial do aparelho no celular.", cena("Cena C02", "Close no celular do neto com o tutorial do aparelho aberto. A avó olha por cima do ombro."))
f("C", "C03", "0:11", "Três passos: plano, Pix, acesso pelo WhatsApp.", {"bloco": "Passos", "src": "c2", "ss": 22, "zoom": 1.28, "ox": 88, "oy": 70, "blur": 9, "p": {"ts": [0.2, 0.7, 1.2]}, "f": 80, "legenda": "Escolheu o plano, pagou por Pix e recebeu o acesso."})
f("C", "C04", "0:20", "Tutorial para cada aparelho: Smart TV, TV Box e celular.", {"bloco": "Telas", "src": "c4", "ss": 14, "zoom": 1.25, "ox": 90, "oy": 70, "p": {"a": "Tutorial para ", "b": "cada aparelho", "sub": "Smart TV, TV Box e celular"}, "f": 80, "legenda": "Tem tutorial para cada aparelho."})
f("C", "C05", "0:27", "Dúvida na instalação? Atendimento pelo WhatsApp.", {"bloco": "Suporte", "src": "c2", "ss": 44, "zoom": 1.28, "ox": 88, "oy": 70, "p": {}, "f": 80, "legenda": "Se aparece uma dúvida, o suporte atende pelo WhatsApp."})
f("C", "C06", "0:33", "A avó achou a novela. Por dentro: novelas, filmes, séries.", {"bloco": "Secao", "src": "c4", "ss": 75, "zoom": 1.25, "ox": 90, "oy": 70, "p": sec("Novelas", ["Novelas", "Filmes", "Séries", "Canais ao vivo", "Infantil"]), "f": 100, "legenda": "Lá dentro tem novelas, filmes, séries e canais ao vivo."})
f("C", "C07", "0:40", "R$ 35 no primeiro mês, até 3 telas na mesma casa.", {"bloco": "Preco", "src": "c4", "ss": 79, "zoom": 1.25, "ox": 90, "oy": 70, "p": PRECO1, "f": 95, "legenda": "O primeiro mês custa trinta e cinco reais."})
f("C", "C08", "0:45", "Botão Saiba mais e teste grátis de 4 horas.", {"bloco": "CTA", "src": "c4", "ss": 81, "zoom": 1.25, "ox": 90, "oy": 70, "p": {"horas": True}, "f": 80, "legenda": "Solicite o seu teste grátis de quatro horas."})

# D: Tudo no mesmo lugar (casal)
f("D", "D01", "0:00", "Ela quer série, ele quer esporte: a TV vive trocando de aplicativo.", cena("Cena D01", "Tela dividida: de um lado ela com o controle e uma série, do outro ele com o controle e um jogo. O controle muda de mão."))
f("D", "D02", "0:06", "Aplicativo, login, menu, de novo.", cena("Cena D02", "Menu cheio de ícones de aplicativos. A TV pula de um para outro, e eles trocam um olhar cansado."))
f("D", "D03", "0:11", "Agora tudo no mesmo lugar: por dentro da VixPlay TV.", {"bloco": "Titulo", "src": "c4", "ss": 11.5, "zoom": 1.25, "ox": 90, "oy": 70, "p": {"l1": "Por dentro da", "l2": "VixPlay TV"}, "f": 50, "legenda": "Agora tudo fica no mesmo lugar."})
f("D", "D04", "0:16", "Canais ao vivo: esportes, filmes e séries, infantil, documentários.", {"bloco": "Secao", "src": "c4", "ss": 20, "zoom": 1.25, "ox": 90, "oy": 70, "p": sec("Canais ao vivo", ["Esportes", "Filmes e séries", "Infantil", "Documentários", "Abertos e fechados"]), "f": 100, "legenda": "Em canais ao vivo tem esportes, filmes e séries, infantil..."})
f("D", "D05", "0:22", "Filmes: seção só de lançamentos e categorias.", {"bloco": "Secao", "src": "c4", "ss": 47, "zoom": 1.25, "ox": 90, "oy": 70, "p": sec("Filmes", ["Lançamentos", "Ação", "Comédia", "Drama", "Infantil"]), "f": 100, "legenda": "Em filmes, uma seção só de lançamentos."})
f("D", "D06", "0:28", "Séries, doramas e novelas.", {"bloco": "Secao", "src": "c4", "ss": 66, "zoom": 1.25, "ox": 90, "oy": 70, "p": sec("Séries", ["Várias temporadas", "Doramas", "Novelas"]), "f": 100, "legenda": "Séries com várias temporadas e um espaço só para doramas."})
f("D", "D07", "0:33", "Até 3 telas: uma na sala, outra no quarto, outra no celular.", {"bloco": "Telas", "src": "c2", "ss": 41, "zoom": 1.28, "ox": 88, "oy": 70, "p": {}, "f": 80, "legenda": "Até três telas, no mesmo plano."})
f("D", "D08", "0:38", "R$ 35 no primeiro mês; R$ 30 renovando em dia.", {"bloco": "Preco", "src": "c4", "ss": 78, "zoom": 1.25, "ox": 90, "oy": 70, "p": PRECO, "f": 105, "legenda": "Primeiro mês, trinta e cinco reais. Renovação em dia, trinta."})
f("D", "D09", "0:43", "Suporte pelo WhatsApp.", {"bloco": "Suporte", "src": "c2", "ss": 45, "zoom": 1.28, "ox": 88, "oy": 70, "p": {}, "f": 80, "legenda": "Se tiver dúvida, o suporte atende pelo WhatsApp."})
f("D", "D10", "0:47", "Botão Saiba mais e teste grátis de 4 horas.", {"bloco": "CTA", "src": "c2", "ss": 43, "zoom": 1.28, "ox": 88, "oy": 70, "p": {"horas": True}, "f": 80, "legenda": "Solicite o seu teste grátis de quatro horas."})

# ---- roteiros (narração para o ElevenLabs; "Vix Play TV" separado para a voz ler certo) ----
ROT = {
 "A": {
  "titulo": "Domingo à noite",
  "etiqueta": "Criativo A · cerca de 40 s · 8 quadros",
  "ideia": "Uma família disputa o controle. Cada um num aplicativo; a VixPlay TV junta tudo e todo mundo assiste junto.",
  "jornada": [("Conflito", "Todos querem coisas diferentes."), ("Descoberta", "Alguém lembra da VixPlay TV."), ("Solução", "Tudo no mesmo lugar, em até 3 telas."), ("Oferta", "R$ 35 no 1º mês, Pix.")],
  "narracao": "Domingo à noite. A família toda no sofá, pipoca pronta, e a disputa de sempre: o que vamos assistir? Um quer filme, outro quer série, a criança pede desenho e a avó só quer a novela. Cada um num aplicativo, cada um com uma assinatura. Foi aí que alguém lembrou da Vix Play TV. Dentro dela tem canais ao vivo, filmes, séries, doramas, novelas e infantil, tudo em um só aplicativo, em até três telas: na sala, no quarto e no celular. O primeiro mês custa trinta e cinco reais, no Pix, sem cartão e sem fidelidade. Toque em Saiba mais e solicite o seu teste grátis de quatro horas.",
  "cenas": [("0:00", "Domingo à noite. A família toda no sofá, pipoca pronta, e a disputa de sempre: o que vamos assistir?", "A01 e A02: cena de sala em plano aberto, luz quente. O controle passa de mão em mão."),
            ("0:10", "Cada um num aplicativo, cada um com uma assinatura.", "A03: bloco de gancho sobre a tela do app; as pílulas Assinatura se juntam na marca."),
            ("0:14", "Foi aí que alguém lembrou da Vix Play TV.", "A04: título Conheça a VixPlay TV sobre a tela inicial (a mão mostrando o menu)."),
            ("0:18", "Canais ao vivo, filmes, séries, doramas, novelas e infantil, tudo em um só aplicativo.", "A05: chips entram na palavra falada, com cortes de filmes e novelas."),
            ("0:26", "Em até três telas: na sala, no quarto e no celular.", "A06: faixa Smart TV, TV Box e celular acendendo em sequência."),
            ("0:31", "O primeiro mês custa trinta e cinco reais, no Pix, sem cartão e sem fidelidade.", "A07: etiqueta de preço compacta, número subindo até R$ 35."),
            ("0:36", "Toque em Saiba mais e solicite o seu teste grátis de quatro horas.", "A08: painel inferior com o botão SAIBA MAIS; a imagem do app segue rodando.")],
 },
 "B": {
  "titulo": "A conta do mês",
  "etiqueta": "Criativo B · cerca de 36 s · 7 quadros",
  "ideia": "Caderno e calculadora no fim do mês: a soma das assinaturas assusta. A VixPlay TV reúne tudo em um aplicativo só.",
  "jornada": [("Cena", "Fim do mês, caderno aberto."), ("Susto", "O total é maior do que parecia."), ("Caminho", "Tudo em um aplicativo."), ("Oferta", "R$ 35, depois R$ 30 em dia.")],
  "narracao": "Fim do mês. Em cima da mesa, o caderno e a calculadora. Uma assinatura de filmes, outra de séries, outra de esportes, outra de infantil. Soma daqui, soma dali, e o total chega maior do que parecia. Existe um jeito mais simples de organizar isso. A Vix Play TV reúne canais ao vivo, filmes, séries, doramas e novelas em um aplicativo só. O primeiro mês custa trinta e cinco reais, e a renovação em dia, trinta. Pagamento por Pix, sem cartão e sem renovação automática. Quer ver como funciona antes? Toque em Saiba mais e solicite o seu teste grátis de quatro horas.",
  "cenas": [("0:00", "Fim do mês. Em cima da mesa, o caderno e a calculadora.", "B01: plano fechado da mão que anota, cozinha, luz de manhã."),
            ("0:05", "Uma assinatura de filmes, outra de séries, outra de esportes, outra de infantil.", "B02: as etiquetas Assinatura entram na página do caderno e colapsam na marca."),
            ("0:11", "Soma daqui, soma dali, e o total chega maior do que parecia.", "B03: a calculadora mostra o total; a mão para."),
            ("0:15", "Existe um jeito mais simples de organizar isso. A Vix Play TV reúne tudo em um aplicativo só.", "B04: título Mais simples, um app só sobre a tela inicial."),
            ("0:20", "Canais ao vivo, filmes, séries, doramas e novelas.", "B05: chips sobre os pôsteres de filmes."),
            ("0:26", "O primeiro mês custa trinta e cinco reais, e a renovação em dia, trinta.", "B06: etiqueta de preço com a linha Renovando em dia: R$ 30."),
            ("0:32", "Pix, sem cartão e sem renovação automática. Toque em Saiba mais.", "B07: painel inferior com SAIBA MAIS e teste grátis de 4 horas.")],
 },
 "C": {
  "titulo": "O tutorial do neto",
  "etiqueta": "Criativo C · cerca de 48 s · 8 quadros",
  "ideia": "O neto instala o aplicativo para a avó seguindo o tutorial do aparelho. Mostra o processo simples e o suporte.",
  "jornada": [("Cena", "Avó indecisa, neto ao lado."), ("Passo a passo", "Plano, Pix, acesso pelo WhatsApp."), ("Instalação", "Tutorial para cada aparelho."), ("Resultado", "Ela acha a novela. R$ 35.")],
  "narracao": "A avó queria assistir à novela no quarto, mas não sabia por onde começar. O neto sentou do lado e resolveu em poucos passos. Ele escolheu o plano, pagou por Pix e recebeu o acesso pelo WhatsApp. Depois abriu o tutorial do aparelho e instalou pelo aplicativo Downloader, com um código. Tem tutorial para cada aparelho: Smart TV, TV Box, celular e outros. Se aparece uma dúvida, o suporte atende pelo WhatsApp. Lá dentro da Vix Play TV tem novelas, filmes, séries, canais ao vivo e infantil. O primeiro mês custa trinta e cinco reais, em até três telas na mesma casa. Toque em Saiba mais e solicite o seu teste grátis de quatro horas.",
  "cenas": [("0:00", "A avó queria assistir à novela no quarto, mas não sabia por onde começar.", "C01: quarto no fim da tarde; avó com o controle, neto senta ao lado."),
            ("0:06", "O neto sentou do lado e resolveu em poucos passos.", "C02: close no celular com o tutorial do aparelho aberto."),
            ("0:11", "Ele escolheu o plano, pagou por Pix e recebeu o acesso pelo WhatsApp.", "C03: três cartões de passo entram um a um sobre a tela do app."),
            ("0:20", "Depois abriu o tutorial do aparelho e instalou pelo Downloader, com um código. Tem tutorial para cada aparelho.", "C04: faixa Smart TV, TV Box e celular com o selo Tutorial para cada aparelho."),
            ("0:27", "Se aparece uma dúvida, o suporte atende pelo WhatsApp.", "C05: dois balões de conversa simples, sem nome de pessoa."),
            ("0:33", "Lá dentro tem novelas, filmes, séries, canais ao vivo e infantil.", "C06: chips sobre as novelas; corte curto para a avó sorrindo (cena gerada)."),
            ("0:40", "O primeiro mês custa trinta e cinco reais, em até três telas na mesma casa.", "C07: etiqueta de preço."),
            ("0:45", "Toque em Saiba mais e solicite o seu teste grátis de quatro horas.", "C08: painel inferior com SAIBA MAIS.")],
 },
 "D": {
  "titulo": "Tudo no mesmo lugar",
  "etiqueta": "Criativo D · cerca de 50 s · 10 quadros",
  "ideia": "Um casal cansado de trocar de aplicativo ganha um menu só, e o vídeo faz o passeio completo por dentro do app.",
  "jornada": [("Atrito", "Ela quer série, ele quer esporte."), ("Virada", "Tudo no mesmo menu."), ("Passeio", "Canais, filmes, séries, doramas, novelas."), ("Oferta", "R$ 35, suporte, teste.")],
  "narracao": "Ela quer série, ele quer esporte, e a TV vive trocando de aplicativo, de login e de menu. Agora tudo fica no mesmo lugar. Abre a Vix Play TV e o menu é direto. Em canais ao vivo tem esportes, filmes e séries, infantil, documentários, canais abertos e fechados. Em filmes, uma seção só de lançamentos e categorias como ação, comédia e drama. Em séries, várias temporadas e um espaço só para doramas, e tem novelas também. Até três telas no mesmo plano: uma na sala, outra no quarto e outra no celular. O primeiro mês custa trinta e cinco reais, e a renovação em dia, trinta. Pix, sem cartão e sem fidelidade. Se tiver dúvida, o suporte atende pelo WhatsApp. Toque em Saiba mais e solicite o seu teste grátis de quatro horas.",
  "cenas": [("0:00", "Ela quer série, ele quer esporte, e a TV vive trocando de aplicativo, de login e de menu.", "D01 e D02: tela dividida (ela / ele); o controle muda de mão; menu cheio de ícones."),
            ("0:11", "Agora tudo fica no mesmo lugar. Abre a Vix Play TV e o menu é direto.", "D03: título Por dentro da VixPlay TV sobre a tela inicial."),
            ("0:16", "Em canais ao vivo tem esportes, filmes e séries, infantil, documentários, canais abertos e fechados.", "D04: chips entram na palavra falada; listas de canais só com desfoque forte."),
            ("0:22", "Em filmes, uma seção só de lançamentos e categorias como ação, comédia e drama.", "D05: chips sobre os pôsteres."),
            ("0:28", "Em séries, várias temporadas e um espaço só para doramas, e tem novelas também.", "D06: chips sobre séries, doramas e novelas."),
            ("0:33", "Até três telas no mesmo plano: sala, quarto e celular.", "D07: faixa de aparelhos."),
            ("0:38", "O primeiro mês custa trinta e cinco reais, e a renovação em dia, trinta. Pix, sem cartão e sem fidelidade.", "D08: etiqueta de preço com a linha de renovação."),
            ("0:43", "Se tiver dúvida, o suporte atende pelo WhatsApp.", "D09: balões simples."),
            ("0:47", "Toque em Saiba mais e solicite o seu teste grátis de quatro horas.", "D10: painel inferior com SAIBA MAIS.")],
 },
}

def main():
    frames = {k: v for k, v in H.items()}
    (AQUI / "frames.json").write_text(json.dumps(frames, ensure_ascii=False, indent=1), encoding="utf-8")
    videos = []
    for vid, r in ROT.items():
        videos.append({
            "etiqueta": r["etiqueta"], "titulo": r["titulo"], "ideia": r["ideia"],
            "jornada": [{"titulo": a, "texto": b} for a, b in r["jornada"]],
            "quadros": [{"id": q["id"], "t": q["t"], "legenda": q["legenda"], "img": f"quadros/{q['id']}.jpg"} for q in H[vid]],
            "roteiro": {"narracao": r["narracao"], "cenas": [{"t": a, "fala": b, "direcao": c} for a, b, c in r["cenas"]]},
        })
    plano = {
        "titulo": "VixPlay TV · 4 histórias para anúncio", "arquivo": "VixPlay TV - 4 historias para aprovacao.pdf",
        "rodape": "VixPlay TV · Criativos em história · Para aprovação", "formato": "9:16", "quadros_por_pagina": 10,
        "tema": {"acento": "#99E200", "acento_texto": "#3C7A00", "sobre_acento": "#061000", "fundo": "#F5F6F2", "cartao": "#FFFFFF",
                 "linha": "#E1E5DA", "tinta": "#10140F", "tinta_2": "#2E352B", "cinza": "#7A8576", "escuro": "#010204",
                 "papel": "#F2F7EE", "papel_2": "#A7B5A2", "fonte_titulo": "Archivo", "titulo_caixa_alta": True,
                 "capa_escura": True, "aprovar_escura": True},
        "capa": {"chamada": "Para aprovação · 4 roteiros", "titulo": "Quatro histórias", "titulo_destaque": "VixPlay TV",
                 "texto": "Cada criativo conta uma história diferente, com personagem, situação e visual próprios. A tela do aplicativo aparece o tempo todo e o motion fica em cima, compacto.",
                 "logo": "logo.png", "logo_altura_mm": 17, "imagens": ["quadros/A05.jpg", "quadros/B06.jpg", "quadros/D05.jpg"],
                 "numeros": [{"n": "A", "texto": "Domingo à noite: a família disputa o controle."},
                             {"n": "B", "texto": "A conta do mês: o caderno e a calculadora."},
                             {"n": "C", "texto": "O tutorial do neto: instalar e usar."},
                             {"n": "D", "texto": "Tudo no mesmo lugar: o casal e o menu."}]},
        "videos": videos,
        "som": {"titulo": "Voz, música e efeitos", "texto": "Voz de narrador por história (nova locução). Música discreta sob a voz. Poucos efeitos, só onde importam.",
                "cartoes": [{"titulo": "Voz", "texto": "Locução nova no ElevenLabs a partir do texto Narração de cada roteiro, 2 takes. Voz brasileira, calorosa, ritmo de conversa."},
                            {"titulo": "Música", "texto": "Uma faixa instrumental por criativo, 18 a 22 LU abaixo da voz, com ducking. As faixas de teste vieram da Epidemic em prévia; antes de anunciar, baixar com a licença do plano."},
                            {"titulo": "Volume final", "texto": "-14 LUFS, pico máximo -1 dBTP."}],
                "efeitos": [["Pílulas se juntam na marca", "toque curto e grave"], ["Preço sobe até R$ 35", "tique suave"], ["Botão SAIBA MAIS", "toque discreto, uma vez"]]},
        "aprovar": {"titulo": "Para aprovar",
                    "itens": [{"texto": "A história do criativo A (Domingo à noite)"}, {"texto": "A história do criativo B (A conta do mês)"},
                              {"texto": "A história do criativo C (O tutorial do neto)"}, {"texto": "A história do criativo D (Tudo no mesmo lugar)"},
                              {"texto": "Cenas de abertura geradas no Google Flow", "nota": "Os quadros de cena (A01, A02, B01, B03, C01, C02, D01, D02) são cartões de descrição; as imagens saem do Flow."},
                              {"texto": "Os textos de narração", "nota": "Só fatos já confirmados: R$ 35, R$ 30 em dia, 3 telas, Pix, suporte pelo WhatsApp, teste de 4 horas."},
                              {"texto": "Música e volume"}],
                    "nota_final": "Para ajustar, cite o código (ex.: muda o B03). Depois da aprovação, geramos as vozes e as cenas e renderizamos."},
    }
    (AQUI / "plano.json").write_text(json.dumps(plano, ensure_ascii=False, indent=1), encoding="utf-8")
    print("frames:", sum(len(v) for v in frames.values()), "| plano.json ok")

main()
