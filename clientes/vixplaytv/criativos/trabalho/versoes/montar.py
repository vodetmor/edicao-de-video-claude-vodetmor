# -*- coding: utf-8 -*-
"""PDF de aprovação das 4 VERSÕES dos criativos do CMD (c1 a c4), 06/11/2026.
Fonte única: gera frames.json (estudio/motor/stills_vix.mjs) e plano.json (skill pdf-aprovacao).
Decisões do Vítor/Deidson (06/11): manter a fala original da pessoa, trocar o nome deles pelo nosso (fala muda + estalo da marca),
edição caseira e DIFERENTE em cada versão (ritmo, takes, imagens de apoio do Pexels, legenda, roteiro)."""
import json
from pathlib import Path

AQUI = Path(__file__).resolve().parent
H = {}

def f(vid, fid, t, legenda, spec):
    H.setdefault(vid, []).append({"id": fid, "t": t, "legenda": legenda, "spec": spec})

def sec(titulo, chips):
    return {"titulo": titulo, "chips": [{"l": l, "t": 0.15 + i * 0.25, "d": i == len(chips) - 1} for i, l in enumerate(chips)]}

PRECO = {"tNum": 0.1, "tRenova": 1.0, "tPix": 1.4}
CTA = {"horas": True}
BANNER = {"bloco": "BannerC1", "p": {}}
POP = {"bloco": "PopMarca", "p": {}}
POP1 = {"bloco": "PopMarca", "p": {"top": 1260, "w": 520}}

# ---------- E: base c1 (homem no carro), 26 s, edição "rápida" ----------
c1 = dict(src="c1", zoom=1.0, ox=50, oy=50, faixa=0.595)
f("E", "E01", "0:00", "Abre direto na dor: Travamentos. Banner vermelho coberto pelo nosso.", {**c1, "ss": 1.7, "camadas": [BANNER], "legenda": "TRAVAMENTOS,", "legendaGrande": True, "legendaTop": 1290, "f": 10})
f("E", "E02", "0:03", "Corte para imagem de apoio: pessoa frustrada com a TV.", {"src": "stock/frustrado", "ss": 2, "zoom": 1.0, "faixa": False, "legenda": "ATUALIZAÇÕES BUGADAS", "legendaGrande": True, "legendaTop": 1300, "f": 15})
f("E", "E03", "0:06", "\"Sabe o que vale?\": o nome deles fica mudo e a nossa marca estoura.", {**c1, "ss": 6.7, "camadas": [BANNER, POP1], "f": 25})
f("E", "E04", "0:10", "Take da TV do original com a legenda grande nossa.", {**c1, "ss": 10.4, "camadas": [BANNER], "legenda": "FLUIDEZ E ESTABILIDADE", "legendaGrande": True, "legendaTop": 1290, "f": 10})
f("E", "E05", "0:15", "\"Três telas simultâneas\": faixa de aparelhos.", {**c1, "ss": 14.6, "camadas": [BANNER], "legenda": "TRÊS TELAS SIMULTÂNEAS", "legendaGrande": True, "legendaTop": 1290, "f": 10})
f("E", "E06", "0:20", "\"Testa agora\": homem de volta, zoom de impacto.", {**c1, "ss": 20.5, "zoom": 1.25, "camadas": [BANNER], "legenda": "TESTA AGORA", "legendaGrande": True, "legendaTop": 1290, "f": 10})
f("E", "E07", "0:24", "Fecha com o botão Saiba mais e o link.", {**c1, "ss": 24.4, "camadas": [{"bloco": "CTA", "p": CTA}], "f": 80})

