---
name: storytold-craft-apps
description: Verdict 2026-10-08 on storytold "Craft" apps (open-source Rust Adobe clones): real; EffectCraft/FilmCraft/VectorCraft tested headless in cloud and bridged to our Remotion motor
metadata:
  type: project
---
Vítor sent an X post (2026-10-06) claiming Adobe apps were recreated in Rust with Opus 5.5. Checked 2026-10-08 in thread "Apps Craft" (cmsg_01257unjkPWjtnQPA28xytUSDmYevUk8GSguavnkcNxVj6): all 7 repos real, MIT/Apache, ~1 week old, agent-written, honest READMEs (real-work readiness 30–70%), no malware found.
- EffectCraft (AE) works headless: AE-style .jsx scripts, 306 effects, 3D, ProRes 4444 alpha, Lottie, MCP. Bridge to motor proven (Lottie + OffthreadVideo transparent identical). Bake expressions with prop.convertExpressionToKeyframes before Lottie.
- FilmCraft (Premiere): JSONL edits, burned captions, exports FCPXML/Premiere XML/OTIO/EDL.
- VectorCraft: .ai/.pdf/.eps -> SVG (client logos).
- Install: estudio/craft/instalar.sh (release binaries + SHA256, 30 s; building takes 13 min). State: estudio/craft/ESTADO.md; notes motion-base/fontes/ferramentas/storytold/NOTAS.md.
**Vítor's verdict 2026-10-08 19:21 UTC:** "horrível, remotion + javascript é muito melhor; só o remotion sola isso aí". EffectCraft REJECTED for motion; no Craft block in the motor.
**How to apply:** motion stays pure Remotion + JS. Only utility uses remain if asked: VectorCraft .ai/.eps -> SVG for client logos, FilmCraft FCPXML export. Before pitching any new motion tool, show one frame side by side with ours instead of just saying it works. Related: [[estudio-motor]], [[motion-base-knowledge]].
