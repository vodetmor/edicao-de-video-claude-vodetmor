---
name: agent-reach-avaliacao
description: Verdict on Panniantong/agent-reach (2026-09-28): useless in cloud (network policy blocks jina/youtube/exa/X), useful locally for X + YouTube research only
metadata:
  type: project
  modified: 2026-09-28T23:04:07.816Z
---

Analyzed 2026-09-28 at Vítor's request. Agent-Reach v1.5.0 (MIT) is an installer + SKILL.md that routes to upstream tools (Jina Reader, yt-dlp, twitter-cli with X cookies, Exa, OpenCLI with Chrome session); half the channels are China-only.
- Cloud test: r.jina.ai, youtube.com, api.fxtwitter.com, mcp.exa.ai all got 403 from this environment's network policy. The blocker is the network allowlist, not missing tools.
- Recommendation given: don't install the whole thing; on the user's PC (Remote Control) use only yt-dlp (YouTube transcripts + reference downloads) and twitter-cli with a secondary X account (ban risk). Not used in editing itself, only research/reference.

**How to apply:** if X/YouTube references are needed, route to Remote Control on the user's device or ask them to allow the hosts in Project settings > environment. Related: [[motion-base-knowledge]].
