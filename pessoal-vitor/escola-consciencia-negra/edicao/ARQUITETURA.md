# Arquitetura · Vídeo "Racismo Ambiental"

Como a gramática estudada no `SPEC.md` vira o nosso vídeo, e como o vídeo é montado tecnicamente.
Regras gerais de motion do projeto: `/mnt/project-files/motion-base/LICOES-MOTION.md` (valem aqui também).

## 1. Regras visuais (escritas uma vez, valem para o vídeo todo)

| Item | Regra |
|---|---|
| Formato | 1920×1080, 30 fps, 16:9 |
| Fundo | quase preto quente `#15110E` |
| Meios-tons | sépia/cinza quente (fotos em P&B puxadas para marrom) |
| Texto | branco-papel `#EDE6DA` |
| **Destaque único** | **vermelho escuro `#83251A`** (como na referência), que fica terracota `#B5532A` quando iluminado sobre foto. Só aparece em momentos fortes: título, números, clímax e frase final |
| Fonte serifada (títulos, nomes, citações) | Cormorant Garamond ou Libre Caslon (Google Fonts, grátis) |
| Fonte máquina de escrever (local e data) | Special Elite ou Courier Prime (Google Fonts) |
| Fonte da legenda cinética | Inter |
| Proibido | degradê, brilho, vidro, azul ou roxo, tudo entrando com fade, mais de um foco por quadro |

## 2. Os blocos visuais do nosso vídeo

| Bloco | Inspirado em | Nosso uso |
|---|---|---|
| **Abertura** | silêncio + aviso + cold open | 2 s de tela preta em silêncio → chuva entra no som → texto pequeno "Baseado na obra *Racismo Ambiental: Entenda essa Luta* (Canal Preto, 2021)" → rua alagada em câmera lenta → Vítor |
| **Nome de cada integrante** | fita de papel com nome | Quando a pessoa diz "Eu sou…", entra uma fita de papel claro com o nome em serifada, ao lado do rosto, com um impacto grave leve. Some depois de uns 3 s |
| **Título** | citação gigante | RACISMO AMBIENTAL em serifada vermelha, tela preta, silêncio antes e impacto grave no reveal |
| **Datas e locais** | etiqueta de máquina de escrever | "LEI DE TERRAS, 1850", "LEI ÁUREA, 1888", "MORRO DA PROVIDÊNCIA, 1897", "WARREN COUNTY, EUA, 1982", digitadas letra a letra com clique de máquina |
| **Fotos de arquivo** | Ken Burns + grão + vinheta | fotos históricas (Marc Ferrez, Augusto Malta, protestos de 1982) sempre em movimento lento, com grão e vinheta |
| **Números** | citação gigante | "16 MILHÕES" e "7 EM CADA 10" em tela cheia, número em vermelho, fonte IBGE pequena embaixo |
| **Legenda cinética** | só nas frases de impacto | só nas frases-chave de cada integrante (ex.: "O chão, não.", "Isso não é coincidência."), sobre fundo escuro ou desfocado; palavra atual em branco e as já ditas em marrom |
| **A-roll dos integrantes** | punch-in alternado | cada frase alterna entre 100%, 112% e 125% de zoom; entrada com desfoque → foco |
| **Clímax** | mancha vermelha + corte mais rápido | fim da Anna Augusta ("dignidade negada, todos os dias"): cortes mais rápidos do vídeo, imagens de enchente e valas, a mancha vermelha tomando a imagem e depois silêncio |
| **Virada** | — | Maria Alice: a imagem clareia, fotos de mobilização, trilha cresce |
| **Fecha o círculo** | bookend | Anna Júlia: volta a rua alagada e a chuva da abertura; frase final em tela preta; créditos em serifada com função em vermelho |

### Tratamento das gravações dos integrantes

Cada pessoa vai gravar com um celular diferente, então a correção de cor serve para deixar tudo com cara de um filme só:
- dessaturar um pouco, esquentar, preto mais profundo, vinheta e grão leve iguais em todos;
- normalizar o volume de cada voz, tirar o chiado e cortar os silêncios longos;
- vídeo vertical, se vier: recortar o centro com cuidado, ou colocar sobre fundo escuro com a pessoa um pouco de lado, no estilo entrevista.

## 3. Estrutura de tempo (alvo 7 a 8 min)

| Tempo | Quem | Energia | Som |
|---|---|---|---|
| 0:00–1:10 | Vítor | gancho + história | silêncio → chuva → drone grave → violoncelo |
| 1:10–2:20 | Maria Eduarda | história | cordas + percussão lenta, cliques de máquina |
| 2:20–3:30 | Cainã | análise | pulso tenso, impacto nos números |
| 3:30–4:35 | Luísa | análise | piano espaçado, silêncio em "funciona em silêncio" |
| 4:35–5:40 | Anna Augusta | **clímax** | cresce até o corte seco e o silêncio |
| 5:40–6:50 | Maria Alice | virada | trilha esperançosa crescendo |
| 6:50–8:00 | Anna Júlia | fechamento | violoncelo da abertura, chuva, trilha cheia nos créditos |

