# -*- coding: utf-8 -*-
"""PDF de aprovação das 4 HISTÓRIAS na edição da referência do Deidson (anúncio "Vox", 06/11/2026).
Mesmas histórias A-D já elogiadas por ele; muda o estilo da edição: cena cheia, texto grande em movimento,
cartões de imagem inclinados, janela com o NOSSO aplicativo, preço e botão como cartões grandes.
Gera frames.json (estudio/motor/stills_vix.mjs) e plano.json (skill pdf-aprovacao).
Fatos só da seção 2 do ESTADO.md; sem nome de canal/streaming, sem 'melhor', sem 'na hora', sem legalidade."""
import json
from pathlib import Path

AQUI = Path(__file__).resolve().parent
H, ROT = {}, {}

def L(*xs):
    """linhas do bloco Kin: texto simples = branco; 'n:texto' = verde; 'o:texto' = contorno"""
    out = []
    for x in xs:
        if x.startswith("n:"): out.append({"l": x[2:], "c": "neon"})
        elif x.startswith("o:"): out.append({"l": x[2:], "c": "out"})
        else: out.append({"l": x})
    return out

def kin(*xs, sub=None, fs=132, top=620):
    p = {"linhas": L(*xs), "fs": fs, "top": top}
    if sub: p["sub"] = sub
    return {"camadas": [{"bloco": "Kin", "p": p}], "f": 40}

def mont(imgs, ss, *xs):
    return {"camadas": [{"bloco": "Mont", "p": {"imgs": imgs, "ss": ss, "linhas": L(*xs)}}], "f": 45}

def jan(ss, titulo, chips=(), **kw):
    return {"camadas": [{"bloco": "Janela", "p": {"ss": ss, "titulo": list(titulo), "chips": list(chips), **kw}}], "f": 60}

def preco(*xs, renova=True):
    return {"camadas": [{"bloco": "Kin", "p": {"linhas": L(*xs), "fs": 150, "top": 330}},
                        {"bloco": "Preco", "p": {"tNum": 0.1, "tRenova": 1.0 if renova else 99, "tPix": 1.4} if renova else {"renova": False, "tNum": 0.1, "tPix": 1.0}}], "f": 105}

def cta(*xs):
    return {"camadas": [{"bloco": "Kin", "p": {"linhas": L(*xs), "fs": 120, "top": 330}}, {"bloco": "CTA", "p": {"horas": True}}], "f": 80}

def hist(vid, titulo, etiqueta, ideia, jornada, itens):
    """itens: (id, tempo, fala, direcao, spec)"""
    ROT[vid] = {"titulo": titulo, "etiqueta": etiqueta, "ideia": ideia, "jornada": jornada,
                "narracao": " ".join(i[2] for i in itens), "cenas": [(i[1], i[2], f"{i[0]}: {i[3]}") for i in itens]}
    for fid, t, fala, dire, spec in itens:
        H.setdefault(vid, []).append({"id": fid, "t": t, "legenda": dire, "spec": spec})

