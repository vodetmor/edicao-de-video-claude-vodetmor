# ESTADO: mini VSL da página /gratis (VixPlay TV)

Pedido do sócio (WhatsApp, 25/11/2026): mini VSL com storytelling para a página do panfleto (/gratis), explicando o programa de indicação ("você nunca viu isso antes", "quantas vezes você já indicou e nunca ganhou nada"). Vertical 9:16, 1080x1920.

## Feito (25/11/2026)
- `roteiro.txt`: narração final (124 palavras).
- `audio/narracao.mp3`: voz Ana Dias, ElevenLabs Eleven v4, gerada pelo SITE via BrowserABI (perfil Default/vitor743). A API recusa voz de biblioteca no plano grátis (402 paid_plan_required). 47,3 s.
- `audio/narracao.palavras.json` e `.txt`: Groq com tempo por palavra; texto bate com o roteiro.
- `quadros.html` (?q=A01..A13) gera os 13 quadros-chave em `quadros/` (Chrome headless). `folha.jpg` = folha de contato.
- `assets/`: fotos geradas no ChatGPT (`image-automation`) com prompts em `prompt-*.txt`, logo real.
- `../aprovacao/`: plano.json e "VixPlay TV - Mini VSL gratis - v1 aprovacao.pdf" (pdf-aprovacao).

## v1 renderizada (26/11/2026, madrugada; o Vítor pediu o render antes da aprovação dos quadros)
- Composição `Gratis` em `estudio/motor/src/obras/gratis/Gratis.tsx` (cenas iguais ao quadros.html; A07 a A09 viraram uma cena contínua: amigos se somam e o preço desce 30→25→15→0). Material em `estudio/motor/public/gratis/` (fora do Git). `palavras.json` lá tem pontuação corrigida para a legenda (Groq não pôs ponto em "zerada", "graça", "bolso"...).
- Lições: zerar `p{margin:0}` (o quadros.html tinha reset; sem ele o texto desce sobre a legenda); contador com spring passa do alvo (R$ -1): limitar entre origem e alvo.
- Música "Listen" (Andrewkn, CC0), a mesma do tutorial, a partir de 36 s; SFX de `public/audio`. Master medido -14,0 LUFS, pico -0,9 dBFS.
- Saída em `../saida/`: `gratis-vsl.mp4` (1080x1920, 48,5 s, 11 MB), `gratis-vsl-web.mp4` (720p, 2,3 MB, copiado para `iptvix/public/videos/gratis-vsl.mp4`), `gratis-vsl.jpg` (capa).
- Falta: crítica por sessão nova e o OK do sócio.

Refazer: `cd estudio/motor && npx remotion render Gratis out/gratis/voz.mp4 --codec=h264 --crf=17`, depois a mixagem (mesma receita do `mix_vix.sh`, música com `-ss 36`, `loudnorm I=-32`, sidechain pela voz, master `I=-14:TP=-1`).

## VSL v4 "storytelling" (aprovada pelo sócio: "Manda bala"; render em 26/11/2026, noite)
Fonte da verdade: `../aprovacao/VixPlay TV - VSL - storytelling.pdf` (plano-v7.json), quadros G01..G20 em `quadros-v7/` (gerados por `quadros-v7.html?q=GNN`), narração literal `roteiro-v4-deidson.txt`.
- Voz: `audio/narracao-v4.mp3` (Ana Dias, Eleven v4, site via BrowserABI perfil Default; 137,9 s). "R$10" foi lido certo ("dez reais"), sem troca de texto.
- Tempos: `audio/narracao-v4.palavras.json` (Groq) e `audio/narracao-v4.legenda.json` (texto LITERAL do roteiro, 334 palavras, alinhado 1:1 com os tempos; o Groq duplicou "indicações." e comeu acentos num trecho, conferido por recorte).
- Motion: composição `VslVixplay` em `estudio/motor/src/obras/vsl-vixplay/VslVixplay.tsx` (CSS do quadros-v7 copiado; cada evento preso à palavra; legenda Montserrat 900 itálico a 1300 px, some no G20 porque o quadro final já diz a frase e o botão ocupa o lugar). Material em `estudio/motor/public/vsl-vixplay/` (fora do Git).
- Som: trilha "Wonders" (Seth_Makes_Sounds, CC0) a partir de 10 s (cresce na revelação do cupom), SFX CC0 (moeda, cadeado, brilho) + `public/audio`. Medido: trilha 20,3 LU abaixo da voz depois do ducking; master -14,1 LUFS, pico true -1,3 dBTP.
- Saídas em `../saida/`: `vsl-vixplay-v4.mp4` (1080x1920, CRF 18), `vsl-vixplay-v4-web.mp4` (720p), `vsl-vixplay-v4.jpg` (capa = G01). Cópia em `Desktop/VixPlay-proposta-25-11/`.
- Falta: crítica por sessão nova; cupom 10REAIS criado no checkout antes de publicar; o Vítor decide onde entra no site.

Refazer (em `estudio/motor`):
```
node stills_vsl.mjs out/vsl-vixplay/stills 1.6 8 24.5 44 53 98.5 117 138.5   # stills de checagem
node render_vsl.mjs 1          # vídeo mudo em pedaços de 300 quadros (pula os prontos) -> out/vsl-vixplay/mudo.mp4
python mix_vsl_vixplay.py      # voz + trilha + SFX, master linear -14 LUFS, gera as saídas finais
ffmpeg -i ../../clientes/vixplaytv/mini-vsl-gratis/trabalho/quadros-v7/G01.png -q:v 3 ../../clientes/vixplaytv/mini-vsl-gratis/saida/vsl-vixplay-v4.jpg
```
Ajuste num trecho: apague só os `out/vsl-vixplay/partes/pNN.mp4` daquele tempo (NN = segundo*30/300) e rode de novo.

## Próximo passo (original, antes do render)
1. Motion no motor (Remotion, como o tutorial): cada evento preso à palavra (tempos no palavras.json; âncoras: Nada 7,7 s, Vixplay 13,1, Cada 14,7, todo 20,2, Um 22,5, Três 24,9, Seis 27,0, zerada 30,5, Você 31,2, nunca 36,4, Assine 38,9, Toque 45,7).
2. Música livre 18 a 22 LU abaixo da voz, SFX da página de som, master -14 LUFS / -1 dBTP.
3. Crítica independente, prévia 720p, final 1080p e versão leve. Copiar para `iptvix/public/videos/gratis-vsl.mp4` (+ `gratis-vsl.jpg` de capa): a página /gratis mostra o vídeo sozinha quando o arquivo existe.

## Comandos
```
C="/c/Program Files/Google/Chrome/Application/chrome.exe"; for q in A01 ... A13; do "$C" --headless=new --hide-scrollbars --allow-file-access-from-files --virtual-time-budget=5000 --window-size=1080,1920 --screenshot=quadros/$q.png "file:///.../quadros.html?q=$q"; done
python -I ~/.claude/skills/pdf-aprovacao/gera_pdf.py ../aprovacao/plano.json
```