# ---------- F: base c2 (apresentadora + TV), cerca de 52 s, edição "economia de casa" ----------
c2 = dict(src="c2", faixa=0.70)
f("F", "F01", "0:00", "Abre com ela falando: \"É muito bom acordar e ligar a TV\".", {**c2, "ss": 0.8, "zoom": 1.0, "ox": 50, "oy": 50, "legenda": "É muito bom acordar e ligar a TV", "f": 12})
f("F", "F02", "0:03", "Imagem de apoio (manhã em casa) com a voz dela por cima.", {"src": "stock/manha", "ss": 1.5, "zoom": 1.0, "faixa": False, "legenda": "Posso assistir à vontade", "f": 15})
f("F", "F03", "0:06", "\"Conheça o ...\": o nome original fica mudo e a marca estoura.", {**c2, "ss": 5.8, "zoom": 1.0, "ox": 50, "oy": 50, "camadas": [POP], "f": 25})
f("F", "F04", "0:13", "Take limpa da TV (posters) no lugar da lista de canais do original; chips do que existe dentro.", {**c2, "ss": 41, "zoom": 1.28, "ox": 88, "oy": 70, "camadas": [{"bloco": "Secao", "p": sec("Tudo em um só lugar", ["Filmes", "Séries", "Novelas", "Animes"])}], "legenda": "Filmes, séries, novelas e animes em um só lugar", "f": 100})
f("F", "F05", "0:25", "Pergunta de economia: pílulas de assinatura colapsam na marca.", {**c2, "ss": 29.5, "zoom": 1.28, "ox": 88, "oy": 70, "camadas": [{"bloco": "Gancho", "p": {"titulo": "Quanto você paga por mês?", "sub": "Uma assinatura aqui, outra ali", "colapsa": 1.8}}], "legenda": "Em vez de pagar por cada aplicativo", "f": 40})
f("F", "F06", "0:34", "No lugar da frase de preço do original, entra o nosso cartão: R$ 35.", {**c2, "ss": 37, "zoom": 1.28, "ox": 88, "oy": 70, "camadas": [{"bloco": "Preco", "p": PRECO}], "legenda": "O primeiro mês custa R$ 35", "f": 105})
f("F", "F07", "0:43", "\"Disponível para Smart TV, TV Box, celular\": faixa de aparelhos.", {**c2, "ss": 47, "zoom": 1.28, "ox": 88, "oy": 70, "camadas": [{"bloco": "Telas", "p": {}}], "legenda": "Disponível para Smart TV, TV Box e celular", "f": 80})
f("F", "F08", "0:49", "O pedido de teste de 3 ou 7 dias sai; entra o nosso: teste grátis de 4 horas.", {**c2, "ss": 40, "zoom": 1.28, "ox": 88, "oy": 70, "camadas": [{"bloco": "CTA", "p": CTA}], "legenda": "Solicite agora o seu teste grátis", "f": 80})

# ---------- G: base c3 (desabafo na penteadeira), cerca de 50 s, edição "documental" ----------
c3 = dict(src="c3", faixa=0.70)
f("G", "G01", "0:00", "Abre em preto e branco, como no original, com ela falando.", {**c3, "ss": 0.8, "zoom": 1.0, "ox": 50, "oy": 50, "legenda": "Você paga pelo serviço, começa a assistir e trava.", "f": 12})
f("G", "G02", "0:05", "Imagem de apoio (carregando sem parar) com a voz dela.", {"src": "stock/buffering", "ss": 2, "zoom": 1.0, "faixa": False, "legenda": "Aí você fecha, abre, troca de canal", "f": 15})
f("G", "G03", "0:13", "Ela de volta, zoom suave: \"Não é vídeo de venda\".", {**c3, "ss": 14, "zoom": 1.15, "ox": 50, "oy": 30, "legenda": "Eu não tô aqui pra vender nada pra vocês", "f": 12})
f("G", "G04", "0:24", "O suporte que demora: imagem de apoio de pessoa irritada.", {"src": "stock/frustrado", "ss": 4, "zoom": 1.0, "faixa": False, "legenda": "O suporte demora uma eternidade pra responder", "f": 15})
f("G", "G05", "0:33", "\"Foi aí que eu encontrei o ...\": nome original mudo, marca estoura.", {**c3, "ss": 33.1, "zoom": 1.0, "ox": 50, "oy": 50, "camadas": [POP], "f": 25})
f("G", "G06", "0:39", "O que ela gostou: corte para a tela do nosso aplicativo (sem celular de banco de imagem), com chips.", {"src": "c4", "faixa": 0.70, "ss": 47, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "Secao", "p": sec("O que ela gostou", ["Navegação simples", "Filmes", "Séries", "Canais ao vivo"])}], "legenda": "A navegação é simples, tem bastante conteúdo", "f": 100})
f("G", "G07", "0:46", "Suporte (balões simples, sem nome de pessoa).", {**c3, "ss": 44, "zoom": 1.1, "ox": 50, "oy": 30, "camadas": [{"bloco": "Suporte", "p": {}}], "legenda": "Outra coisa que gostei foi ter suporte", "f": 80})
f("G", "G08", "0:50", "O pedido de comentário do original sai; entra o botão Saiba mais.", {**c3, "ss": 62, "zoom": 1.1, "ox": 50, "oy": 30, "camadas": [{"bloco": "CTA", "p": CTA}], "legenda": "Clique em Saiba mais", "f": 80})

