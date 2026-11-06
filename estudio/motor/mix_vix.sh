# uso: bash mix_vix.sh N  (mixa out/vix/rN.mp4 + public/vix/musica/mN.mp3 -> saida)
N=$1
S=/c/dev/maquina-de-editar/clientes/vixplaytv/criativos/saida
NM=(x 01-gancho-preco 02-economia-o-que-tem-dentro 03-dor-solucao 04-passeio-por-dentro)
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/vix/r$N.mp4)
ffmpeg -v error -y -i out/vix/r$N.mp4 -i public/vix/musica/m$N.mp3 -filter_complex \
"[1:a]atrim=0:$D,asetpts=PTS-STARTPTS,loudnorm=I=-32:TP=-3,afade=t=in:d=1,afade=t=out:st=$(python -c "print(max(0,$D-2))"):d=2[m];[0:a]asplit[v1][v2];[m][v1]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=500[md];[v2][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]" \
-map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k "$S/vixplay-criativo${NM[$N]}.mp4"
