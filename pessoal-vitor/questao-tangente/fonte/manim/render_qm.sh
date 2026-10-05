#!/bin/bash
cd /root/manimwork
run(){ for c in "$@"; do timeout 3000 /opt/manimenv/bin/manim -qm --disable_caching --media_dir /root/mm questao.py $c > /root/mm/log_$c.txt 2>&1; echo "$c $?" >> /root/mm/feitos.txt; done; }
rm -f /root/mm/feitos.txt
run C2Desenho & run C1Questao C0Gancho & run C3Tangente C6Resposta & run C4Movimentos C5Resolve & wait
echo TUDO >> /root/mm/feitos.txt
