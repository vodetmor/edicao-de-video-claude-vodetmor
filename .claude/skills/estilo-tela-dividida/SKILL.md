---
name: estilo-tela-dividida
description: Estilo "tela dividida" (split) para vídeo de pessoa falando - rosto em cima e explicação embaixo se montando junto com a fala (lista, passos, número). Use quando o usuário pedir split, tela dividida, split reel, split diagrama, ou quando a fala explica um passo a passo.
---

# Estilo: tela dividida

Rosto em cima, explicação embaixo. Quem assiste ouve e vê a ideia se montar ao mesmo tempo, palavra por palavra.
O pipeline é o da skill `editar-video`: esta skill só decide a direção.

## Quando usar
- Explicar enquanto fala: passos de um método, lista de erros, dicas, números.
- Vídeo vertical 9:16 (no 16:9 vira lado a lado sozinho).
- Não use se a fala não tem nada para mostrar: a metade de baixo vazia fica pior que o corte limpo.

## Receita
| Parte | O que fazer |
|---|---|
| Base | `"estilo": "split"`, uma cena por ideia, todas `layout: "split"` |
| Abertura | `titulo` na primeira palavra do tema (gancho em até 3 s) |
| Meio | `passos` (2 a 4 nós) para processo, `lista` item a item para dicas, `numero` para dado dito |
| Troca | nova ideia = nova cena; o elemento anterior sai, o novo entra na palavra que o nomeia |
| Legenda | `limpa`; ela fica na faixa entre o rosto e o painel, longe dos botões da rede |
| Fim | `cta` embaixo com o rosto em cima (a pessoa convida, a tela confirma) |

Exemplo completo: `estudio/editor/estilos/exemplos/split.json`.

## Perguntas extras do briefing
- Quais são os passos ou itens, na ordem em que a pessoa fala? (confira na transcrição, não invente)
- Tem ícone ou logo de marca citada? Logo só com arquivo real em `assets/`.

## Crítica antes de mostrar
- Cada item entra na palavra dele, não todos de uma vez?
- Texto legível no celular (título ≤ 24 caracteres, item ≤ 22)? Corte palavras, não diminua a fonte.
- O rosto não foi cortado na divisão (queixo dentro da metade de cima)?
- Nunca mais de 4 itens por cena: dividida em duas cenas se passar disso.
