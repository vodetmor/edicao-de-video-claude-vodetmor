#!/bin/bash
# Quadros de conferência: bash stills.sh <segmento> <seg1> <seg2> ...  (segundos na timeline do segmento)
V=/mnt/project-files/ruanda/trabalho/video; NM=/home/user/ruanda-nm; s=$1; shift
python3 /mnt/project-files/ruanda/trabalho/scripts/fotos_sync.py >/dev/null
rm -rf $NM/src; cp -r $V/src $NM/src; mkdir -p $NM/public; cp -ru $V/public/. $NM/public/; cp $V/remotion.config.ts $V/tsconfig.json $NM/
mkdir -p $V/renders/stills; cd $NM
for t in "$@"; do f=$(python3 -c "print(round($t*30))")
  if [ $s = abertura ]; then npx remotion still src/index.ts Abertura $V/renders/stills/abertura-$t.jpg --frame=$f --log=error
  elif [ $s = encerramento ]; then npx remotion still src/index.ts Encerramento $V/renders/stills/fim-$t.jpg --frame=$f --log=error
  else npx remotion still src/index.ts Segmento $V/renders/stills/$s-$t.jpg --props=public/segmentos/$s.json --frame=$f --log=error; fi
done
