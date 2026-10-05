# Aula: Lançamento oblíquo (estado em 2026-10-03)
Pedido de Vítor: explicação curta e direta de lançamento oblíquo com Manim + motor Remotion/GLSL + música/SFX, voz ElevenLabs (JULIANO MAGALHÃES, 3:46).

## Feito
- Roteiro (roteiro/ROTEIRO-ELEVENLABS.txt) e voz (audio/locucao.mp3).
- Palavras com tempo: audio/palavras_ok.json (534 palavras). 20 pausas inseridas: vídeo de 4:36,9 (8306 quadros a 30 fps).
- Mix final: audio/mix.wav (-14,0 LUFS, pico -1,0 dBTP), stems em audio/stems/. Música "Inspired" Kevin MacLeod (incompetech, CC BY 4.0): CRÉDITO OBRIGATÓRIO na descrição.
- Remotion completo (2D + legendas + camada Manim + 3D GLSL), derivações Manim renderizadas.
- Plano para aprovação: plano/plano-quadros-chave.pdf (gerado por plano/gera_pdf.py), amostra renders/amostra-derivacao.mp4 (quadros 2400-3220).
- Aprovado por Vítor. Ajustes dele aplicados: rótulo "inclinação = −g" acima da reta com traço; nenhuma fórmula cortada por linha (halo + caixas cheias + fórmulas acima do chão).
- ENTREGUE 2026-10-03: renders/lancamento-obliquo.mp4 (4:37, 1080p30, -14 LUFS / -1 dBTP). Render: bash fonte/render-final.sh (blocos de 300 em renders/blocos; apagar só os blocos alterados e rodar de novo).

## Próximo
1. Esperar opinião de Vítor sobre o vídeo final; ajustar só as partes citadas (2D ~25 s por bloco, blocos 3D 0-599, 7500-8305 levam 10-20 min).

## Reconstruir do zero (container novo)
```
# sistema
apt-get install -y texlive texlive-latex-extra texlive-fonts-extra dvisvgm libpango1.0-dev libcairo2-dev ffmpeg poppler-utils
python3 -m venv /opt/manimenv && /opt/manimenv/bin/pip install manim      # Manim CE 0.21
pip install faster-whisper numpy pillow                                    # só se for retranscrever
# Remotion
cp -r fonte/remotion /root/aula && cd /root/aula && npm ci                # (package.json do motor + katex 0.16)
mkdir -p public/audio && cp BASE/audio/mix.wav public/audio/
# ordem do pipeline (BASE = /mnt/project-files/estudio/aula-lancamento-obliquo)
python3 fonte/tempo.py                    # pausas -> audio/voz_final.wav + fonte/remotion/src/data/relogio.json (copiar para /root/aula/src/data/)
mkdir -p /root/manimwork && cp fonte/manim/{aula.py,render.sh,manifesto.py} /root/manimwork/ && bash /root/manimwork/render.sh   # rodar da cópia local; retomável; FORCA=1 refaz
cd /root/aula && /opt/manimenv/bin/python BASE/fonte/manim/manifesto.py   # -> src/data/manim.json
python3 BASE/fonte/legenda_desvio.py      # legendas que desviam das fórmulas -> src/data/legenda_lado.json
python3 BASE/fonte/sons.py                # SFX + música + master -> audio/mix.wav e stems
node stills.mjs <pasta> 0,230,...         # quadros soltos
npx remotion render src/index.ts Aula out.mp4 --gl=angle --frames=A-B --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```
Notas: o Manim grava alfa pré-multiplicado, por isso o render.sh extrai com unpremultiply. Depois de mexer em src/ em /root/aula, copiar de volta para fonte/remotion/.
