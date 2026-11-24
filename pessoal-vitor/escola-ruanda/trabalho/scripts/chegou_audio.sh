#!/bin/bash
# Quando chegar um áudio novo (ex.: Ana Isabel): bash scripts/chegou_audio.sh <arquivo-recebido> ana-isabel
# 1) guarda original  2) limpa (DeepFilterNet3 x2) e iguala a -16 LUFS  3) transcreve na Groq (palavra a palavra)
# 4) gera fala editada + legenda em video/public/falas/  -> depois: escrever eventos em video/public/segmentos/2-ana-isabel.json
#    (tirar "aguardando"), conferir com stills.sh, bash video/render.sh 2-ana-isabel && python3 video/montar.py
set -e; B=/mnt/project-files/ruanda/trabalho; src=$1; id=$2
cp "$src" $B/originais/$id.${src##*.}
mkdir -p /tmp/claude-0/novo1 /tmp/claude-0/novo2
python3 $B/scripts/limpar_voz.py "$src" /tmp/claude-0/novo1/$id.wav
python3 $B/scripts/acabar_vozes.py /tmp/claude-0/novo1 /tmp/claude-0/novo2
cp /tmp/claude-0/novo2/$id.wav $B/audio/limpo/
set -a; . $B/.env; set +a
ffmpeg -v error -y -i $B/audio/limpo/$id.wav -ac 1 -ar 16000 /tmp/claude-0/$id.flac
curl -s https://api.groq.com/openai/v1/audio/transcriptions -H "Authorization: Bearer $GROQ_API_KEY" -F file=@/tmp/claude-0/$id.flac -F model=whisper-large-v3 -F language=pt -F response_format=verbose_json -F "timestamp_granularities[]=word" -F "timestamp_granularities[]=segment" -F "prompt=Ruanda, hutus, tutsis, Habyarimana, Frente Patriótica Ruandesa, FPR, Paul Kagame, Uganda, Arusha, UNAMIR, ONU, Interahamwe, Kigali." > $B/transcricoes/groq/$id.json
python3 $B/scripts/prep_falas.py $id
python3 -c "import json;print(json.load(open('$B/transcricoes/groq/$id.json'))['text'])"
