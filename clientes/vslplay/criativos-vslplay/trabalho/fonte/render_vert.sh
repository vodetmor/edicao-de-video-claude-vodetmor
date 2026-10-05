set -e
cd /tmp/claude-0/-home-user/dbcde345-8f4b-529d-8cdb-8b388ee59a12/scratchpad/ad
T=/mnt/attach/project-files/anuncio-vslplay/trabalho/renders
npx remotion render src/index.ts Vertical out/render/vert_mudo.mp4 --muted --concurrency=3 --timeout=300000 --offthreadvideo-cache-size-in-bytes=2000000000 --jpeg-quality=95 --crf=16 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell > out/render/vert.log 2>&1
ffmpeg -v error -y -i out/render/vert_mudo.mp4 -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/render/anuncio_vert.mp4
cp out/render/anuncio_vert.mp4 $T/anuncio-vslplay-locucao-vertical-v1.mp4
ffmpeg -hide_banner -i out/render/anuncio_vert.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
python3 qa.py out/render/anuncio_vert.mp4 | head -4
echo DONE
