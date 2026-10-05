# SPEC: vídeo de lançamento Gojiberry × OpenAI (0–30 s)

Referência enviada por Vítor em 28/09/2026: o vídeo lado a lado do @notdwd. Usei **só o painel da esquerda** (o original da Gojiberry), recortado em x=30, y=305, 916×516, a 24 fps. São 720 quadros, com o áudio compartilhado.
As medições foram feitas com código (`metrics.json`: caixa do conteúdo escuro e do colorido a cada quadro, diferença entre quadros e ataques do áudio). As folhas de contato estão em `sheetA.png` (0–15 s) e `sheetB.png` (15–30 s), com 4 quadros por segundo.

## Números globais
- **Cortes secos:** só 2 (quadro 37→38 e 686). O resto é **plano-sequência**: a câmera empurra, faz pan, ou um elemento vira o próximo (morph, íris, whip).
- **Pouso ("chega rápido, pousa suave"):** medi três pousos. O botão de enviar vai de 456 a 292 px com diferenças 47, 34, 23, 18, 14, 10, 8, 6, 4, o que dá **k ≈ 0,25 da distância restante por quadro a 24 fps** (≈ 0,21 a 30 fps). A tagline entra com 21, 15, 9, 5, 4, 2, que dá k ≈ 0,3 no começo.
- **Saídas aceleram (ease-in):** o wordmark apaga com passos de 4, 5, 4, 6, 7, 9, 14, 21 px, e o cartão sai com 0, 2, 2, 3, 5, 5, 7, 10, 12, 17, 24 px em ~12 quadros (0,5 s).
- **Nada congela:** na pausa da tagline a câmera faz pan constante de **~0,16% da largura por quadro**. No lockup de abertura, zoom-out de ~1% por quadro.
- **Digitação:** cada frase de 3–5 palavras entra em **12–16 quadros** (~0,6 s), palavra por palavra, com blur e cor. Depois fica ~20–30 quadros em pausa com pan lento para a esquerda.
- **Som:** 80 ataques em 30 s (~2,7 por segundo). **Quase toda ação tem um som.** A loudness integrada é de **-14,4 LUFS**. A autocorrelação indica pulso de ~125 BPM (23 quadros).
- **Visual:** fundo branco (~250 de luminância), tinta preta, **uma cor de marca** (coral/laranja) só nas palavras-chave, tipografia sans grande. Não há degradê de fundo, só o ladrilho do ícone.

## Lista de shots (quadros a 24 fps)

