---
name: skill-pdf-aprovacao
description: Reusable skill pdf-aprovacao (2026-11-06) generates the short approval PDF (cover, keyframes, sound, checklist) from a plano.json
metadata:
  type: project
  modified: 2026-11-06T17:17:28.648Z
---
Built 2026-11-06 from the Rei da VSL / MedicMais approval PDFs. Lives in /mnt/project-files/skills/pdf-aprovacao (+ .zip sent to Vítor for his local project) and in repo `.claude/skills/pdf-aprovacao` (branch claude/project-thread-8ab7le).
`python gera_pdf.py plano.json` -> aprovacao.html + PDF via headless Chrome/Edge, no deps. Brand theme in plano.json `tema`; default = Apple direction. Grid auto-fits 9:16/4:5/1:1/16:9 and splits pages.
Gotcha: Chromium `--user-data-dir` made print-to-pdf hang in the cloud container; script omits it.
**How to apply:** for any approval gate ([[feedback-quadros-chave]], [[feedback-aprovacao-objetiva]]) fill a plano.json and run this instead of writing a one-off gera_pdf.py.
