f=$1; n=$(basename $f .webm); d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f | cut -d. -f1)
step=$(( d/40 + 1 )); [ $step -lt 3 ] && step=3
ffmpeg -v error -y -i $f -vf "fps=1/$step,scale=240:-2,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=8x5" -frames:v 1 fr/$n.jpg 2>&1 | head -2
echo "$n ${d}s step=${step}"
