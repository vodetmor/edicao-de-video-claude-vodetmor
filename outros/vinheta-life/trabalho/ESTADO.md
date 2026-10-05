# Estado: vinheta de encerramento "life" (jovens e adolescentes da igreja)

Pedido do Vítor (04/10/2026 00h UTC): vinheta de encerramento divertida e alegre com a logo "life".
Padrões assumidos: 6 s, 16:9 1080p + 9:16, som próprio sintetizado, logo em vetor limpo.
Perguntas enviadas a ele: texto junto (nome da igreja/slogan/versículo), @ do Instagram, onde vai passar.

## Feito
- Logo em vetor: `fonte/logo/geometria.py` (ajusta o anel = losango de cantos redondos por SDF) -> `geo.json`;
  `fonte/logo/monta.py` (shapely: anel exato, l/i/pingo geométricos medidos por perfil subpixel, gancho do f e o e = contorno do PNG suavizado) -> `logo.json`, `life-limpa.svg`, `life-limpa.png`.
- Animação Remotion: `fonte/src/Vinheta.tsx` (composições Vinheta169 e Vinheta916), tempos em `fonte/src/data/tempo.json` (120 BPM, 15 quadros por tempo).
- Quadros-chave + rascunhos sem som entregues para aprovação: `../quadros-chave.pdf`, `../rascunho-16x9-sem-som.mp4`, `../rascunho-9x16-sem-som.mp4` (board em `quadros/board.py`).

## Entregue (04/10/2026 ~00:35 UTC)
- Vítor aprovou o storytelling direto e pediu render final (Deidson: "só encerramento, vertical"). Padrões escolhidos: sem texto extra, sem @, final no laranja.
- Finais: `../vinheta-life-9x16.mp4` e `../vinheta-life-16x9.mp4` (6 s, motion blur 8 amostras, -14 LUFS). Som: `fonte/audio/som.py` (sintetizado: ukulele Karplus-Strong, boing, apito, marimba, tcharam) -> `audio/vinheta-som.wav`; mix: `ffmpeg -i vNNN.mp4 -i audio/vinheta-som.wav -af loudnorm=I=-14:TP=-1:LRA=7 -c:v copy -c:a aac -b:a 256k`.
- Extras no estouro: cruzinhas "+" (toque de igreja), ondas de contorno do losango, sombra de contato da bolinha.

## Próximo passo (antigo)
- Esperar OK do Vítor nos quadros (e respostas: texto, @, uso). Depois: som sintetizado (boing, pop, marimba, assobio, tcharam, ukulele KS + palmas) lendo tempo.json, motion blur, render final 16:9 e 9:16, -14 LUFS, crítica em contexto novo.

## Refazer
```
mkdir -p ~/vinheta && cp /mnt/project-files/vinheta-life/trabalho/fonte/{package.json,tsconfig.json,remotion.config.ts,stills.mjs} ~/vinheta/ && cp -r /mnt/project-files/vinheta-life/trabalho/fonte/src ~/vinheta/
cd ~/vinheta && npm i
node stills.mjs Vinheta169 /tmp/st 0,38,90,165
npx remotion render src/index.ts Vinheta169 out169.mp4   # e Vinheta916
python3 -m pip install pillow numpy scipy potracer shapely cairosvg  # só para refazer a logo
```
- Versão só efeitos (pedido do Vítor 00:27): `python3 fonte/audio/som.py --sem-musica` -> audio/vinheta-sfx.wav; finais `../vinheta-life-*-so-efeitos.mp4`.
