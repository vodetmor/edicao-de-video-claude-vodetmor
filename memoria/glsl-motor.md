---
name: glsl-motor
description: GLSL/raymarching layer added to our Remotion engine on 2026-10-02 (showcase "Isso não foi filmado"); how it works and where it lives
metadata:
  type: project
---
Built 2026-10-02 from studying github.com/oprogramadorreal/pdoom-video (MIT; video CLD-GSpl5Q0, three.js + GLSL, every frame f(t)).
- Code: /mnt/project-files/estudio/motor/src/glsl: Shader.tsx (raw WebGL2 canvas, uniforms per frame, transparent so React stacks over/under), comum.ts (noise, fbm, SDFs, smin, fio/hachura, palette in linear), cena.ts (raymarched 3D object with soft shadow, AO, Fresnel env reflection, x-ray SDF slice, pixelation, sinking + ink floor), overlays.ts (Dissolve with alpha; Acabamento grain+vignette via mixBlendMode overlay), Vitrine.tsx; motor/src/motor/chaves.ts = numbers keyed to spoken words.
- Render needs `--gl=angle` (no GPU in cloud, SwiftShader): ~1.5-3 frames/s for raymarch at 1080p with 2x2 AA.
- Plan PDF estudio/glsl/plano/plano-glsl.pdf; keyframes estudio/glsl/keyframes/; state estudio/glsl/trabalho/ESTADO.md.
- Horse test was dropped by Vítor (2026-10-02). Showcase delivered 2026-10-03: estudio/glsl/isso-nao-foi-filmado.mp4; full render ~1 h in cloud, use resumable chunked script motor/glsl-render.sh (container restarts happen).
Related: [[estudio-motor]], [[feedback-quadros-chave]].
