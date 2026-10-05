#!/bin/bash
# Uso: ./render_parte.sh <N> <CompId> <nome-saida>   ex.: ./render_parte.sh 3 Parte3Caina parte3-caina
# Renderiza sem som, junta com public/pN/mix.wav, confere quadros congelados e copia para a pasta do projeto.
set -e
cd "$(dirname "$0")"
N=$1; COMP=$2; NOME=$3
FF=$(python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())")
DEST=/mnt/project-files/escola-consciencia-negra
mkdir -p out
npx remotion render src/index.ts $COMP out/p$N-mudo.mp4 --muted --concurrency=4 --log=error
$FF -y -loglevel error -i out/p$N-mudo.mp4 -i public/p$N/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart out/$NOME.mp4
$FF -hide_banner -i out/$NOME.mp4 -vf "freezedetect=n=0.001:d=2.5" -an -f null - 2>&1 | grep -o "freeze_start: [0-9.]*\|freeze_duration: [0-9.]*" | paste - - || true
cp out/$NOME.mp4 $DEST/$NOME.mp4
cp out/$NOME.mp4 $DEST/trabalho/renders/$NOME.mp4
echo "pronto: $DEST/$NOME.mp4"
