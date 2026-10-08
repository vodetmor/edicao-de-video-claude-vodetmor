# Estado: animação em JavaScript (método Chase AI)

## Feito (08/10/2026)
- Skill `animate` (github.com/cth9191/animate, MIT, commit 7e5eb56) instalada como skill do projeto: `skills/animate/` (no GitHub: `.claude/skills/animate/`). Estudo do método: `motion-base/fontes/chase-ai/NOTAS.md`.
- Primeira peça: **"Um vídeo é uma função do tempo"** (9:16, 21 s, 24 fps, 120 BPM, estilo caderno, trilha sintetizada em código, sem locução).
  - Fonte: `pecas/funcao-do-tempo/` (`piece.json`, `src/head.html`, `src/scenes.js`, `src/bridges.js`, `src/score.js`). `index.html` é gerado (abrir no navegador: clique para ouvir, `?t=12.5` congela um quadro).
  - Entrega: `entregas/um-video-e-uma-funcao-do-tempo.mp4` (-14 LUFS, pico -2,2 dBFS) e `entregas/storyboard.png`.
  - Revisão medida (`review.mjs`): corte na grade PASS, 2 morphs na grade PASS, arco da história 5/5, texto sem corte/sobreposição e fora da área da interface, sem trecho morto. Folhas em `pecas/funcao-do-tempo/review/`.
- Esperando a opinião do Vítor sobre a peça.

## Refazer (na nuvem ou no PC)
```bash
# fontes de mão (o kit só usa fontes do sistema): Caveat para legendas, Kalam como "cursive"
mkdir -p ~/.fonts ~/.config/fontconfig
cp /mnt/project-files/estudio/animacao-js/trabalho/fontes/*.ttf ~/.fonts/
cp /mnt/project-files/estudio/animacao-js/trabalho/fontes/fonts.conf ~/.config/fontconfig/fonts.conf && fc-cache -f
SK=/mnt/project-files/skills/animate      # no repositório: .claude/skills/animate
cd /mnt/project-files/estudio/animacao-js/pecas
node $SK/tools/build.mjs funcao-do-tempo
node $SK/tools/storyboard.mjs funcao-do-tempo            # storyboard.png (portão de aprovação)
node $SK/tools/export.mjs funcao-do-tempo --share        # ~3 min na nuvem (504 quadros, ~45 ms/quadro + codificação)
node $SK/tools/review.mjs funcao-do-tempo                # números + folhas de contato
ffmpeg -y -i funcao-do-tempo/renders/share.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=7,volume=-0.7dB" -ar 48000 -c:a aac -b:a 256k -movflags +faststart ../entregas/um-video-e-uma-funcao-do-tempo.mp4
```
Ajuste só de som: `export.mjs funcao-do-tempo --share --only-audio`.
No Windows: Node 18+, `npm i -g playwright && npx playwright install chromium`, ffmpeg no PATH; as fontes `.ttf` daqui instaladas no Windows.

## Próximo passo
- Ouvir o que o Vítor achar e ajustar só o que ele pedir (fonte existente, render só do que mudou).
- Ideias: versão 16:9 (`"formats"`), uma aula do ENEM nesse estilo com a voz dele (a voz vira o relógio: `tools/voice.mjs`), um estilo próprio a partir de referências (`new-style.md`).
