# Estado · Vídeo de venda do site MedicMais Sobradinho

Pedido do Vítor 13/10/2026 23:44 BRT (thread "Vídeo de venda do site Medic Mais"): extrair o design system de
https://medicmais-sobradinho-site.vercel.app/ e planejar um vídeo editado no nosso padrão vendendo o site ao dono da clínica
(por que ter site/infraestrutura, como agrega, por que comprar). Primeiro entregável = plano + quadros-chave. NÃO renderizar antes do OK.

## Feito (14/10/2026 ~00:00 BRT)
- `identidade/site/`: cópia local do site (wget; o wget direto no /mnt dá Bus error: baixar no scratch e copiar).
- `identidade/tema-bruto.json` (ponte-tokens.mjs) + `identidade/tema.json` (papéis + filtro de gosto) + `identidade/prints/` (celular 390@3x, desktop 1440@2x, `.pend` escondido, por seção).
- `../brutos/reels/`: 4 reels públicos da clínica via yt-dlp (tour DJXkhhZv_-R, Dona Ana DRxLD5sDhRp, Maria DOeJs35Dn7D, família DR226gCAYMv). Beatriz (DK-UPmov7B0) pede login.
- `SPEC.md`: público, identidade, material, dados com fonte, estrutura, parâmetros de motion e som.
- `voz/roteiro.json` (13 frases, C01-C13) + `voz/gera_voz.py` (edge-tts Antonio +10%, corta silêncio) -> `voz/provisoria/`, `provisoria.wav`, `tempos.json` (~78 s). Amostra na raiz: `amostra-voz-provisoria.mp3`.
- `storyboard/gera.py` -> `html/K01..K16` -> `render.mjs` -> `quadros/` (1080x1920) + `quadros.json`. Zip na raiz: `quadros-chave-1080x1920.zip`.
- `plano/gera_pdf.py` -> `aprovacao.html` -> `pdf.mjs` -> `plano-video-site-medicmais.pdf` (5 páginas; cópia na raiz).

## Aguardando o Vítor (rodada do plano, resolvida 14/10 03:06: "top, aprovado pode renderizar" + locução Ana Dias)
- OK da história/quadros; duração ~78 s; quem narra (ElevenLabs dele?); entra preço/condição no fim?; pode usar os reels.
- Conferir no Google dele a busca "MedicMais Sobradinho" (K07 diz: só catálogos e outra clínica).
- Logo oficial (coração em M) sem arquivo: usamos o letreiro do site; não redesenhar.

## Próximo passo (depois do OK)
Projeto Remotion da obra em `trabalho/fonte/` (base estudio/motor; node_modules fora do /mnt, ex. ~/mm com src/public em link),
cues por palavra da voz final (ElevenLabs Scribe, chave em anuncio-vslplay/trabalho/.env), reels em public/ (usar o terço de cima: legenda queimada),
som com synth.py (VSL Play) ~96 BPM, crítica independente ≥ 8/10, final 9:16 e 16:9.

## Refazer
```
S=<scratch com npm i playwright>; W=/mnt/project-files/clientes/medicmais-sobradinho/trabalho
cd $W/voz && python3 gera_voz.py                      # pip install edge-tts
cd $W/storyboard && python3 gera.py && cp render.mjs $S && (cd $S && node render.mjs $W/storyboard [K01 ...])
cd $W/plano && python3 gera_pdf.py && cp pdf.mjs $S && (cd $S && PLANO=$W/plano HTML=aprovacao.html OUT=plano-video-site-medicmais.pdf CHROME=/opt/pw-browsers/chromium node pdf.mjs)
```

## Produção (14/10/2026 00:06-00:40 BRT) — ENTREGUE
- Locução final: `brutos/voz/locucao-ana-dias.mp3` (ElevenLabs Ana Dias, 88,5 s, -19,3 LUFS). `voz/transcreve.py` (Scribe) -> `voz/transcricao.json`. Scribe escreveu "Magic Mais" no lugar de MedicMais: conferir a pronúncia de ouvido.
- `fonte/cues.py` -> `fonte/src/cues.json` (16 cortes + ~70 eventos por índice de palavra; `--lista` imprime os índices). Ritmo da voz mantido (sem cortar silêncio). 2703 quadros = 90,1 s.
- `fonte/src/Video.tsx` (16 cenas = K01-K16), `kit.tsx`, `Root.tsx` (composição "MedicMais" 1080x1920 30 fps). `fonte/public/`: prints do site para vídeo (`identidade/prints-video.mjs`: sem barra fixa embutida, quadros reais dos reels nos espaços de vídeo), clipes do tour/Dona Ana em `clips/`, miniaturas em `img/`, Poppins.
- Som: `fonte/audio/audio.py` (synth.py) -> `render/audio.wav`: trilha original 94,7 BPM em Ré maior, seções por cena, efeitos nos eventos, voz 21 dB acima do leito, efeitos -9 dB sob a voz, bateria -3 dB extra, ducking adiantado 100 ms. -14,0 LUFS / -1,9 dBTP.
- Crítica independente: v1 6,5 (tracejado do K07 invisível, 6 trechos parados, rolagem rápida K10, barra duplicada, mancha de degradê no lugar do vídeo, efeitos colados na voz) -> v2 8,3 -> v3 com os 2 ajustes restantes (barra 2023 cresce em "Em 2023", bateria mais baixa sob a voz).
- Entregue na raiz da obra: `video-site-medicmais.mp4` (34 MB) e `video-site-medicmais-celular.mp4` (17 MB).

## Refazer o vídeo
```
# projeto de render fora do /mnt: mkdir ~/mm && cp estudio/motor/package.json estudio/motor/tsconfig.json ~/mm && cd ~/mm && npm i
# ln -s $W/fonte/src src; ln -s $W/fonte/public public; cp $W/fonte/remotion.config.ts .   (stills.mjs = renderStill em lote)
cd $W/fonte && python3 cues.py && python3 audio/audio.py
cd ~/mm && npx remotion render src/index.ts MedicMais out/video.mp4 --concurrency=4 --crf=18
ffmpeg -i out/video.mp4 -i $W/render/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $W/render/video-v3.mp4
```
Próximo: retorno do Vítor; versão 16:9 se ele quiser para reunião.

## Rodada 2 (2026-10-14 04:13 UTC) — site + Google Meu Negócio
- Vítor pediu: logo do Google nas buscas, logos reais dos apps citados, e nova camada: plaquinha NFC do Google Meu Negócio (ref.: vídeo WhatsApp = placa "Nós agradeceríamos sua avaliação no Google!", celular encosta → abre tela de 5 estrelas). Oferta vira posicionamento digital (site + GMN).
- Plano PRÉ-APROVADO (sem PDF). Roteiro novo: voz/roteiro-v2-gmn.txt (enviado). Próximo: quando chegar o áudio dele → transcreve.py, refazer cues.py, cenas novas (perfil GMN + plaquinha NFC + estrelas), logos reais (Google/Instagram/WhatsApp/Maps), render, crítico ≥ 8, entregar.
- Vítor 04:14 UTC (para o ajuste, depois do áudio): cena da plaquinha em 3D caprichado — celular chega perto, som de NFC de pagamento por aproximação ("tim"), linha de cinco estrelas acendendo, motion forte. PRINCÍPIO: toda empresa citada (Google, Instagram, WhatsApp, Maps) aparece com logo/identidade real — o cliente vê a marca, não lê o texto.

