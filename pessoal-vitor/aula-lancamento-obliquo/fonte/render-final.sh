#!/bin/bash
# Render final em blocos retomáveis (sem áudio), depois junta e põe o mix.wav.
# Uso: bash render-final.sh   (rodar de novo continua de onde parou)
set -e
B=/mnt/project-files/estudio/aula-lancamento-obliquo
OUT=$B/renders/blocos; mkdir -p "$OUT"
cd /root/aula
TOTAL=8306; PASSO=300
BR=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
for ((a=0; a<TOTAL; a+=PASSO)); do
  b=$((a+PASSO-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "%s/b%04d.mp4" "$OUT" $a)
  [ -s "$f" ] && continue
  echo "$(date +%T) bloco $a-$b"
  npx remotion render src/index.ts Aula "$OUT/tmp.mp4" --frames=$a-$b --gl=angle --muted --crf=16 \
     --browser-executable=$BR --timeout=240000 --log=error >/tmp/render_bloco.log 2>&1 || { tail -20 /tmp/render_bloco.log; exit 1; }
  mv "$OUT/tmp.mp4" "$f"
done
ls "$OUT"/b*.mp4 | sed "s/.*/file '&'/" > "$OUT/lista.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$OUT/lista.txt" -i $B/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart $B/renders/lancamento-obliquo.mp4
echo "$(date +%T) PRONTO"; ffprobe -v error -show_entries format=duration -of csv=p=0 $B/renders/lancamento-obliquo.mp4