# ---------- H: base c4 (cozinha + passeio pela TV), cerca de 85 s, edição "passeio com marcação" ----------
c4 = dict(src="c4", faixa=0.70)
f("H", "H01", "0:00", "Abre em \"Aqui em casa usamos o ...\": a primeira frase do original sai.", {**c4, "ss": 2.7, "zoom": 1.0, "ox": 50, "oy": 50, "camadas": [POP], "legenda": "Aqui em casa usamos o VixPlay TV", "f": 40})
f("H", "H02", "0:08", "\"Cansado de pagar vários streamings?\": pílulas colapsam na marca.", {**c4, "ss": 10.4, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "Gancho", "p": {"titulo": "Cansado de pagar vários?", "sub": "Uma mensalidade só", "colapsa": 1.8}}], "legenda": "Está cansado de pagar vários streamings?", "f": 40})
f("H", "H03", "0:17", "\"Pago apenas uma mensalidade\": chip simples sobre a TV.", {**c4, "ss": 17.5, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "Secao", "p": sec("Uma mensalidade", ["Tudo que eu vou mostrar", "Em um só aplicativo"])}], "legenda": "Eu pago apenas uma mensalidade por mês", "f": 100})
f("H", "H04", "0:26", "Canais ao vivo (nomes dos canais desfocados), chips das categorias.", {**c4, "ss": 26.5, "zoom": 1.25, "ox": 90, "oy": 70, "blur": 9, "camadas": [{"bloco": "Secao", "p": sec("Canais ao vivo", ["Esportes", "Infantil", "Documentário", "Canal aberto", "Canal fechado"])}], "legenda": "Aqui nós temos canais ao vivo", "f": 100})
f("H", "H05", "0:45", "Filmes: lançamentos, com chips.", {**c4, "ss": 48, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "Secao", "p": sec("Filmes", ["Lançamentos", "Filmes antigos"])}], "legenda": "Filme que está no cinema, mas já está por aqui", "f": 100})
f("H", "H06", "0:60", "Séries e doramas.", {**c4, "ss": 66, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "Secao", "p": sec("Séries", ["Anime", "Dorama"])}], "legenda": "Em séries nós vamos ter anime e dorama", "f": 100})
f("H", "H07", "0:70", "Novelas, com o corte seguindo o ritmo da fala.", {**c4, "ss": 74, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "Secao", "p": sec("Novelas", ["Das mais novas às mais antigas"])}], "legenda": "Novela de todo lado você encontra aqui", "f": 100})
f("H", "H08", "0:84", "Fecha no \"é só clicar no link e fazer um teste gratuito\".", {**c4, "ss": 87, "zoom": 1.25, "ox": 90, "oy": 70, "camadas": [{"bloco": "CTA", "p": CTA}], "legenda": "É só clicar no link e fazer um teste gratuito", "f": 80})

