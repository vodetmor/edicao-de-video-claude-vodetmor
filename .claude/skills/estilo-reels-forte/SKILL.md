---
name: estilo-reels-forte
description: Estilo "reels forte" para vídeo de pessoa falando - rosto em tela cheia com legenda grande de 1 a 3 palavras, maiúsculas, palavra falada colorida, ritmo alto. Use quando o usuário pedir legenda grande, palavra por palavra, estilo Hormozi, fitted captions ou reels de alto ritmo.
---

# Estilo: reels forte

Legenda é a estrela: palavras grandes que acompanham a fala segurando quem assiste sem som.
O pipeline é o da skill `editar-video`: esta skill só decide a direção.

## Quando usar
- Reels e TikTok de alto ritmo, opinião, lista rápida, gancho agressivo.
- Público que assiste sem som.
- Não use em aula longa nem em marca que pede sobriedade: fica cansativo. Prefira `estilo-corte-limpo`.

## Receita
| Parte | O que fazer |
|---|---|
| Base | `"estilo": "reels-forte"`, layout `cheio` |
| Legenda | `forte` (1 a 3 palavras, Archivo 800, palavra falada na cor `destaqueLegenda` da marca); a frase fecha nas vírgulas |
| Ritmo | `anuncio` (cortes secos) e punch-in automático por frase |
| Elementos | poucos: `numero` e `icone` nas palavras de impacto; a legenda já ocupa o olho |
| Zoom extra | 2 a 3 por vídeo nas frases mais fortes |
| Fim | `cta` curto, legenda continua |

Exemplo completo: `estudio/editor/estilos/exemplos/reels-forte.json`.

## Perguntas extras do briefing
- Qual cor de destaque da marca? (vai em `marca.json` → `destaqueLegenda`; precisa ler bem sobre o vídeo)
- Termos com grafia certa (nomes, marcas)? Vão em `--termos` na transcrição.

## Crítica antes de mostrar
- Nenhuma palavra errada na legenda (é o que mais aparece: confira a transcrição inteira).
- A legenda não cobre boca nem olhos (fica no terço de baixo, acima dos botões da rede).
- O destaque lê bem em fundo claro e escuro? Se não, troque a cor.
