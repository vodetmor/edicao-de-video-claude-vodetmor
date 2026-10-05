---
name: hypit-avaliacao
description: Verdict on hypit-ai/hypit (2026-10-02): open-source agent skill that "clones" viral videos into word-anchored workflows; overlaps our Remotion pipeline, useful as idea source + UGC variants
metadata:
  type: project
  modified: 2026-10-02T15:55:41.141Z
---

Read 2026-10-02 at Vítor's request (v0.2.17, very new, trending).
- What: Claude Code/Codex skill (`npx skills add hypit-ai/hypit -g`) + TS runtime. Drop a reference video, agent rebuilds it as an editable workflow (SVML markup): footage, captions, B-roll, effects anchored to WORDS, not seconds. Renders HTML via headless Chromium ("hyperframes"), not Remotion.
- Cost: tool free; AI generation (Seedance, GPT Image, ElevenLabs etc.) paid per use via HypiHub or own keys; examples cost ~US$1 each. Code-only videos (captions + motion) need no paid model. WhisperX/yt-dlp run locally.
- License: modified Apache 2.0; using it for own and client work is allowed; outputs belong to user; can't resell it or run it as SaaS.
- Verdict given: don't swap our Remotion pipeline (Vítor's 10/10 quality came from it). Worth: (1) its word-anchoring idea, already similar to how we sync motion to the spoken word; (2) optional test for mass hook variants of ads/UGC. Its examples are brain-rot UGC style, far from Vítor's Apple-like taste.
- FUTURE GOAL (Vítor, 2026-10-02): later he wants to take scaled ads from Facebook (Meta Ad Library) and TikTok Ads and model them with AI; Hypit is the candidate tool for that. No test now. Full notes: /mnt/project-files/motion-base/fontes/ferramentas/hypit.md.
Related: [[anuncio-vslplay]], [[motion-base-knowledge]].
