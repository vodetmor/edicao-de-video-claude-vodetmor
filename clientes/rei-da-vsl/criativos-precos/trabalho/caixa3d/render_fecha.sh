#!/bin/bash
# Rodada 4c: abas fechando em meio-passos (Q 0..18 de 0,5 em 0,5) -> fecha_00..36.png. Uso: bash render_fecha.sh <pasta> [tam]
OUT=${1:?pasta}; TAM=${2:-1000}; mkdir -p "$OUT"; cd "$(dirname "$0")"
for i in $(seq 0 36); do f=$(printf "%s/fecha_%02d.png" "$OUT" $i); [ -f "$f" ] || python3 caixa.py $(python3 -c "print($i/2)") "$f" $TAM > /dev/null 2>&1; done
echo pronto
