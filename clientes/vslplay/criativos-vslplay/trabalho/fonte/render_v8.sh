set -e
cd /tmp/claude-0/-home-user/dbcde345-8f4b-529d-8cdb-8b388ee59a12/scratchpad/ad
T=/mnt/attach/project-files/anuncio-vslplay/trabalho/renders
npx remotion render src/index.ts Anuncio out/render/v8_mudo.mp4 --muted --concurrency=4 --jpeg-quality=95 --crf=16 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell > out/render/v8.log 2>&1
ffmpeg -v error -y -i out/render/v8_mudo.mp4 -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/render/anuncio_v8.mp4
cp out/render/anuncio_v8.mp4 $T/anuncio-vslplay-locucao-v8.mp4
ffmpeg -hide_banner -i out/render/anuncio_v8.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
python3 qa.py out/render/anuncio_v8.mp4 | head -4
echo DONE
