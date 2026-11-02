---
name: estilo-painel
description: Estilo "painel em cima" para vídeo de pessoa falando - painel explicativo ocupa a parte de cima (comparação, gráfico, antes e depois, número grande) e o rosto fica embaixo. Use quando o usuário pedir painel explicativo, explainer panel, comparação, antes e depois ou "mostrar o dado".
---

# Estilo: painel em cima

O dado é o protagonista: o painel em cima prende o olho, o rosto embaixo dá confiança.
O pipeline é o da skill `editar-video`: esta skill só decide a direção.

## Quando usar
- Comparação (errado × certo, antes × depois, barato × caro), resultado, tendência, um número que muda a cabeça.
- Anúncio que precisa provar algo com dado real.
- Não use para conversa sem dado: vira um painel com frase solta.

## Receita
| Parte | O que fazer |
|---|---|
| Base | `"estilo": "painel"`, cenas com `layout: "split-cima"` |
| Abertura | `numero` ou `titulo` grande no gancho (primeiros 3 s) |
| Meio | `comparar` (esquerda/direita, cada lado na sua palavra), `grafico` (só com pontos reais; senão fica a nota "ilustrativo"), `numero` com `rotulo` |
| Respiro | entre painéis densos, 1 cena `cheio` curta (2–4 s) para o rosto voltar |
| Legenda | `limpa` |
| Fim | `cta` com o rosto de volta (`cheio` ou `split`) |

Exemplo completo: `estudio/editor/estilos/exemplos/painel.json`.

## Perguntas extras do briefing
- Qual é a comparação ou o número central, e de onde ele vem? (fonte real, ou dito na fala)
- A pessoa quer mostrar print ou gráfico de verdade? Peça o arquivo; nunca desenhe um "parecido".

## Crítica antes de mostrar
- Todo número na tela foi dito ou está no briefing? Número inventado = erro grave.
- Um painel por ideia; o olho sabe para onde ir em 1 s?
- O rosto embaixo não fica atrás da legenda nem da área de botões da rede?
