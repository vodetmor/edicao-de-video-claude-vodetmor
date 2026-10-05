---
name: busca-material-real
description: Free multi-source search CLI for real footage/photos/news/SFX at ferramentas/busca/busca.py (2026-10-02); what sources work from the cloud
metadata:
  type: reference
  modified: 2026-10-02T16:50:28.140Z
---
Built 2026-10-02 (thread "busca de material real"). Tool: /mnt/project-files/ferramentas/busca/busca.py; guide motion-base/BUSCA-MATERIAL-REAL.md.
Flow: search -> look at folha.jpg (numbered thumbs colored by license) -> `--de <pasta> --baixar 2,6` -> license logged in ferramentas/busca/registro-licencas.csv.
Needs `pip install pillow yt-dlp` per fresh container. Keys read from ferramentas/busca/chaves.env and escola-consciencia-negra/edicao/.env (Pexels/Freesound/Jamendo exist; Pixabay key missing, Vítor must create it).

Works from cloud: Pexels API, Mixkit (HTML, occasional 429), Openverse, Wikimedia (429 bursts), Internet Archive (noisy relevance), NASA, LoC, Freesound, Jamendo, Google News RSS, Dailymotion search+download (only 288-384p), YouTube search only.
Blocked/useless: Pixabay web, Unsplash, Vecteezy/Videvo/Freepik, Coverr (mostly AI), Reddit, Bing images (random results for bots), DuckDuckGo, Vimeo, GDELT (5 s limit).

**How to apply:** use this before generating anything with AI; real material first. See [[rede-acessos-2026-09-29]].
