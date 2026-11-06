#!/bin/bash
# Renderiza as derivações (mov com alfa) e extrai PNG por quadro na pasta public do Remotion.
# Retomável: pula cena pronta. Uso: bash render.sh [Cena ...]   (FORCA=1 refaz)
# Manim grava alfa pré-multiplicado: unpremultiply evita preenchimentos marrons.
# (PNG direto do Manim pula quadros parados; o mov guarda o tempo certo.)
set -e
# media em disco local: a pasta compartilhada às vezes some no meio dos arquivos parciais do Manim
cd "$(dirname "$0")"
OUT=/root/aula/public/manim
mkdir -p "$OUT"
for C in ${@:-Comp Mru Muv Trajetoria Tempo Altura Alcance Max45 Compl Resumo}; do
  if [ -s "$OUT/$C/done" ] && [ -z "$FORCA" ]; then echo "$C pronto"; continue; fi
  rm -rf "${OUT:?}/${C:?}"
  /opt/manimenv/bin/manim -qh --fps 30 -t --format mov --disable_caching --media_dir /root/manim_media aula.py "$C" >"/tmp/manim_$C.log" 2>&1 || { tail -20 "/tmp/manim_$C.log"; exit 1; }
  mkdir -p "$OUT/$C"
  ffmpeg -y -loglevel error -i "/root/manim_media/videos/aula/1080p30/$C.mov" -vf unpremultiply=inplace=1 -start_number 0 "$OUT/$C/%04d.png"
  ls "$OUT/$C" | wc -l > "$OUT/$C/done"; echo "$C: $(cat "$OUT/$C/done") quadros"
done
