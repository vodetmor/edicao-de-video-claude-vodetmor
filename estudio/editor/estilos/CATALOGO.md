# Catálogo de estilos

Um estilo = layout base + legenda + ritmo de punch-in. Cada cena do roteiro pode trocar o layout, então os estilos
se misturam (ex.: corte limpo que abre uma moldura numa explicação). Exemplo de roteiro de cada um em `exemplos/`.

## Prontos (testados num bruto real de 20 s, 9:16)

Cada estilo pronto tem uma skill própria com a receita, as perguntas extras do briefing e a crítica antes de mostrar
(`.claude/skills/estilo-*`). Estilo novo = exemplo em `exemplos/` + skill `estilo-<nome>` no mesmo formato.

| Estilo | Nome no roteiro | Quando usar | Layout base |
|---|---|---|---|
| Corte limpo | `corte-limpo` | fala forte, pouco a explicar; cartões curtos por cima | `cheio` + punch-in alternado por frase |
| Tela dividida | `split` | explicar enquanto fala: lista, passos, número se montando embaixo | `split` (rosto em cima) |
| Painel em cima | `painel` | comparação, gráfico, antes/depois; rosto embaixo | `split-cima` |
| Moldura e quadro | `moldura` | aula ou conteúdo explicativo: tela cheia, e nas explicações o rosto vai para uma moldura e o quadro ocupa o resto; pode ir para `tela` (só explicação, voz continua) | `cheio` ↔ `moldura` ↔ `tela` |
| Reels forte | `reels-forte` | conteúdo de reels com legenda grande palavra a palavra (fora do DESIGN-SYSTEM do projeto: só quando o usuário pedir) | `cheio` + legenda `forte` |

Layouts: `cheio`, `split`, `split-cima`, `moldura`, `tela`. No 16:9, `split` vira lado a lado e a moldura vai para a direita.
Legendas: `limpa` (padrão), `destaque`, `forte`, `caixa`, `nenhuma`.
Elementos: `titulo`, `lista`, `numero`, `passos`, `grafico`, `comparar`, `icone`, `imagem` (arquivo real de `assets/`), `cta`.

## Mapa das referências de mercado → nosso caminho

Referências estudadas em 29/10/2026: o pacote de 20 estilos de um criador estrangeiro (página pública) e os 7 estilos
que o Jerônimo montou. Nada foi copiado: cada linha diz qual peça NOSSA cobre a mesma necessidade.

| Referência | Nosso equivalente | Situação |
|---|---|---|
| Business Reels / Personal Reels | `corte-limpo` ou `reels-forte` | pronto |
| Explainer Panel | `painel` / `split` | pronto |
| Split Reel / Split diagrama (Jerônimo) | `split` + `passos`/`lista` | pronto |
| Painel explicativo (Jerônimo) | `painel` + `titulo` + `numero` + `lista` | pronto |
| Corte limpo (Jerônimo) | `corte-limpo` | pronto |
| Fitted Captions | legenda `caixa` / `forte` | pronto |
| Educational YouTube / Split-Screen Lesson / Lesson Document (16:9) | `moldura` e `split` em 16:9 | pronto (falta exemplo 16:9 testado) |
| Ranking Format / Top 5 / Rapid List / Tips Breakdown | `lista` numerada por cena + `numero` | parcial: falta elemento `ranking` dedicado |
| This vs That / Clone Versus | `comparar` | parcial: falta lado a lado com dois takes |
| B-roll and Stacked Text / Visual Essay / Image Cluster | `imagem` com material real (`ferramentas/busca/busca.py`) | planejado: elemento de B-roll em tela cheia e grade de imagens |
| Canvas funil / Funil Miro (Jerônimo) | — | planejado: elemento `mapa` (nós ligados que se desenham com a fala e a câmera recua no fim) |
| Glass Explainer | — | não fazer: vidro é proibido no DESIGN-SYSTEM |
| Cut-out Backdrop / Cut-out Grid / Recorte em grade (Jerônimo) | — | depende de recorte com alfa de qualidade; testar antes de prometer (ver skill, referência `avancado.md`) |
| Depth UI / Interface atrás (Jerônimo) | — | depende do mesmo recorte (telas atrás da cabeça) |
| YouTube Clips / Coaching Call Clips | `corte-limpo` em trechos | planejado: escolher os melhores trechos de um vídeo longo |
| Cinematic Type / Big type stack | legenda `forte` + `titulo` | parcial |
| Vlog / Natural Story / Yap & Show | `corte-limpo` com ritmo `conteudo` | pronto (sem B-roll) |

Próximos a construir, em ordem de valor: `mapa` (funis que o Jerônimo quer), B-roll real em tela cheia, `ranking`,
exemplo 16:9 de aula, recorte com alfa (só se passar no teste de 5 s).
