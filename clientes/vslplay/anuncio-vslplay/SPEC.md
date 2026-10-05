# SPEC · estudo quadro a quadro das 3 referências do anúncio VSL Play

29/09/2026 · medido com ffmpeg + Python (diferença entre quadros, rastreio do objeto, onsets e loudness). Vídeos em `referencias/`. Tudo a 30 fps, quadro de 1920×1080.

## ref-brain.mp4 (showreel "caderno de motion", 15 s)

É o vídeo que o prompt colado descreve. Serve para as **técnicas** (quique, stretch, stagger, spin, snap, easing, follow-through, antecipação), não para o visual.

| Medida | Valor |
|---|---|
| Cortes | 12 em 15 s: 2,13 (bola para tipo), 3,77 (tipo para palavras), 4,00 a 4,70 (uma palavra a cada 4 a 7 quadros), 5,17, 5,57 (para o gráfico), 8,47 (chicote para partículas), 13,17 (para o final) |
| Quadros congelados | 8,6% (quase nada parado) |
| Luminância por segundo | claro 0 a 3 s, escuro 4 a 5 s, claro 6 a 8 s, escuro 9 a 13 s, claro 14 s: alterna claro e escuro a cada 2 a 5 s |
| Bola | 94 px de diâmetro. Impactos nos quadros 14, 28, 42 e 56: **um a cada 14 quadros**, que é exatamente uma batida da música |
| Queda inicial | de y 0 a y 770 em 10 quadros (gravidade real), andando ~22 px/quadro para a direita |
| Altura dos quiques | 384 px, 269 px, 174 px: cada quique tem **0,68** da altura do anterior |
| Squash no impacto | proporção largura/altura **2,6 por 1 quadro**, depois 0,98 e 0,74 na subida |
| Stretch na queda | **0,60** na velocidade máxima; área preservada (6.500 a 6.900 px² o tempo todo) |
| No topo do arco | 1,16 (a bola "achata" de leve no ponto parado) |
| Onion skin | contornos finos nas posições anteriores, mais juntos no topo e mais separados na queda |
| Tipo "I MAKE THINGS MOVE." | letras sobem com stagger de ~45 ms (1,35 quadro), rotação leve e **blur vertical forte** no movimento; o ponto azul pousa depois das letras |
| BOUNCE / STRETCH / SPIN / SNAP | cada palavra demonstra o próprio verbo: quique com gravidade, esticão elástico com overshoot, rotateY de 450° com perspectiva, e SNAP sem easing, com guias vermelhas por 4 quadros |
| Transição rápida | chicote lateral com blur direcional forte (8,1 a 8,7 s) |
| Final | anel de progresso 0 a 100%, antecipação (o ponto achata e recua), soltura que motiva a entrada do título final |
| Áudio | **128,6 BPM** (14 quadros por batida), -14,9 LUFS integrado, LRA 4,8 LU; impactos da bola caem nos onsets 0,53 / 1,00 / 1,47 / 1,93 s |

## ref-jackson.mp4 (reel de identidades de marca, 25 s)

Serve para a **desconstrução e reconstrução de logo**.

| Medida | Valor |
|---|---|
| Cortes | 60 em 25 s, em rajadas de 4 a 6 quadros (ex.: 9,6 a 10,5 s e 21,0 a 22,7 s) intercaladas com planos de 1 a 3 s |
| Quadros congelados | 50%: os planos de logo pousam e seguram; o ritmo vem das rajadas |
| Loudness | -12,4 LUFS, LRA 13,4 LU (mais dinâmico que o ref-brain) |
| Construção de marca | a peça-chave entra primeiro, gira e se multiplica em volta de um centro (asterisco, 0 a 1 s) |
| Letras | nascem de uma máscara na linha de base, uma a uma; letras finas se desenham traço a traço |
| Linha que conecta | "P—L—A—N": uma linha liga as letras e a câmera segue a ponta da linha |
| Campos de cor | fundos chapados (oliva, verde, azul-petróleo, amarelo) com a marca em branco ou preto; nenhum degradê |

## ref-x.mp4 (gráfico "The token flood", 8 s)

Serve para o **gráfico de retenção** (e para o vídeo da escola).

| Medida | Valor |
|---|---|
| Cortes | 7, quase todos numa rajada de 5,2 a 5,7 s (a volta do zoom) |
| Quadros congelados | 34% (a segurança final do gráfico) |
| Câmera | segue a ponta da linha com zoom de ~2,4x; uma etiqueta preta com o valor acompanha a ponta e troca de número a cada poucos quadros |
| Revelação | ao fim da linha, a câmera abre (zoom out) e mostra o gráfico inteiro com título e fonte |
| Selo | um círculo se desenha, enche de cor e recebe o número-resumo ("27x mais em 52 semanas") |
| Fonte | rodapé pequeno com a origem do dado, sempre visível |

## O que fica igual e o que muda no anúncio

**Fica igual (medido):** quique a cada 14 quadros com razão 0,68, squash 2,6 por 1 quadro, stretch 0,60, stagger de tipo de 1 a 2 quadros com blur vertical, SNAP sem easing com guias por 4 quadros, chicote com blur direcional, câmera que segue a ponta do gráfico a ~2,4x e depois abre, selo circular, alternância claro/escuro a cada 2 a 5 s, 128,6 BPM (14 quadros por batida), master perto de -14 LUFS.

**Muda:** a bola azul vira o **ponto branco da logo VSL Play**; as palavras que demonstram o próprio verbo viram **recursos do player que demonstram a própria função**; as anotações à mão viram chamadas técnicas finas em Inter (limite de 2 famílias do DESIGN-SYSTEM); o "caderno" vira o **próprio player**: timecode no canto e trilha de progresso embaixo; os campos de cor do ref-jackson vêm das 3 fitas da logo (coral, ciano, violeta), sempre chapados.
