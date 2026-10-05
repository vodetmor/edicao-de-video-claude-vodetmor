---
name: ecc-avaliacao
description: Verdict on affaan-m/ECC agent kit (2026-10-02): don't install whole; cherry-pick taste-distillation (measure refs), fresh-context render review, confidence-tagged lessons
metadata:
  type: project
  modified: 2026-10-02T16:05:09.764Z
---

Read 2026-10-02 at Vítor's request (v2.2.3, MIT). ECC = Claude Code plugin with 68 agents, 293 skills, 94 commands, hooks; ~90% for software dev. Vítor liked it because it mirrors our coordinator + thread setup.
- Verdict: don't install whole (code-oriented, bloats context, cloud wipes ~/.claude). Full eval: /mnt/project-files/organizacao/ecc.md.
- Adopt: (1) taste-distillation skill (copy saved at motion-base/fontes/ferramentas/ecc/taste-distillation) to measure winning ads' cut rhythm + color LUT for future "model scaled ads" work; needs numpy/opencv/scenedetect, ask Vítor before installing; (2) separate fresh-context reviewer of each render vs SPEC/DESIGN-SYSTEM; (3) tag lessons "confirmado pelo Vítor" vs "palpite".
- Explained to Vítor: each new project-chat message opens a fresh thread (= new chat, clean context); continue a topic inside its thread.
Related: [[hypit-avaliacao]], [[motion-base-knowledge]], [[feedback-processo-edicao]].
