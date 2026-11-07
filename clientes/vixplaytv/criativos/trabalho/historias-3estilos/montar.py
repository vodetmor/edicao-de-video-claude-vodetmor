# -*- coding: utf-8 -*-
"""Gera plano.json (skill pdf-aprovacao) dos 3 storytellings em estilos diferentes.
Quadros: quadros/R*, D*, F* (renderizados de C:/tmp/sb/sb.html por cells.js)."""
import json
from pathlib import Path

AQUI = Path(__file__).parent
cells = {c["code"]: c for c in json.loads((AQUI / "cells.json").read_text(encoding="utf-8"))}
tema = json.loads((AQUI.parent / "historias-vox" / "plano.json").read_text(encoding="utf-8"))["tema"]


NETO = [
    ("0:00", "CAPA (1º frame, vitrine do Instagram): \"Como a vovó voltou a ver novela\", vovó e neto no sofá, logo."),
    ("0:01", "A mão escreve A VOVÓ e começa a desenhar a vovó."),
    ("0:03", "Vovó no sofá, TV com ?; a mão escreve \"como é que liga?\" no balão."),
    ("0:05", "A mão escreve ATÉ QUE O NETO CHEGA, com marca-texto verde."),
    ("0:06", "A mão desenha o neto do lado da vovó, com o celular."),
    ("0:08", "TUTORIAL: celular desenhado com as linhas do passo a passo."),
    ("0:11", "Passos 1, 2 e 3 escritos e marcados: plano, Pix, acesso."),
    ("0:14", "PARA CADA APARELHO: a mão desenha TV, box e celular."),
    ("0:16", "DEU DÚVIDA? Balão com \"suporte humano no WhatsApp\"."),
    ("0:19", "NOVELA! A vovó feliz; a mão desenha estrelinhas."),
    ("0:21", "Vovó e neto no sofá; a mão pinta de verde o menu: canais, filmes, séries, novelas."),
    ("0:24", "R$ 35 circulado em verde; a mão escreve \"no primeiro mês\"."),
    ("0:26", "PIX, SEM CARTÃO, SEM FIDELIDADE com ✓ verde."),
    ("0:28", "TESTE GRÁTIS DE 4 HORAS, botão ASSISTA COM A VIXPLAY TV e o logo real colado."),
]

CAPAS = {
    "R": ("0:00", "CAPA (1º frame, vitrine do Instagram): QUEM MANDA NO CONTROLE?, foto com tinta verde e logo."),
    "D": ("0:00", "CAPA (1º frame, vitrine do Instagram): \"A conta do mês... fecha?\" no caderno, bilhete e logo."),
    "F": ("0:00", "CAPA (1º frame, vitrine do Instagram): SEXTA À NOITE. E A TV?, adesivos e logo."),
}


def quadros(p):
    out = []
    if p == "N":
        return [{"id": f"W{i:02d}", "t": t, "legenda": l, "img": f"quadros/W{i:02d}.jpg"} for i, (t, l) in enumerate(NETO)]
    t0, l0 = CAPAS[p]
    out.append({"id": f"{p}00", "t": t0, "legenda": l0, "img": f"quadros/{p}00.jpg"})
    for i in range(1, 9):
        c = cells[f"{p}{i:02d}"]
        t = c["n"].split("·")[1].strip()
        out.append({"id": c["code"], "t": t, "legenda": c["d"], "img": f"quadros/{c['code']}.jpg"})
    return out


