set -e
cd /tmp/claude-0/cv
for c in C2 C3; do
  l=$(echo $c | tr A-Z a-z)
  npx remotion render src/index.ts $c out/${l}_mudo.mp4 --muted --crf=16 --timeout=300000 > out/render_${l}.log 2>&1
  ffmpeg -v error -y -i out/${l}_mudo.mp4 -i out/audio/mix_${l}.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/${l}.mp4
done
echo ALLDONE > out/render_done.txt
