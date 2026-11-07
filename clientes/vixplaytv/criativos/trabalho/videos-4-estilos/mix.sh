# uso: bash mix.sh VIDEO_MUDO VOZ MUSICA CAPA LOGO T_LOGO SAIDA
V=$1; A=$2; M=$3; C=$4; L=$5; TL=$6; O=$7
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
ffmpeg -v error -y -i "$V" -i "$C" -loop 1 -i "$L" -i "$A" -i "$M" -filter_complex \
"[2:v]format=rgba,fade=t=in:st=$TL:d=0.4:alpha=1[lg];[0:v][lg]overlay=0:0:enable='gte(t,$TL)':shortest=1[v1];[v1][1:v]overlay=0:0:enable='eq(n,0)'[v];\
[3:a]apad,atrim=0:$D[vz];[4:a]aloop=loop=-1:size=2e9,atrim=0:$D,asetpts=PTS-STARTPTS,loudnorm=I=-30:TP=-3,afade=t=in:d=0.6,afade=t=out:st=$(python -c "print(max(0,$D-1.5))"):d=1.5[m];\
[vz]asplit[v1a][v2a];[m][v1a]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=400[md];[v2a][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]" \
-map "[v]" -map "[a]" -t $D -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$O"
