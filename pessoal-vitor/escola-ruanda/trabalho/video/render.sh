#!/bin/bash
# Renderiza partes do vídeo. Uso: bash render.sh [abertura] [1-anna-julia] [2-ana-isabel] ... [encerramento] | todos
# Cada parte vira renders/partes/<nome>.mp4 (independente). Depois: bash montar.sh
set -e
V=/mnt/project-files/ruanda/trabalho/video; NM=/home/user/ruanda-nm
[ -d $NM/node_modules ] || (mkdir -p $NM && cp $V/package.json $NM/ && cd $NM && npm i --no-audit --no-fund)
python3 /mnt/project-files/ruanda/trabalho/scripts/fotos_sync.py >/dev/null
rm -rf $NM/src; cp -r $V/src $NM/src; mkdir -p $NM/public; cp -ru $V/public/. $NM/public/; cp $V/remotion.config.ts $V/tsconfig.json $NM/
mkdir -p $V/renders/partes; cd $NM
alvos="$@"; [ "$1" = "todos" ] && alvos="abertura $(ls $V/public/segmentos | sed 's/.json//') encerramento"
for a in $alvos; do
  case $a in
    abertura) npx remotion render src/index.ts Abertura $V/renders/partes/00-abertura.mp4 --log=error ;;
    encerramento) npx remotion render src/index.ts Encerramento $V/renders/partes/99-encerramento.mp4 --log=error ;;
    *) npx remotion render src/index.ts Segmento $V/renders/partes/$a.mp4 --props=public/segmentos/$a.json --log=error ;;
  esac
  echo "pronto: $a"
done