## v4 / v2 da oferta (14/10/2026 ~04:20–05:30 UTC): site + Google Meu Negócio — PRÉ-APROVADO, sem PDF
- Voz: brutos/voz/locucao-v2-ana-dias.mp3 (146,7 s) -> voz/transcreve_v2.py -> voz/transcricao-v2.json (351 palavras).
- Cenas (23): fonte/cues.py (INI K01–K23, EV por índice de palavra). v1 guardada em v1-backup/.
- Novas: K05 Instagram real (print do perfil em brutos/ref/instagram-perfil.png, posts voam do feed), K06/K07 Google (logo real + barra com "G"),
  K09 "não é só um site" (MedicMais no centro, Google/Instagram/Maps/WhatsApp em volta), K10 duas partes, K16 Parte 2 Google Meu Negócio,
  K17 perfil se completando (dados reais do site: Quadra 7/9, CL 13; (61) 99825-5551), K18 plaquinha NFC em 3D real (src/Plaquinha3D.tsx, three.js),
  K19 cada paciente vira uma estrela (pacientes reais dos depoimentos), K21 o sistema (site -> Google -> plaquinha -> prova), K23 "no ar e no mapa".
- Logos reais: fonte/public/logos (cópia de motion-base/logos/wikimedia-* e gstatic-google-meu-negocio). Ícones Phosphor: src/icons.ts.
- Texturas 3D: fonte/texturas/gera.py (HTML) + render.mjs (Playwright) -> public/tex/*.png (placa, tela travada, tela de avaliação 0–5 estrelas).
- Áudio: fonte/audio/audio.py (voz v2; "tim" NFC = bipe 2,4 kHz 150 ms no toque + ding de 2 notas; estrelas em pluck subindo).
- Render (precisa --gl=angle por causa do 3D; @remotion/three fixo em 4.0.529 = mesma versão do remotion):
  cd ~/mm && npx remotion render src/index.ts MedicMais out/v4.mp4 --concurrency=4 --crf=18 --gl=angle ; depois mux com render/audio.wav.
- Stills: cd ~/mm && node stills.mjs out/s2 <quadros...> (stills.mjs passa chromiumOptions gl angle).
- ENTREGUE 14/10/2026 05:30 UTC: ../video-site-google-medicmais.mp4 (master, 148 s, 54 MB) + ../video-site-google-medicmais-celular.mp4 (29 MB). render/video-v6.mp4 = master.
  Crítica independente: v4 7,0 -> v5 8,0 -> v6 (tim do NFC movido para a pausa antes de "e a tela", celular encostando no ícone NFC). -14,0 LUFS / -1,9 dBTP.
  Pendências leves anotadas pela crítica (não bloqueiam): cenas mais paradas em 70–75 s (depoimento), 80–84 s (linhas + celular), 125–128 s (paleta); sem legenda (estilo aprovado na v1).

## Vídeo da proposta (PDF) — 15/10/2026
- Vítor mandou o PDF da proposta (14 páginas, copiado em ../proposta/Proposta-MedicMais-Sobradinho.pdf) e pediu SÓ o roteiro por ora; ele gera no ElevenLabs e manda o áudio para eu editar.
- Roteiro: voz/roteiro-proposta-pdf.txt (segue a ordem das páginas: ponto de partida, 6 diagnósticos, CNPJ inapto, site pronto, 4 entregas, vídeos, Saúde Day, 90 dias, preços, próximo passo).
- Próximo (quando chegar o áudio): transcrever (voz/transcreve_v2.py adaptado), planejar cenas pelas páginas do PDF + identidade MedicMais, render. Pasta nova sugerida: clientes/medicmais-sobradinho/proposta/trabalho/.
- 15/10 03:08 UTC: Vítor pediu REAPROVEITAR o vídeo v2 sem retrabalho e emendar o da proposta. Plano: manter v2 K01–K21 INTACTOS (quadros 0–4095, 136,5 s, voz v2 já gerada, termina em "...transforma cada atendimento em prova"); a continuação nova começa dali (voz/roteiro-proposta-continuacao.txt, ~2:35) e fecha reaproveitando a cena K23 ("no ar e no mapa"). K22 (faltam 4 detalhes) sai: o CNPJ passa a ser tratado no diagnóstico. Reuso de peças: Phone, Logo, Plus, Star, grade das 4 frentes, Instagram real (K05), perfil Google (K17), plaquinha 3D, K23. Novas cenas: diagnóstico (6), site antigo x novo (print do PDF), CNPJ, 4 entregas, vídeo+Saúde Day (flyer do PDF), 90 dias, preços. Áudio: voz v2 cortada em 136,5 s + voz nova, mixagem única (audio.py).

## v7 / v3 da oferta: vídeo + proposta emendados (15/10/2026 ~06:30 UTC), PRÉ-APROVADO
- Voz: brutos/voz/locucao-v3-proposta-ana-dias.mp3 (174,1 s, transcrita em voz/transcricao-v3.json via voz/transcreve_v3.py, 423 palavras, bate com voz/roteiro-proposta-continuacao.txt).
  Emenda: brutos/voz/locucao-v3-completa.wav = voz v2 0–136,5 s (fade 80 ms) + 0,5 s de silêncio + voz da proposta (OFF = 137,0 s). 311,1 s.
- cues.py: K01–K21 iguais à v2 (P01 começa no quadro 4096 = fim exato da K21); eventos da proposta com nome (p_, d1–d6, c_, e1–e4, v_, s_, n_, r_, f_) por índice de palavra da transcricao-v3; K22 saiu; K23 fecha com os novos "no ar"/"mapa". DUR 9433 quadros (314,4 s).
- Cenas novas em src/Video.tsx (bloco "v3: a proposta"): P01 nota 4,7 / 99 avaliações; P02 casa arrumada (lupa pela presença); P03 "6 pontos"; P04 diagnóstico (um cartão por ponto: busca sem site oficial, site antigo com dados velhos (print do PDF), GMN 50%, 3 endereços, link da bio não abria, vídeos sem padrão);
  P05 CNPJ inapto (dados do PDF p.5); P06 passo a passo com o contador / mesmo endereço; P07 4 entregas; P08–P11 cada entrega (site, presença com Google/Instagram/Facebook/WhatsApp, CRM com etiquetas + lembrete, organização + painel);
  P12 vídeo (bruto x editado, cada palavra acende uma peça); P13 Saúde Day (flyer do PDF); P14 90 dias; P15 implantação R$ 1.790 (R$ 2.191 riscado); P16 planos R$ 497 / R$ 859 recomendado; P17 fecho (logo coração branco do PDF); K23.
- Material novo em public: img/site-antigo.jpg, img/saude-day-flyer.jpg, img/mm-logo-escrita.png e img/mm-logo-coracao-branco.png (extraídos do PDF com pdfimages + máscara alfa; logo oficial, não redesenhado), logos/facebook.svg (wikimedia 2021). Ícones Phosphor extras no fim de src/icons.ts.
- v2 guardada em v2-backup/ (Video.tsx, cues.py, cues.json, audio.py).
- Render: cd ~/mm && npx remotion render src/index.ts MedicMais out/v7.mp4 --concurrency=4 --crf=18 --gl=angle ; mux com render/audio.wav.
- Crítica independente: v7 6,5 (aberturas vazias, trocas do diagnóstico sobrepostas, emenda) -> v8 7,5 -> v9 (ícones da Presença na palavra com moldura antes, lista do CRM se preenche, painel entra cedo, celular do Instagram sem cobrir o título, 4 entregas entram cedo).
- ENTREGUE 15/10/2026 ~08:00 UTC: ../video-site-google-proposta-medicmais.mp4 (master 1080x1920, 312,7 s, 89 MB) + ../video-site-google-proposta-medicmais-celular.mp4 (720x1280, 24 MB). render/video-v9.mp4 = master. -14,1 LUFS / -1,7 dBTP.
- Atenção: P05 mostra razão social, CNPJ e "INAPTA" (do PDF). Ok para mandar ao dono; não postar em público.
