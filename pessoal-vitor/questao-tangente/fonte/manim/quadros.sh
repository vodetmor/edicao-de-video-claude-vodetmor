#!/bin/bash
# quadros.sh Cena INI t1 t2 ... -> mosaico em scratchpad/<Cena>.png (tempos globais)
C=$1; I=$2; shift 2
S=/tmp/claude-0/-home-user-edicao-de-video-claude-vodetmor/862832e0-2006-52ff-9125-81819465fa52/scratchpad
Q=${Q:-480p30}
args=(); n=0
for g in "$@"; do t=$(python3 -c "print(max(0,$g-$I))"); ffmpeg -v error -y -ss $t -i /root/mm/videos/questao/$Q/$C.mp4 -frames:v 1 $S/_f$n.png; args+=(-i $S/_f$n.png); n=$((n+1)); done
if [ $n -eq 1 ]; then cp $S/_f0.png $S/$C.png; exit; fi
f=""; rows=$(( (n+1)/2 )); for ((r=0;r<rows;r++)); do a=$((2*r)); b=$((2*r+1)); if [ $b -lt $n ]; then f="$f[$a][$b]hstack[r$r];"; else f="$f[$a]pad=iw*2:ih[r$r];"; fi; done
for ((r=0;r<rows;r++)); do f="$f[r$r]"; done
if [ $rows -eq 1 ]; then ffmpeg -v error -y "${args[@]}" -filter_complex "[0][1]hstack" $S/$C.png; else ffmpeg -v error -y "${args[@]}" -filter_complex "${f}vstack=$rows" $S/$C.png; fi
