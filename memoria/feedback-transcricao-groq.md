---
name: feedback-transcricao-groq
description: Always transcribe audio with the Groq Whisper API (instant), never slow local Whisper first
metadata:
  type: feedback
---

Vítor (2026-11-23/24): "Use o groq sempre pra transcrever, é instantânea". Local faster-whisper large-v3 on CPU took ~10 min for 6 min of audio; Groq took seconds.
**Why:** he wants speed; Groq is free.
**How to apply:** POST to https://api.groq.com/openai/v1/audio/transcriptions with model=whisper-large-v3, language=pt, response_format=verbose_json, timestamp_granularities[]=word. Key GROQ_API_KEY lives in /mnt/project-files/ruanda/trabalho/.env (gitignored; never copy the value). Check suspicious spans (stumbles, odd numbers) by re-sending just that clip. Related: [[video-ruanda]]
