#!/bin/bash
# Clonagem PT-BR com dots.tts (Apache-2.0, uso comercial ok) a partir da voz SINTETICA gerada pelo OmniVoice.
# Uso: bash testa_dots.sh  (venv em /opt/dotsenv: python3 -m venv /opt/dotsenv; pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cpu; pip install dots.tts)
cd "$(dirname "$0")"
AD="Você gasta seiscentos e oitenta reais por mês num player de vídeo? Com a VSL Play, você paga quarenta e oito e cinquenta. E ainda tem teste A B, gráfico de retenção e integração com tudo que você já usa."
REF_TXT="A liberdade veio no papel. Na prática, não. E essa realidade se estende até os dias atuais."
for M in soar mf; do
  S=$(date +%s)
  /opt/dotsenv/bin/dots.tts --model-name-or-path dots-studio/dots.tts-$M --precision float32 --language auto_detect \
    --text "$AD" --prompt-audio testes/omnivoice-design-masc-ref.wav --prompt-text "$REF_TXT" \
    --output testes/dots-$M-clone-sintetico-anuncio.wav
  echo "dots-$M: gerado em $(( $(date +%s) - S )) s"
done
