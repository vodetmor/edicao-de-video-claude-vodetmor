#!/bin/bash
# Renderiza a sequência da caixa (abas abrindo->fechando->fita) em PNG com alfa. Uso: bash render_seq.sh <pasta_saida> [tam]
OUT=${1:?pasta}; TAM=${2:-1000}; mkdir -p "$OUT"
cd "$(dirname "$0")"
for q in $(seq 0 32); do f=$(printf "%s/caixa_%02d.png" "$OUT" $q); [ -f "$f" ] || python3 caixa.py $q "$f" $TAM > /dev/null 2>&1; done
echo pronto
