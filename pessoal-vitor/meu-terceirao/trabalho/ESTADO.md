# Meu Terceirão: ESTADO

## Feito (12/11/2026)
- Músicas em MP3: `musica/tempo-perdido.mp3` (5:02) e `musica/pelo-tempo-que-durar.mp3` (3:20).
- Áudio do piloto (80,6 s): `musica/piloto-audio.mp3` = Tempo Perdido 12,0→41,2 s + 122,4→154,6 s + 185,3→206,5 s, crossfades de 1 s, fade-out 76,5→81 s. Letra com tempo por palavra conferida: `musica/piloto-audio.palavras.json`.
- Inventário da 232: 45 fotos renomeadas em `fotos/f01v..f45h` (h = horizontal, v = vertical), 15 vídeos (`videos/` tem só as miniaturas; os mp4 ficam em `232/`), folhas de contato `fotos/_folha.jpg` e `videos/_folha.jpg`. Pasta `231/` ainda vazia.
- Recortes de pessoas (rembg u2net) em `recortes/` (f22h usado no efeito de profundidade).
- TV de tubo real (Pexels, livre) em `referencias/tv-crt/` (licença em LICENCAS.md); usada a #8.
- Composição Remotion: `estudio/motor/src/obras/terceirao/Terceirao.tsx` (id `Terceirao`, 1920x1080, 30 fps, 2430 quadros). Assets copiados para `estudio/motor/public/terceirao/` (fora do Git).
- Quadros-chave: `previa/quadros/_folha-quadros.jpg`.
- Prévia 720p: `previa/piloto-720p-bruto.mp4` (render) → `previa/piloto-720p.mp4` (loudnorm -14 LUFS).

