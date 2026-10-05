# Voz: VoiceStudio / OmniVoice / dots.tts (thread "VoiceStudio", 02/10/2026)
Feito:
- Vítor instalou o app VoiceStudio no PC dele (02/10 23:10).
- Nuvem: OmniVoice em /opt/ovenv e dots.tts em /opt/dotsenv (somem no reinício). Reinstalar:
  python3 -m venv /opt/ovenv && /opt/ovenv/bin/pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cpu && /opt/ovenv/bin/pip install omnivoice soundfile
  python3 -m venv /opt/dotsenv && (mesmo torch) && /opt/dotsenv/bin/pip install dots.tts
- Testes: testa_omnivoice.py, testa_dots.sh, confere.py (Whisper). Saídas em testes/, mp3 em amostras/.
- Resultados e licenças: motion-base/fontes/ferramentas/voicestudio.md.
Regra: clonar só voz com autorização explícita do dono na conversa (ambiente bloqueia sem isso).
Próximo:
- STAND-BY (02/10 23:44): Vítor achou todas as amostras ruins; app útil, guardar para depois.
- Quando ele mandar voz autorizada: clonar no PC dele (app) ou aqui com OmniVoice.
- Anúncio comercial: rodar dots.tts/MOSS no Kaggle GPU.