# ---------------- A: Domingo à noite ----------------
hist("A", "Domingo à noite", "Criativo A · cerca de 40 s · 8 quadros",
     "Uma família disputa o controle. Cada um num aplicativo; a VixPlay TV junta tudo e todo mundo assiste junto.",
     [("Conflito", "Todos querem coisas diferentes."), ("Descoberta", "Alguém lembra da VixPlay TV."), ("Solução", "Tudo no mesmo lugar, em até 3 telas."), ("Oferta", "R$ 35 no 1º mês, Pix, teste de 4 horas.")],
     [("A01", "0:00", "Domingo à noite. A família toda no sofá, pipoca pronta, e a disputa de sempre: o que vamos assistir?", "três cartões de imagem sobem com a família e o controle; texto grande: DOMINGO À NOITE, UM SÓ CONTROLE.", mont(["familia", "controle", "casal"], [1, 2, 3], "DOMINGO À NOITE", "n:UM SÓ CONTROLE")),
      ("A02", "0:06", "Um quer filme, outro quer série, a criança pede desenho e a avó só quer a novela.", "palavras grandes entram uma a uma sobre fundo escuro: CADA UM PEDE UMA COISA.", kin("CADA UM", "PEDE UMA", "n:COISA", sub="Filme, série, desenho e novela")),
      ("A03", "0:10", "Cada um num aplicativo, cada um com uma assinatura.", "contagem em texto grande: 4 CELULARES, 4 APLICATIVOS, 4 ASSINATURAS.", kin("4 CELULARES", "4 APLICATIVOS", "n:4 ASSINATURAS", fs=96)),
      ("A04", "0:14", "Foi aí que alguém lembrou da Vix Play TV.", "a janela com o nosso aplicativo entra com o título CONHEÇA A VIXPLAY TV.", jan(12, ["CONHEÇA A", "VIXPLAY TV"])),
      ("A05", "0:18", "Canais ao vivo, filmes, séries, doramas, novelas e infantil, tudo em um só aplicativo.", "janela do app; chips entram na palavra falada.", jan(48, ["TUDO EM", "UM LUGAR"], ["Canais ao vivo", "Filmes", "Séries", "Doramas", "Novelas", "Infantil"], ox=70)),
      ("A06", "0:26", "Em até três telas: na sala, no quarto e no celular.", "texto grande: ATÉ 3 TELAS; ao lado, sala, quarto e celular.", kin("ATÉ", "n:3 TELAS", sub="Na sala, no quarto e no celular", fs=190)),
      ("A07", "0:31", "O primeiro mês custa trinta e cinco reais, no Pix, sem cartão e sem fidelidade.", "preço como cartão grande: R$ 35, Pix, sem cartão.", preco("PRIMEIRO MÊS", renova=False)),
      ("A08", "0:36", "Toque em Saiba mais e solicite o seu teste grátis de quatro horas.", "texto grande SEU TESTE GRÁTIS e painel com o botão SAIBA MAIS.", cta("SEU TESTE", "n:GRÁTIS"))])

# ---------------- B: A conta do mês ----------------
hist("B", "A conta do mês", "Criativo B · cerca de 36 s · 7 quadros",
     "Caderno e calculadora no fim do mês: a soma das assinaturas assusta. A VixPlay TV reúne tudo em um aplicativo só.",
     [("Cena", "Fim do mês, caderno aberto."), ("Susto", "O total é maior do que parecia."), ("Caminho", "Tudo em um aplicativo."), ("Oferta", "R$ 35, depois R$ 30 em dia.")],
     [("B01", "0:00", "Fim do mês. Em cima da mesa, o caderno e a calculadora.", "cartões de imagem com a pessoa e o dinheiro; texto grande: FIM DO MÊS, A CONTA CHEGOU.", mont(["dinheiro", "manha", "frustrado"], [1, 2, 3], "FIM DO MÊS", "n:A CONTA CHEGOU")),
      ("B02", "0:05", "Uma assinatura de filmes, outra de séries, outra de esportes, outra de infantil.", "frases grandes entram em sequência: UMA ASSINATURA AQUI, OUTRA ALI.", kin("UMA ASSINATURA", "AQUI,", "n:OUTRA ALI", fs=100)),
      ("B03", "0:11", "Soma daqui, soma dali, e o total chega maior do que parecia.", "texto grande pesado: O TOTAL PESA MAIS DO QUE PARECIA.", kin("O TOTAL", "n:PESA MAIS", sub="do que parecia")),
      ("B04", "0:15", "Existe um jeito mais simples de organizar isso. A Vix Play TV reúne tudo em um aplicativo só.", "a janela com o nosso aplicativo entra: MAIS SIMPLES, UM APP SÓ.", jan(19, ["MAIS SIMPLES:", "UM APP SÓ"], ox=30, oy=55, zoom=1.6)),
      ("B05", "0:20", "Canais ao vivo, filmes, séries, doramas e novelas.", "janela do app com chips do que tem dentro.", jan(39, ["O QUE TEM", "DENTRO"], ["Canais ao vivo", "Filmes", "Séries", "Doramas", "Novelas"])),
      ("B06", "0:26", "O primeiro mês custa trinta e cinco reais, e a renovação em dia, trinta.", "cartão de preço com a linha Renovando em dia: R$ 30.", preco("A CONTA", "n:FICA SIMPLES")),
      ("B07", "0:32", "Pix, sem cartão e sem renovação automática. Toque em Saiba mais.", "texto grande e painel com SAIBA MAIS e teste de 4 horas.", cta("TESTE", "n:SEM CARTÃO"))])

