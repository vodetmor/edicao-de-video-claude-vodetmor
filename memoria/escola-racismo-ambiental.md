---
name: escola-racismo-ambiental
description: Vítor's school documentary video on racismo ambiental (PAS work, Canal Preto 2021); script PDF + internal edit notes in project files
metadata:
  type: project
  modified: 2026-09-29T00:09:38.793Z
---

Started 2026-09-28. School group video (7 speakers, order: Vítor Machado, Maria Eduarda, Cainã Farias, Luísa Brasil, Anna Augusta, Maria Alice, Anna Júlia Dias), 7–8 min, serious dramatic documentary tone.
- Group script (only lines + short context per person): /mnt/project-files/escola-consciencia-negra/roteiro-racismo-ambiental.pdf
- Internal edit notes (music, on-screen visuals, name lower-thirds, recording tips): /mnt/project-files/escola-consciencia-negra/notas-de-edicao.md
- Next: group sends recordings in the thread; then edit.

**Why:** Vítor's corrections: the group PDF must carry only what each person says and their context, no editing notes. Each person says their own name inside their own part, right after an impact line. No group roll-call montage, no "Eu sou X junto com..." intro.
**How to apply:** keep editing/meta notes for Claude in separate files; lower-third name appears when each speaker says their name.

Update 2026-09-29: studied Vítor's reference (Tinoco, "A triste história de Franz Kafka", 20:30, inspire never copy). Edit docs in /mnt/project-files/escola-consciencia-negra/edicao/ (SPEC.md, ARQUITETURA.md, PLANO.md, referencia/). Vítor wants the Tinoco editing STYLE replicated (not his content); accent dark red #83251A like the reference. Cloud blocks commons/jamendo/freesound/pexels/whisper model downloads (WebSearch works, WebFetch to commons is cache-only); PLANO.md lists hosts to allow + keys needed. ffmpeg available via `pip install imageio-ffmpeg` (no drawtext filter; text via Remotion/PIL).
- API keys live in /mnt/project-files/escola-consciencia-negra/edicao/.env (Freesound saved; Jamendo saved too). First Freesound test 2026-09-29: freesound.org still 403 from network policy.

**Pendências / how to resume (2026-09-29):** when Vítor sends the 7 recordings (each named), start a NEW thread (old one has stale network). Steps: 1) retest Jamendo + Freesound with keys in .env (never tested: old thread was 403); 2) read edicao/SPEC.md, ARQUITETURA.md, PLANO.md + motion-base/LICOES-MOTION.md; 3) follow PLANO phases (acervo → ingest/transcribe → 5 test stills for approval → Remotion montage → sound → separate critique ≥8/10 → final 1080p). Style = replicate Tinoco editing style fully. Final spoken lines will differ from the script PDF (script was a suggestion).

Intake 2026-09-29 23:15 UTC (thread from Vítor's message with 4 files): Cainã, Luísa, Anna Augusta, Anna Júlia received; ALL parts are audio only (Vítor: convert all to mp3). Missing Vítor, Maria Eduarda, Maria Alice. Anna Júlia did NOT say her name. Status + quality in escola-consciencia-negra/trabalho/ESTADO.md; transcripts in trabalho/transcricoes/.
Decision (Vítor 2026-09-29 23:34 UTC): if a speaker didn't say their name (Anna Júlia), no re-record; show the name on screen as polished motion-graphics lower-third, same pattern as the others.
Vítor's part received 2026-09-30 00:30 UTC: video 01a (1080p, up to 'racismo ambiental', keep image) + audio 01b (rest). Still missing Maria Eduarda, Maria Alice.

Status 2026-09-30 04:40 UTC: parts 3-7 built and rendered separately into escola-consciencia-negra/parteN-*.mp4; part 2 (Maria Eduarda) pre-built from script with a T timing table (no audio yet). Vítor sent the Canal Preto obra video (acervo/obra/); real scenes from it now appear in parts 3, 5, 6 (credited). Resume from trabalho/ESTADO.md (last section). Pending: Maria Eduarda audio, remaining placeholder photos, final join with continuous music.

DELIVERED 2026-10-01 01:30 UTC: final video escola-consciencia-negra/racismo-ambiental-FINAL.mp4 (8:20, -14 LUFS), all 7 parts incl. Maria Eduarda (globe to Warren County). Rebuild: gen/final.py in trabalho/fonte (see ESTADO.md last section).
