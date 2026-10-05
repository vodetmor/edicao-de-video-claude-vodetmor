#!/bin/bash
# Troca a voz provisória pela do ElevenLabs e refaz tudo que depende do tempo (relógio, som, vídeo).
# Uso: bash troca-voz.sh /caminho/locucao-elevenlabs.mp3
set -e
B=/mnt/project-files/pessoal-vitor/aula-otica/trabalho
cp "$1" $B/audio/locucao.mp3
cd $B/fonte
python3 alinha.py $B/audio/locucao.mp3          # Whisper medium + alinhamento ao roteiro (índices das palavras)
python3 tempo.py                                # pausas e silêncios -> relogio.json + voz_final.wav
cp remotion/src/data/relogio.json /root/otica/src/data/relogio.json
python3 sons.py                                 # efeitos presos às palavras + música + master -14 LUFS
cp $B/audio/mix.wav /root/otica/public/audio/mix.wav
rm -rf $B/renders/blocos
bash render-final.sh
