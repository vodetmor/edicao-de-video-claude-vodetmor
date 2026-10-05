# Estudo · "Caso criminal em 30 s" (referência enviada em 29/09/2026)

Arquivo: `referencia.mp4` (1280×720, 60 fps, 34 s, AAC 48 kHz). Folhas de contato a cada 0,25 s em `folha-0.jpg` … `folha-7.jpg`.
Medição feita com código: diferença entre quadros (cortes e quadros congelados), correlação de fase quadro a quadro (movimento de câmera em px) e espectro do áudio.

> Não copiar a identidade (polícia, vermelho/azul neon, grade de caderno). O que vale copiar é a **gramática**: como a câmera anda entre "estações", como foto e texto se combinam, e o fato de quase nada ficar parado.

## 1. Lista de shots

| # | Tempo | O que acontece | Técnica |
|---|---|---|---|
| 1 | 0,00–2,50 | Cena 3D de crime (quarto, fita policial), silhueta vermelha. O nome MENHAZ entra letra a letra, com contorno neon, **atrás e na frente** da silhueta | Texto entre camadas (profundidade), fita policial em parallax |
| 2 | 2,50–5,25 | Fundo cinza com grade. Polaroid do suspeito (tarja vermelha pintada à mão nos olhos) cai girando sobre o nome gigante CHRISTOPHER, que fica **atrás** da foto | Foto + nome gigante condensado, sombra projetada |
| 3 | 5,25–7,20 | A câmera **sobe** (pan vertical): o nome anterior sai por baixo, TRACEY + polaroid da vítima entram por cima | Estações empilhadas, câmera viaja entre elas |
| 4 | 7,20–8,60 | Zoom para dentro da foto da vítima: vira tela cheia, desfocada, cor lavada, vinheta | "Entrar na foto" como transição |
| 5 | 8,60–15,40 | Fundo preto. Mãos ilustradas vermelha e azul, o homem aparece no meio. Pílula brilha na mão, linha puxa o rótulo KILL HIS PARENTS; depois TELL THE TRUTH do lado azul | Ilustração + rótulo com linha de chamada (callout) |
| 6 | 15,43–19,70 | Calendário real sobre madeira. Páginas viram (agosto → novembro), a câmera mergulha até o dia 19 e um círculo vermelho é desenhado; "2015" entra | Objeto físico + círculo desenhado à mão |
| 7 | 19,70–23,25 | A polaroid do suspeito entra por cima do calendário, recebe carimbo **GUILTY**; a polaroid da vítima cai por cima. Câmera recua e mostra a pilha sobre a mesa | Pilha de fotos = evidências; carimbo |
| 8 | 23,27–28,25 | Grade escura. Ícones em círculo (JOB, FUTURE, SCHOOL) desenhados por um arco que fecha; rótulos com letras em glitch RGB. A câmera **desliza na horizontal** entre eles | "Estações" em trilho horizontal |
| 9 | 28,27–32,57 | "X" vermelho, título BRIEFLY EXPLAINED em serifada com glitch, logo do jogo, print do jogo em moldura rasgada ligada por uma linha à mão | Título + moldura de papel rasgado + linha à mão |
| 10 | 32,57–34,0 | Preto | Fim |

Cortes secos medidos (quadro a 60 fps): 150 (2,50 s), 432 (7,20), 516 (8,60), 926 (15,43), 1396 (23,27), 1696 (28,27), 1954 (32,57). **Só 7 cortes em 34 s**: o resto é uma câmera contínua que viaja. Isso é o que faz parecer "animado" e caro.

## 2. Números medidos

| Medida | Valor | Como usar |
|---|---|---|
| Entrada da polaroid (2,82 s) | pico de **427 px/quadro** (a 1280 px) no 1º quadro, depois decai: 28 → 21 → 17 → 15 → 13 → 10 … px por quadro, até ~1 px em 2 s | É o "chega rápido, pousa suave". Decaimento ≈ **7% da distância restante por quadro a 60 fps = ~14% a 30 fps**. Bate com a nossa regra k = 0,12–0,19 |
| Pan vertical entre estações (4,90–6,50 s) | 636 px em 1,6 s, pico no meio (5,63 s), 17 px/quadro | Pan com **aceleração e desaceleração** (ease-in-out), não o approach |
| Pan horizontal entre ícones (24,85–26,13 s) | 770 px (60% da largura) em 1,28 s, pico 28 px/quadro exatamente no meio | Ease-in-out simétrico: ~0,6 s acelerando, ~0,6 s freando |
| Depois de pousar | a câmera **continua andando** a 3–4 px/quadro (≈ 0,3% da largura por quadro) | Mesmo número da nossa regra "nada congela" (0,25%/quadro) |
| Quadros congelados | só 14 trechos ≥ 0,1 s; o maior tem 1,7 s (calendário parado para leitura) | Parada total só quando há texto para ler |
| Brilho médio | alterna escuro (3–30) e claro (120–137 no calendário) | O contraste entre blocos marca capítulos |
| Saturação | quase zero nas estações cinza; cor só nas fotos e no vermelho/azul | Um fundo neutro faz a foto real "saltar" |
| Áudio | narração + trilha constante, sobe de −30 para −15 dBFS ao longo do vídeo; centroide espectral sobe de ~650 Hz para ~1.500 Hz | A trilha **cresce** até o fim, sem quedas. Não há impactos isolados detectáveis: o som acompanha, não pontua |

## 3. O que levar para o vídeo da escola

1. **Câmera contínua entre estações**: em vez de cortar de foto para foto, colocar datas e fotos numa "mesa" ou "parede" grande e fazer a câmera viajar entre elas (pan ease-in-out de ~1,3 s, depois drift de 0,25%/quadro).
2. **Foto real + palavra gigante atrás**: nome de lugar (PROVIDÊNCIA, WARREN COUNTY) em letras enormes atrás de uma foto de arquivo com moldura. Para nós: serifada (Cormorant) em papel, e não a fonte condensada da referência.
3. **Entrar na foto**: zoom que atravessa a moldura e vira tela cheia. Ótimo para passar da data (1897) para a foto do morro.
4. **Círculo desenhado à mão** em cima de um documento real (Lei Áurea, Lei de Terras, mapa do IBGE). Traço vermelho escuro `#83251A`, desenhado em ~0,5 s.
5. **Carimbo** sobre documento: por exemplo, "1888" ou "LIVRES?" sobre a Lei Áurea. Usar com muita parcimônia (1 vez no vídeo).
6. **Linha de chamada (callout)** ligando um ponto da foto a um rótulo: "lixão", "esgoto a céu aberto", "encosta". Serve bem ao mapa do Cainã.

O que **não** levar: neon, brilho em texto, glitch RGB, fita policial, azul (fora da paleta do projeto).
