#!/bin/bash
# Junta as cenas (cada uma cortada/estendida para o número exato de quadros), põe o mix e queima as legendas.
# Uso: bash fonte/monta.sh 720p30|1080p60 saida.mp4
set -e
Q=${1:-720p30}; OUT=${2:-/mnt/project-files/pessoal-vitor/questao-tangente/renders/previa-720p.mp4}
B=/mnt/project-files/pessoal-vitor/questao-tangente; V=/root/mm/videos/questao/$Q
FPS=${Q#*p}
mkdir -p $(dirname $OUT)
read -r -a N <<< "$(python3 -c "
import json;P=json.load(open('$B/audio/pausas.json'));W=json.load(open('$B/audio/palavras.json'))
L=[0]+[p['de'] for p in P]+[W[-1]['e']+2.4];f=[round(x*$FPS) for x in L];print(' '.join(str(f[i+1]-f[i]) for i in range(7)))")"
CENAS=(C0Gancho C1Questao C2Desenho C3Tangente C4Movimentos C5Resolve C6Resposta)
IN=(); FC=""
for i in 0 1 2 3 4 5 6; do IN+=(-i $V/${CENAS[$i]}.mp4); FC="$FC[$i:v]tpad=stop_mode=clone:stop=30,trim=end_frame=${N[$i]},setpts=PTS-STARTPTS[v$i];"; done
FC="$FC[v0][v1][v2][v3][v4][v5][v6]concat=n=7:v=1:a=0,ass=$B/audio/legendas.ass[v]"
ffmpeg -v error -y "${IN[@]}" -i $B/audio/mix.flac -filter_complex "$FC" -map "[v]" -map 7:a -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -shortest $OUT
ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT
