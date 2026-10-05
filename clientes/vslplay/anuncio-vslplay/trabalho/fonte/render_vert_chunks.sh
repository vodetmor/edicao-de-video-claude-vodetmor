# Vertical render in chunks of 250 frames, each retried up to 3 times; finished chunks are skipped (resumable).
cd /tmp/claude-0/-home-user/dbcde345-8f4b-529d-8cdb-8b388ee59a12/scratchpad/ad
T=/mnt/attach/project-files/anuncio-vslplay/trabalho/renders
C=out/render/vchunks; mkdir -p $C
N=2501; STEP=250
BR=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
: > $C/list.txt
for ((a=0; a<N; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $N ] && b=$((N-1))
  out=$C/c$(printf %04d $a).mp4
  for try in 1 2 3; do
    [ -s $out ] && break
    npx remotion render src/index.ts Vertical $out.tmp.mp4 --frames=$a-$b --muted --concurrency=2 --timeout=300000 --jpeg-quality=95 --crf=16 --browser-executable=$BR > $C/log_$a.txt 2>&1 && mv $out.tmp.mp4 $out
  done
  [ -s $out ] || { echo "FAILED chunk $a"; exit 1; }
  echo "file '$(basename $out)'" >> $C/list.txt
  mkdir -p $T/vchunks && cp -n $out $T/vchunks/
  echo "chunk $a ok"
done
ffmpeg -v error -y -f concat -safe 0 -i $C/list.txt -c copy out/render/vert_mudo.mp4
ffmpeg -v error -y -i out/render/vert_mudo.mp4 -i out/audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/render/anuncio_vert.mp4
cp out/render/anuncio_vert.mp4 $T/anuncio-vslplay-locucao-vertical-v1.mp4
ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/render/anuncio_vert.mp4
python3 qa.py out/render/anuncio_vert.mp4 | head -3
echo DONE
