---
name: editor-video-falado
description: estudio/editor (built 2026-10-29): raw talking-head -> edited video (cuts, face track, captions, 5 styles, review panel localhost:8080) + skill editar-video
metadata:
  type: project
  modified: 2026-10-29T18:06:03.409Z
---
Built 2026-10-29 in repo `estudio/editor/` (branch claude/project-thread-xk9d9x) as the base of the product with Jerônimo ([[produto-skills-jeronimo]]), also for our own use.
Pipeline: `pipeline/limpar.py <pasta>` (faster-whisper local, energy-based pause cuts, retakes keep last, YuNet face track) -> Claude writes `projeto/roteiro-visual.json` -> `remotion/renderizar.mjs` (--quadros/--amostra/--trecho/--nome) and `remotion/painel.mjs` (live Remotion Player review, notes at exact frame in projeto/revisao/notas.json).
Styles ready: corte-limpo, split, painel, moldura, reels-forte (catalog estilos/CATALOGO.md maps the foreign 20-style pack and Jerônimo's 7). Next planned: `mapa` element (his Canvas/Miro funnels), B-roll, ranking, 16:9 lesson, alpha cutout test.
Review panel also runs as a claude.ai artifact (`remotion/artefato.mjs`, notes in artifact db collection `notas`): test video at https://claude.ai/artifact/Dm3hNUc6iRhnkgJUrjya2c (2026-10-29); republish same URL after edits.
Skill `.claude/skills/editar-video` is written generically ("o usuário"). Test media (Jerônimo IMG_4309) and the 5 rendered styles: /mnt/project-files/outros/maquina-edicaoia/teste-editor/.
**Why:** Vítor asked to have everything working inside our ecosystem before turning it into a product.
**How to apply:** for any raw talking video, use the skill editar-video; extend styles/elements in remotion/src instead of writing one-off code.
