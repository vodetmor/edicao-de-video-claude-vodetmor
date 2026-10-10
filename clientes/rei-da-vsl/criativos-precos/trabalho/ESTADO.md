# Estado · Criativos de preço Rei da VSL (Dhay, via Vítor)

Pedido 09/10/2026 12:30 BRT: 2 criativos em motion graphics para a marca Rei da VSL, um por texto, com as locuções e logos enviadas. Primeiro entregável: PDF com plano de ação para aprovação (sem render do vídeo antes do OK).

## Feito (09/10/2026)
- `brutos/`: texto-1.mp3 (24,6 s, −19,3 LUFS), texto-2.mp3 (19,7 s, −19,5 LUFS), 6 PNG de logo/coroa (versões letra branca e letra preta).
- `trabalho/transcricao.json`: tempo por palavra (ElevenLabs Scribe; `transcreve.py` lê a chave de anuncio-vslplay/trabalho/.env).
- Paleta medida na coroa: ouro #DCB906 (claro #ECD119, escuro #B99100), preto #0B0B0B, branco #F7F5EF.
- `trabalho/mede_ref.py`: ritmo das referências (troca visual, % parado, viradas claro/escuro). Tiras em `referencias/`.
- Quadros-chave: `trabalho/storyboard/gera.py` (HTML) + `render.mjs` (Playwright) -> `trabalho/storyboard/quadros/A01..A10, B01..B08` (1080x1920). Zip na raiz da obra: `quadros-chave-1080x1920.zip`.
- PDF de aprovação (OBJETIVO, 5 páginas, regra do Vítor 09/10): `trabalho/plano/gera_pdf_curto.py` -> `aprovacao.html` -> `plano-criativos-rei-da-vsl.pdf` (cópia na raiz). Plano longo só interno: `gera_pdf.py` -> `plano-detalhado-interno.pdf`.

## Decisões propostas (aguardando OK)
- 9:16 1080x1920 30 fps; depois 4:5 e 16:9 da mesma spec.
- Criativo 01 (25,2 s): hodômetro 39,90 -> SIM em ouro -> 1 vira 10 -> anel 30 s -> pilha soma 399 -> tudo incluso -> trio copy/locução/edição -> testes A/B com a coroa no vencedor -> logo + botão.
- Criativo 02 (20,3 s): mesmo hodômetro com cores invertidas (ouro/preto) -> contorno do criativo -> trio -> 3 contratações -> fundem na coroa -> post patrocinado "PRONTO" -> virada meta (o vídeo dentro da timeline) -> logo + botão.
- Trilha original sintetizada 128,6 BPM (como v6), ducking ~10 dB, master −14 LUFS / −1 dBTP. Sem legenda separada (frases são a tipografia). HUD de editor nos cantos.

## Rodada 2 (09/10 15:34 BRT, crítica do Vítor)
- Ele achou a rodada 1 "plana e chata, cenas parecidas", 49,90 demais no 02, coroa ouro sobre fundo ouro (B05), e pediu 10 estilos diferentes inspirados nos reels do X no A04, pensando no lead (conectar, interessar, variedade, marca, clique).
- Feito: `storyboard/gera2.py` (importa helpers de gera.py) -> `quadros-v2/` A01-A15 e B01-B10 (B09 = B07 da rodada 1, a virada meta). Render: script render2.mjs (Playwright, executablePath /opt/pw-browsers/chromium). Cada frase virou metáfora literal (etiqueta, caixa, cupom, carimbo, caos de conversas, exportação 100%). 49,90 só em B01 e B10. Coroa ouro em squircle branco.
- PDF objetivo atualizado (5 páginas, jornada do lead por vídeo). Zip agora tem os quadros v2.
- Biblioteca: motion-base/fontes/x/ESTILOS-MOTION.md (10 estilos + dicas do X), lição em LICOES-MOTION.

## Produção (09/10 noite, após "Aprovado" do chefe)
- Caixa do A05 refeita em 3D de verdade: `caixa3d/caixa.py` (Blender por código, Cycles CPU, caixa preta fosca, fita dourada, coroa e "10 CRIATIVOS"); `render_seq.sh` gera os 33 quadros (abas fechando + fita) em `fonte/public/caixa/`.
- Motor próprio desta obra: `fonte/` (Remotion 4.0.529). `cues.py` -> `src/cues.json` (cortes e eventos presos às palavras de transcricao.json) é a fonte única de tempo para a animação e para o som.
  - `src/ui.tsx` (Stage 540x960 escalado x2, HUD, hodômetro, etiqueta, celular, 10 estilos animados, onda real da voz, botão, mão, Burst, DotField, Nota), `src/parts.tsx` (HL títulos, digitação, carimbo, toggle, check), `src/Film.tsx` (cenas, entradas whip/punch/zoom, empurrão de câmera, tremor nos impactos), `src/CriativoA.tsx`, `src/CriativoB.tsx`.
  - A13 novo: 10 vídeos chegam, ganham check em "prontos" e se organizam em 3 campanhas que ligam em "campanhas".
  - B09+B10: o próprio vídeo encolhe e vira o 1º card de um carrossel do portfólio (um card a cada 1,33 s), sob logo, preço e botão. Criativo 02 agora tem 22,4 s. Lista de clipes em `src/portfolio.json`; clipes em `fonte/public/portfolio/` (00-vslplay.mp4 recortado do anúncio vertical).
  - Portfólio de vídeo da Rei da VSL: reidavsl.com/portfolio-de-vsl (YouTube). Download bloqueado na nuvem; `brutos/portfolio/baixar.bat` baixa 4 no PC do Vítor. Lista completa em `brutos/portfolio/LISTA.md`.
