---
name: estudio-motor
description: Our own video engine "Estúdio" (2026-10-02): Remotion motor + JSON spec anchored to spoken words + HyperFrames HTML/GSAP bridge + batch variants; plan in organizacao/ESTUDIO-PLANO.md
metadata:
  type: project
  modified: 2026-10-02T16:23:59.346Z
---

Built 2026-10-02 at Vítor's request ("algo nosso" merging Remotion + HyperFrames + Hypit, AE-level).
- Code: /mnt/project-files/estudio/motor (README/ESTADO with rebuild commands). One generic composition "Video" reads a spec JSON (specs/*.json): events anchored to words ("antes-1", "oferta:fim+6", "@0", "fim"), blocks from catalog (Batida, Slam, Botao, Trilha, Legenda, HtmlGsap), SFX. `node fabrica.mjs spec [A,B] [--stills]` renders all variants + loudnorm -14 LUFS.
- HtmlGsap block runs HyperFrames-style HTML+CSS+GSAP inside Remotion (script gets gsap, root, M = word times in s, W, H; returns tl).
- Test: estudio/teste-gancho/ (criativo 2 hook, 3 variants A React / B HTML / C 4:5). Vítor picked A (2026-10-02): "incrivelmente bom, muito mais fluido"; A language is the default for creatives. Decision 16:28: Remotion only, no over-engineering; HyperFrames = recipe book rewritten in React, Hypit = idea only; HtmlGsap bridge kept as fallback, not default.
- Next per plan: port HyperFrames blueprints, test Lottie (@remotion/lottie installed), "scaled ad" module, Google Flow prompt kit, move C2/C3 to spec, private GitHub repo. Paid keys slot: motor/.env.exemplo.
Related: [[hypit-avaliacao]], [[ecc-avaliacao]], [[design-system-video]], [[feedback-processo-edicao]].