| # | Quadros | O que acontece | Movimento medido | Sons (quadro) |
|---|---|---|---|---|
| 1 | 0–37 | Lockup "OpenAI + Gojiberry". As marcas digitam-se (o ícone entra, o wordmark aparece letra a letra) e o segundo nome entra colorido e vira preto | xmax 130→397 em saltos de palavra (quadros 2, 12, 18, 20). Depois zoom-out lento de ~1%/quadro | 18, 24, 27 |
| 2 | 38–100 | UI de chat "What can I help with?" com caixa "Ask anything". **Corte seco** no 38 e push-in rápido para a direita (52–57). O cursor entra, clica (67), e digita "Run my outbound" (72–92) | push de ~1,6× em 6 quadros. Ripple no clique | 42, 52, 57, **67**, 78, 84, 87 |
| 3 | 100–140 | O ícone do app nasce (pop), o wordmark digita-se letra a letra com blur (108–122), fica 6 quadros, **apaga da direita para a esquerda acelerando** (126–138) e o ícone encolhe | exit ease-in | 110, **116**, 121, 127, **138** |
| 4 | 140–172 | O ícone vira ladrilho saturado e "respira". Um **anel pontilhado (íris)** expande e revela a próxima UI de dentro (165–175) | escala da íris ~×4 em 10 quadros | 147, 154, 159, 167 |
| 5 | 172–208 | Janela de chat desktop. A barra lateral se popula e a câmera empurra devagar até o canto da caixa de texto | push contínuo | 178, 189, 192, 198, 204 |
| 6 | 208–452 | **Close extremo dentro da caixa.** "@Gojiberry" (negrito, 216–240) e depois 4 frases digitadas palavra a palavra, com a câmera acompanhando: "Find 100 SaaS founders hiring salespeople" (248–318), "enrich their contact details" (324–366), "write a personalised message" (372–402) e "and launch the campaign." (414–452). A câmera faz pan para a esquerda o tempo todo, e entre frases há um salto de linha | pan ~2–3 px/quadro (meia resolução) ≈ 0,5%/quadro | 233, 238, 257, 276, 314, 333, 341–359 (um por palavra), 377, 386, 390, 400, 415, 426, 429, 435 |
| 7 | 452–471 | O botão de enviar (círculo preto com seta) aparece à direita. A câmera **empurra até ele** (~×3), o cursor entra e **clica no 470** | pouso k≈0,25 | **452**, 457, 461, **470** |
| 8 | 471–490 | O botão explode em **pixels** na cor da marca (dispersão), e o botão avança para a câmera e sai | — | 476, 480, 483 |
| 9 | 490–516 | O balão da mensagem (azul-claro, com o prompt) entra de baixo com blur de movimento. "Working…" abaixo | entrada com blur vertical | 499, 512 |
| 10 | 516–530 | **Whip-zoom** em "Working" (palavra gigante, blur horizontal forte). O pico de diferença no 527 é a transição | — | **529** |
| 11 | 528–560 | Grade espalhada de ~8 fotos de leads com rótulo "Analysing Lead…" e zoom-out rápido que assenta | pouso | **535**, 547 |
| 12 | 560–590 | A câmera se aproxima de uma foto, e as outras saem pelas bordas | push | 569, 579, 586 |
| 13 | 590–622 | O cartão de contato se monta linha a linha (nome, cargo, e-mail, telefone, LinkedIn, ícones), com **stagger** ~3 quadros. Sai para a esquerda acelerando (610–622) | exit ease-in 12 quadros | 591, 597, 602, 607, 612 |
| 14 | 622–686 | Tagline "Brings the right context into every message" palavra a palavra com cor (626–642), que depois vira preto. Pausa com pan lento (642–676) e **whip para a esquerda** com blur horizontal (676–685). **Corte seco no 686** | pan 0,16%/quadro | **627**, 631, **639**, 642, 650, 655, **668**, 672 |
| 15 | 686–720 | O cartão de contato volta grande, o cursor passa e a câmera abre para a UI final | push | 701, 707, 715 |

## KEEP / CHANGE para a v6 (demo do benchmark)

**KEEP (idêntico):** os quadros de cada shot, os 2 cortes secos, os pushes e pans de câmera, pousos com k≈0,25/quadro a 24 fps, saídas ease-in, digitação palavra a palavra com blur, a íris pontilhada, a explosão em pixels, o whip-zoom, a grade espalhada, o cartão montando linha a linha, a tagline com pan e whip, e os sons nos mesmos quadros.

**CHANGE (nosso):**
| Referência | v6 |
|---|---|
| OpenAI + Gojiberry | **OpenAI (GPT-6 Astra) + Claude (Fable 5.1)**, com SVGs reais |
| "What can I help with?" / "Run my outbound" | "Como posso ajudar?" / "Compare os dois" |
| Ícone e wordmark Gojiberry | Símbolo do Claude e "Fable 5.1". O ladrilho da íris vira o símbolo da OpenAI |
| Janela ChatGPT | Janela de chat neutra, sem marca |
| "@Gojiberry Find 100 SaaS founders…" | "@Placar Compare Fable 5.1 e GPT-6 Astra / em código e matemática, / raciocínio e trabalho real / e me diga quem vence." |
| Pixels coral | Pixels laranja Claude #D97757 e tinta |
| Balão azul-claro, "Working…" | Balão cinza-claro, "Analisando…" |
| Fotos de leads | Ladrilhos de benchmark (logo + nota + nome do teste) |
| Cartão de contato | Cartão de resultado: "Índice de Inteligência 53 = 53" e as 4 linhas de notas |
| "Brings the right context into every message" | "O melhor modelo depende da sua tarefa." |
| Cor coral/laranja em degradê nas palavras | **Uma cor só** (#D97757), sem degradê |

**Regras visuais (fixas):** fundo #FFFFFF, tinta #1D1D1F, cinza #86868B, acento #D97757, Inter, 16:9 1920×1080 a 24 fps (igual à referência; a versão 9:16 vem depois).
**Proibido:** degradê, glow, vidro, fade em tudo, UI de marca falsa e logo redesenhado.