- Som: `fonte/audio/audio.py A|B` (synth.py do VSL Play v6): trilha original 128,57 BPM com a grade no quadro 7 (tempos fortes em 'Sim', 'incluso', botão; no 02 o preço bate e 'A gente' solta o refrão), efeitos em cada evento, música 19 dB abaixo da voz enquanto ela fala, volta em 0,7 s, master -14 LUFS / -1 dBTP -> `render/audio-A.wav`, `audio-B.wav`.
- Projeto Remotion de trabalho em ~/rv (node_modules fora do /mnt): `src` e `public` são links para `fonte/`. Recriar: copiar package.json/tsconfig de estudio/motor, `npm i`, `ln -s .../fonte/src src`, `ln -s .../fonte/public public`, remotion.config.ts com `resolve.symlinks=false`.

## Entregue (09/10 ~20:25 BRT)
- `criativo-01-rei-da-vsl-39,90.mp4` (25,2 s) e `criativo-02-rei-da-vsl-49,90.mp4` (22,4 s), 1080x1920, -14 LUFS, na raiz da obra + `criativos-rei-da-vsl.zip`.
- Crítica independente: rodada 1 = 7,2 / 6,8; rodada 2 = 7,8 / 8,0; os 4 itens restantes foram corrigidos antes do render final (preço trava nítido no A01, A/B sem sobreposição, UGC com pessoa real da Pexels em fonte/public/ugc, carrossel termina num card nítido).
- Carrossel do 02: 3 vídeos do portfólio que o Vítor baixou (brutos/portfolio/0N-edicao-dopaminetica-*.mp4, 360x640) + VSL Play + motions nossos (src/portfolio.json).

## Rodada 4 (entregue 09/10 ~23:30 BRT): mais lento, legível, mais 3D
Crítica do Vítor: rápido demais, informação demais, gancho de 3 s não fisgou, caixa 3D só 1 s. Pode ter até 1 min. Depois: "pacote cortou", "pausas estranhas".
- `fonte/esticar.py`: pausas SÓ entre frases, corte no ponto mais silencioso (`voz/texto-N-esticado.wav`, `transcricao-esticada.json`); cues.py e audio.py usam a versão esticada. 01 = 29,6 s, 02 = 26,1 s (rodada 4d: pausas pela metade, Vítor achou 6-7 s e 11-12 s parados).
- Saíram A02, A06, A11, A12 (A10 = lista COPY/LOCUÇÃO/EDIÇÃO que se monta). HUD só cantos + "Rei da VSL"; sem notas mono, ecos, onda decorativa, letreiro do CTA. Seções da música seguem os eventos (grade()).
- 3D (Blender, `caixa3d/`): abas fechando suaves em `fecha_00..36` (render_fecha.sh, Q em meio-passos, caixa aberta em V; rodada 4c); caixa entra aberta 1,3 s antes de "Fechando", fecha, fita, câmera orbita até "10 CRIATIVOS" (caixa.py q 0-80); preço 3D dos ganchos (`preco3d.py A|B`); coroa real em 3D por camadas do PNG (`coroa3d.py`, B06). Render: `bash caixa3d/render_tudo.sh <pasta_png>` + `python3 caixa3d/converter.py <pasta_png>/<sub>`. Imagens com sombra levam máscara de borda (linear-gradient intersect) para não mostrar o quadrado.
- Entregue: `criativo-01-rei-da-vsl-39,90-v2.mp4`, `criativo-02-rei-da-vsl-49,90-v2.mp4` (sem zip, sem versão celular, a pedido). Próximo: retorno do Vítor/chefe.

## Refazer
```
# vídeos: cd fonte && python3 cues.py && python3 audio/audio.py A && python3 audio/audio.py B
# cd ~/rv && npx remotion render CriativoA ../out-A.mp4 && ffmpeg -i out-A.mp4 -i render/audio-A.wav -c:v copy -c:a aac -b:a 192k -shortest final-A.mp4
# quadros-chave da aprovação:
cd trabalho/storyboard && python3 gera.py
# playwright num node_modules qualquer (ex.: scratch: npm i playwright@1); copiar render.mjs/pdf.mjs para lá
CHROME=/opt/pw-browsers/chromium node render.mjs          # quadros (ajustar 'here' para esta pasta)
cd ../plano && python3 gera_pdf.py && PLANO=$PWD CHROME=/opt/pw-browsers/chromium node pdf.mjs
```
