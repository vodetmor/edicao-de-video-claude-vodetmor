#!/bin/bash
# Rodada 4: renderiza em paralelo a órbita da caixa (q 33-80), o preço 3D (A e B) e a coroa 3D; pula quadros prontos.
# Uso: bash render_tudo.sh <pasta_png>   depois: python3 converter.py <pasta_png>/<sub> para cada subpasta
S=${1:?pasta}; cd "$(dirname "$0")"
bash render_seq.sh $S/caixa_seq 1000 80 &
bash render_preco.sh $S/preco_seq 1080 &
( mkdir -p $S/coroa_seq; for q in $(seq 0 44); do f=$(printf "%s/coroa_seq/coroa_%02d.png" $S $q); [ -f $f ] || python3 coroa3d.py $q $f 1080 >/dev/null 2>&1; done ) &
wait; echo pronto
