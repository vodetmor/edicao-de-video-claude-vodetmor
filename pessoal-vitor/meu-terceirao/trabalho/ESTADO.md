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