Os tempos exatos saem das gravações reais. O roteiro é sugestão e a versão final muda.

## 4. Pipeline técnico

```
brutos/ (7 vídeos)
  └─ 1. ingestão (ffmpeg): 1080p, 30 fps constante, áudio 48 kHz, loudness por voz
       └─ 2. transcrição com tempo por palavra (Whisper)
            └─ 3. corte (silêncios, melhor take, ordem 1→7)
                 └─ 4. timeline.json  ← fonte única da verdade: cortes, zooms, textos, B-roll, sons
                      ├─ 5. gráficos e composição (Remotion, lendo timeline.json)
                      └─ 6. áudio (trilha + SFX + ducking + master -14 LUFS, ffmpeg)
                           └─ 7. render sem áudio → mux com ffmpeg → prévia 720p → final 1080p
                                └─ 8. crítica por uma sessão separada (nota ≥ 8/10)
```

| Etapa | Ferramenta | Estado na nuvem hoje |
|---|---|---|
| Ingestão, cortes, cor, mux | ffmpeg (versão estática instalada via pip) | funciona |
| Transcrição com tempo por palavra | Whisper (grátis, roda aqui) | **bloqueado**: o download do modelo precisa do domínio `openaipublic.azureedge.net` liberado |
| Composição e texto animado | Remotion (npm) | funciona |
| Fotos históricas | Wikimedia Commons, Brasiliana Fotográfica, Arquivo Nacional, Agência Brasil (CC BY) | busco com a pesquisa web, mas **download bloqueado** |
| Vídeos de apoio | Pexels / Pixabay (API com chave grátis) | **bloqueado** |
| Trilha | Jamendo (API com chave grátis) | **bloqueado** |
| Efeitos (chuva, água) | Freesound (API com chave grátis) | **bloqueado** |
| Efeitos sintéticos (impacto grave, riser, clique de máquina) | gerados em Python, como no v6 | funciona |
| Fontes | Google Fonts | funciona |

## 5. Pastas

```
escola-consciencia-negra/edicao/
  SPEC.md · ARQUITETURA.md · PLANO.md
  referencia/        quadros e espectrogramas do estudo
  brutos/            vídeos dos integrantes (1-vitor.mp4 … 7-anna-julia.mp4)
  ingest/            vídeos normalizados
  transcricoes/      JSON com tempo por palavra
  assets/fotos/ · assets/videos/ · assets/musica/ · assets/sfx/
  assets/CREDITOS.md fonte e licença de cada arquivo (vai para os créditos)
  timeline.json
  remotion/          projeto de composição
  render/            prévias e versão final
```

## 6. Acréscimos da pesquisa de 29/09/2026

Tirados do estudo `motion-base/estudos/caso-criminal/SPEC.md` e das referências em `motion-base/referencias/`. Só a gramática; a identidade continua a da seção 1 (sépia, serifada, vermelho-escuro, nada de neon ou glitch).

| Momento | Técnica nova | Números |
|---|---|---|
| Bloco histórico (Vítor → Maria Eduarda) | **Mesa de arquivo com câmera contínua**: 1850, 1888, 1897 e 1982 ficam espalhados numa grande mesa de papel escuro, cada data com sua foto/documento. Em vez de cortar, a câmera viaja de uma estação para a outra | pan ease-in-out de ~1,3 s por ~60% da largura; parada com drift de 0,25%/quadro; texto parado ≥ 8 quadros |
| Lei Áurea / Lei de Terras | **Círculo desenhado à mão** no trecho do documento real + no máximo 1 carimbo no vídeo todo | traço `#83251A`, desenhado em ~0,5 s (15 quadros) |
| Morro da Providência 1897/1920 | **Foto com moldura sobre a palavra gigante** PROVIDÊNCIA (serifada, atrás da foto) e depois **entrar na foto** (zoom atravessando a moldura até tela cheia) | foto entra com approach k≈0,14; zoom de travessia ~0,6 s |
| Zoom Terra → Rio → Providência | Google Earth Studio (real) + desaceleração final com a nossa curva + nome do lugar e linha de chamada | ver `PROMPTS-FLOW.md`, momento 2 |
| Mapa do Cainã | **Mapa escuro de relevo** com a área acesa por contorno e preenchimento vermelho-escuro (modelo: `referencias/pinterest/videos/mapa-4.mp4`), rótulos por **linha de chamada** ("lixão", "esgoto", "encosta") | câmera sempre em deriva lenta; nada de quadros parados |
| Números 16,4 milhões / 72,9% | contagem com o número em vermelho-escuro e fonte pequena "IBGE, Censo 2022 (2024)" | o roteiro diz "7 em cada 10": confere (72,9% pretos ou pardos) |
| Clímax / Virada | planos de IA só simbólicos, sem rostos (`PROMPTS-FLOW.md`, momentos 3 e 4) | — |
