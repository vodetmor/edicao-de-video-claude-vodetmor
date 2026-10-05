#!/bin/bash
# Render da vitrine GLSL em blocos retomáveis (sobrevive a reinício do container) + loudness final.
# Uso: bash glsl-render.sh   -> /mnt/project-files/estudio/glsl/isso-nao-foi-filmado.mp4
set -e
CH=/mnt/project-files/estudio/glsl/trabalho/blocos
OUT=/mnt/project-files/estudio/glsl/isso-nao-foi-filmado.mp4
TOTAL=853; PASSO=60
mkdir -p "$CH"
for ((a=0; a<TOTAL; a+=PASSO)); do
  b=$((a+PASSO-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "%s/b%04d.mp4" "$CH" $a)
  [ -s "$f" ] && continue
  npx remotion render src/index.ts GlslVitrine /tmp/bloco.mp4 --frames=$a-$b --gl=angle --concurrency=4 --timeout=240000 --crf=14 --muted --image-format=jpeg --jpeg-quality=95 >/dev/null 2>&1
  mv /tmp/bloco.mp4 "$f"; echo "bloco $a-$b ok"
done
ls "$CH"/b*.mp4 | sed "s/^/file '/; s/$/'/" > /tmp/lista.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i /tmp/lista.txt -i public/audio/glsl/mix.wav -map 0:v -map 1:a -c:v copy \
  -af loudnorm=I=-14:TP=-1:LRA=9 -ar 48000 -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo "pronto: $OUT"
