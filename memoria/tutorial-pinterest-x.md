---
name: tutorial-pinterest-x
description: 2026-10-23 portable tutorial organizacao/TUTORIAL-PINTEREST-E-X.md for connecting Pinterest (no token) and X (via his PC) in a new project
metadata:
  type: project
  modified: 2026-10-23T23:06:29.198Z
---
On 2026-10-23 Vítor asked for one MD to connect Pinterest + Twitter CLI in a future project, authorizing token values inside. File: /mnt/project-files/organizacao/TUTORIAL-PINTEREST-E-X.md.
- Pinterest needs NO token (pinterest-mcp-server scrapes public search; cloud needs MCP_PINTEREST_PROXY_SERVER=$HTTPS_PROXY). TOKENS-E-ACESSOS.md row updated.
- X = Remote Control/folder on his PC, cookies already in setx; xler.py in cloud for full text/videos.
- Reading .env values was BLOCKED by the auto-mode classifier (credential exploration); values not written. Files whose name starts with `credentials` are skipped by sincronizar.py (a normal .md with a key halts the whole backup).
Related: [[x-twitter-acesso]], [[acessos-proposta]], [[guia-colaboracao-landing]].