VERSOES = {
 "E": {"etiqueta": "Versão E · base C1 · cerca de 24 s", "titulo": "Rápida: o homem no carro",
  "ideia": "Mesmo gancho de ruptura do C1, com a fala original do homem. Edição de ritmo alto: zoom de impacto, legenda grande palavra a palavra, imagem de apoio de pessoa frustrada e a nossa faixa no lugar do banner vermelho.",
  "jornada": [("Gancho", "Dor em texto grande, sem rodeio."), ("Virada", "A marca estoura onde ele dizia o nome."), ("Benefícios", "Telas e suporte do original."), ("Chamada", "Saiba mais.")],
  "mantem": "Toda a fala original do homem, do \"Travamentos\" até o \"Toque em Saiba mais\".",
  "tira": "A primeira frase (\"... não vale mais a pena\"), porque ataca o nosso próprio tipo de serviço. O nome GPT-TV fica mudo nas duas vezes em que é falado, com a nossa marca no lugar. Banner \"Sinal GPT\" e legenda do original cobertos.",
  "poe": "Legenda grande nossa, banner VixPlay, zoom no final, imagem de apoio (Pexels), faixa Até 3 telas e painel final com Saiba mais."},
 "F": {"etiqueta": "Versão F · base C2 · cerca de 52 s", "titulo": "Economia de casa: a apresentadora",
  "ideia": "A apresentadora fala como no C2 e depois a TV mostra o app. A diferença está no ritmo mais calmo, na legenda fina e no cartão de preço nosso no lugar da frase de preço do original.",
  "jornada": [("Abertura", "Ela acordando e ligando a TV."), ("Marca", "Nome original mudo, marca estoura."), ("Passeio", "Filmes, séries, novelas e animes."), ("Oferta", "R$ 35 e teste de 4 horas.")],
  "mantem": "A fala da apresentadora e do narrador da TV, a ordem do passeio e os trechos de cinema e séries.",
  "tira": "\"Mais de 20 mil conteúdos\", \"planos a partir de 20 reais\" e \"teste de 3 ou 7 dias\", que não valem para a VixPlay. A lista de nomes de streaming e canais com logo fica fora da imagem (sem desfoque, só corte). Legenda e logo do app original cobertos.",
  "poe": "Imagem de apoio de manhã em casa, chips do que existe dentro, pílulas de assinatura, cartão de preço, faixa de aparelhos e painel final."},
 "G": {"etiqueta": "Versão G · base C3 · cerca de 50 s", "titulo": "Desabafo: a penteadeira",
  "ideia": "Depoimento caseiro, como o C3: ela fala direto para a câmera. A edição é a mais limpa das quatro: zoom suave, legenda fina e imagens de apoio nos momentos de dor.",
  "jornada": [("Dor", "Paga, começa a assistir e trava."), ("Confiança", "\"Não é vídeo de venda\"."), ("Descoberta", "Nome original mudo, marca estoura."), ("Chamada", "Saiba mais.")],
  "mantem": "A fala da mulher do começo até o trecho do suporte.",
  "tira": "O pedido de comentário (\"comenta a palavra aplicativo\"), que é chamada para engajamento orgânico e não funciona em anúncio pago. O nome Mundo Play fica mudo.",
  "poe": "Imagens de apoio (carregando sem parar, pessoa irritada) e a tela do app, chips do que ela gostou, balões de suporte e painel final com Saiba mais."},
 "H": {"etiqueta": "Versão H · base C4 · cerca de 85 s", "titulo": "Passeio: a cozinha e o menu",
  "ideia": "A mulher na cozinha abre e depois a TV mostra o menu, com a voz dela narrando. É a versão mais longa, com chips acompanhando a fala e as listas de canais desfocadas.",
  "jornada": [("Abertura", "Aqui em casa usamos o app."), ("Dor", "Cansado de pagar vários."), ("Passeio", "Canais, filmes, séries, novelas."), ("Chamada", "Teste gratuito.")],
  "mantem": "A fala e o passeio do original, na ordem.",
  "tira": "\"IPTV é coisa do passado\" (contradiz o nosso serviço) e o nome Mundo Play, que fica mudo; o menu final com o nome \"Mundo TV\" fica fora da imagem. Nomes de canais na lista e legenda original cobertos.",
  "poe": "Estalo da marca, pílulas de assinatura, chips por seção, desfoque forte nas listas de canais e painel final."},
}

