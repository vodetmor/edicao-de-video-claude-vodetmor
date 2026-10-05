# Anúncio VSL Play (fonte)

Remotion 4.0.529 (React) para a imagem e Python (numpy/scipy) para a trilha e os efeitos, tudo sintetizado.
1920×1080, 30 fps, 48 s (1.440 quadros). Batida de 128,57 BPM = 14 quadros por tempo.

## Rodar

    npm i
    python3 audio/make_audio.py        # gera out/audio/mix.wav (-14 LUFS, pico real <= -1 dBTP) e os stems
    npx remotion studio                # composição "Anuncio"
    npx remotion render src/index.ts Anuncio out/anuncio_mudo.mp4 --muted --crf=16
    ffmpeg -i out/anuncio_mudo.mp4 -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/anuncio.mp4

Vinheta da logo (7,5 s, 225 quadros), mesma montagem da abertura, com som próprio:

    python3 audio/make_sting.py        # gera out/audio/vinheta.wav
    npx remotion render src/index.ts Vinheta out/vinheta_mudo.mp4 --muted --crf=16
    ffmpeg -i out/vinheta_mudo.mp4 -i out/audio/vinheta.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/vinheta.mp4

Corte de 4,5 s da vinheta (quadros 66 a 200: do triângulo se fechando ao último pouso do ponto):

    python3 audio/cut_sting.py         # gera out/audio/vinheta_curta.wav a partir de vinheta.wav
    ffmpeg -i out/vinheta_mudo.mp4 -i out/audio/vinheta_curta.wav -filter_complex "[0:v]trim=start_frame=66:end_frame=200,setpts=PTS-STARTPTS[v]" -map "[v]" -map 1:a -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart out/vinheta_curta.mp4

Vinheta com fundo transparente (ProRes 4444 com canal alfa, para pôr sobre qualquer imagem no editor):

    npx remotion render src/index.ts VinhetaAlpha out/vinheta_alpha.mov --muted --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
    ffmpeg -i out/vinheta_alpha.mov -i out/audio/vinheta.wav -map 0:v -map 1:a -c:v copy -c:a pcm_s16le out/vinheta_alpha_som.mov

O áudio entra pelo ffmpeg de propósito: o mux do Remotion atrasa o AAC em cerca de 1 quadro.

## Onde está cada coisa

- `src/timeline.ts`: os quadros de cada acontecimento (a trilha em `audio/make_audio.py` usa os mesmos números).
- `src/Logo.tsx` + `src/logoData.ts`: a logo real vetorizada (fitas, triângulo, ponto) com as texturas tiradas do arquivo original.
- `src/FoldIcon.tsx`: as três fitas como abas de papel em 3D (dobradiça na borda do ícone, perspectiva, sombreamento), que caem por gravidade e quicam duas vezes. Usadas na montagem da abertura, na remontagem do final e na vinheta.
- `src/Vinheta.tsx`: as composições "Vinheta" (a logo animada sozinha, para abrir ou fechar qualquer vídeo) e "VinhetaAlpha" (a mesma, sem fundo).
- `src/Player.tsx`: o player copiado do CSS real (cdn.vslplay.com/player.js).
- `src/CamStage.tsx`: a câmera que entra em cada recurso; o player cresce numa janela à direita da coluna de texto, recortado com cantos arredondados e sombra redesenhada.
- `src/scenes/`: Opening (ponto que quica e monta a logo), Chapter1 (Atenção), Chapter2 (Retenção), Chapter3 (Conversão), Late (preço, "E muito mais", integrações), Finale (a logo se reconstrói), Chrome (timecode e trilha de progresso).
- `src/kit.tsx`: curvas de easing, molas, motion blur por amostras (média corrida, número de amostras adaptado à velocidade), texto que sobe letra a letra.
- `qa.py`: confere o vídeo renderizado (trechos congelados, quadro isolado que some, deriva da cor do papel). `python3 qa.py out/anuncio.mp4`
- `stills.mjs` + `sheet.py`: quadros soltos e folhas de contato para revisar sem renderizar tudo (`node stills.mjs out/dir 70,84,98 0.5 Vinheta` escolhe a composição).
- `zoomsheet.py`: folha com recortes ampliados 3× de uma região (bordas do triângulo, emendas das fitas) para achar frestas e contornos de 1 px.
- `loudcurve.py`: curva de loudness de curto prazo por segundo e LRA de um WAV, para conferir a dinâmica da trilha (`python3 loudcurve.py out/audio/mix.wav`).
- `audio/cut_sting.py`: o som do corte de 4,5 s da vinheta.
- `public/`: logos das integrações (do site), texturas da logo e o clipe do apresentador (Mixkit, licença gratuita).
- Brief e estudo das referências: `anuncio-vslplay/BRIEF.md` e `SPEC.md`.