# ---------------- C: O tutorial do neto ----------------
hist("C", "O tutorial do neto", "Criativo C · cerca de 48 s · 8 quadros",
     "O neto instala o aplicativo para a avó seguindo o tutorial do aparelho. Mostra o processo simples e o suporte.",
     [("Cena", "Avó indecisa, neto ao lado."), ("Passo a passo", "Plano, Pix, acesso pelo WhatsApp."), ("Instalação", "Tutorial para cada aparelho."), ("Resultado", "Ela acha a novela. R$ 35.")],
     [("C01", "0:00", "A avó queria assistir à novela no quarto, mas não sabia por onde começar.", "cartões de imagem com o controle e o celular; texto grande: A AVÓ QUERIA ASSISTIR À NOVELA.", mont(["controle", "manha", "celular"], [1, 2, 3], "A AVÓ QUERIA", "n:ASSISTIR À NOVELA")),
      ("C02", "0:06", "O neto sentou do lado e resolveu em poucos passos.", "cartões de imagem com o celular; texto grande: O NETO ABRIU O TUTORIAL.", mont(["celular", "familia", "controle"], [2, 1, 4], "O NETO ABRIU", "n:O TUTORIAL")),
      ("C03", "0:11", "Ele escolheu o plano, pagou por Pix e recebeu o acesso pelo WhatsApp.", "três passos grandes entram um a um: ESCOLHE O PLANO, PAGA POR PIX, RECEBE O ACESSO.", kin("1 ESCOLHE O PLANO", "2 PAGA POR PIX", "n:3 RECEBE O ACESSO", fs=86, top=640)),
      ("C04", "0:20", "Depois abriu o tutorial do aparelho e instalou pelo Downloader, com um código. Tem tutorial para cada aparelho.", "janela do app; título TUTORIAL PARA CADA APARELHO; chips Smart TV, TV Box e celular.", jan(14, ["TUTORIAL PARA", "CADA APARELHO"], ["Smart TV", "TV Box", "Celular"], ox=90, oy=70)),
      ("C05", "0:27", "Se aparece uma dúvida, o suporte atende pelo WhatsApp.", "texto grande: DÚVIDA? SUPORTE NO WHATSAPP, com dois balões simples.", kin("DÚVIDA?", "SUPORTE NO", "n:WHATSAPP", sub="Gente de verdade do outro lado")),
      ("C06", "0:33", "Lá dentro tem novelas, filmes, séries, canais ao vivo e infantil.", "janela do app nas novelas, com chips.", jan(75, ["A NOVELA", "ESTÁ AQUI"], ["Novelas", "Filmes", "Séries", "Canais ao vivo", "Infantil"], ox=90, oy=70)),
      ("C07", "0:40", "O primeiro mês custa trinta e cinco reais, em até três telas na mesma casa.", "preço como cartão grande, com até 3 telas.", preco("PRIMEIRO MÊS", renova=False)),
      ("C08", "0:45", "Toque em Saiba mais e solicite o seu teste grátis de quatro horas.", "texto grande e painel com SAIBA MAIS.", cta("SEU TESTE", "n:GRÁTIS"))])

