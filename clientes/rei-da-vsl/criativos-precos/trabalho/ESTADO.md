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

## Próximo passo
Esperar aprovação do Dhay/Vítor no PDF. Depois: spec JSON no motor (estudio/motor) com eventos nas palavras de transcricao.json, componentes Hodometro/MiniCriativo/Trio/Hud/Botao/Coroa, som (make_audio estilo v6), crítica independente ≥ 8/10, prévia 720p, final.

## Refazer
```
cd trabalho/storyboard && python3 gera.py
# playwright num node_modules qualquer (ex.: scratch: npm i playwright@1); copiar render.mjs/pdf.mjs para lá
CHROME=/opt/pw-browsers/chromium node render.mjs          # quadros (ajustar 'here' para esta pasta)
cd ../plano && python3 gera_pdf.py && PLANO=$PWD CHROME=/opt/pw-browsers/chromium node pdf.mjs
```
