---
name: feedback-vozes-iguais
description: Every voice clip Vítor sends (any video, any group member) must be denoised and loudness-matched before use; measure before/after
metadata:
  type: feedback
---

Vítor (2026-11-19, Somalia video): his voice sounded much quieter than Luísa's and other clips still had noise. Rule for ALL future audios: clean every clip the same way and bring all voices to the same loudness so everyone is equally audible without noise.
**Why:** a group video is presented in class; every voice must be heard clearly.
**How to apply:** after first clean (DeepFilterNet3) + silence trimming, run escola-consciencia-negra/somalia/trabalho/scripts/acabar_vozes.py (2nd DF3 pass, EQ, compressor, gate, linear gain to -16 LUFS, limiter). Never use one-pass ffmpeg loudnorm on voices or the master (it lifts noise/flattens ducking). Report a before/after table. Related: [[roteiro-somalia]]