# ---------------- D: Tudo no mesmo lugar (a mulher na pia entra aqui como cena de abertura) ----------------
hist("D", "Tudo no mesmo lugar", "Criativo D · cerca de 50 s · 10 quadros",
     "Um casal cansado de trocar de aplicativo ganha um menu só, e o vídeo faz o passeio completo por dentro do app.",
     [("Atrito", "Ela quer série, ele quer esporte."), ("Virada", "Tudo no mesmo menu."), ("Passeio", "Canais, filmes, séries, doramas, novelas."), ("Oferta", "R$ 35, suporte, teste.")],
     [("D01", "0:00", "Ela quer série, ele quer esporte, e a TV vive trocando de aplicativo.", "cartões de imagem do casal e do controle; texto grande: ELA QUER SÉRIE, ELE QUER ESPORTE.", mont(["casal", "controle", "frustrado"], [1, 3, 2], "ELA QUER SÉRIE", "n:ELE QUER ESPORTE")),
      ("D02", "0:06", "Aplicativo, login, menu, de novo.", "palavras grandes em sequência: APLICATIVO, LOGIN, MENU, DE NOVO.", kin("APLICATIVO,", "LOGIN,", "MENU,", "n:DE NOVO", fs=120)),
      ("D03", "0:11", "Agora tudo fica no mesmo lugar. Abre a Vix Play TV e o menu é direto.", "janela do app com o título POR DENTRO DA VIXPLAY TV.", jan(11.5, ["POR DENTRO DA", "VIXPLAY TV"], ox=90, oy=70)),
      ("D04", "0:16", "Em canais ao vivo tem esportes, filmes e séries, infantil, documentários, canais abertos e fechados.", "janela do app (listas de canais desfocadas) e chips das categorias.", jan(20, ["CANAIS", "AO VIVO"], ["Esportes", "Filmes e séries", "Infantil", "Documentários", "Abertos e fechados"], blur=9)),
      ("D05", "0:22", "Em filmes, uma seção só de lançamentos e categorias como ação, comédia e drama.", "janela do app nos filmes, com chips.", jan(47, ["FILMES", "LANÇAMENTOS"], ["Lançamentos", "Ação", "Comédia", "Drama", "Infantil"])),
      ("D06", "0:28", "Em séries, várias temporadas e um espaço só para doramas, e tem novelas também.", "janela do app nas séries, com chips.", jan(66, ["SÉRIES,", "DORAMAS"], ["Várias temporadas", "Doramas", "Novelas"])),
      ("D07", "0:33", "Até três telas no mesmo plano: sala, quarto e celular.", "texto grande ATÉ 3 TELAS.", kin("ATÉ", "n:3 TELAS", sub="No mesmo plano", fs=190)),
      ("D08", "0:38", "O primeiro mês custa trinta e cinco reais, e a renovação em dia, trinta. Pix, sem cartão e sem fidelidade.", "cartão de preço com a linha de renovação em dia.", preco("PRIMEIRO MÊS", "n:R$ 35", renova=True)),
      ("D09", "0:43", "Se tiver dúvida, o suporte atende pelo WhatsApp.", "texto grande: SUPORTE NO WHATSAPP.", kin("DÚVIDA?", "n:SUPORTE", "NO WHATSAPP", fs=120)),
      ("D10", "0:47", "Toque em Saiba mais e solicite o seu teste grátis de quatro horas.", "texto grande e painel com SAIBA MAIS.", cta("SEU TESTE", "n:GRÁTIS"))])

