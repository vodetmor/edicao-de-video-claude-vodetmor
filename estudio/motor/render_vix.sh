for r in r1 r2 r3 r4; do
  npx remotion render Vix out/vix/$r.mp4 --props="{\"id\":\"$r\"}" --codec=h264 --crf=17 2>&1 | tail -2
done
