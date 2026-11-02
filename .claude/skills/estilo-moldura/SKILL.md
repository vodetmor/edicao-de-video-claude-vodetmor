---
name: estilo-moldura
description: Estilo "moldura e quadro" para aula ou conteúdo explicativo - começa em tela cheia, nas explicações o rosto vai para uma moldura e o quadro ocupa o resto, e pode ir para tela só de explicação com a voz continuando. Use quando o usuário pedir aula, conteúdo educativo, lesson, educational YouTube ou moldura.
---

# Estilo: moldura e quadro

Funciona como uma aula: o professor fala de perto, chama o quadro quando precisa e volta para olhar no olho.
O pipeline é o da skill `editar-video`: esta skill só decide a direção.

## Quando usar
- Aula, explicação de conceito, tutorial, conteúdo de autoridade; vídeos de 45 s a vários minutos.
- 9:16 (moldura em cima, quadro embaixo) ou 16:9 (moldura à direita).
- Não use em anúncio curto de venda: troque por `estilo-tela-dividida`.

## Receita
| Parte | O que fazer |
|---|---|
| Base | `"estilo": "moldura"` |
| Abertura | `cheio`: a pessoa apresenta o tema olhando para a câmera |
| Explicação | cena `moldura` com `titulo` + `passos`/`lista` montando na fala |
| Ápice | cena `tela` (só o quadro, a voz continua) para o conceito mais importante: `numero`, `comparar`, `lista` |
| Ciclo | cheio → moldura → tela → cheio; troque de layout a cada ideia nova, nunca mais de 10 s iguais |
| Ritmo | `aula` (respiros maiores) |
| Legenda | `limpa`; no `tela` ela continua embaixo |
| Fim | volta ao `cheio` e `cta` |

Exemplo completo: `estudio/editor/estilos/exemplos/moldura.json`.

## Perguntas extras do briefing
- Qual é a sequência do conteúdo (conceito → exemplo → o que cai na prova / o que fazer)?
- Tem material de apoio real (imagem, print, fórmula)? Vai em `assets/` e entra como `imagem`.

## Crítica antes de mostrar
- Cada troca de layout acontece no começo de uma ideia, não no meio de uma frase?
- Os elementos da cena nova esperam a moldura chegar (nada aparece por cima do rosto em movimento)?
- O quadro explica a frase que está sendo dita, e não a próxima?
