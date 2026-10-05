---
name: voz-clonagem-local
description: VoiceStudio (voicestudio.sh) and similar local voice-cloning engines tested 2026-10-02; quality judged bad by Vítor, on stand-by
metadata:
  type: project
  modified: 2026-10-02T23:44:33.899Z
---
2026-10-02: Vítor asked for VoiceStudio (open-source desktop app, AGPL, github.com/debpalash/VoiceStudio) to clone voices instead of paying ElevenLabs. He installed it on his PC himself. Cloud test (CPU, synthetic voices only) of OmniVoice (default engine) and dots.tts: Vítor said "ficou ruim todos", but the app is useful, so it is ON STAND-BY. Keep ElevenLabs (Ana Dias) as the quality reference.
Similar tools to remember (all inside VoiceStudio's engine catalog): OmniVoice (k2-fsa, weights CC-BY-NC = no paid ads), dots.tts (Apache-2.0, 2B, needs GPU, Linux only), MOSS-TTS-v1.5 (Apache-2.0, 8B, GPU), CosyVoice 3, IndexTTS 2.5 (bilibili license), VoxCPM2, Confucius4-TTS (Apache, has Portuguese). Free baseline: edge-tts (pt-BR Antonio/Thalita).
**Why:** CPU is too slow for 2B+ models (dots.tts took 40 min for 12 s); PT-BR quality fell short of ElevenLabs.
**How to apply:** If voice cloning comes up again, retest the commercial-license engines on Kaggle GPU with a voice whose owner explicitly authorized it (the cloud env blocks cloning a real voice without that). Notes: motion-base/fontes/ferramentas/voicestudio.md; state and scripts: ferramentas/voz/ESTADO.md. Related: [[acessos-proposta]], [[anuncio-vslplay]].
