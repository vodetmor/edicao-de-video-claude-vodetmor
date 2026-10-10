#!/bin/bash
# Renderiza o preço 3D dos ganchos. Uso: bash render_preco.sh <pasta_saida> [tam]  ->  preco<A|B>_QQ.png
OUT=${1:?pasta}; TAM=${2:-1080}; mkdir -p "$OUT"
cd "$(dirname "$0")"
for spec in "A 0 88" "B 0 74"; do set -- $spec
  for q in $(seq $2 $3); do f=$(printf "%s/preco%s_%02d.png" "$OUT" $1 $q); [ -f "$f" ] || python3 preco3d.py $1 $q "$f" $TAM > /dev/null 2>&1; done
done
echo pronto