def main():
    (AQUI / "frames.json").write_text(json.dumps(H, ensure_ascii=False, indent=1), encoding="utf-8")
    videos = []
    for vid, r in ROT.items():
        videos.append({
            "etiqueta": r["etiqueta"], "titulo": r["titulo"], "ideia": r["ideia"],
            "jornada": [{"titulo": a, "texto": b} for a, b in r["jornada"]],
            "quadros": [{"id": q["id"], "t": q["t"], "legenda": q["legenda"], "img": f"quadros/{q['id']}.jpg"} for q in H[vid]],
            "roteiro": {"narracao": r["narracao"], "cenas": [{"t": a, "fala": b, "direcao": c} for a, b, c in r["cenas"]]},
        })
    plano = {
        "titulo": "VixPlay TV · 4 histórias na edição da referência", "arquivo": "VixPlay TV - 4 historias estilo referencia para aprovacao.pdf",
        "rodape": "VixPlay TV · Histórias na edição da referência · Para aprovação", "formato": "9:16", "quadros_por_pagina": 10,
        "tema": {"acento": "#99E200", "acento_texto": "#3C7A00", "sobre_acento": "#061000", "fundo": "#F5F6F2", "cartao": "#FFFFFF",
                 "linha": "#E1E5DA", "tinta": "#10140F", "tinta_2": "#2E352B", "cinza": "#7A8576", "escuro": "#010204",
                 "papel": "#F2F7EE", "papel_2": "#A7B5A2", "fonte_titulo": "Archivo", "titulo_caixa_alta": True,
                 "capa_escura": True, "aprovar_escura": True},
        "capa": {"chamada": "Para aprovação · 4 roteiros", "titulo": "Quatro histórias", "titulo_destaque": "na edição da referência",
                 "texto": "As mesmas histórias A a D, agora com a edição do anúncio de referência: cena cheia, texto grande em movimento, cartões de imagem inclinados, janela com o nosso aplicativo e preço e botão em cartões grandes.",
                 "logo": "logo.png", "logo_altura_mm": 17, "imagens": ["quadros/A05.jpg", "quadros/B03.jpg", "quadros/D01.jpg"],
                 "numeros": [{"n": "A", "texto": "Domingo à noite: a família disputa o controle."},
                             {"n": "B", "texto": "A conta do mês: o caderno e a calculadora."},
                             {"n": "C", "texto": "O tutorial do neto: instalar e usar."},
                             {"n": "D", "texto": "Tudo no mesmo lugar: o casal e o menu."}]},
        "videos": videos,
        "som": {"titulo": "Voz, música e efeitos", "texto": "Locução de narrador por história, no ritmo da referência: frase curta, palavra-chave grande na tela no momento em que é falada.",
                "cartoes": [{"titulo": "Voz", "texto": "Locução no ElevenLabs a partir do texto Narração de cada roteiro, 2 takes. Voz brasileira, ritmo firme e claro."},
                            {"titulo": "Música", "texto": "Faixa instrumental por criativo, 18 a 22 LU abaixo da voz, com ducking. As faixas de teste são prévias da Epidemic; antes de anunciar, baixar com a licença do plano."},
                            {"titulo": "Volume final", "texto": "-14 LUFS, pico máximo -1 dBTP."}],
                "efeitos": [["Palavra grande entra", "toque curto e seco"], ["Cartões de imagem sobem", "deslize suave"], ["Preço sobe até R$ 35", "tique suave"], ["Botão SAIBA MAIS", "toque discreto, uma vez"]]},
        "aprovar": {"titulo": "Para aprovar",
                    "itens": [{"texto": "O estilo da edição (texto grande, cartões, janela do app)", "nota": "Montado a partir do anúncio de referência que o Deidson enviou."},
                              {"texto": "A história do criativo A (Domingo à noite)"}, {"texto": "A história do criativo B (A conta do mês)"},
                              {"texto": "A história do criativo C (O tutorial do neto)"}, {"texto": "A história do criativo D (Tudo no mesmo lugar)"},
                              {"texto": "Imagens de apoio de banco de imagens grátis (Pexels)", "nota": "Pessoas e cenas vêm do Pexels; se preferirem cenas geradas no Google Flow, trocamos os cartões."},
                              {"texto": "Os textos de narração", "nota": "Só fatos já confirmados: R$ 35, R$ 30 em dia, 3 telas, Pix, suporte pelo WhatsApp, teste de 4 horas."},
                              {"texto": "Música e volume"}],
                    "nota_final": "Para ajustar, cite o código (ex.: muda o B03). Depois da aprovação, geramos as vozes e renderizamos um de cada vez."},
    }
    (AQUI / "plano.json").write_text(json.dumps(plano, ensure_ascii=False, indent=1), encoding="utf-8")
    print("frames:", sum(len(v) for v in H.values()), "| plano.json ok")

main()
