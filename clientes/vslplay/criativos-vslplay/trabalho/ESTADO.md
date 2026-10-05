# Estado: criativos VSL Play (roteiros 2 e 3), pedido 01/10/2026

Pedido: Deidson/Dhay querem só o STORYTELLING (cenas para aprovação) dos roteiros 2 e 3 do briefing; o 1 foi descartado. Foco: retenção, gancho forte nos 3 primeiros segundos, pegada de criativo de anúncio (não institucional como o v6).

## Feito (01/10/2026)
- Briefing e áudio copiados: `trabalho/brutos/briefing-3-criativos.docx`, `trabalho/brutos/audios-3-criativos.mp3` (2:09, os 3 roteiros em sequência).
- Transcrição com tempo por palavra (faster-whisper small): `trabalho/transcricao-audios.json`.
  - Roteiro 1: 0,0 a 31,7 s (ignorado).
  - Roteiro 2: abertura gravada 2x (tomada A 32,40 a 43,82; tomada B 46,78 a 56,62); resto 57,26 a 82,68. Corte escolhido: tomada A + resto = 36,8 s com pausas limitadas a 0,45 s.
  - Roteiro 3: 85,88 a 126,44 = 40,5 s com pausas limitadas.
- Storytelling entregue como Claude Doc (fonte da verdade, com coluna de aprovação por cena):
  https://claude.ai/code/artifact/e44d9cf2-e2fd-4e22-a1c5-e912e3542764
  - Criativo 2: vilão = botão que despenca no 00:07 (oferta só em 12:40); resolve na cena 3 com o botão com delay nascendo no 12:40; seções sincronizadas 04:10/09:30/12:40.
  - Criativo 3: 100 pontinhos andando numa linha que vira precipício (100 -> 58, anel no 00:06); cena 3 revela que a linha era o gráfico de retenção (dados demo: 00:06 58%, 14K visitas, 3,5K cliques, 24,54% play rate); A/B cinza x ciano; leque de logos das integrações.
  - Padrões: 9:16 primeiro, sem logo na abertura, texto-chave grande (2 a 4 palavras), troca visual a cada 1,5 a 2,5 s, identidade do v6 (coral/ciano/violeta chapados).

## Próximo passo
- Esperar aprovação/ajustes do cliente no doc (comentários e coluna Aprovação). Pergunta aberta: tomada A ou B do gancho do criativo 2.
- Depois: produzir o criativo 2 primeiro (reaproveitar fonte do v6 em `anuncio-vslplay/trabalho/fonte`: player, logos, vinheta curta, Vertical.tsx), seguindo SPEC -> brief -> stills -> motion -> som -> crítica.

## Storyboard desenhado (01/10/2026 ~17:35 UTC, pedido do Vítor: "as imagens, os quadros")
- Entregue em `criativos-vslplay/storyboard/`: `storyboard-criativos-vslplay.pdf` (4 páginas), `criativo2-prancha-1/2.png`, `criativo3-prancha-1/2.png` (2600x1600), `quadros-1080x1920.zip` (24 quadros no tamanho real).
- As 4 pranchas também foram embutidas no Claude Doc, abaixo da introdução de cada criativo.
- Fonte: `trabalho/storyboard/gera.py` (HTML/CSS de cada quadro, 540x960 renderizado em 2x; legendas das pranchas em C2CAP/C3CAP) + `render.mjs` (Playwright). Refazer: `python3 gera.py`, copiar `render.mjs` para uma pasta com playwright (ex.: link para /opt/node22/lib/node_modules/playwright) e `node render.mjs <pasta storyboard>`; depois o bloco Python do PDF/zip (Pillow).
- Assets: `img/presenter.jpg` (quadro do clipe Mixkit do v6), `img/logo-lockup.png` (recorte do quadro final da vertical v8), logos webp reais, fontes Archivo/Inter em `fonts/`.
- Gráfico de retenção do criativo 3 usa os dados demo reais com eixo de 0 a 30 s (para a queda do 00:06 aparecer). Curva da versão B é ilustrativa.

## Produção (aprovado pelo cliente em 01/10/2026 ~17:40 UTC: "Achei top... Pode rodar", SÓ VERTICAL)
- Voz: a do áudio do cliente (não precisa gerar). `criativos/voz.py` corta e encurta pausas (máx 0,4 s) -> `out/audio/vo_c2.wav` (37,1 s) e `vo_c3.wav` (40,9 s) + `src/data/words_c2/c3.json` (palavra -> quadro).
- Fonte: `trabalho/fonte/` = cópia do projeto Remotion do anúncio v8 + `src/criativos/` (shared.tsx, C2.tsx) + `criativos/` (voz.py, chaves.py, audio.py). Quadros-chave em `src/data/keys_c2.json` (gerado por chaves.py, lido pela imagem e pelo som).
- Refazer criativo 2 (numa pasta fora do /mnt, com node_modules): copiar `trabalho/fonte` -> `npm i` -> `python3 criativos/voz.py && python3 criativos/chaves.py && python3 criativos/audio.py c2` -> `npx remotion render src/index.ts C2 out/c2_mudo.mp4 --muted --crf=16 --timeout=300000` -> `ffmpeg -i out/c2_mudo.mp4 -i out/audio/mix_c2.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/c2.mp4`.
- Estado: criativo 2 primeira versão renderizando (01/10 ~18:30 UTC). Criativo 3: a fazer depois (mesma estrutura, C3.tsx + chaves c3 + audio c3).

## 2026-10-01 ENTREGUE produção vertical (9:16)
- criativo2-vertical.mp4 (38,3 s) e criativo3-vertical.mp4 (42,1 s) em /mnt/project-files/criativos-vslplay/. Cópias + folhas de QA em trabalho/renders/.
- QA: -14 LUFS, pico ≤ -1,7 dBFS, sem trechos parados exceto o hold final do end card.
- Voz: a própria gravação do cliente (abertura do C2 = take A). Mixes em trabalho/audio/mix_c2.wav, mix_c3.wav.
- Rebuild: copiar trabalho/fonte para um scratch, `npm i`, depois `python3 criativos/voz.py && python3 criativos/chaves.py && python3 criativos/audio.py c2 && python3 criativos/audio.py c3 && bash render_both.sh`.
- Próximo: aguardar feedback do Vítor/cliente; ajustes pontuais no fonte (nunca refazer do zero).
