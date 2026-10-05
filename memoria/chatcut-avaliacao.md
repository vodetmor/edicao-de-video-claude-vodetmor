---
name: chatcut-avaliacao
description: ChatCut Claude plugin evaluated 2026-09-28: blocked in cloud, desktop-only, credit-based; verdict = optional rough-cut tool on user's PC, not for motion
metadata:
  type: project
  modified: 2026-09-28T23:39:49.584Z
---

ChatCut (chatcut.io) plugin for Claude Code, evaluated 2026-09-28.
- Install: `claude plugin marketplace add https://github.com/ChatCut-Inc/agent-plugin.git#main` then `claude plugin install chatcut@chatcut-inc`, OAuth login, new session. Desktop app only.
- MCP server is hosted (api.chatcut.io); chatcut.io and api.chatcut.io are blocked by the cloud proxy, so it can't run in cloud threads. GitHub repo is reachable.
- Free plan: 5 credits, 60 min total web export; paid from ~$42/mo. Exports video, SRT, Premiere/DaVinci XML, CapCut drafts.
- Its motion graphics use its own style catalog/presets (JSX inside its editor), not our reference-first SPEC.md + Remotion flow.

**Why:** user wants lean edits and the SPEC.md workflow ([[motion-base-knowledge]]); tight budget.
**How to apply:** don't route motion work to ChatCut. Only suggest it for talking-head rough cut (transcribe, cut, captions) on the user's own computer via Remote Control, if they ask.
