---
name: extract-ds-avaliacao
description: extract-ds skill (rtadewald) evaluated 2026-10-07 on vslplay.com: site folder -> live HTML design-system catalog; proposed per-client motor theme, not adopted yet
metadata:
  type: project
  modified: 2026-10-07T22:21:45.320Z
---
Vítor sent rtadewald/skills extract-ds (2026-10-07) wanting client identity -> creatives/video/sites.
- What it is: agent workflow that copies a LOCAL site folder into `<brand>-design-system/` (Overview with lorem + Components catalog), two approval gates. Not a URL scraper, outputs HTML not tokens. Repo has no license: internal use only. Copy in /mnt/project-files/skills/extract-ds (ORIGEM.md).
- Test on vslplay.com (WordPress/Elementor): wget mirror works offline; our bridge `motion-base/fontes/ferramentas/extract-ds/ponte-tokens.mjs` measured navy #000C39, indigo #5D6CF9, magenta #E04DF2, Roboto. Site identity = blue/purple gradients + glow, which his taste bans; the 10/10 ad used the logo's flat colors instead.
- Proposal (awaiting his OK, flow unchanged): `estudio/motor/temas/<cliente>.json` + `"tema"` field in spec merged over theme.ts C; taste filter before use. Notes: motion-base/fontes/ferramentas/extract-ds/NOTAS.md. Thread "extract-ds" cmsg_01257unjkPWjtnQPA28xytUSWv5UpcNKDjV9M2nM8VrU6Y.
Related: [[estudio-motor]], [[design-system-video]], [[feedback-processo-edicao]].
