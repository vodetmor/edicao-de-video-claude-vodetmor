---
name: acessos-proposta
description: Prioritized proposal (2026-10-02) of new accesses for Claude (Gemini key, Apify ad libraries, Meta Ads read-only, Kaggle GPU, GitHub) and what was tested from cloud
metadata:
  type: project
  modified: 2026-10-02T21:30:10.048Z
---
File: /mnt/project-files/organizacao/ACESSOS-PROPOSTA.md (thread "acessos novos"). Framed around 4 bottlenecks: eyes/ears (Gemini watches video with audio = reference analyst + fresh critic), scoreboard (Meta Ads insights read-only), raw material (voice, music, 720p Flow clips), compute (no GPU in cloud; Kaggle free 30h/wk or his PC if NVIDIA).
Tested from cloud 2026-10-02:
- edge-tts works free, no key (pt-BR Thalita/Francisca/Antonio) once certifi points to /root/.ccr/ca-bundle.crt; script organizacao/amostras-voz/voz_edge.py. Use for scratch narration/animatics.
- Gemini API reachable (needs key). fal.ai, Apify, TikTok Creative Center, ElevenLabs API, HF reachable. LottieFiles 403.
- Meta Ad Library web has anti-bot JS challenge; Graph ads_archive only political ads in BR -> use Apify actors (apify/facebook-ads-scraper, doliz/tiktok-creative-center-scraper) or his PC Chrome. Playwright Chromium in cloud fails TLS via proxy (ERR_CERT_AUTHORITY_INVALID), unresolved.
- Apify WORKS (2026-10-02 21:40, after Vítor said "Eu já te dei a apify"): token from his 2026-09-29 timeline post; free plan US$5/mo. apify~facebook-ads-scraper run-sync with an Ad Library search URL + resultsLimit returns pageName, body, startDate (days running) and HD video URLs; cost ~US$0.0046/ad (~1000 ads/mo free). Test: estudio/escalados/teste-apify/anuncios.json.
Pixabay API has no music. Awaiting Vítor: Gemini key (he worried about cost; explained free tier, no card, no billing), niche for first real ad batch, (PC has NO NVIDIA, confirmed 2026-10-02: GPU path = Kaggle; check his PC via Remote Control terminal instead of asking him), GitHub/Kaggle/Meta read access.
Related: [[estudio-motor]], [[busca-material-real]], [[x-twitter-acesso]].
2026-10-02 21:43: Vítor questioned adding Gemini ("tem certeza?"). Agreed: NOT adding another AI for motion (our 10/10 came from measurement + his feedback; he is the critic). Only possible use: volume analysis of scaled-ad batches, to be A/B tested on 5 ads (my analysis vs with Gemini) if he wants. Lesson: don't propose extra layers without evidence; say plainly when something is a guess.
