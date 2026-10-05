---
name: rede-acessos-2026-09-29
description: What the cloud network reaches after it was opened on 2026-09-29 (X via fxtwitter, Pinterest, YouTube search-only, Wikimedia rate limits, Whisper/HF)
metadata:
  type: reference
  modified: 2026-09-29T02:32:53.582Z
---
Tested 2026-09-29 in this project's cloud env:
- X: `api.fxtwitter.com/status/<id>` returns text + video URLs; video.twimg.com downloads work. No search, no thread replies.
- Pinterest: `/ideas/...` and board pages return HTML with i.pinimg.com 736x images and v1.pinimg.com mp4s. Search pages (`/search/pins`) need JS, return nothing.
- YouTube: yt-dlp search/metadata works; download blocked ("sign in to confirm you're not a bot").
- Wikimedia Commons: needs a descriptive User-Agent, standard thumb width (1280), ~4 s between requests; otherwise 429 and the IP stays throttled for a while. Full-text search is poor for modern topics; use categories.
- Whisper model host and huggingface.co reachable → transcription possible in cloud now.
- Brasiliana Fotográfica 403; NASA images API 403. Substack posts readable via `/api/v1/posts/<slug>` (paywalled part not included).
- Gotcha: `pkill -f commons.py` / `pgrep -f` also match your own bash wrapper; wait on a PID instead.
Related: [[motion-base-knowledge]], [[escola-racismo-ambiental]].