V = [
    {
        "etiqueta": "Whiteboard · A vovó e o neto · 30 s · 14 quadros",
        "titulo": "A vovó e o neto",
        "ideia": "Estilo whiteboard: uma mão real com pincel desenha a história em tempo real no quadro branco, traço preto e destaque em verde VixPlay. A vovó não sabe ligar, o neto chega e ensina.",
        "jornada": [
            {"titulo": "Problema", "texto": "A vovó quer a novela e não sabe ligar."},
            {"titulo": "Ajuda", "texto": "O neto chega com o tutorial."},
            {"titulo": "Passos", "texto": "Plano, Pix, acesso; tutorial por aparelho."},
            {"titulo": "Oferta", "texto": "R$ 35, sem cartão, teste de 4 horas."},
        ],
        "q": "N",
        "narracao": "A vovó queria ver a novela... mas como é que liga? Até que o neto chega. Tutorial: um, escolhe o plano. Dois, paga por Pix. Três, recebe o acesso. Tem tutorial pra cada aparelho: TV, box e celular. Deu dúvida? Suporte no WhatsApp. E a novela, ó! R$ 35 no primeiro mês. Pix, sem cartão e sem fidelidade. Teste grátis de quatro horas. Toque em saiba mais.",
    },
    {
        "etiqueta": "Estilo 1 · Referência · 30 s · 9 quadros",
        "titulo": "Domingo à noite",
        "ideia": "Na edição da referência: palavra por palavra com desfoque, fundo verde vivo, fotos com tinta verde, esfera de rede e cartões de chat.",
        "jornada": [
            {"titulo": "Gancho", "texto": "Quem manda no controle?"},
            {"titulo": "Dor", "texto": "Cada um quer um; várias assinaturas."},
            {"titulo": "Solução", "texto": "Uma só mensalidade, 3 passos, 3 telas."},
            {"titulo": "Oferta", "texto": "R$ 35, sem cartão, teste de 4 horas."},
        ],
        "q": "R",
        "narracao": "Domingo à noite. Quem manda no controle? Cada um quer um programa diferente. E você, cansou de pagar várias assinaturas? Aqui é uma só mensalidade. Escolhe o plano, paga por Pix e recebe o acesso no WhatsApp. Até três telas: TV, box e celular. R$ 35 no primeiro mês, sem cartão e sem fidelidade. Renovando em dia, R$ 30. Teste grátis de quatro horas. Toque em saiba mais.",
    },
    {
        "etiqueta": "Estilo 2 · Desenho à mão · 30 s · 9 quadros",
        "titulo": "A conta do mês",
        "ideia": "Caderno de linhas: a letra se escreve na tela, as contas são riscadas de vermelho e o preço ganha círculo e marca-texto verde.",
        "jornada": [
            {"titulo": "Gancho", "texto": "A conta do mês fecha?"},
            {"titulo": "Dor", "texto": "Assinatura 1, 2, 3: o total assusta."},
            {"titulo": "Virada", "texto": "E se fosse uma só? R$ 35."},
            {"titulo": "Oferta", "texto": "Pix, 3 telas, teste de 4 horas."},
        ],
        "q": "D",
        "narracao": "A conta do mês. Assinatura um, assinatura dois, assinatura três... o total assusta. Faz a conta de novo. E se fosse uma só? R$ 35 no primeiro mês. Paga por Pix, sem cartão, sem fidelidade. TV, celular ou box, até três telas. Teste grátis de quatro horas: é só chamar no WhatsApp.",
    },
    {
        "etiqueta": "Estilo 3 · Fotos reais · 30 s · 9 quadros",
        "titulo": "Sexta à noite",
        "ideia": "Fotos reais em corte rápido, legenda grande com contorno, adesivos verdes e tela dividida.",
        "jornada": [
            {"titulo": "Gancho", "texto": "Sexta à noite: o que assistir?"},
            {"titulo": "Dor", "texto": "Cada um quer uma coisa. E a conta?"},
            {"titulo": "Solução", "texto": "Uma mensalidade; Downloader e tutorial."},
            {"titulo": "Oferta", "texto": "R$ 35, Pix, teste de 4 horas."},
        ],
        "q": "F",
        "narracao": "Sexta à noite. O que vai assistir? Cada um quer uma coisa. E a conta? Uma só mensalidade: filmes, séries, novelas e canais ao vivo. Instala pelo Downloader, com tutorial pra cada aparelho. R$ 35 no primeiro mês. Pix, sem cartão, sem fidelidade. Teste grátis de quatro horas. Saiba mais.",
    },
]

plano = {
    "titulo": "VixPlay TV · 4 histórias em 4 estilos",
    "arquivo": "VixPlay TV - 4 historias em 4 estilos para aprovacao.pdf",
    "rodape": "VixPlay TV · 4 histórias em 4 estilos · Para aprovação",
    "formato": "9:16",
    "quadros_por_pagina": 14,
    "tema": tema,
    "capa": {
        "chamada": "Para aprovação · 4 roteiros",
        "titulo": "Quatro histórias",
        "titulo_destaque": "em 4 estilos",
        "texto": "Gancho, cenas e edição próprios. O 1º frame de cada vídeo é a capa da vitrine do Instagram.",
        "logo": "logo.png",
        "logo_altura_mm": 17,
        "imagens": ["quadros/W00.jpg", "quadros/R00.jpg", "quadros/F00.jpg"],
        "numeros": [
            {"n": "1", "texto": "A vovó e o neto: whiteboard, a mão desenhando."},
            {"n": "2", "texto": "Domingo à noite: edição da referência, palavra por palavra."},
            {"n": "3", "texto": "A conta do mês: desenho à mão no caderno."},
            {"n": "4", "texto": "Sexta à noite: fotos reais em corte rápido."},
        ],
    },
    "videos": [
        {
            "etiqueta": v["etiqueta"], "titulo": v["titulo"], "ideia": v["ideia"], "jornada": v["jornada"],
            "quadros": quadros(v["q"]),
            "roteiro": {"narracao": v["narracao"]},
        }
        for v in V
    ],
    "som": {
        "titulo": "Som",
        "texto": "Voz na frente; música 18 a 22 LU abaixo, volta nas pausas. Volume final −14 LUFS.",
        "cartoes": [
            {"titulo": "Voz", "texto": "ElevenLabs, gerada por vocês a partir das locuções deste PDF."},
            {"titulo": "Música", "texto": "Vovó: música leve e alegre. Estilo 1: eletrônica com pulso. Estilo 2: violão leve. Estilo 3: pop com batida marcada."},
        ],
        "efeitos": [
            ["Palavra entrando", "whoosh curto"],
            ["Selo, adesivo ou preço", "pop"],
            ["Lápis e risco (estilo 2)", "rabisco de lápis"],
            ["Logo no fim", "brilho curto"],
        ],
    },
    "aprovar": {
        "titulo": "Para aprovar",
        "itens": [
            {"texto": "Quais estilos vão para vídeo (1, 2, 3, 4)"},
            {"texto": "Locução de cada história", "nota": "para gerar no ElevenLabs"},
            {"texto": "Fotos do estilo 3", "nota": "Pexels, licença livre"},
        ],
        "nota_final": "Para ajustar, cite o código (ex.: muda o R03).",
    },
}
(AQUI / "plano.json").write_text(json.dumps(plano, ensure_ascii=False, indent=1), encoding="utf-8")
print("plano.json ok")