def main():
    (AQUI / "frames.json").write_text(json.dumps(H, ensure_ascii=False, indent=1), encoding="utf-8")
    videos = []
    for vid, r in VERSOES.items():
        videos.append({
            "etiqueta": r["etiqueta"], "titulo": r["titulo"], "ideia": r["ideia"],
            "jornada": [{"titulo": a, "texto": b} for a, b in r["jornada"]],
            "quadros": [{"id": q["id"], "t": q["t"], "legenda": q["legenda"], "img": f"quadros/{q['id']}.jpg"} for q in H[vid]],
            "roteiro": {"cartoes": [{"titulo": "O que fica do original", "texto": r["mantem"]}, {"titulo": "O que sai", "texto": r["tira"]}, {"titulo": "O que entra", "texto": r["poe"]}], "cenas": []},
        })
    plano = {
        "titulo": "VixPlay TV · 4 versões dos criativos do CMD", "arquivo": "VixPlay TV - 4 versoes dos criativos para aprovacao.pdf",
        "rodape": "VixPlay TV · Versões dos criativos validados · Para aprovação", "formato": "9:16", "quadros_por_pagina": 10,
        "tema": {"acento": "#99E200", "acento_texto": "#3C7A00", "sobre_acento": "#061000", "fundo": "#F5F6F2", "cartao": "#FFFFFF",
                 "linha": "#E1E5DA", "tinta": "#10140F", "tinta_2": "#2E352B", "cinza": "#7A8576", "escuro": "#010204",
                 "papel": "#F2F7EE", "papel_2": "#A7B5A2", "fonte_titulo": "Archivo", "titulo_caixa_alta": True,
                 "capa_escura": True, "aprovar_escura": True},
        "capa": {"chamada": "Para aprovação · 4 versões", "titulo": "Quatro versões", "titulo_destaque": "dos criativos do CMD",
                 "texto": "Fala original das pessoas, nome deles trocado pelo nosso e edição diferente em cada versão.",
                 "logo": "logo.png", "logo_altura_mm": 17, "imagens": ["quadros/E03.jpg", "quadros/F04.jpg", "quadros/H04.jpg"],
                 "numeros": [{"n": "E", "texto": "Rápida: o homem no carro (C1)."}, {"n": "F", "texto": "Economia de casa (C2)."},
                             {"n": "G", "texto": "Desabafo: a penteadeira (C3)."}, {"n": "H", "texto": "Passeio: a cozinha e o menu (C4)."}]},
        "videos": videos,
        "som": {"titulo": "Áudio e música", "texto": "A voz é a original de cada pessoa. A música entra baixa por baixo, diferente em cada versão.",
                "cartoes": [{"titulo": "Voz", "texto": "Áudio original de cada vídeo, com o nome deles silenciado onde era falado e um estalo curto da nossa marca no lugar."},
                            {"titulo": "Música", "texto": "Uma faixa por versão, 18 a 22 LU abaixo da voz, com ducking. As faixas de teste são prévia da Epidemic; antes de anunciar, baixar com a licença do plano."},
                            {"titulo": "Volume final", "texto": "-14 LUFS, pico máximo -1 dBTP."}],
                "efeitos": [["Nome original silenciado", "estalo curto e grave da marca"], ["Preço sobe até R$ 35", "tique suave"], ["Botão SAIBA MAIS", "toque discreto, uma vez"]]},
        "aprovar": {"titulo": "Para aprovar",
                    "itens": [{"texto": "Versão E (C1, o homem no carro)"}, {"texto": "Versão F (C2, a apresentadora e a TV)"},
                              {"texto": "Versão G (C3, o desabafo)"}, {"texto": "Versão H (C4, a cozinha e o passeio)"},
                              {"texto": "Manter a fala original das pessoas, com o nome deles silenciado",
                               "nota": "A voz de cada pessoa fica como no original. Onde ela falava Mundo Play ou GPT-TV, o áudio fica mudo e a nossa marca aparece."},
                              {"texto": "Aceitar as promessas que ficam na fala original",
                               "nota": "Streamings citados pelo nome, \"1.300 canais\", \"sem travamento\" e Big Brother 24 horas continuam na voz do C2 e do C4. É decisão do Vítor e do Deidson; fica registrado aqui. Preço, prazo de teste e pedido de comentário do original saem."},
                              {"texto": "Depoimento de pessoa real falando de outro aplicativo",
                               "nota": "No C3 e no C4 a pessoa diz que usa o aplicativo. Foi liberado pelo CMD para modelar; confirmar com ele por escrito que as imagens podem ser usadas com a nossa marca."},
                              {"texto": "Imagens de apoio do Pexels e música"}],
                    "nota_final": "Para ajustar, cite o código (ex.: muda o F05). Depois da aprovação, renderizamos as 4 versões."},
    }
    (AQUI / "plano.json").write_text(json.dumps(plano, ensure_ascii=False, indent=1), encoding="utf-8")
    print("frames:", sum(len(v) for v in H.values()), "| plano.json ok")

main()