## v2 (12/11/2026, depois do 1º piloto): feedback do Vítor aplicado
- Todas as 45 fotos no vídeo (tira de filme em "mas tenho muito tempo" absorveu f16h, f25h, f33v, f35h); conferido por script (só f22h e f13h repetem de propósito).
- "tempo": recorte e fundo com a mesma transformação (sem meninas duplicadas); fundo desfoca quando a palavra entra.
- Cor: nada de P&B; filtro quente/amarelado de lembrança (sepia 0,38, saturate 1,4) → cor viva.
- Intro: sala retrô quente (Pexels #12: TV, xadrez, videogame, vaso) no lugar da TV no escuro; câmera parte da sala inteira e entra na tela.
- Referências PMV do Vítor (links.md) → scrapbook: papel kraft + fita + sombra de planta no mural, vazamento de luz nas trocas de cena, parede "tempo" atrás da tira, HUD REC no clipe, fecho "terceirão" com a turma dentro das letras.
- Assets novos em `estudio/motor/public/terceirao/`: tv2.jpg, papel.jpg, planta-sombra.png, recortes PNG.

## Decisões do Vítor
- Piloto 60–90 s com começo/meio/fim, Tempo Perdido; horizontal; sem fala; todas as fotos ficam (a do trote também); direitos da música não preocupam (exibição interna).
- Intro "lembranças": TV de tubo real com fita VHS dentro (PLAY, timecode, chuvisco, scanlines) e a câmera entra na tela. Blender descartado (sem GPU, sem referência).
- Uma ideia tipográfica por frase (foco, passa, cresce, profundidade com recorte, encosta, afasta, dissolve, extrusão 3D) e transições de edit (zoom, empurra com blur direcional, cruza).
- Efeito "lembrança" (bordas clareiam e desfocam, brilho sobe) nos picos: entrada pela TV, "temos todo o tempo do mundo", "somos tão jovens". Só nas fotos, nunca no texto.

## Como refazer
```
cd estudio/motor
npx remotion still src/index.ts Terceirao saida.jpg --frame=800          # um quadro
npx remotion render src/index.ts Terceirao previa.mp4 --scale=0.6667     # 720p
npx remotion render src/index.ts Terceirao final.mp4                     # 1080p
ffmpeg -i previa.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy saida.mp4 # master
```
Trocar a música: refazer `piloto-audio.mp3` (ffmpeg atrim/acrossfade), transcrever com `groq_transcrever.py --palavras` e atualizar a tabela `T` no .tsx.

## Próximo passo
- Vítor avaliar a prévia 720p; ajustes pontuais na fonte; depois render 1080p.
- Quando chegar a 231: entram no Mural (D) e na sequência final; nada precisa ser refeito.
- Versão completa de 5 min: 5 atos do plano em `referencias/PESQUISA.md`.

## Feedback do Vítor sobre a v2 (12/11/2026 18:55) — PARADO até o Luiz mandar a 231; a próxima edição é a FINAL (5 min)
1. Fundo de papel kraft ("branco com pelos"): fora. Incomodou muito.
2. Efeito "lembrança": não é vinheta branca. É o BRILHO subindo com leve desfoque (bloom), sem véu nas bordas.
3. Mural sem senso de 3D (fotos diminuíram, fundo não). Fazer 3D de verdade: câmera num espaço 3D, cenário 3D, transições 3D (three/GLSL do motor liberados).
4. Faltaram os vídeos: todos entram, trecho divertido de cada, música abaixa e o som do vídeo toca como lembrança.
5. Faltou motion 3D de cenário e transições.
6. Textos: "DF" (não SP), "Escola La Salle Sobradinho", 2026. Fotos de vários anos.
7. Final: 232 + 231 misturados (grupo de amigos), nunca separado por sala. Todas as fotos e vídeos das duas turmas.

### Respostas do Vítor para a FINAL (12/11/2026 19:00)
- Espaço 3D: fotos flutuando, câmera voando entre elas (aprovado). Objetivo único: EMOÇÃO, fazer chorar de saudade. Cores que remetem a saudade, fugindo de paleta monocromática.
- Som dos vídeos: som do vídeo na frente, música ~12 dB abaixo, volta suave; trechos de 3 a 5 s.
- Música: Tempo Perdido inteira (5:02); passar de 5 min em 2 s não desclassifica.
- Cronologia: quando o Luiz mandar, separar as antigas e "voltar ao passado"; haverá fotos de criança → script que estima a idade das pessoas (ex.: DeepFace/InsightFace, CPU) para ordenar e montar um memorial infância→terceirão.
- Paleta: manter como está (cor quente de lembrança); sem rigor aqui.
- Textos na final: "La Salle Sobradinho · 2026" no fecho (logo real em SVG se o Vítor passar); ano grande e discreto quando a época muda (ex.: 2019… 2026); nomes de pessoas só com lista dele.
- Fecho: texto curto e MUITO emotivo, sem fala, enquanto a música termina: agradecimento aos professores + reflexão sobre o tempo passar rápido e a importância disso; pode citar poeta/cronista (Machado, Clarice...) SE tiver valor emotivo, não acadêmico. Vítor pediu que eu mande a ideia; só citação com autoria conferida.
- Exibição: projetor/telão na AULA DA SAUDADE em 25/11/2026 (não colocar a data no vídeo). Margens seguras maiores, texto grande, contraste alto. Final pronta com folga: alvo 22/11.
- Intro da TV na sala retrô: fica como está (trocar SP → DF).
- Correção do Vítor (19:10): papel kraft em si não é o problema (pode humanizar); o estranho foi COMO entrou (textura fibrosa em close, fundo fixo). Se voltar, integrado ao 3D, textura fina.
- Fecho APROVADO: Vinicius ("que não seja imortal, posto que é chama, / mas que seja infinito enquanto dure.") → "A gente achava que o tempo era lento. / Era a gente que estava rápido demais para ver." → "Aos nossos professores: vocês não nos ensinaram só matéria. / Ensinaram a gente a ficar." → "Nem foi tempo perdido." → "La Salle Sobradinho · 2026" → por último "231 e 232" (chave de ouro).
- STATUS: parado, esperando as fotos/vídeos da 231 (Luiz).
- Ajuste pedido pela Luísa (19:26, via Vítor): fotos e vídeos HORIZONTAIS o maior possível na tela ("deixar o quadrado maior, mais visível"). Na v2 os clipes em cartão (v02 1260 px, v15 450 px, cartão do "tempo" 760 px) e o mural pequeno violam isso. Regra para a final: horizontal = tela cheia ou quase (≥ 85% da largura); cartão/moldura só em dupla de verticais e no mural 3D, nunca para clipe horizontal.
- Anna Augusta (19:29, via Vítor, print conferido): o "quadrado" é o CARTÃO do clipe v02 em "todos os dias quando acordo" (8,8–10,5 s), que ocupa 1260 px com moldura creme e sobra preto em volta. Ajuste da final: clipe horizontal em tela cheia (mesma regra da Luísa), sem moldura; o do colega dormindo (v15, vertical) ganha o maior tamanho possível ou vira dupla.
- Anna Augusta (19:36): foto do cachorro dela (f43v) REMOVIDA do vídeo. Arquivo movido para `trabalho/fotos-excluidas/`; fonte já sem ela (intro passa a mostrar só f09v naquele slide). Total de fotos da 232 em uso: 44.
- Ordem do Vítor (19:40): quando ele avisar "chegaram fotos novas", verificar as DUAS pastas (`232/` e `231/`), não só a 231. Às 19:45 já havia material novo: 232 com 73 arquivos (eram 62 no piloto) e 231 com 37. Processar só quando ele avisar. Material novo entra pelo mesmo caminho: renomear em `trabalho/fotos/` (f46…), copiar para `estudio/motor/public/terceirao/`, atualizar folha de contato.
- Vítor (19:50): pode haver fotos repetidas entre os envios; filtrar e excluir duplicatas. Método: hash perceptual (dHash/pHash via PIL, distância ≤ 6) entre 232/, 231/ e trabalho/fotos/; vídeos por duração + hash da miniatura. Duplicatas vão para `trabalho/fotos-excluidas/duplicatas/` com `relatorio.txt` (par a par); nunca apagar.

### Mecanismos de densidade para a final (Vítor, 19:55: "muitas fotos/vídeos, todos contemplados, envolvente com a música")
Orçamento: 302 s ≈ 465 batidas (92 BPM). Estimativa 150 fotos + 40 vídeos: vídeos 3 s = 120 s; fotos nos 180 s restantes → precisa de vários-por-momento.
- Corte na batida (1 cheia por batida) nos trechos fortes.
- Tira de filme (6–8 por 5 s) nos versos médios.
- Mural 3D (15–20 por 10 s; câmera voa e entra numa foto) em "temos nosso próprio tempo" x3.
- Grade que se enche na meia-batida (12–16 por 8 batidas) e uma célula abre para tela cheia, nos instrumentais.
- Dupla/tripla de verticais nos versos calmos.
- Vídeo que vira foto: toca com som 2–4 s, congela, vira polaroid e voa para o mural.
- Mosaico de 4 vídeos mudos no instrumental longo (3:40–5:00 da música).
- Garantia: todas as fotos num único espaço 3D; a câmera passa por cada uma ao menos uma vez; as melhores ganham close em tela cheia (horizontais sempre grandes).
Capacidade: ~200 fotos + 50 vídeos com folga. Script de montagem deve distribuir automaticamente por mecanismo e verificar cobertura (toda foto/vídeo citado ≥ 1 vez).

## Chegadas (13/11/2026, via remote control; ainda chegando)
- Salvas sem processar em `trabalho/chegadas-2026-11-13/`: c01 a c19 (19 fotos, pela ordem do envio; a turma de cada uma ainda não foi separada) e `VID-20261113-WA0097.mp4` (vídeo 848x478, 27,4 s, H.264 + AAC).
- Sem dedupe, sem renomear em `fotos/`, sem editar. Vítor avisa "chegaram todas" para começar.
- Segundo lote (13/11, mesma pasta): c20 a c39 (mais 20 fotos). Total na pasta de chegadas: 39 fotos + 1 vídeo. Ainda sem dedupe, sem separar turma.
- Terceiro lote (13/11): c40 a c59 (20 fotos), salvas na mesma pasta. Total: 59 fotos + 1 vídeo.
- Dedupe (dHash 9x8, distância ≤ 10, script em scratchpad): 3 pares idênticos: c37=c40, c38=c41, c39=c42. Só marcado, nada movido ainda (move para `fotos-excluidas/duplicatas/` quando Vítor avisar "chegaram todas").
- Limite: dHash pega recorte/redimensionamento, não a mesma cena fotografada de outro ângulo. Revisão visual antes do render.
- Drive (13/11): pasta enviada pelo Vítor tinha só cópias. Apagadas permanentemente 48 cópias baixadas (dr01 a dr48) e c40, c41, c42 (repetem c37 a c39). Restam 64 fotos únicas (c01 a c39, c43 a c67).

## Triagem por mídia (13/11, Claude de modelo menor, a pedido do Vítor)
- Pasta `triagem/manifest.csv`: uma linha por arquivo (64 fotos + 19 vídeos), com quem aparece e `crianca_ate_11`.
- Feita por leitura visual (folhas de contato), não por modelo de idade. Só c06 tem criança clara (aparenta 7 a 10 anos). Fotos de criança aparecem penduradas na parede em c43 e c63; não são as pessoas da cena, só decoração.
- Idade por rosto (DeepFace/InsightFace) não está instalada: exige TensorFlow ou ONNX com pesos. Não rodado. Se o Vítor quiser o script de fato, é instalação à parte.
- Drive via conta vitor743 (Workspace MCP reconectado; download pelo helper `C:/GoogleWorkspaceMCP` com googleapis). Pastas: raiz (98) e Criança (40): 138 arquivos. Removidos 88 (já salvos, ou cópias do Criança/raiz): 19 vídeos iguais aos chegados, 4 fotos da pasta Criança repetidas, todas as fotos da raiz já salvas. Restaram 39 fotos novas (`chegadas-2026-11-13/n01..n39`) e 11 vídeos novos (`nv01..nv11`).
- Total único: 103 fotos e 30 vídeos. Triagem em `triagem/manifest.csv`: 35 fotos com criança até 11 anos, 1 em dúvida (n35), 67 adolescentes/jovens; vídeos sem criança.
- Triagem em pastas (13/11, ordem do Vítor: dúvida vai para criança): `triagem/crianca/` (36 fotos) e `triagem/jovem/` (67 fotos + 30 vídeos). Pasta `chegadas-2026-11-13/` removida (vazia; vídeo WA0097 repetido apagado). Nomes: c01..c67 (menos os removidos), n01..n39, vid-WA02xx, nv01..nv11. Total: 103 fotos, 30 vídeos.

## Acervo fechado (13/11/2026, tarde): pastas 232/ e 231/ processadas
- 232/ e 231/ (material do Luiz já estava lá) processadas: duplicatas apagadas (9 fotos, 11 vídeos), a foto do cachorro (pedido da Anna) apareceu de novo em 232/ e foi apagada. Fotos movidas para `triagem/crianca/` e `triagem/jovem/` com nomes a01..a86 (pastas originais agora vazias); vídeos b01..b34 em `triagem/jovem/`.
- TOTAL ÚNICO: 188 fotos (53 criança, 135 jovem), 64 vídeos (todos jovem). Dúvida (a62-a64, n35) = criança, ordem do Vítor.
- Estrutura real da música (energia medida): intro 0-20,8 s; força total 12-228 s; coda mais suave 234-294 s; fade 294-302 s. Letra: tempo por palavra em `musica/tempo-perdido.palavras.json` (confere até ~204 s; depois é coda instrumental).

## FINAL v1 (13/11/2026): composição montada e prévia em render
- Pipeline: `trabalho/scripts/prep_final.py` (reduz fotos, converte vídeos, mede áudio) → `estudio/motor/src/obras/terceirao/acervo.json`; `trabalho/scripts/montar_final.py` (linha do tempo na batida 0,6472 s, cobertura 100%: 188/188 fotos, 64/64 vídeos) → `plano.json`; composição `Final.tsx` (id `Final`, 9066 quadros, 1920x1080, 30 fps). Assets em `estudio/motor/public/final/` (fora do Git).
- Efeitos novos: bloom de lembrança (brilho + desfoque leve, sem véu), mural 3D (túnel de polaroids), parede final com recuo de câmera, mosaico de 4 vídeos, grade, ponte com contador de anos 2014→2026, portal pelos polaroids, música com ducking de −12 dB sob os vídeos com som. Intro TV: "SP" virou "DF".
- Como refazer: `python trabalho/scripts/prep_final.py && python trabalho/scripts/montar_final.py`, depois `cd estudio/motor && npx remotion render src/index.ts Final saida.mp4 --scale=0.5 --concurrency=12` (540p) ou sem `--scale` (1080p).
- Pendente: ver a prévia inteira e ajustar; normalizar som dos vídeos; master −14 LUFS; render 1080p.

## FINAL v1 RENDERIZADA (13/11/2026 23:20)
- Arquivo do projetor: `trabalho/previa/meu-terceirao-final-v1.mp4` (1920x1080, 30 fps, 302,2 s, 9066 quadros, −14,0 LUFS, 380 MB). Cópia leve 720p: `meu-terceirao-final-v1-celular.mp4` (70 MB). Bruto sem master: `final-v1-bruto.mp4`.
- Render NESTE PC: sempre em pedaços, `python trabalho/scripts/render_pedacos.py --tam 300 --conc 2 --orcamento 200` em primeiro plano, repetindo até sair "PRONTO" (tarefa de fundo é derrubada pelo Claude Code quando a RAM aperta). `--gl=angle` (placa de vídeo) é 10x mais rápido que o padrão e dá imagem igual (PSNR 49,7 dB). Para refazer só um trecho: apagar `previa/pedacos/pNNN.mp4` (pedaço N = quadros N*300…) e `audio.wav` se o som mudou; rodar de novo. Depois `python trabalho/scripts/masterizar.py previa/final-v1-bruto.mp4 previa/meu-terceirao-final-v1.mp4`.
- Correções feitas na conferência: (1) `janela_forte` do prep escolhia sempre o fim do vídeo (passo do astats errado) e o trecho acabava antes do corte = tela preta por ~7 quadros; corrigido + `ritmo()` no Final.tsx desacelera vídeo curto em vez de ficar preto. (2) Mosaicos tinham vídeo mudo: agora o vídeo mais vivo toca na frente (−20 LUFS) e os outros ao fundo (−32); música baixa −6 dB nos mosaicos e −12 dB nos solos. (3) Vídeos baixos subidos para −18 LUFS no prep. (4) Grades com zoom lento contínuo (sem quadro parado). (5) Parede centralizada, câmera sempre andando, fusão de 40 quadros para a foto final; texto dos professores termina antes da fusão (276,4–281,5).
- Pedido do Vítor (13/11 noite): TV da abertura e fita alternam 232 e 231 (TV: a74 e a66 são da 231; fita: a02, a67, a16, a71…). Turma de origem das fotos a01..a86 está na coluna `quem_aparece` do `triagem/manifest.csv`; c*/n* (chat e Drive) não têm turma registrada.
- Entrega: só pelo Remote Control (sem Telegram, pedido do Vítor).
- Conferido: 188/188 fotos, 64/64 vídeos, freezedetect sem travadas, áudio e vídeo com a mesma duração.
- Próximo passo: feedback do Vítor ao assistir. Ainda não revisado por ele: densidade do mural, vídeos verticais do final (estreitos com fundo desfocado).

## Ajuste: passagem do tempo sem anos (14/11/2026 00:35)
- A ponte (90,6 → 103,5 s) não tem mais número. É só um escurecimento que sobe e desce (`Ponte` em `Final.tsx`). Motivo: os anos da escada não são a data real de cada foto.
- p009 e p010 refeitos; `meu-terceirao-final-v1.mp4` remasterizado (−14,0 LUFS, pico −0,3 dBFS), 302,2 s, 9066 quadros, freezedetect sem travada.

## FINAL V2 (14/11/2026): foto e vídeo alternados (pedido da Anna no grupo, 14/11, 00:41)
- A Anna pediu para não deixar os vídeos todos juntos no fim. A V2 mantém a mesma música, o mesmo acervo e os mesmos limites de cada trecho; só muda a ordem dos blocos dentro de cada trecho entre âncoras (portal, ponte, murais, parede, solos de abraço, foto da turma).
- Gerar: `python trabalho/scripts/montar_final.py --v2` (grava `estudio/motor/src/obras/terceirao/plano-v2.json`; a V1 `plano.json` não muda).
- Render: o motor lê `plano.json` fixo, então o render da V2 troca o `plano.json` pelo `plano-v2.json` e devolve a V1 no fim (backup no scratchpad da sessão). Comando: `python scripts/render_pedacos.py --tam 300 --conc 2 --pasta pedacos-v2 --saida final-v2-bruto.mp4`, depois `python scripts/masterizar.py previa/final-v2-bruto.mp4 previa/meu-terceirao-final-v2.mp4`.
- Limite: a infância tem fotos e os 4 mosaicos de vídeo do trecho da ponte; o trecho do mural (3 mosaicos seguidos antes da foto da turma) continua só com vídeo, porque o mural é âncora.

## FINAL V3 (14/11/2026 13:19): mais mídias da 232
- Pasta do Drive `1RMIwqYLG7U6omr3ZlUlr0z28k-uukr-N` (74 arquivos) baixada em `chegadas-2026-11-14-232/`. Repetidas fora (13 já no acervo, 7 cópias no próprio lote, 2 mesma cena). Entraram 42 fotos (`d01..d42`) e 10 vídeos (`dv01..dv10`) em `triagem/jovem/`. Acervo: 230 fotos, 74 vídeos.

## FINAL V4 (14/11/2026): revisão do Vítor
Pedidos e o que foi feito:
- **Letra fora de sincronia:** as linhas tinham tempo digitado à mão, até 5 s atrasado. Agora `LINHAS` em `montar_final.py` usa o início de cada palavra medido (transcrição inteira + clipes curtos conferidos). "Nem foi tempo perdido" é em 185,8 s.
- **Abertura ("Todos os dias quando acordo"):** saiu o zoom na parede de polaroids (`portal`); entra direto uma foto de criança.
- **Rosto, não chapéu:** `scripts/rostos.py` (YuNet/OpenCV) grava `rostos.json` e miniaturas `public/final/t/`. `enquadra()` em `Final.tsx` põe o rosto a ~54% da altura sem cortar o chapéu, e o zoom caminha para o rosto.
- **Sem corte seco entre fotos:** `usePassagem` (foto nova desliza da direita, a anterior segue devagar para a esquerda). A rajada de "selvagem" continua em corte com clarão.
- **Mural:** um voo só (45 fotos), sem corte entre três blocos; fundo marrom trocado pela luz da própria foto desfocada.
- **Cena final (ideia do Vítor):** bloco `tres`: todas as 304 mídias numa parede, a câmera recua, elas formam um "3" e depois "231 e 232". Vídeos mudos, vindos de um atlas (`scripts/atlas_videos.py` → `public/final/atlas.mp4` + `atlas.json`), um quadro extraído por quadro e recortado em canvas.
- **TV da abertura:** imagem agora segue o tubo (bordas abauladas, barril por `feDisplacementMap` com `public/terceirao/tv-barril.png`, vidro); a curvatura some quando a câmera entra na tela.
Ordem para refazer: `prep_final.py` → `rostos.py` → `atlas_videos.py` → `montar_final.py --v2` → trocar `plano.json` pelo `plano-v2.json` → `render_pedacos.py --pasta pedacos-v4 --saida final-v4-bruto.mp4` → `masterizar.py`.
Áudio: render do Remotion só até o início da cena `tres` (a cena deixa a passada de áudio lentíssima); o resto é a música pura emendada por ffmpeg.

## FINAL V5 (14/11/2026 16:36): entrega atual
- TV: curvatura mais forte (`feDisplacementMap` 230, bordas 14 px) e mantida enquanto a câmera entra na tela (achata só de 7,6 a 8,7 s).
- Abertura: `montar_final.py` escolhe para o 1º verso uma foto deitada de criança com rosto visível (hoje `n16`).
- Arquivos: `previa/meu-terceirao-final-v5.mp4` (1080p) e `-previa-480p.mp4` (Telegram msg 5857). Pedaços em `previa/pedacos-v4/`.
- Áudio: `audio-a.wav` (Remotion, quadros 0-7830) + cauda da música por ffmpeg. O `render_pedacos.py` ainda tenta o áudio inteiro e falha nessa cena: fazer à mão como descrito acima.
- `plano.json` do motor continua sendo o da V1; a entrega usa `plano-v2.json` (trocar antes de renderizar, devolver depois).

## FINAL V7 (14/11/2026 17:32): entrega atual, aprovada pelo Vítor fora este último ajuste
- V6: no mural a câmera passou a mirar cada foto (as de perto saíam do quadro). V7: a câmera segue uma curva suave (Catmull-Rom) pelo centro das fotos, contínua, sem parar e arrancar. Polaroid 760 px, some entre 200 e 430 px de profundidade.
- Arquivos: `previa/meu-terceirao-final-v7.mp4` (1080p) e `-previa-480p.mp4` (Telegram msg 5859). Pedaços 13-17 refeitos em `previa/pedacos-v4/`.
- Vítor (14/11): "Sincronização, fotos, emoção tudo 10/10"; disse que este era o último ajuste da parte dele.
- Pendente: `render_pedacos.py` fazer o áudio em duas partes sozinho (hoje é manual, ver V5).

## FINAL V8 (14/11/2026 18:15): entrega atual + limpeza de disco
- Mural mais lento: 22 fotos em 36 s (eram 45), alternando de lado perto do eixo (±230 a 280 px), câmera em curva suave a 80% do desvio, foto some entre 310 e 540 px. O Vítor achou a V7 "rápida demais, olhando para os lados".
- **Arquivo oficial:** `previa/meu-terceirao-final-v8.mp4` (1920x1080, 30 fps, 302,2 s, −14 LUFS, 388 MB). Prévia para WhatsApp/Telegram: `previa/meu-terceirao-final-v8-previa-480p.mp4` (Telegram msg 5860). O projeto é 1080p; não existe versão 4K.
- Limpeza (pedido do Vítor): apagadas as versões v1 a v7 (final, bruto e prévia), pilotos, `pedacos`, `pedacos-v2`, `pedacos-v3`, `atlas-tmp` e ~4,8 GB de pacotes `remotion-*` em `%TEMP%`. Liberados 13 GB. Ficaram a V8, a prévia e `pedacos-v4` (pedaços atuais, 0,5 GB, para ajuste rápido; pode apagar depois da aprovação).
- Para refazer do zero: ordem descrita na seção da V4 (todas as mídias-fonte continuam em `triagem/` e `estudio/motor/public/final/`).

## AULA DA SAUDADE (pedido de 23/11/2026): vídeo novo, outra música, outro ritmo
- Música: "Bem" (Chapéu de Palha), 270 s, em `musica/chapeu-de-palha.mp3`; tempo por palavra em `musica/chapeu-de-palha.palavras.json` (a "Legenda Adriana Zanotto" no fim é alucinação da transcrição, ignorar). Versos medidos: 17,2 "Se tu me visse"; 31,8 "Se eu me espalhasse em ti"; 47,2 "Tudo em volta tem um pouco do pouco que eu tenho de ti"; 62,1 "No meu quarto, teu cheiro"; 77,3 "Na tua falta me resta solidão"; instrumental 83-102; 102 segunda estrofe; 116,8 "Essa mania de querer..."; 132 refrão; 160 "solidão"; instrumental 168-186; 186,8 "E essas fotos que carregam...pesam no meu coração. Vazio"; 201,8 "Essa mania de lembrar"; 217 refrão final; 244,8 "E no silêncio eu escuto você" (252,5); instrumental até 270.
- Pedido: despedida da escola, álbum de fotos, ritmo lento, SEM a TV, foco em fotos de criança e de jovens mais novos, algumas atuais (não todas), as duas turmas, tipografia que mostra as épocas.
- Roteiro proposto (a aprovar): ver mensagem da sessão. Atos: 0-17 álbum abre (preto, grão, 1 foto de bebê/criança); 17-83 "Antes" (infância, 1 foto por verso, 6-8 s cada); 83-102 instrumental, a cor volta; 102-168 "Crescendo" (jovens, dupla/tripla de verticais, mural lento); 168-186 instrumental, vídeos em câmera lenta; 186-201 "Vazio" (foto quase imóvel, texto some); 201-245 "Hoje" (231 e 232 juntas, fotos atuais); 245-270 silêncio, foto da turma, fim.
- Pendência: fotos de criança (c*, n*) não têm turma registrada no manifesto; as 55 da 231 e 116 da 232 são jovens (a*, d*). Confirmar com o Vítor como garantir as duas turmas na infância.

## AULA DA SAUDADE V1 (23/11/2026 17:11): entregue (prévia no Telegram, msg 5871)
- Arquivo oficial: `previa/aula-da-saudade-v1.mp4` (1920x1080, 30 fps, 270 s, 8100 quadros, -13,6 LUFS, sem trechos congelados, ~500 MB). Prévia: `previa/aula-da-saudade-v1-previa-480p.mp4` (22 MB). Folha de quadros: `previa/saudade-folha.jpg`.
- Composição `Saudade` (`estudio/motor/src/obras/saudade/Saudade.tsx`, registrada em `src/Root.tsx`); plano em `.../saudade/plano.json` gerado por `scripts/montar_saudade.py` (39 páginas: 34 fotos, 21 de criança, 10 vídeos em câmera lenta, tempo da letra por palavra de `musica/chapeu-de-palha.palavras.json`).
- Visual aprovado pelo Vítor: capa de papel que abre (0-6 s) e fecha em "231 e 232" (259-266 s); páginas de álbum (polaroid, fita) sobre papel velho REAL; letras de colagem (bilhete de resgate) cujo papel e fonte trocam por 14 quadros antes de fixar; serifa itálica, sem serifa e "vazio" (186-201 s) em outras épocas; "saudade" uma única vez (224,5 s).
- Texturas: fotos livres (Pexels/Pixabay) em `referencias/papel/` (licenças em LICENCAS.md de cada pasta); preparadas por script inline em `estudio/motor/public/saudade/papel/` (fundo1-7, t1-t8, capa, moldura, vinco, escuro) + fontes em `public/saudade/fontes/` (13 famílias livres; cópia em `trabalho/fontes-saudade/`). Pinterest MCP voltou vazio; o X não rendeu textura.
- Refazer: `python scripts/montar_saudade.py` -> `python scripts/render_saudade.py --orcamento 560` (repetir até PRONTO; ~2 min por pedaço de 15 s) -> `python scripts/render_saudade.py --juntar --saida aula-da-saudade-vN`. Refazer um trecho: apagar `previa/saudade-pedacos/pNNN.mp4`.
- Pendências: Vítor ainda não assistiu com som; fotos de criança c*/n* sem turma no manifesto (turmas nas jovens: 231=12, 232=6 entre as de turma conhecida; checar equilíbrio); nenhuma foto com cigarro de papel foi filtrada manualmente (só confiei na triagem anterior).
