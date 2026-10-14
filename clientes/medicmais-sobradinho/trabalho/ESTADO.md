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
