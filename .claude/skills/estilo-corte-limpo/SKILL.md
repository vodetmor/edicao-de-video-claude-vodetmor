---
name: estilo-corte-limpo
description: Estilo "corte limpo" para vídeo de pessoa falando - rosto em tela cheia, punch-in alternado por frase, cartões curtos por cima só nas palavras-chave. Use quando o usuário pedir corte limpo, vídeo direto, reels de negócio, vlog ou "só limpa e legenda".
---

# Estilo: corte limpo

A pessoa é o vídeo. A edição tira o que atrapalha (pausas, tomadas, vícios) e dá ritmo com zoom, sem esconder o rosto.
O pipeline (cortes, rosto, painel, render) é o da skill `editar-video`: esta skill só decide a direção.

## Quando usar
- Fala forte, opinião, história, convite, bastidor; pouco para explicar na tela.
- Quem fala tem presença e a gravação está boa (luz, enquadramento).
- Não use quando a fala explica processo, números ou comparação: aí vá para `estilo-tela-dividida` ou `estilo-moldura`.

## Receita
| Parte | O que fazer |
|---|---|
| Base | `"estilo": "corte-limpo"`, layout `cheio` o vídeo todo |
| Ritmo | punch-in automático por frase (1 → 1,1 → 1 → 1,18); ritmo de corte `conteudo`, ou `anuncio` se o objetivo é venda |
| Elementos | no máximo 1 cartão a cada 6–10 s, só em palavra-chave: `titulo` curto, `numero` dito, `icone`, `cta` |
| Zoom extra | `"zooms": [{"de": "palavra", "nivel": 1.2}]` na frase de impacto (1 ou 2 por vídeo) |
| Legenda | `limpa` (padrão); `caixa` se o fundo for claro ou poluído |
| Fim | `cta` na palavra do convite, rosto inteiro visível |

Exemplo completo: `estudio/editor/estilos/exemplos/corte-limpo.json`.

## Perguntas extras do briefing
- Qual é a frase mais forte do vídeo? (vira o zoom extra)
- Tem logo, preço ou número que precisa aparecer? (vira cartão; logo só com o arquivo real)

## Crítica antes de mostrar
- O rosto fica inteiro em todo zoom (testa e queixo dentro, olhos no terço de cima)?
- Algum cartão cobre a boca ou fica mais de 4 s? Corte.
- Há trecho de mais de 10 s sem nenhuma mudança (zoom, cartão ou corte)? Coloque um zoom.
- Os cortes de pausa deixaram respiração natural? Se soar picotado, use o ritmo `conteudo`.
